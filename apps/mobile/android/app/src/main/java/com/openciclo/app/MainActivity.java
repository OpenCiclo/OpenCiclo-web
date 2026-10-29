package com.openciclo.app;

import android.os.Bundle;
import android.webkit.WebView;

import androidx.activity.OnBackPressedCallback;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Local plugins must be registered before the bridge starts.
        registerPlugin(DeviceVaultPlugin.class);
        super.onCreate(savedInstanceState);
        getOnBackPressedDispatcher().addCallback(this, backButton);
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
