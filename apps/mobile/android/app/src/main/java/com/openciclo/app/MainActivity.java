package com.openciclo.app;

import android.content.res.Configuration;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.webkit.WebView;
import android.widget.TextView;

import androidx.activity.OnBackPressedCallback;
import androidx.annotation.NonNull;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Local plugins must be registered before the bridge starts.
        registerPlugin(DeviceVaultPlugin.class);
        super.onCreate(savedInstanceState);
        // The recents screen shows the app's icon instead of a picture of the diary,
        // for every account. Screenshots still work; the app lock adds FLAG_SECURE.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            setRecentsScreenshotEnabled(false);
        }
        Bridge bridge = getBridge();
        if (bridge == null || bridge.getWebView() == null) {
            // No WebView on this phone (Android System WebView disabled or missing):
            // Capacitor could not start. Say so plainly instead of crashing.
            showNoWebViewMessage();
            return;
        }
        // Until the page paints, show the window background (the splash color)
        // instead of the WebView's default white.
        bridge.getWebView().setBackgroundColor(Color.TRANSPARENT);
        getOnBackPressedDispatcher().addCallback(this, backButton);
    }

    // fontScale is in the manifest's configChanges, so a new system font size no longer
    // recreates the activity and the WebView keeps the text zoom it got at creation.
    // Apply the new scale the way the WebView does when it is created.
    // TODO(device check): verify on a phone or emulator, including Android 14's
    // non-linear font scaling (large scales grow small text more than big text).
    @Override
    public void onConfigurationChanged(@NonNull Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        Bridge bridge = getBridge();
        if (bridge == null || bridge.getWebView() == null) return;
        bridge.getWebView().getSettings().setTextZoom(Math.round(newConfig.fontScale * 100));
    }

    private void showNoWebViewMessage() {
        TextView message = new TextView(this);
        message.setText(R.string.no_webview_message);
        message.setGravity(Gravity.CENTER);
        message.setTextSize(18);
        int padding = Math.round(32 * getResources().getDisplayMetrics().density);
        message.setPadding(padding, padding, padding, padding);
        setContentView(message);
    }

    // Back asks the page first (window.cicloBack, apps/web/lib/client/android-back.ts):
    // it may close a sheet or undo an onboarding step. Otherwise the WebView goes back
    // in history. At the first screen, or on the lock screen, Android's default runs.
    private final OnBackPressedCallback backButton = new OnBackPressedCallback(true) {
        @Override
        public void handleOnBackPressed() {
            WebView webView = getBridge().getWebView();
            webView.evaluateJavascript("window.cicloBack ? window.cicloBack() : 'history'", result -> {
                if ("\"handled\"".equals(result)) return;
                if (!"\"exit\"".equals(result) && webView.canGoBack()) {
                    webView.goBack();
                    return;
                }
                setEnabled(false);
                getOnBackPressedDispatcher().onBackPressed();
                setEnabled(true);
            });
        }
    };
}
