package com.hrsup.eco.erp;

import android.os.Bundle;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

public class MainActivity extends BridgeActivity {
    private boolean isFallbackLoaded = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Safe default FirebaseApp initialization to prevent native crash when google-services.json is absent
        try {
            if (FirebaseApp.getApps(this).isEmpty()) {
                FirebaseOptions options = new FirebaseOptions.Builder()
                        .setApplicationId("com.hrsup.eco.erp")
                        .setApiKey("AIzaSyDummyKeyForLocalInitializationOnly12345")
                        .setProjectId("eco-erp-system")
                        .build();
                FirebaseApp.initializeApp(this, options);
            }
        } catch (Throwable t) {
            // Safe fallback
        }

        super.onCreate(savedInstanceState);

        // Robust offline fallback: If remote live endpoint is unreachable, fallback to bundled local assets
        if (getBridge() != null && getBridge().getWebView() != null) {
            final WebView webView = getBridge().getWebView();
            webView.setWebViewClient(new BridgeWebViewClient(getBridge()) {
                @Override
                public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                    super.onReceivedError(view, request, error);
                    if (request.isForMainFrame() && !isFallbackLoaded) {
                        isFallbackLoaded = true;
                        view.post(() -> view.loadUrl("https://localhost"));
                    }
                }
            });
        }
    }
}
