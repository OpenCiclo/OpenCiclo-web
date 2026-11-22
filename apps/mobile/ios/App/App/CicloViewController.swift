// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import Capacitor
import UIKit

/// The app's only screen: Capacitor's WebView, plus what MainActivity.java does on Android.
/// - Registers the local plugin (DeviceVaultPlugin) before the page loads.
/// - Keeps the brand mark on screen from the launch screen until the page has painted,
///   so the hand-over to the web boot splash has no blank frame.
/// - Covers the app whenever it is not in front, for every account: the app switcher
///   never shows the diary. (iOS cannot block screenshots; see docs/ios.md.)
class CicloViewController: CAPBridgeViewController {
    private static let markSize: CGFloat = 160
    // If the page never reports that it loaded, the mark still goes away.
    private static let launchMarkTimeout: TimeInterval = 5

    private var launchMark: UIView?
    private var loadingObservation: NSKeyValueObservation?
    private var privacyCover: UIView?

    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(DeviceVaultPlugin())
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        let background = Self.brandBackground()
        // Until the page paints, show the launch screen's color instead of white.
        webView?.isOpaque = false
        webView?.backgroundColor = background
        webView?.scrollView.backgroundColor = background
        showLaunchMark()
        let center = NotificationCenter.default
        center.addObserver(self, selector: #selector(coverApp), name: UIApplication.willResignActiveNotification, object: nil)
        center.addObserver(self, selector: #selector(uncoverApp), name: UIApplication.didBecomeActiveNotification, object: nil)
        #if DEBUG
        warnAboutForeignBundle()
        #endif
    }

    private static func brandBackground() -> UIColor {
        UIColor(named: "BrandBackground") ?? .systemBackground
    }

    /// The page background with the still mark in the middle, laid out like LaunchScreen.storyboard.
    private func brandedCover() -> UIView {
        let cover = UIView()
        cover.backgroundColor = Self.brandBackground()
        cover.translatesAutoresizingMaskIntoConstraints = false
        let mark = UIImageView(image: UIImage(named: "SplashMark"))
        mark.contentMode = .scaleAspectFit
        mark.translatesAutoresizingMaskIntoConstraints = false
        cover.addSubview(mark)
        NSLayoutConstraint.activate([
            mark.centerXAnchor.constraint(equalTo: cover.centerXAnchor),
            mark.centerYAnchor.constraint(equalTo: cover.centerYAnchor),
            mark.widthAnchor.constraint(equalToConstant: Self.markSize),
            mark.heightAnchor.constraint(equalToConstant: Self.markSize)
        ])
        return cover
    }

    private func pin(_ cover: UIView, to parent: UIView) {
        parent.addSubview(cover)
        NSLayoutConstraint.activate([
            cover.topAnchor.constraint(equalTo: parent.topAnchor),
            cover.bottomAnchor.constraint(equalTo: parent.bottomAnchor),
            cover.leadingAnchor.constraint(equalTo: parent.leadingAnchor),
            cover.trailingAnchor.constraint(equalTo: parent.trailingAnchor)
        ])
    }

    // MARK: - Launch

    private func showLaunchMark() {
        guard let webView else { return }
        let mark = brandedCover()
        mark.isUserInteractionEnabled = false
        pin(mark, to: view)
        launchMark = mark
        // The page shows its own splash (the same mark, moving) from an inline script, so
        // by the time the load ends it is on screen under this one.
        loadingObservation = webView.observe(\.isLoading, options: [.new]) { [weak self] _, change in
            guard change.newValue == false else { return }
            DispatchQueue.main.async { self?.hideLaunchMark() }
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + Self.launchMarkTimeout) { [weak self] in
            self?.hideLaunchMark()
        }
    }

    private func hideLaunchMark() {
        loadingObservation = nil
        guard let mark = launchMark else { return }
        launchMark = nil
        UIView.animate(withDuration: 0.15, animations: { mark.alpha = 0 }, completion: { _ in mark.removeFromSuperview() })
    }

    // MARK: - App switcher

    @objc private func coverApp() {
        guard privacyCover == nil, let window = view.window else { return }
        let cover = brandedCover()
        pin(cover, to: window)
        privacyCover = cover
    }

    @objc private func uncoverApp() {
        privacyCover?.removeFromSuperview()
        privacyCover = nil
    }

    // MARK: - Debug

    #if DEBUG
    /// `cap sync ios` copies whatever export the Capacitor config points at. The Android
    /// export would run here with Android wording and Google Play links: say so in the console.
    private func warnAboutForeignBundle() {
        guard let file = Bundle.main.url(forResource: "build-info", withExtension: "json", subdirectory: "public"),
              let data = try? Data(contentsOf: file),
              let info = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            print("Ciclo: public/build-info.json is missing. Run `npm run build:ios` in apps/mobile.")
            return
        }
        if info["target"] as? String != "ios" {
            print("Ciclo: this is not an iOS export (build-info.json target). Run `npm run build:ios` in apps/mobile.")
        }
    }
    #endif
}
