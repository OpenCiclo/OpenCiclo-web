package com.openciclo.app;

import android.app.Activity;
import android.content.ClipData;
import android.content.ClipDescription;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.PersistableBundle;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyPermanentlyInvalidatedException;
import android.security.keystore.KeyProperties;
import android.util.AtomicFile;
import android.view.WindowManager;

import androidx.activity.result.ActivityResult;
import androidx.annotation.NonNull;
import androidx.biometric.BiometricManager;
import androidx.biometric.BiometricPrompt;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import androidx.fragment.app.FragmentActivity;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.Key;
import java.security.KeyStore;
import java.security.MessageDigest;
import java.security.ProviderException;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import java.util.UUID;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

/**
 * Storage for the "only on this device" diary.
 *
 * The diary file holds the same AES-GCM vault blob the server would store, sealed in
 * TypeScript with the key derived from the 12-word phrase. This class never sees the
 * plaintext diary. The phrase is sealed here with an AES key that lives in Android
 * Keystore and cannot be exported. With the app lock on, that key only works right
 * after a fingerprint or screen-lock check.
 *
 * It also keeps the phrase of a hosted account that chose "Keep me signed in", in its
 * own file under its own Keystore key, so that phrase never sits in WebView storage, and
 * the same way an email sign-up waiting for its code (phrase, email, wrapped kit), so an
 * app closed while the person reads the email can finish it.
 *
 * Re-sealing the device phrase (or the waiting sign-up) generates its new key under a new alias
 * and writes the new file before the old keys are deleted: a canceled fingerprint check or a
 * failed write leaves the old file and key as they were. The file names the alias that opens it
 * (format 2). It can also clear the session cookie in the app's cookie jar for an offline sign-out.
 *
 * Files live in the app's private storage, which data_extraction_rules.xml keeps out of
 * backups. Never log the phrase, file contents, or exception details from crypto calls.
 */
@CapacitorPlugin(name = "DeviceVault")
public class DeviceVaultPlugin extends Plugin {

    private static final String KEYSTORE = "AndroidKeyStore";
    private static final String KEY_PLAIN = "ciclo-device-phrase-v1";
    private static final String KEY_AUTH = "ciclo-device-phrase-auth-v1";
    private static final String KEY_HOSTED = "ciclo-hosted-phrase-v1";
    private static final String KEY_PENDING = "ciclo-pending-signup-v1";
    private static final String DIARY_FILE = "device-diary.json";
    private static final String PHRASE_FILE = "device-phrase.bin";
    private static final String HOSTED_PHRASE_FILE = "hosted-phrase.bin";
    private static final String PENDING_SIGNUP_FILE = "pending-signup.bin";
    // The aliases each store's keys are made from (the fixed one, or "<base>-<uuid>").
    private static final String[] DEVICE_PHRASE_KEYS = {KEY_PLAIN, KEY_AUTH};
    private static final String[] PENDING_KEYS = {KEY_PENDING};
    private static final String[] HOSTED_KEYS = {KEY_HOSTED};
    // The session cookie and its legacy name (lib/server/session.ts).
    private static final String[] SESSION_COOKIES = {"ciclo_session", "oddy_session"};
    // The hosted diary as last seen on the host (still sealed), for reading without a connection.
    // Never a device diary: status() and readDiary() do not look at it.
    private static final String HOSTED_COPY_FILE = "hosted-diary-copy.json";
    private static final String EXPORT_DIR = "exports";
    // Names the clip copySensitive() writes, so clearCopied() only removes that one.
    private static final String PHRASE_CLIP_LABEL = "Ciclo recovery phrase";
    private static final byte PHRASE_FORMAT = 1;
    // Like PHRASE_FORMAT, plus the Keystore alias that opens the file (device phrase only).
    private static final byte PHRASE_FORMAT_ALIAS = 2;
    private static final byte MODE_PLAIN = 0;
    private static final byte MODE_AUTH = 1;
    private static final int GCM_TAG_BITS = 128;
    private static final int AUTHENTICATORS =
        BiometricManager.Authenticators.BIOMETRIC_STRONG | BiometricManager.Authenticators.DEVICE_CREDENTIAL;

    private interface CipherAction {
        void run(Cipher cipher) throws GeneralSecurityException, IOException;
    }

    /**
     * A phrase file: format byte, mode byte, [format 2: alias length, alias in ASCII], IV length,
     * IV, AES-GCM ciphertext. Format 1 files are opened by the fixed alias of their mode.
     */
    private static final class SealedPhrase {
        final byte mode;
        /** Null for format 1. */
        final String alias;
        final byte[] iv;
        final byte[] sealed;

        private SealedPhrase(byte mode, String alias, byte[] iv, byte[] sealed) {
            this.mode = mode;
            this.alias = alias;
            this.iv = iv;
            this.sealed = sealed;
        }

        /** Throws GeneralSecurityException for an unknown format, a RuntimeException for a truncated file. */
        static SealedPhrase parse(byte[] raw) throws GeneralSecurityException {
            ByteBuffer buffer = ByteBuffer.wrap(raw);
            byte format = buffer.get();
            if (format != PHRASE_FORMAT && format != PHRASE_FORMAT_ALIAS) {
                throw new GeneralSecurityException("Unknown phrase format");
            }
            byte mode = buffer.get();
            String alias = null;
            if (format == PHRASE_FORMAT_ALIAS) {
                byte[] name = new byte[buffer.get() & 0xFF];
                buffer.get(name);
                alias = new String(name, StandardCharsets.US_ASCII);
            }
            byte[] iv = new byte[buffer.get()];
            buffer.get(iv);
            byte[] sealed = new byte[buffer.remaining()];
            buffer.get(sealed);
            return new SealedPhrase(mode, alias, iv, sealed);
        }
    }

    @Override
    public void load() {
        // A shared export is plaintext. Drop leftovers from the last session.
        deleteRecursively(new File(getContext().getCacheDir(), EXPORT_DIR));
    }

    @PluginMethod
    public void status(PluginCall call) {
        try {
            byte[] phrase = readOrNull(PHRASE_FILE);
            JSObject result = new JSObject();
            result.put("hasDiary", readOrNull(DIARY_FILE) != null);
            result.put("hasPhrase", phrase != null);
            result.put("phraseNeedsAuth", phrase != null && phrase.length > 1 && phrase[1] == MODE_AUTH);
            result.put("lockAvailable", lockAvailable());
            // Below Android 11 the app lock cannot work at all; Settings says so instead
            // of asking for a fingerprint or screen lock.
            result.put("lockSupported", Build.VERSION.SDK_INT >= Build.VERSION_CODES.R);
            call.resolve(result);
        } catch (IOException e) {
            call.reject("Could not read the device diary", "IO_ERROR");
        }
    }

    @PluginMethod
    public void readDiary(PluginCall call) {
        try {
            byte[] bytes = readOrNull(DIARY_FILE);
            JSObject result = new JSObject();
            if (bytes != null) result.put("data", new String(bytes, StandardCharsets.UTF_8));
            call.resolve(result);
        } catch (IOException e) {
            call.reject("Could not read the device diary", "IO_ERROR");
        }
    }

    @PluginMethod
    public void writeDiary(PluginCall call) {
        String data = call.getString("data");
        if (data == null || data.isEmpty()) {
            call.reject("Nothing to save", "INVALID_ARGUMENT");
            return;
        }
        try {
            write(DIARY_FILE, data.getBytes(StandardCharsets.UTF_8));
            call.resolve();
        } catch (IOException e) {
            call.reject("Could not save the device diary", "IO_ERROR");
        }
    }

    /**
     * Seals the phrase with a new Keystore key. With requireAuth, asks for a fingerprint or the
     * screen lock first. The new key gets a new alias: the old file and its key keep working until
     * the new file is written, and only then are the old keys deleted. A canceled check or a failed
     * write deletes the new key and leaves everything else as it was.
     */
    @PluginMethod
    public void storePhrase(PluginCall call) {
        String phrase = call.getString("phrase");
        boolean requireAuth = Boolean.TRUE.equals(call.getBoolean("requireAuth", false));
        if (phrase == null || phrase.isEmpty()) {
            call.reject("Missing phrase", "INVALID_ARGUMENT");
            return;
        }
        byte[] plain = phrase.getBytes(StandardCharsets.UTF_8);
        if (!requireAuth) {
            storePlainSealed(call, PHRASE_FILE, DEVICE_PHRASE_KEYS, KEY_PLAIN, plain, "Could not protect the phrase");
            return;
        }
        if (!lockAvailable()) {
            call.reject("No fingerprint or screen lock set up", "LOCK_UNAVAILABLE");
            return;
        }
        String alias = KEY_AUTH + "-" + UUID.randomUUID();
        try {
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, freshKey(alias, true));
            authenticate(call, cipher, (authorized) -> {
                byte[] written;
                try {
                    written = writePhrase(PHRASE_FILE, MODE_AUTH, alias, authorized.getIV(), authorized.doFinal(plain));
                } catch (GeneralSecurityException | IOException | ProviderException e) {
                    // Nothing replaced the old file (AtomicFile): it and its key stay.
                    deleteKey(alias);
                    call.reject("Could not protect the phrase", "KEY_ERROR");
                    return;
                }
                // A key behind the fingerprint check cannot be opened again here without
                // asking once more: the bytes on disk are what is checked.
                commitSealed(call, PHRASE_FILE, DEVICE_PHRASE_KEYS, alias, written, null, "Could not protect the phrase");
            }, () -> deleteKey(alias));
        } catch (GeneralSecurityException | ProviderException e) {
            deleteKey(alias);
            call.reject("Could not protect the phrase", "KEY_ERROR");
        }
    }

    @PluginMethod
    public void readPhrase(PluginCall call) {
        try {
            byte[] raw = readOrNull(PHRASE_FILE);
            if (raw == null) {
                call.reject("No phrase on this device", "NO_PHRASE");
                return;
            }
            SealedPhrase file = SealedPhrase.parse(raw);
            byte mode = file.mode;
            byte[] iv = file.iv;
            byte[] sealed = file.sealed;

            String alias = file.alias != null ? file.alias : (mode == MODE_AUTH ? KEY_AUTH : KEY_PLAIN);
            if (!isDevicePhraseAlias(alias, mode)) throw new GeneralSecurityException("Unexpected key alias");
            SecretKey key = existingKey(alias);
            if (key == null) {
                call.reject("The key for this phrase is gone", "KEY_MISSING");
                return;
            }
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            try {
                cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(GCM_TAG_BITS, iv));
            } catch (KeyPermanentlyInvalidatedException e) {
                // A new fingerprint was enrolled or the screen lock was removed.
                call.reject("The key for this phrase was invalidated", "KEY_INVALIDATED");
                return;
            }
            CipherAction open = (authorized) -> {
                JSObject result = new JSObject();
                result.put("phrase", new String(authorized.doFinal(sealed), StandardCharsets.UTF_8));
                call.resolve(result);
            };
            if (mode == MODE_AUTH) {
                authenticate(call, cipher, open, null);
            } else {
                open.run(cipher);
            }
        } catch (GeneralSecurityException | IOException | RuntimeException e) {
            // RuntimeException covers a truncated file (BufferUnderflowException) and Keystore ProviderExceptions.
            call.reject("Could not open the phrase", "KEY_ERROR");
        }
    }

    /**
     * Deletes the diary, then (only once the diary is gone) the sealed phrase and every Keystore
     * key of the device phrase. A diary that could not be deleted keeps its phrase, so it still opens.
     */
    @PluginMethod
    public void clear(PluginCall call) {
        AtomicFile diary = atomic(DIARY_FILE);
        diary.delete();
        if (diary.getBaseFile().exists() || readOrNullQuietly(DIARY_FILE) != null) {
            call.reject("Could not delete the device diary", "IO_ERROR");
            return;
        }
        atomic(PHRASE_FILE).delete();
        deleteKeysExcept(DEVICE_PHRASE_KEYS, null);
        call.resolve();
    }

    /**
     * Seals the phrase of a hosted account kept signed in. There is no app lock here: like a
     * browser that keeps you signed in, the app opens the diary on start. The point is that the
     * phrase is never stored in plaintext: a copy of the app's files is useless off this phone.
     * Like the device phrase, each write gets a new key and the old one goes only once the new
     * file reads back and opens, so a failed write never loses the phrase kept so far.
     */
    @PluginMethod
    public void storeHostedPhrase(PluginCall call) {
        String phrase = call.getString("phrase");
        if (phrase == null || phrase.isEmpty()) {
            call.reject("Missing phrase", "INVALID_ARGUMENT");
            return;
        }
        storePlainSealed(
            call, HOSTED_PHRASE_FILE, HOSTED_KEYS, KEY_HOSTED, phrase.getBytes(StandardCharsets.UTF_8),
            "Could not protect the phrase");
    }

    /** Resolves with no phrase when none is kept. */
    @PluginMethod
    public void readHostedPhrase(PluginCall call) {
        try {
            byte[] raw = readOrNull(HOSTED_PHRASE_FILE);
            JSObject result = new JSObject();
            if (raw == null) {
                call.resolve(result);
                return;
            }
            SealedPhrase file = SealedPhrase.parse(raw);
            if (file.mode != MODE_PLAIN) throw new GeneralSecurityException("Unexpected mode");
            String alias = file.alias != null ? file.alias : KEY_HOSTED;
            if (!isAliasOf(alias, KEY_HOSTED)) throw new GeneralSecurityException("Unexpected key alias");
            SecretKey key = existingKey(alias);
            if (key == null) {
                call.reject("The key for this phrase is gone", "KEY_MISSING");
                return;
            }
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(GCM_TAG_BITS, file.iv));
            result.put("phrase", new String(cipher.doFinal(file.sealed), StandardCharsets.UTF_8));
            call.resolve(result);
        } catch (GeneralSecurityException | IOException | RuntimeException e) {
            // RuntimeException covers a truncated file (BufferUnderflowException) and Keystore ProviderExceptions.
            call.reject("Could not open the phrase", "KEY_ERROR");
        }
    }

    /** Deletes the hosted account's sealed phrase and its key. Sign-out and account deletion call it. */
    @PluginMethod
    public void clearHostedPhrase(PluginCall call) {
        AtomicFile file = atomic(HOSTED_PHRASE_FILE);
        file.delete();
        deleteKeysExcept(HOSTED_KEYS, null);
        if (file.getBaseFile().exists()) {
            call.reject("Could not delete the phrase", "IO_ERROR");
            return;
        }
        call.resolve();
    }

    /**
     * Seals an email sign-up waiting for its code (JSON with the phrase, the email and the wrapped
     * kit; see lib/client/pending-signup.ts) under its own plain Keystore key. Like the device
     * phrase, the new key gets a new alias and the old keys go only once the new file reads back
     * and opens, so a failed write leaves the sign-up kept so far readable.
     */
    @PluginMethod
    public void storePendingSignup(PluginCall call) {
        String data = call.getString("data");
        if (data == null || data.isEmpty()) {
            call.reject("Nothing to save", "INVALID_ARGUMENT");
            return;
        }
        storePlainSealed(
            call, PENDING_SIGNUP_FILE, PENDING_KEYS, KEY_PENDING, data.getBytes(StandardCharsets.UTF_8),
            "Could not protect the sign-up");
    }

    /** Resolves with no data when no sign-up is waiting. */
    @PluginMethod
    public void readPendingSignup(PluginCall call) {
        try {
            byte[] raw = readOrNull(PENDING_SIGNUP_FILE);
            JSObject result = new JSObject();
            if (raw == null) {
                call.resolve(result);
                return;
            }
            SealedPhrase file = SealedPhrase.parse(raw);
            if (file.mode != MODE_PLAIN) throw new GeneralSecurityException("Unexpected mode");
            String alias = file.alias != null ? file.alias : KEY_PENDING;
            if (!isAliasOf(alias, KEY_PENDING)) throw new GeneralSecurityException("Unexpected key alias");
            SecretKey key = existingKey(alias);
            if (key == null) {
                call.reject("The key for this sign-up is gone", "KEY_MISSING");
                return;
            }
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(GCM_TAG_BITS, file.iv));
            result.put("data", new String(cipher.doFinal(file.sealed), StandardCharsets.UTF_8));
            call.resolve(result);
        } catch (GeneralSecurityException | IOException | RuntimeException e) {
            // RuntimeException covers a truncated file (BufferUnderflowException) and Keystore ProviderExceptions.
            call.reject("Could not open the sign-up", "KEY_ERROR");
        }
    }

    /** Deletes the waiting sign-up and its key: it finished, or another sign-in replaced it. */
    @PluginMethod
    public void clearPendingSignup(PluginCall call) {
        AtomicFile file = atomic(PENDING_SIGNUP_FILE);
        file.delete();
        deleteKeysExcept(PENDING_KEYS, null);
        if (file.getBaseFile().exists()) {
            call.reject("Could not delete the sign-up", "IO_ERROR");
            return;
        }
        call.resolve();
    }

    /**
     * The offline copy of a hosted account's diary: the same sealed blob the host stores, so it
     * opens only with the account's phrase. Resolves with no data when there is none.
     */
    @PluginMethod
    public void readHostedCopy(PluginCall call) {
        try {
            byte[] bytes = readOrNull(HOSTED_COPY_FILE);
            JSObject result = new JSObject();
            if (bytes != null) result.put("data", new String(bytes, StandardCharsets.UTF_8));
            call.resolve(result);
        } catch (IOException e) {
            call.reject("Could not read the offline copy", "IO_ERROR");
        }
    }

    @PluginMethod
    public void writeHostedCopy(PluginCall call) {
        String data = call.getString("data");
        if (data == null || data.isEmpty()) {
            call.reject("Nothing to save", "INVALID_ARGUMENT");
            return;
        }
        try {
            write(HOSTED_COPY_FILE, data.getBytes(StandardCharsets.UTF_8));
            call.resolve();
        } catch (IOException e) {
            call.reject("Could not save the offline copy", "IO_ERROR");
        }
    }

    @PluginMethod
    public void clearHostedCopy(PluginCall call) {
        AtomicFile file = atomic(HOSTED_COPY_FILE);
        file.delete();
        if (file.getBaseFile().exists()) {
            call.reject("Could not delete the offline copy", "IO_ERROR");
            return;
        }
        call.resolve();
    }

    /** Hides the app from screenshots and the recent-apps preview. */
    @PluginMethod
    public void setSecureScreen(PluginCall call) {
        boolean enabled = Boolean.TRUE.equals(call.getBoolean("enabled", false));
        getActivity().runOnUiThread(() -> {
            if (enabled) {
                getActivity().getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
            } else {
                getActivity().getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SECURE);
            }
            call.resolve();
        });
    }

    /**
     * Copies the 12-word phrase. The clip is marked sensitive, so Android 13+ hides it
     * in the clipboard preview and keyboards do not suggest it. Its label lets
     * clearCopied() recognise it later without reading the phrase back.
     */
    @PluginMethod
    public void copySensitive(PluginCall call) {
        String text = call.getString("text");
        if (text == null || text.isEmpty()) {
            call.reject("Nothing to copy", "INVALID_ARGUMENT");
            return;
        }
        getActivity().runOnUiThread(() -> {
            ClipboardManager clipboard = ContextCompat.getSystemService(getContext(), ClipboardManager.class);
            if (clipboard == null) {
                call.reject("No clipboard", "UNAVAILABLE");
                return;
            }
            ClipData clip = ClipData.newPlainText(PHRASE_CLIP_LABEL, text);
            PersistableBundle extras = new PersistableBundle();
            // ClipDescription.EXTRA_IS_SENSITIVE on Android 13+; older versions ignore it.
            extras.putBoolean("android.content.extra.IS_SENSITIVE", true);
            clip.getDescription().setExtras(extras);
            clipboard.setPrimaryClip(clip);
            call.resolve();
        });
    }

    /**
     * Empties the clipboard if it still holds the phrase copied above (same label).
     * Resolves { checked: false } when it could not look: Android 10+ lets only the
     * app with the focus read the clipboard. The caller then tries again once the
     * app is back in front.
     */
    @PluginMethod
    public void clearCopied(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            JSObject result = new JSObject();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q && !getActivity().hasWindowFocus()) {
                result.put("checked", false);
                call.resolve(result);
                return;
            }
            ClipboardManager clipboard = ContextCompat.getSystemService(getContext(), ClipboardManager.class);
            ClipDescription description = clipboard == null ? null : clipboard.getPrimaryClipDescription();
            CharSequence label = description == null ? null : description.getLabel();
            if (label != null && PHRASE_CLIP_LABEL.contentEquals(label)) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                    clipboard.clearPrimaryClip();
                } else {
                    clipboard.setPrimaryClip(ClipData.newPlainText("", ""));
                }
            }
            result.put("checked", true);
            call.resolve(result);
        });
    }

    /**
     * Clears the session cookies for the API host in the WebView cookie store, which is the jar
     * CapacitorHttp's native requests use (CapacitorCookieManager). For a sign-out that cannot reach
     * the host: the httpOnly cookie is cleared here instead. Names as in lib/server/session.ts.
     */
    @PluginMethod
    public void clearSessionCookie(PluginCall call) {
        String url = call.getString("url");
        if (url == null || !(url.startsWith("https://") || url.startsWith("http://"))) {
            call.reject("Invalid URL", "INVALID_ARGUMENT");
            return;
        }
        String attributes = "; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; HttpOnly"
            + (url.startsWith("https://") ? "; Secure" : "");
        getActivity().runOnUiThread(() -> {
            try {
                android.webkit.CookieManager cookies = android.webkit.CookieManager.getInstance();
                for (String name : SESSION_COOKIES) cookies.setCookie(url, name + "=" + attributes);
                cookies.flush();
                call.resolve();
            } catch (RuntimeException e) {
                call.reject("Could not clear the session cookie", "IO_ERROR");
            }
        });
    }

    /** Opens the share sheet for a text file (diary export, phrase backup). A WebView cannot download. */
    @PluginMethod
    public void shareFile(PluginCall call) {
        String filename = call.getString("filename", "");
        String data = call.getString("data");
        String mimeType = call.getString("mimeType", "text/plain");
        if (data == null || filename == null || !filename.matches("[A-Za-z0-9._-]{1,80}")) {
            call.reject("Invalid file", "INVALID_ARGUMENT");
            return;
        }
        try {
            Context context = getContext();
            File dir = new File(context.getCacheDir(), EXPORT_DIR);
            deleteRecursively(dir);
            if (!dir.mkdirs()) throw new IOException("mkdirs");
            File file = new File(dir, filename);
            try (FileOutputStream out = new FileOutputStream(file)) {
                out.write(data.getBytes(StandardCharsets.UTF_8));
            }
            Uri uri = FileProvider.getUriForFile(context, context.getPackageName() + ".fileprovider", file);
            Intent send = new Intent(Intent.ACTION_SEND)
                .setType(mimeType)
                .putExtra(Intent.EXTRA_STREAM, uri)
                .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            Intent chooser = Intent.createChooser(send, filename);
            getActivity().runOnUiThread(() -> {
                getActivity().startActivity(chooser);
                call.resolve();
            });
        } catch (IOException | IllegalArgumentException e) {
            call.reject("Could not share the file", "IO_ERROR");
        }
    }

    /**
     * Saves a text file where the person chooses, with Android's own "Save to" screen (phone
     * storage, Drive, any document provider). Needs no storage permission: the system hands
     * back one place to write, picked by her. Resolves `saved: false` when she backs out.
     * The text goes straight to that place; nothing is left in the app's cache.
     */
    @PluginMethod
    public void saveFile(PluginCall call) {
        String filename = call.getString("filename", "");
        String mimeType = call.getString("mimeType", "text/plain");
        if (call.getString("data") == null || filename == null || !filename.matches("[A-Za-z0-9._-]{1,80}")) {
            call.reject("Invalid file", "INVALID_ARGUMENT");
            return;
        }
        Intent create = new Intent(Intent.ACTION_CREATE_DOCUMENT)
            .addCategory(Intent.CATEGORY_OPENABLE)
            .setType(mimeType)
            .putExtra(Intent.EXTRA_TITLE, filename);
        try {
            startActivityForResult(call, create, "saveFileResult");
        } catch (RuntimeException e) {
            // No app on the device can show the screen.
            call.reject("Could not open the save screen", "UNAVAILABLE");
        }
    }

    @ActivityCallback
    private void saveFileResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        Intent chosen = result.getData();
        Uri uri = chosen == null ? null : chosen.getData();
        if (result.getResultCode() != Activity.RESULT_OK || uri == null) {
            JSObject cancelled = new JSObject();
            cancelled.put("saved", false);
            call.resolve(cancelled);
            return;
        }
        String data = call.getString("data");
        // "wt": an existing file she chose to replace is cut to the new length.
        try (OutputStream out = getContext().getContentResolver().openOutputStream(uri, "wt")) {
            if (out == null || data == null) throw new IOException("no stream");
            out.write(data.getBytes(StandardCharsets.UTF_8));
            out.flush();
            JSObject done = new JSObject();
            done.put("saved", true);
            call.resolve(done);
        } catch (IOException | RuntimeException e) {
            call.reject("Could not save the file", "IO_ERROR");
        }
    }

    /** `onFailure` (may be null) runs when the check or `onAuthorized` fails, before the call is rejected. */
    private void authenticate(PluginCall call, Cipher cipher, CipherAction onAuthorized, Runnable onFailure) {
        String title = call.getString("title", "Ciclo");
        String subtitle = call.getString("subtitle");
        getActivity().runOnUiThread(() -> {
            BiometricPrompt.PromptInfo.Builder info = new BiometricPrompt.PromptInfo.Builder()
                .setTitle(title)
                .setAllowedAuthenticators(AUTHENTICATORS);
            if (subtitle != null) info.setSubtitle(subtitle);
            BiometricPrompt prompt = new BiometricPrompt(
                (FragmentActivity) getActivity(),
                ContextCompat.getMainExecutor(getContext()),
                new BiometricPrompt.AuthenticationCallback() {
                    @Override
                    public void onAuthenticationSucceeded(@NonNull BiometricPrompt.AuthenticationResult result) {
                        BiometricPrompt.CryptoObject crypto = result.getCryptoObject();
                        try {
                            if (crypto == null || crypto.getCipher() == null) throw new GeneralSecurityException();
                            onAuthorized.run(crypto.getCipher());
                        } catch (GeneralSecurityException | IOException | ProviderException e) {
                            if (onFailure != null) onFailure.run();
                            call.reject("Could not use the key", "KEY_ERROR");
                        }
                    }

                    @Override
                    public void onAuthenticationError(int errorCode, @NonNull CharSequence errString) {
                        boolean canceled = errorCode == BiometricPrompt.ERROR_USER_CANCELED
                            || errorCode == BiometricPrompt.ERROR_NEGATIVE_BUTTON
                            || errorCode == BiometricPrompt.ERROR_CANCELED;
                        if (onFailure != null) onFailure.run();
                        call.reject("Authentication did not finish", canceled ? "AUTH_CANCELED" : "AUTH_ERROR");
                    }
                }
            );
            prompt.authenticate(info.build(), new BiometricPrompt.CryptoObject(cipher));
        });
    }

    /** Per-use keys that accept a fingerprint or the screen lock need Android 11. */
    private boolean lockAvailable() {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.R
            && BiometricManager.from(getContext()).canAuthenticate(AUTHENTICATORS) == BiometricManager.BIOMETRIC_SUCCESS;
    }

    private SecretKey freshKey(String alias, boolean requireAuth) throws GeneralSecurityException {
        deleteKey(alias);
        try {
            return generateKey(alias, requireAuth, true);
        } catch (ProviderException e) {
            // StrongBox is missing or does not support this key. Use the TEE instead.
            deleteKey(alias);
            return generateKey(alias, requireAuth, false);
        }
    }

    private SecretKey generateKey(String alias, boolean requireAuth, boolean strongBox) throws GeneralSecurityException {
        KeyGenParameterSpec.Builder spec = new KeyGenParameterSpec.Builder(
            alias,
            KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT
        )
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setKeySize(256);
        if (strongBox && Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            spec.setIsStrongBoxBacked(true);
        }
        if (requireAuth) {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) throw new GeneralSecurityException("Needs Android 11");
            spec.setUserAuthenticationRequired(true);
            spec.setUserAuthenticationParameters(0, KeyProperties.AUTH_BIOMETRIC_STRONG | KeyProperties.AUTH_DEVICE_CREDENTIAL);
        }
        KeyGenerator generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, KEYSTORE);
        generator.init(spec.build());
        return generator.generateKey();
    }

    private SecretKey existingKey(String alias) throws GeneralSecurityException, IOException {
        KeyStore keyStore = KeyStore.getInstance(KEYSTORE);
        keyStore.load(null);
        Key key = keyStore.getKey(alias, null);
        return key instanceof SecretKey ? (SecretKey) key : null;
    }

    private void deleteKey(String alias) {
        try {
            KeyStore keyStore = KeyStore.getInstance(KEYSTORE);
            keyStore.load(null);
            if (keyStore.containsAlias(alias)) keyStore.deleteEntry(alias);
        } catch (GeneralSecurityException | IOException e) {
            // Nothing to delete, or the Keystore is unavailable. Either way the key is unusable.
        }
    }

    /** Writes a phrase file in format 2 (it names the Keystore alias that opens it). Returns the bytes written. */
    private byte[] writePhrase(String name, byte mode, String alias, byte[] iv, byte[] sealed) throws IOException {
        byte[] aliasBytes = alias.getBytes(StandardCharsets.US_ASCII);
        if (aliasBytes.length > 255) throw new IOException("Alias too long");
        ByteBuffer buffer = ByteBuffer.allocate(4 + aliasBytes.length + iv.length + sealed.length);
        buffer.put(PHRASE_FORMAT_ALIAS).put(mode).put((byte) aliasBytes.length).put(aliasBytes)
            .put((byte) iv.length).put(iv).put(sealed);
        byte[] bytes = buffer.array();
        write(name, bytes);
        return bytes;
    }

    /**
     * Seals `plain` under a new plain key ("<base>-<uuid>") into `file`, then commits it with
     * `commitSealed`. A write that throws replaces nothing (AtomicFile): the new key goes.
     */
    private void storePlainSealed(PluginCall call, String file, String[] keys, String base, byte[] plain, String failure) {
        String alias = base + "-" + UUID.randomUUID();
        byte[] written;
        try {
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, freshKey(alias, false));
            written = writePhrase(file, MODE_PLAIN, alias, cipher.getIV(), cipher.doFinal(plain));
        } catch (GeneralSecurityException | IOException | ProviderException e) {
            deleteKey(alias);
            call.reject(failure, "KEY_ERROR");
            return;
        }
        commitSealed(call, file, keys, alias, written, plain, failure);
    }

    /**
     * AtomicFile.finishWrite can log a failed sync, close or rename instead of throwing, so a new
     * file counts as written only once it reads back exactly as written and names `alias` (and, for
     * a plain key, opens to `plain`). Only then do the other keys of `keys` go.
     * - Not on disk (the old file is still there): the new key goes; the old file and keys stay.
     * - Cannot tell (the file cannot be read, or it is there but does not open): every key stays,
     *   so whichever file is in place still opens.
     */
    private void commitSealed(
        PluginCall call, String file, String[] keys, String alias, byte[] written, byte[] plain, String failure
    ) {
        byte[] onDisk;
        try {
            onDisk = readOrNull(file);
        } catch (IOException e) {
            call.reject(failure, "IO_ERROR");
            return;
        }
        if (onDisk == null || !MessageDigest.isEqual(onDisk, written)) {
            deleteKey(alias);
            call.reject(failure, "IO_ERROR");
            return;
        }
        if (!namesAlias(onDisk, alias) || (plain != null && !opensTo(onDisk, alias, plain))) {
            call.reject(failure, "KEY_ERROR");
            return;
        }
        deleteKeysExcept(keys, alias);
        call.resolve();
    }

    private static boolean namesAlias(byte[] raw, String alias) {
        try {
            return alias.equals(SealedPhrase.parse(raw).alias);
        } catch (GeneralSecurityException | RuntimeException e) {
            return false;
        }
    }

    /** Whether the phrase file `raw` opens with the key `alias` to exactly `plain`. */
    private boolean opensTo(byte[] raw, String alias, byte[] plain) {
        try {
            SealedPhrase file = SealedPhrase.parse(raw);
            SecretKey key = existingKey(alias);
            if (key == null) return false;
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(GCM_TAG_BITS, file.iv));
            return MessageDigest.isEqual(cipher.doFinal(file.sealed), plain);
        } catch (GeneralSecurityException | IOException | RuntimeException e) {
            return false;
        }
    }

    /** `base` itself (format 1 files), or an alias made from it ("<base>-<uuid>"). */
    private static boolean isAliasOf(String alias, String base) {
        return alias.equals(base) || alias.startsWith(base + "-");
    }

    /** The fixed alias of `mode` (format 1 files), or one made from it by storePhrase. */
    private static boolean isDevicePhraseAlias(String alias, byte mode) {
        return isAliasOf(alias, mode == MODE_AUTH ? KEY_AUTH : KEY_PLAIN);
    }

    /** Deletes every Keystore key made from one of `bases` but `keep` (null: all of them). Never throws. */
    private void deleteKeysExcept(String[] bases, String keep) {
        try {
            KeyStore keyStore = KeyStore.getInstance(KEYSTORE);
            keyStore.load(null);
            List<String> doomed = new ArrayList<>();
            for (Enumeration<String> names = keyStore.aliases(); names.hasMoreElements(); ) {
                String name = names.nextElement();
                if (name.equals(keep)) continue;
                for (String base : bases) {
                    if (isAliasOf(name, base)) {
                        doomed.add(name);
                        break;
                    }
                }
            }
            for (String name : doomed) keyStore.deleteEntry(name);
        } catch (GeneralSecurityException | IOException | RuntimeException e) {
            // The Keystore is unavailable (a ProviderException, say). A leftover key opens nothing
            // without its file, and the file already written must not be reported as failed.
        }
    }

    private AtomicFile atomic(String name) {
        return new AtomicFile(new File(getContext().getFilesDir(), name));
    }

    private byte[] readOrNull(String name) throws IOException {
        try {
            return atomic(name).readFully();
        } catch (FileNotFoundException e) {
            return null;
        }
    }

    private byte[] readOrNullQuietly(String name) {
        try {
            return readOrNull(name);
        } catch (IOException e) {
            return null;
        }
    }

    /** Writes to a temporary file, syncs it, then replaces the old one, so a crash never leaves half a file. */
    private void write(String name, byte[] bytes) throws IOException {
        AtomicFile file = atomic(name);
        FileOutputStream out = file.startWrite();
        try {
            out.write(bytes);
            file.finishWrite(out);
        } catch (IOException e) {
            file.failWrite(out);
            throw e;
        }
    }

    private static void deleteRecursively(File file) {
        File[] children = file.listFiles();
        if (children != null) {
            for (File child : children) deleteRecursively(child);
        }
        //noinspection ResultOfMethodCallIgnored
        file.delete();
    }
}
