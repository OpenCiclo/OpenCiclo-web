// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import Capacitor
import CryptoKit
import Foundation
import LocalAuthentication
import Security
import UIKit
import UniformTypeIdentifiers
import WebKit

/// Storage for the "only on this device" diary. The iOS twin of DeviceVaultPlugin.java
/// (apps/mobile/android): same methods, same error codes, same file layout, so the
/// TypeScript side (apps/web/lib/device-vault.ts) does not know which one it talks to.
///
/// The diary file holds the same AES-GCM vault blob the server would store, sealed in
/// TypeScript with the key derived from the 12-word phrase. This class never sees the
/// plaintext diary. The phrase is sealed here with a random AES-256 key that lives in the
/// Keychain (this device only, never synced, never in a backup). With the app lock on,
/// that Keychain item only opens right after Face ID, Touch ID or the device passcode.
///
/// It also keeps the phrase of a hosted account that chose "Keep me signed in", in its own
/// file under its own key, so that phrase never sits in WebView storage, and the same way
/// an email sign-up waiting for its code.
///
/// Re-sealing generates the new key under a new alias and writes the new file before the
/// old keys are deleted: a canceled check or a failed write leaves the old file and key as
/// they were. The file names the alias that opens it (format 2).
///
/// A Keychain item outlives the app when it is uninstalled; the files do not. A key left
/// behind opens nothing without its file, and the next write deletes it.
///
/// Never log the phrase, file contents, or error details from crypto or Keychain calls.
@objc(DeviceVaultPlugin)
public class DeviceVaultPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "DeviceVaultPlugin"
    public let jsName = "DeviceVault"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "status", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "readDiary", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "writeDiary", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "storePhrase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "readPhrase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clear", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "storeHostedPhrase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "readHostedPhrase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearHostedPhrase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "storePendingSignup", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "readPendingSignup", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearPendingSignup", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "readHostedCopy", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "writeHostedCopy", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearHostedCopy", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setSecureScreen", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setAppearance", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "copySensitive", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearCopied", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearSessionCookie", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "shareFile", returnType: CAPPluginReturnPromise)
    ]

    // Names match the Android plugin, so the docs and the threat model describe both.
    private static let keyPlain = "ciclo-device-phrase-v1"
    private static let keyAuth = "ciclo-device-phrase-auth-v1"
    private static let keyHosted = "ciclo-hosted-phrase-v1"
    private static let keyPending = "ciclo-pending-signup-v1"
    private static let diaryFile = "device-diary.json"
    private static let phraseFile = "device-phrase.bin"
    private static let hostedPhraseFile = "hosted-phrase.bin"
    private static let pendingSignupFile = "pending-signup.bin"
    // The hosted diary as last seen on the host (still sealed), for reading without a connection.
    // Never a device diary: status() and readDiary() do not look at it.
    private static let hostedCopyFile = "hosted-diary-copy.json"
    private static let devicePhraseKeys = [keyPlain, keyAuth]
    private static let pendingKeys = [keyPending]
    private static let hostedKeys = [keyHosted]
    // The session cookie and its legacy name (lib/server/session.ts).
    private static let sessionCookies = ["ciclo_session", "oddy_session"]
    private static let keychainService = "com.openciclo.app.vault-keys"
    private static let storageDirectory = "CicloVault"
    private static let exportDirectory = "exports"
    // Every phrase file written here is format 2: it names the Keychain alias that opens it.
    private static let phraseFormatAlias: UInt8 = 2
    private static let modePlain: UInt8 = 0
    private static let modeAuth: UInt8 = 1
    private static let nonceLength = 12
    private static let tagLength = 16
    // The phrase leaves the clipboard by itself after this long, even if the app is closed.
    private static let clipLifetime: TimeInterval = 120

    /// Keychain and file work never runs on the main thread: a Keychain read behind the
    /// app lock waits for the person.
    private let queue = DispatchQueue(label: "com.openciclo.app.device-vault")
    /// UIPasteboard's change count right after copySensitive, to recognise the clip later
    /// without reading the clipboard (a read shows the system's paste notice).
    private var copiedChangeCount: Int?

    /// A phrase file: format byte, mode byte, alias length, alias in ASCII, nonce length,
    /// nonce, AES-GCM ciphertext followed by its 16-byte tag (what Android's Cipher writes).
    private struct SealedPhrase {
        let mode: UInt8
        let alias: String
        let nonce: Data
        let sealed: Data

        static func parse(_ raw: Data) -> SealedPhrase? {
            let bytes = [UInt8](raw)
            var offset = 0
            func take(_ count: Int) -> [UInt8]? {
                guard count >= 0, offset + count <= bytes.count else { return nil }
                defer { offset += count }
                return Array(bytes[offset..<(offset + count)])
            }
            guard let head = take(2), head[0] == DeviceVaultPlugin.phraseFormatAlias else { return nil }
            guard let aliasLength = take(1), let aliasBytes = take(Int(aliasLength[0])),
                  let alias = String(bytes: aliasBytes, encoding: .ascii) else { return nil }
            guard let nonceLength = take(1), let nonce = take(Int(nonceLength[0])) else { return nil }
            let sealed = Array(bytes[offset...])
            guard nonce.count == DeviceVaultPlugin.nonceLength, sealed.count >= DeviceVaultPlugin.tagLength else { return nil }
            return SealedPhrase(mode: head[1], alias: alias, nonce: Data(nonce), sealed: Data(sealed))
        }

        static func encode(mode: UInt8, alias: String, nonce: Data, sealed: Data) -> Data? {
            guard let aliasBytes = alias.data(using: .ascii), aliasBytes.count <= 255, nonce.count <= 255 else { return nil }
            var out = Data([DeviceVaultPlugin.phraseFormatAlias, mode, UInt8(aliasBytes.count)])
            out.append(aliasBytes)
            out.append(UInt8(nonce.count))
            out.append(nonce)
            out.append(sealed)
            return out
        }
    }

    private enum KeyRead {
        case key(SymmetricKey)
        case missing
        case canceled
        case authFailed
        case failed
    }

    override public func load() {
        // A shared export is plaintext. Drop leftovers from the last session.
        try? FileManager.default.removeItem(at: exportDirectoryURL())
    }

    // MARK: - Diary

    @objc func status(_ call: CAPPluginCall) {
        queue.async {
            do {
                let phrase = try self.readOrNil(Self.phraseFile)
                let hasDiary = try self.readOrNil(Self.diaryFile) != nil
                let needsAuth = phrase.map { $0.count > 1 && $0[$0.startIndex + 1] == Self.modeAuth } ?? false
                call.resolve([
                    "hasDiary": hasDiary,
                    "hasPhrase": phrase != nil,
                    "phraseNeedsAuth": needsAuth,
                    "lockAvailable": self.lockAvailable(),
                    // Every iOS version this app runs on can ask for Face ID, Touch ID or the passcode.
                    "lockSupported": true
                ])
            } catch {
                call.reject("Could not read the device diary", "IO_ERROR")
            }
        }
    }

    @objc func readDiary(_ call: CAPPluginCall) {
        readText(call, file: Self.diaryFile, failure: "Could not read the device diary")
    }

    @objc func writeDiary(_ call: CAPPluginCall) {
        writeText(call, file: Self.diaryFile, failure: "Could not save the device diary")
    }

    /// Seals the phrase with a new Keychain key. With requireAuth, asks for Face ID, Touch ID
    /// or the passcode first. The new key gets a new alias: the old file and its key keep
    /// working until the new file is written, and only then are the old keys deleted.
    @objc func storePhrase(_ call: CAPPluginCall) {
        guard let phrase = call.getString("phrase"), !phrase.isEmpty else {
            call.reject("Missing phrase", "INVALID_ARGUMENT")
            return
        }
        let plain = Data(phrase.utf8)
        let failure = "Could not protect the phrase"
        guard call.getBool("requireAuth", false) else {
            queue.async {
                self.storeSealed(call, file: Self.phraseFile, keys: Self.devicePhraseKeys, base: Self.keyPlain,
                                 mode: Self.modePlain, plain: plain, failure: failure)
            }
            return
        }
        guard lockAvailable() else {
            call.reject("No passcode set up", "LOCK_UNAVAILABLE")
            return
        }
        // Adding a Keychain item behind the passcode asks nothing, so ask here: turning the
        // app lock on must prove the person can pass it.
        let context = LAContext()
        context.evaluatePolicy(.deviceOwnerAuthentication, localizedReason: promptReason(call)) { success, error in
            guard success else {
                call.reject("Authentication did not finish", Self.isCanceled(error) ? "AUTH_CANCELED" : "AUTH_ERROR")
                return
            }
            self.queue.async {
                self.storeSealed(call, file: Self.phraseFile, keys: Self.devicePhraseKeys, base: Self.keyAuth,
                                 mode: Self.modeAuth, plain: plain, failure: failure)
            }
        }
    }

    @objc func readPhrase(_ call: CAPPluginCall) {
        let reason = promptReason(call)
        queue.async {
            let raw: Data?
            do {
                raw = try self.readOrNil(Self.phraseFile)
            } catch {
                call.reject("Could not open the phrase", "KEY_ERROR")
                return
            }
            guard let raw else {
                call.reject("No phrase on this device", "NO_PHRASE")
                return
            }
            guard let file = SealedPhrase.parse(raw),
                  Self.isAlias(file.alias, of: file.mode == Self.modeAuth ? Self.keyAuth : Self.keyPlain) else {
                call.reject("Could not open the phrase", "KEY_ERROR")
                return
            }
            let auth = file.mode == Self.modeAuth
            switch self.readKey(file.alias, prompt: auth ? reason : nil) {
            case .key(let key):
                guard let plain = Self.open(file, with: key), let phrase = String(data: plain, encoding: .utf8) else {
                    call.reject("Could not open the phrase", "KEY_ERROR")
                    return
                }
                call.resolve(["phrase": phrase])
            case .missing:
                // iOS deletes an item behind the passcode when the passcode is turned off.
                if auth {
                    call.reject("The key for this phrase was invalidated", "KEY_INVALIDATED")
                } else {
                    call.reject("The key for this phrase is gone", "KEY_MISSING")
                }
            case .canceled:
                call.reject("Authentication did not finish", "AUTH_CANCELED")
            case .authFailed:
                call.reject("Authentication did not finish", "AUTH_ERROR")
            case .failed:
                call.reject("Could not open the phrase", "KEY_ERROR")
            }
        }
    }

    /// Deletes the diary, then (only once the diary is gone) the sealed phrase and every
    /// key of the device phrase. A diary that could not be deleted keeps its phrase, so it still opens.
    @objc func clear(_ call: CAPPluginCall) {
        queue.async {
            guard self.remove(Self.diaryFile) else {
                call.reject("Could not delete the device diary", "IO_ERROR")
                return
            }
            _ = self.remove(Self.phraseFile)
            self.deleteKeys(of: Self.devicePhraseKeys, except: nil)
            call.resolve()
        }
    }

    // MARK: - Hosted phrase ("Keep me signed in")

    @objc func storeHostedPhrase(_ call: CAPPluginCall) {
        guard let phrase = call.getString("phrase"), !phrase.isEmpty else {
            call.reject("Missing phrase", "INVALID_ARGUMENT")
            return
        }
        queue.async {
            self.storeSealed(call, file: Self.hostedPhraseFile, keys: Self.hostedKeys, base: Self.keyHosted,
                             mode: Self.modePlain, plain: Data(phrase.utf8), failure: "Could not protect the phrase")
        }
    }

    /// Resolves with no phrase when none is kept.
    @objc func readHostedPhrase(_ call: CAPPluginCall) {
        readPlainSealed(call, file: Self.hostedPhraseFile, base: Self.keyHosted, field: "phrase",
                        missing: "The key for this phrase is gone", failure: "Could not open the phrase")
    }

    /// Deletes the hosted account's sealed phrase and its key. Sign-out and account deletion call it.
    @objc func clearHostedPhrase(_ call: CAPPluginCall) {
        clearSealed(call, file: Self.hostedPhraseFile, keys: Self.hostedKeys, failure: "Could not delete the phrase")
    }

    // MARK: - Email sign-up waiting for its code

    @objc func storePendingSignup(_ call: CAPPluginCall) {
        guard let data = call.getString("data"), !data.isEmpty else {
            call.reject("Nothing to save", "INVALID_ARGUMENT")
            return
        }
        queue.async {
            self.storeSealed(call, file: Self.pendingSignupFile, keys: Self.pendingKeys, base: Self.keyPending,
                             mode: Self.modePlain, plain: Data(data.utf8), failure: "Could not protect the sign-up")
        }
    }

    /// Resolves with no data when no sign-up is waiting.
    @objc func readPendingSignup(_ call: CAPPluginCall) {
        readPlainSealed(call, file: Self.pendingSignupFile, base: Self.keyPending, field: "data",
                        missing: "The key for this sign-up is gone", failure: "Could not open the sign-up")
    }

    @objc func clearPendingSignup(_ call: CAPPluginCall) {
        clearSealed(call, file: Self.pendingSignupFile, keys: Self.pendingKeys, failure: "Could not delete the sign-up")
    }

    // MARK: - Offline copy of a hosted diary

    @objc func readHostedCopy(_ call: CAPPluginCall) {
        readText(call, file: Self.hostedCopyFile, failure: "Could not read the offline copy")
    }

    @objc func writeHostedCopy(_ call: CAPPluginCall) {
        writeText(call, file: Self.hostedCopyFile, failure: "Could not save the offline copy")
    }

    @objc func clearHostedCopy(_ call: CAPPluginCall) {
        queue.async {
            if self.remove(Self.hostedCopyFile) {
                call.resolve()
            } else {
                call.reject("Could not delete the offline copy", "IO_ERROR")
            }
        }
    }

    // MARK: - Screen, clipboard, cookies, sharing

    /// iOS has no switch that blocks screenshots. What the app lock promises on iOS is the
    /// cover in the app switcher, and CicloViewController draws that for every account, with
    /// or without the lock. So there is nothing to turn on here.
    @objc func setSecureScreen(_ call: CAPPluginCall) {
        call.resolve()
    }

    /// Makes the system parts (status bar text, keyboard, the launch cover) follow the theme
    /// chosen in Settings. "system" hands them back to iOS.
    @objc func setAppearance(_ call: CAPPluginCall) {
        let scheme = call.getString("scheme", "system")
        DispatchQueue.main.async {
            let style: UIUserInterfaceStyle = scheme == "dark" ? .dark : scheme == "light" ? .light : .unspecified
            self.bridge?.viewController?.view.window?.overrideUserInterfaceStyle = style
            call.resolve()
        }
    }

    /// Copies the 12-word phrase. The clip stays on this device (no Universal Clipboard) and
    /// iOS drops it by itself after two minutes.
    @objc func copySensitive(_ call: CAPPluginCall) {
        guard let text = call.getString("text"), !text.isEmpty else {
            call.reject("Nothing to copy", "INVALID_ARGUMENT")
            return
        }
        DispatchQueue.main.async {
            let pasteboard = UIPasteboard.general
            pasteboard.setItems(
                [[UTType.utf8PlainText.identifier: text]],
                options: [.localOnly: true, .expirationDate: Date().addingTimeInterval(Self.clipLifetime)]
            )
            self.copiedChangeCount = pasteboard.changeCount
            call.resolve()
        }
    }

    /// Empties the clipboard if nothing was copied since copySensitive (same change count).
    /// It never reads the clipboard, so iOS shows no paste notice.
    @objc func clearCopied(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let pasteboard = UIPasteboard.general
            if let count = self.copiedChangeCount, pasteboard.changeCount == count {
                pasteboard.items = []
            }
            self.copiedChangeCount = nil
            call.resolve(["checked": true])
        }
    }

    /// Clears the session cookies for the API host in the cookie store native HTTP uses
    /// (HTTPCookieStorage.shared), and in the WebView's own store. For a sign-out that
    /// cannot reach the host. Names as in lib/server/session.ts.
    @objc func clearSessionCookie(_ call: CAPPluginCall) {
        guard let value = call.getString("url"), value.hasPrefix("https://") || value.hasPrefix("http://"),
              let url = URL(string: value), let host = url.host else {
            call.reject("Invalid URL", "INVALID_ARGUMENT")
            return
        }
        DispatchQueue.main.async {
            let storage = HTTPCookieStorage.shared
            for cookie in storage.cookies(for: url) ?? [] where Self.sessionCookies.contains(cookie.name) {
                storage.deleteCookie(cookie)
            }
            let webStore = WKWebsiteDataStore.default().httpCookieStore
            webStore.getAllCookies { cookies in
                let doomed = cookies.filter { cookie in
                    let domain = cookie.domain.hasPrefix(".") ? String(cookie.domain.dropFirst()) : cookie.domain
                    return Self.sessionCookies.contains(cookie.name) && (host == domain || host.hasSuffix("." + domain))
                }
                let group = DispatchGroup()
                for cookie in doomed {
                    group.enter()
                    webStore.delete(cookie) { group.leave() }
                }
                group.notify(queue: .main) { call.resolve() }
            }
        }
    }

    /// Opens the share sheet for a text file (diary export, phrase backup). A WebView cannot download.
    @objc func shareFile(_ call: CAPPluginCall) {
        let filename = call.getString("filename", "")
        guard let data = call.getString("data"),
              filename.range(of: "^[A-Za-z0-9._-]{1,80}$", options: .regularExpression) != nil else {
            call.reject("Invalid file", "INVALID_ARGUMENT")
            return
        }
        let directory = exportDirectoryURL()
        let file = directory.appendingPathComponent(filename)
        do {
            try? FileManager.default.removeItem(at: directory)
            try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
            try Data(data.utf8).write(to: file, options: [.atomic, .completeFileProtection])
        } catch {
            call.reject("Could not share the file", "IO_ERROR")
            return
        }
        DispatchQueue.main.async {
            guard let presenter = self.bridge?.viewController else {
                call.reject("Could not share the file", "IO_ERROR")
                return
            }
            let sheet = UIActivityViewController(activityItems: [file], applicationActivities: nil)
            // An iPad shows the sheet as a popover and needs to know where it points.
            if let popover = sheet.popoverPresentationController {
                popover.sourceView = presenter.view
                popover.sourceRect = CGRect(x: presenter.view.bounds.midX, y: presenter.view.bounds.maxY - 80, width: 1, height: 1)
                popover.permittedArrowDirections = []
            }
            presenter.present(sheet, animated: true) { call.resolve() }
        }
    }

    // MARK: - Sealed files

    /// Seals `plain` under a new key ("<base>-<uuid>") into `file`. The file counts as written
    /// only once it reads back exactly as written and names the new alias (and, for a key with
    /// no check, opens to `plain`). Only then do the other keys of `keys` go.
    /// - Nothing landed (the old file is still there): the new key goes; the old file and keys stay.
    /// - Cannot tell (the file cannot be read back, or it is there but does not open): every
    ///   key stays, so whichever file is in place still opens.
    private func storeSealed(
        _ call: CAPPluginCall, file: String, keys: [String], base: String, mode: UInt8, plain: Data, failure: String
    ) {
        let alias = base + "-" + UUID().uuidString.lowercased()
        let key = SymmetricKey(size: .bits256)
        guard addKey(alias, key: key, requireAuth: mode == Self.modeAuth) else {
            deleteKey(alias)
            call.reject(failure, "KEY_ERROR")
            return
        }
        guard let box = try? AES.GCM.seal(plain, using: key),
              let bytes = SealedPhrase.encode(mode: mode, alias: alias, nonce: Data(box.nonce), sealed: box.ciphertext + box.tag) else {
            deleteKey(alias)
            call.reject(failure, "KEY_ERROR")
            return
        }
        do {
            try write(file, bytes)
        } catch {
            // An atomic write that throws replaced nothing: the old file and its key stay.
            deleteKey(alias)
            call.reject(failure, "KEY_ERROR")
            return
        }
        let onDisk: Data?
        do {
            onDisk = try readOrNil(file)
        } catch {
            call.reject(failure, "IO_ERROR")
            return
        }
        guard let onDisk, onDisk == bytes else {
            deleteKey(alias)
            call.reject(failure, "IO_ERROR")
            return
        }
        guard let written = SealedPhrase.parse(onDisk), written.alias == alias else {
            call.reject(failure, "KEY_ERROR")
            return
        }
        // A key behind the passcode cannot be read back here without asking once more: the
        // bytes on disk are what is checked. The key in hand is the one that was stored.
        if mode == Self.modePlain {
            guard case .key(let stored) = readKey(alias, prompt: nil), Self.open(written, with: stored) == plain else {
                call.reject(failure, "KEY_ERROR")
                return
            }
        }
        deleteKeys(of: keys, except: alias)
        call.resolve()
    }

    /// Reads a file sealed with a key that needs no check. Resolves with no `field` when there is no file.
    private func readPlainSealed(
        _ call: CAPPluginCall, file: String, base: String, field: String, missing: String, failure: String
    ) {
        queue.async {
            let raw: Data?
            do {
                raw = try self.readOrNil(file)
            } catch {
                call.reject(failure, "KEY_ERROR")
                return
            }
            guard let raw else {
                call.resolve()
                return
            }
            guard let sealed = SealedPhrase.parse(raw), sealed.mode == Self.modePlain, Self.isAlias(sealed.alias, of: base) else {
                call.reject(failure, "KEY_ERROR")
                return
            }
            switch self.readKey(sealed.alias, prompt: nil) {
            case .key(let key):
                guard let plain = Self.open(sealed, with: key), let text = String(data: plain, encoding: .utf8) else {
                    call.reject(failure, "KEY_ERROR")
                    return
                }
                call.resolve([field: text])
            case .missing:
                call.reject(missing, "KEY_MISSING")
            default:
                call.reject(failure, "KEY_ERROR")
            }
        }
    }

    private func clearSealed(_ call: CAPPluginCall, file: String, keys: [String], failure: String) {
        queue.async {
            let removed = self.remove(file)
            self.deleteKeys(of: keys, except: nil)
            if removed {
                call.resolve()
            } else {
                call.reject(failure, "IO_ERROR")
            }
        }
    }

    private static func open(_ file: SealedPhrase, with key: SymmetricKey) -> Data? {
        guard file.sealed.count >= tagLength, let nonce = try? AES.GCM.Nonce(data: file.nonce) else { return nil }
        let split = file.sealed.count - tagLength
        let ciphertext = file.sealed.prefix(split)
        let tag = file.sealed.suffix(tagLength)
        guard let box = try? AES.GCM.SealedBox(nonce: nonce, ciphertext: ciphertext, tag: tag) else { return nil }
        return try? AES.GCM.open(box, using: key)
    }

    /// `base` itself, or an alias made from it ("<base>-<uuid>").
    private static func isAlias(_ alias: String, of base: String) -> Bool {
        alias == base || alias.hasPrefix(base + "-")
    }

    // MARK: - Keychain

    private func keyQuery(_ alias: String) -> [String: Any] {
        [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: Self.keychainService,
            kSecAttrAccount as String: alias
        ]
    }

    /// Stores a new key. Without a check it opens whenever the device has been unlocked once
    /// since it started (a save can finish just after the screen locks). With a check it sits
    /// behind Face ID, Touch ID or the passcode, and iOS deletes it if the passcode is turned off.
    private func addKey(_ alias: String, key: SymmetricKey, requireAuth: Bool) -> Bool {
        var query = keyQuery(alias)
        query[kSecValueData as String] = key.withUnsafeBytes { Data($0) }
        if requireAuth {
            guard let access = SecAccessControlCreateWithFlags(
                nil, kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly, .userPresence, nil
            ) else { return false }
            query[kSecAttrAccessControl as String] = access
        } else {
            query[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        }
        SecItemDelete(keyQuery(alias) as CFDictionary)
        return SecItemAdd(query as CFDictionary, nil) == errSecSuccess
    }

    /// `prompt` is the text for the system check; nil for a key that needs none (the read
    /// then never shows anything: a key that would ask fails instead).
    private func readKey(_ alias: String, prompt: String?) -> KeyRead {
        var query = keyQuery(alias)
        query[kSecReturnData as String] = true
        query[kSecMatchLimit as String] = kSecMatchLimitOne
        let context = LAContext()
        if let prompt {
            context.localizedReason = prompt
        } else {
            context.interactionNotAllowed = true
        }
        query[kSecUseAuthenticationContext as String] = context
        var item: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &item)
        switch status {
        case errSecSuccess:
            guard let data = item as? Data, data.count == 32 else { return .failed }
            return .key(SymmetricKey(data: data))
        case errSecItemNotFound:
            return .missing
        case errSecUserCanceled:
            return .canceled
        case errSecAuthFailed, errSecInteractionNotAllowed:
            return .authFailed
        default:
            return .failed
        }
    }

    private func deleteKey(_ alias: String) {
        SecItemDelete(keyQuery(alias) as CFDictionary)
    }

    /// Deletes every key made from one of `bases` but `keep` (nil: all of them). Never fails:
    /// a leftover key opens nothing without its file.
    private func deleteKeys(of bases: [String], except keep: String?) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: Self.keychainService,
            kSecReturnAttributes as String: true,
            kSecMatchLimit as String: kSecMatchLimitAll
        ]
        var result: CFTypeRef?
        guard SecItemCopyMatching(query as CFDictionary, &result) == errSecSuccess,
              let items = result as? [[String: Any]] else { return }
        for item in items {
            guard let alias = item[kSecAttrAccount as String] as? String, alias != keep,
                  bases.contains(where: { Self.isAlias(alias, of: $0) }) else { continue }
            deleteKey(alias)
        }
    }

    /// The app lock needs a device passcode (Face ID and Touch ID cannot exist without one).
    private func lockAvailable() -> Bool {
        LAContext().canEvaluatePolicy(.deviceOwnerAuthentication, error: nil)
    }

    private func promptReason(_ call: CAPPluginCall) -> String {
        call.getString("subtitle") ?? call.getString("title") ?? "Ciclo"
    }

    private static func isCanceled(_ error: Error?) -> Bool {
        guard let code = (error as? LAError)?.code else { return false }
        return code == .userCancel || code == .appCancel || code == .systemCancel
    }

    // MARK: - Files

    /// Application Support/CicloVault, kept out of iCloud and computer backups.
    private func storageURL() throws -> URL {
        let base = try FileManager.default.url(
            for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true
        )
        var directory = base.appendingPathComponent(Self.storageDirectory, isDirectory: true)
        if !FileManager.default.fileExists(atPath: directory.path) {
            try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        }
        var values = URLResourceValues()
        values.isExcludedFromBackup = true
        try? directory.setResourceValues(values)
        return directory
    }

    private func exportDirectoryURL() -> URL {
        FileManager.default.temporaryDirectory.appendingPathComponent(Self.exportDirectory, isDirectory: true)
    }

    /// Nil when there is no such file. Throws when it is there but cannot be read.
    private func readOrNil(_ name: String) throws -> Data? {
        let file = try storageURL().appendingPathComponent(name)
        guard FileManager.default.fileExists(atPath: file.path) else { return nil }
        return try Data(contentsOf: file)
    }

    /// Writes to a temporary file, then replaces the old one, so a crash never leaves half a file.
    private func write(_ name: String, _ bytes: Data) throws {
        let file = try storageURL().appendingPathComponent(name)
        try bytes.write(to: file, options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])
    }

    /// Whether the file is gone afterwards.
    private func remove(_ name: String) -> Bool {
        guard let file = try? storageURL().appendingPathComponent(name) else { return false }
        try? FileManager.default.removeItem(at: file)
        return !FileManager.default.fileExists(atPath: file.path)
    }

    private func readText(_ call: CAPPluginCall, file: String, failure: String) {
        queue.async {
            do {
                guard let bytes = try self.readOrNil(file) else {
                    call.resolve()
                    return
                }
                guard let text = String(data: bytes, encoding: .utf8) else {
                    call.reject(failure, "IO_ERROR")
                    return
                }
                call.resolve(["data": text])
            } catch {
                call.reject(failure, "IO_ERROR")
            }
        }
    }

    private func writeText(_ call: CAPPluginCall, file: String, failure: String) {
        guard let data = call.getString("data"), !data.isEmpty else {
            call.reject("Nothing to save", "INVALID_ARGUMENT")
            return
        }
        queue.async {
            do {
                try self.write(file, Data(data.utf8))
                call.resolve()
            } catch {
                call.reject(failure, "IO_ERROR")
            }
        }
    }
}
