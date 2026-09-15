package com.sahyog.app;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private SwipeRefreshLayout swipeRefresh;
    private LinearLayout errorLayout;
    private EditText urlInput;
    private Button btnRetry, btnSaveUrl;
    private TextView errorText;

    private static final String PREFS_NAME = "SahYogPrefs";
    private static final String KEY_SERVER_URL = "server_url";
    
    // Default Verified Live URL: Vercel production domain
    private static final String DEFAULT_URL = "https://shayog-rb55.vercel.app/customer/dashboard";

    private SharedPreferences prefs;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);

        // Only set default URL if not yet initialized
        if (!prefs.contains(KEY_SERVER_URL)) {
            prefs.edit().putString(KEY_SERVER_URL, DEFAULT_URL).apply();
        }

        swipeRefresh = findViewById(R.id.swipeRefresh);
        webView = findViewById(R.id.webView);
        errorLayout = findViewById(R.id.errorLayout);
        urlInput = findViewById(R.id.urlInput);
        btnRetry = findViewById(R.id.btnRetry);
        btnSaveUrl = findViewById(R.id.btnSaveUrl);
        errorText = findViewById(R.id.errorText);

        swipeRefresh.setColorSchemeColors(0xFF0D9488, 0xFF059669);
        swipeRefresh.setOnRefreshListener(() -> {
            if (webView.getUrl() != null && !webView.getUrl().isEmpty()) {
                webView.reload();
            } else {
                loadAppUrl();
            }
        });

        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        webSettings.setLoadWithOverviewMode(true);
        webSettings.setUseWideViewPort(true);
        webSettings.setBuiltInZoomControls(false);
        webSettings.setDisplayZoomControls(false);
        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        // Custom UA so our website knows it's inside the native APK (hides download banner)
        String defaultUA = webSettings.getUserAgentString();
        webSettings.setUserAgentString(defaultUA + " SahYogApp/1.0");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();

                // Silently redirect if any Vercel login redirect occurs without showing popup
                if (url.contains("vercel.com/login") || 
                    url.contains("vercel.com/sso-api") || 
                    (url.contains("shayog.vercel.app") && !url.contains("shayog-rb55"))) {
                    view.loadUrl(DEFAULT_URL);
                    return true;
                }

                // Handle UPI Payment Intents (Google Pay, PhonePe, Paytm, BHIM)
                if (url.startsWith("upi://") || 
                    url.startsWith("tez://") || 
                    url.startsWith("phonepe://") || 
                    url.startsWith("paytmmp://")) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW);
                        intent.setData(Uri.parse(url));
                        startActivity(intent);
                        return true;
                    } catch (Exception e) {
                        try {
                            Intent fallbackIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("upi://pay"));
                            startActivity(fallbackIntent);
                            return true;
                        } catch (Exception ex) {
                            Toast.makeText(MainActivity.this, "No UPI app (Google Pay / PhonePe) found.", Toast.LENGTH_SHORT).show();
                            return true;
                        }
                    }
                }

                if (url.startsWith("tel:")) {
                    Intent intent = new Intent(Intent.ACTION_DIAL, Uri.parse(url));
                    startActivity(intent);
                    return true;
                }

                return false;
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                swipeRefresh.setRefreshing(true);
                if (url.contains("vercel.com/login")) {
                    view.stopLoading();
                    view.loadUrl(DEFAULT_URL);
                }
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                swipeRefresh.setRefreshing(false);
                if (!url.contains("vercel.com/login")) {
                    errorLayout.setVisibility(View.GONE);
                    webView.setVisibility(View.VISIBLE);
                    // Remember the last active page URL so refreshing or relaunching restores this exact screen
                    if (url.contains("shayog-rb55.vercel.app")) {
                        prefs.edit().putString(KEY_SERVER_URL, url).apply();
                        urlInput.setText(url);
                    }
                } else {
                    view.loadUrl(DEFAULT_URL);
                }
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) {
                    swipeRefresh.setRefreshing(false);
                    showErrorScreen("Connection to server failed. Please verify internet connection or tap retry.");
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient());

        btnRetry.setOnClickListener(v -> loadAppUrl());

        btnSaveUrl.setOnClickListener(v -> {
            String newUrl = urlInput.getText().toString().trim();
            if (!newUrl.isEmpty()) {
                if (!newUrl.startsWith("http://") && !newUrl.startsWith("https://")) {
                    newUrl = "https://" + newUrl;
                }
                prefs.edit().putString(KEY_SERVER_URL, newUrl).apply();
                Toast.makeText(MainActivity.this, "URL Saved! Connecting...", Toast.LENGTH_SHORT).show();
                loadAppUrl();
            }
        });

        loadAppUrl();
    }


    private void loadAppUrl() {
        String targetUrl = prefs.getString(KEY_SERVER_URL, DEFAULT_URL);
        if (targetUrl == null || !targetUrl.contains("shayog-rb55.vercel.app")) {
            targetUrl = DEFAULT_URL;
        }
        urlInput.setText(targetUrl);
        errorLayout.setVisibility(View.GONE);
        webView.setVisibility(View.VISIBLE);
        webView.loadUrl(targetUrl);
    }

    private void showErrorScreen(String message) {
        webView.setVisibility(View.GONE);
        errorLayout.setVisibility(View.VISIBLE);
        errorText.setText(message);
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}
