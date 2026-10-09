package com.digitalbhai.app;

import android.app.Activity;
import android.app.DownloadManager;
import android.content.ClipData;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.LinearLayout;
import android.widget.Toast;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.RequestConfiguration;
import com.google.firebase.analytics.FirebaseAnalytics;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.Locale;
import org.json.JSONObject;

public class MainActivity extends Activity {
    private WebView web;
    private FirebaseAnalytics fa;
    private static final String FILEPROVIDER_AUTH = "com.digitalbhai.app.fileprovider";
    private static final int REQ_RECORD_AUDIO = 1001;
    private SpeechRecognizer speechRecognizer;
    private String pendingVoiceLang = "hi-IN";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Firebase Analytics auto-initializes from google-services.json.
        try { fa = FirebaseAnalytics.getInstance(this); } catch (Exception ignored) {}
        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        web.setWebViewClient(new WebViewClient(){
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url){
                if(url!=null&&(url.startsWith("http://")||url.startsWith("https://"))){
                    try{ startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url))); }
                    catch(Exception e){ view.loadUrl(url); }
                    return true;
                }
                return false;
            }
        });
        setContentView(buildLayoutWithAds());
        initAds();
        web.addJavascriptInterface(new AppBridge(), "Android");
        if (savedInstanceState != null) web.restoreState(savedInstanceState);
        else web.loadUrl("file:///android_asset/www/index.html");
    }

    /** WebView on top + AdMob banner at the bottom. Ads must never crash the app. */
    private LinearLayout buildLayoutWithAds() {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        LinearLayout.LayoutParams webLp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f);
        web.setLayoutParams(webLp);
        root.addView(web);
        try {
            adView = new AdView(this);
            // Hasnain's real AdMob banner unit (created 2026-10-01).
            adView.setAdUnitId("ca-app-pub-1457912071506893/4479331241");
            adView.setAdSize(AdSize.BANNER);
            LinearLayout.LayoutParams adLp = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT);
            adView.setLayoutParams(adLp);
            root.addView(adView);
        } catch (Exception ignored) {}
        return root;
    }

    private AdView adView;

    /** Initializes AdMob safely. Audience is school students, so ads are
     *  marked child-directed with max content rating G. */
    private void initAds() {
        try {
            RequestConfiguration conf = new RequestConfiguration.Builder()
                    .setTagForChildDirectedTreatment(
                            RequestConfiguration.TAG_FOR_CHILD_DIRECTED_TREATMENT_TRUE)
                    .setMaxAdContentRating(RequestConfiguration.MAX_AD_CONTENT_RATING_G)
                    .build();
            MobileAds.setRequestConfiguration(conf);
            MobileAds.initialize(this, initializationStatus -> loadBannerAd());
        } catch (Exception ignored) {}
    }

    /** Loads banner ad with automatic retry on failure (up to 5 times). */
    private int adRetryCount = 0;
    private void loadBannerAd() {
        try {
            if (adView == null) return;
            adView.setAdListener(new AdListener() {
                @Override public void onAdLoaded() {
                    adRetryCount = 0;
                    try { adView.setVisibility(android.view.View.VISIBLE); } catch (Exception ignored) {}
                }
                @Override public void onAdFailedToLoad(LoadAdError error) {
                    if (adRetryCount < 5) {
                        adRetryCount++;
                        adView.postDelayed(() -> loadBannerAd(), 30000 * adRetryCount);
                    }
                }
            });
            adView.loadAd(new AdRequest.Builder().build());
        } catch (Exception ignored) {}
    }

    @Override
    protected void onPause() {
        try { if (adView != null) adView.pause(); } catch (Exception ignored) {}
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        try { if (adView != null) adView.resume(); } catch (Exception ignored) {}
    }

    @Override
    protected void onDestroy() {
        try { if (adView != null) adView.destroy(); } catch (Exception ignored) {}
        try { stopNativeVoice(); } catch (Exception ignored) {}
        super.onDestroy();
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        if (web != null) web.saveState(outState);
    }

    @Override
    public void onBackPressed() {
        if (web != null) {
            web.evaluateJavascript("(typeof window.androidBack==='function')?window.androidBack():false", new android.webkit.ValueCallback<String>() {
                @Override public void onReceiveValue(String v) {
                    if (!"true".equals(v)) MainActivity.super.onBackPressed();
                }
            });
        } else super.onBackPressed();
    }

    // ---------- Share: send the real installed APK via system chooser ----------
    private void shareApkViaSystem() {
        try {
            File src = new File(getApplicationInfo().sourceDir);
            File shareDir = new File(getCacheDir(), "share");
            if (!shareDir.exists()) shareDir.mkdirs();
            File dst = new File(shareDir, "DigitalBhai.apk");
            try (InputStream in = new FileInputStream(src);
                 OutputStream out = new FileOutputStream(dst)) {
                byte[] buf = new byte[65536];
                int n;
                while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
            }
            Uri uri = FileProvider.getUriForFile(this, FILEPROVIDER_AUTH, dst);
            Intent i = new Intent(Intent.ACTION_SEND);
            i.setType("application/vnd.android.package-archive");
            i.putExtra(Intent.EXTRA_STREAM, uri);
            i.putExtra(Intent.EXTRA_TEXT,
                    "Digital Bhai \uD83D\udcbb \u2014 Cyber Cafe management app, by Hasnain");
            i.setClipData(ClipData.newRawUri("Digital Bhai", uri));
            i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(Intent.createChooser(i, "Share Digital Bhai App"));
        } catch (Exception e) {
            Toast.makeText(MainActivity.this,
                    "Share fail ho gaya \uD83D\uDE1E", Toast.LENGTH_LONG).show();
        }
    }

    /** JS bridge: window.Android.shareApk() — shares the installed APK file itself. */
    private class AppBridge {
        @JavascriptInterface
        public void shareApk() {
            runOnUiThread(new Runnable() {
                @Override public void run() { shareApkViaSystem(); }
            });
        }

        /** JS bridge: window.Android.getVersionCode() — installed versionCode for update checks. */
        @JavascriptInterface
        public int getVersionCode() {
            try { return BuildConfig.VERSION_CODE; } catch (Exception e) { return 0; }
        }

        /** JS bridge: window.Android.openUrl(url) — opens a link in the external browser.
         *  Only http/https allowed. */
        @JavascriptInterface
        public void openUrl(String url) {
            final String u = url;
            runOnUiThread(new Runnable() {
                @Override public void run() {
                    try {
                        if (u == null || !(u.startsWith("https://") || u.startsWith("http://"))) {
                            Toast.makeText(MainActivity.this, "Link nahi khul paya", Toast.LENGTH_LONG).show();
                            return;
                        }
                        Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(u));
                        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        startActivity(i);
                    } catch (Exception e) {
                        Toast.makeText(MainActivity.this, "Link nahi khul paya", Toast.LENGTH_LONG).show();
                    }
                }
            });
        }

        /** JS bridge: window.Android.downloadApk(url) — downloads the APK directly
         *  with Android's DownloadManager: system notification shows progress,
         *  tapping the finished download opens the installer. Falls back to
         *  openUrl() if anything goes wrong. */
        @JavascriptInterface
        public void downloadApk(String url) {
            final String u = url;
            runOnUiThread(new Runnable() {
                @Override public void run() {
                    try {
                        if (u == null || !(u.startsWith("https://") || u.startsWith("http://"))) {
                            Toast.makeText(MainActivity.this, "Download link sahi nahi hai", Toast.LENGTH_LONG).show();
                            return;
                        }
                        DownloadManager dm = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
                        long dlId = -1;
                        try {
                            if (dm != null) {
                                DownloadManager.Request req = new DownloadManager.Request(Uri.parse(u));
                                req.setTitle("Digital Bhai Update");
                                req.setDescription("Naya version download ho raha hai…");
                                req.setNotificationVisibility(
                                        DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                                req.setDestinationInExternalPublicDir(
                                        Environment.DIRECTORY_DOWNLOADS, "DigitalBhai.apk");
                                req.setMimeType("application/vnd.android.package-archive");
                                req.setAllowedOverMetered(true);
                                req.setAllowedOverRoaming(true);
                                dlId = dm.enqueue(req);
                            }
                        } catch (Exception ignored) { dlId = -1; }
                        if (dlId != -1) {
                            Toast.makeText(MainActivity.this,
                                    "⬇ Download shuru ho gaya — notification me dekho",
                                    Toast.LENGTH_LONG).show();
                        } else {
                            openUrl(u);
                            Toast.makeText(MainActivity.this,
                                    "Browser me download khul raha hai…",
                                    Toast.LENGTH_LONG).show();
                        }
                    } catch (Exception e) {
                        openUrl(u);
                    }
                }
            });
        }

        /** JS bridge: window.Android.logEvent(name, paramsJson) — Firebase Analytics.
         *  Never throws: analytics must never break the app. */
        @JavascriptInterface
        public void logEvent(String name, String paramsJson) {
            try {
                Bundle b = new Bundle();
                try {
                    JSONObject o = new JSONObject(paramsJson);
                    Iterator<String> k = o.keys();
                    while (k.hasNext()) {
                        String key = k.next();
                        b.putString(key, o.optString(key, ""));
                    }
                } catch (Exception ignored) {}
                if (fa != null && name != null && !name.isEmpty()) fa.logEvent(name, b);
            } catch (Exception ignored) {}
        }

        /** JS bridge: window.Android.startVoiceInput(lang) — native speech recognition.
         *  Web Speech API WebView me kaam nahi karta, isliye native SpeechRecognizer.
         *  Result: window.onVoiceResult(text) | Error: window.onVoiceError() */
        @JavascriptInterface
        public void startVoiceInput(String lang) {
            final String l = (lang != null && !lang.isEmpty()) ? lang : "hi-IN";
            runOnUiThread(new Runnable() {
                @Override public void run() { startNativeVoice(l); }
            });
        }

        /** JS bridge: window.Android.stopVoiceInput() */
        @JavascriptInterface
        public void stopVoiceInput() {
            runOnUiThread(new Runnable() {
                @Override public void run() { stopNativeVoice(); }
            });
        }
    }

    // ---------- native voice input (SpeechRecognizer) ----------
    private void startNativeVoice(String lang) {
        try {
            pendingVoiceLang = lang;
            if (ContextCompat.checkSelfPermission(this,
                    android.Manifest.permission.RECORD_AUDIO)
                    != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this,
                        new String[]{android.Manifest.permission.RECORD_AUDIO},
                        REQ_RECORD_AUDIO);
                return;
            }
            beginListening(lang);
        } catch (Exception e) {
            voiceErrorToJs();
        }
    }

    private void beginListening(String lang) {
        try {
            stopNativeVoice();
            if (!SpeechRecognizer.isRecognitionAvailable(this)) {
                voiceErrorToJs();
                return;
            }
            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this);
            Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL,
                    RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang);
            intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
            speechRecognizer.setRecognitionListener(new RecognitionListener() {
                @Override public void onReadyForSpeech(Bundle p) { voiceStateToJs(true); }
                @Override public void onBeginningOfSpeech() {}
                @Override public void onRmsChanged(float v) {}
                @Override public void onBufferReceived(byte[] b) {}
                @Override public void onEndOfSpeech() { voiceStateToJs(false); }
                @Override public void onError(int e) { voiceErrorToJs(); stopNativeVoice(); }
                @Override public void onResults(Bundle r) {
                    try {
                        ArrayList<String> list = r.getStringArrayList(
                                SpeechRecognizer.RESULTS_RECOGNITION);
                        if (list != null && !list.isEmpty()) voiceResultToJs(list.get(0));
                        else voiceErrorToJs();
                    } catch (Exception e) { voiceErrorToJs(); }
                    stopNativeVoice();
                }
                @Override public void onPartialResults(Bundle r) {}
                @Override public void onEvent(int t, Bundle p) {}
            });
            speechRecognizer.startListening(intent);
        } catch (Exception e) {
            voiceErrorToJs();
        }
    }

    private void stopNativeVoice() {
        try {
            if (speechRecognizer != null) {
                speechRecognizer.stopListening();
                speechRecognizer.cancel();
                speechRecognizer.destroy();
                speechRecognizer = null;
            }
        } catch (Exception ignored) {}
    }

    private void voiceResultToJs(final String text) {
        try {
            final String safe = text == null ? "" :
                    text.replace("\\", "\\\\").replace("'", "\\'").replace("\n", " ");
            runOnUiThread(new Runnable() {
                @Override public void run() {
                    try { web.evaluateJavascript(
                            "window.onVoiceResult && window.onVoiceResult('" + safe + "')",
                            null); } catch (Exception ignored) {}
                }
            });
        } catch (Exception ignored) {}
    }

    private void voiceErrorToJs() {
        try {
            runOnUiThread(new Runnable() {
                @Override public void run() {
                    try { web.evaluateJavascript(
                            "window.onVoiceError && window.onVoiceError()",
                            null); } catch (Exception ignored) {}
                }
            });
        } catch (Exception ignored) {}
    }

    private void voiceStateToJs(final boolean listening) {
        try {
            runOnUiThread(new Runnable() {
                @Override public void run() {
                    try { web.evaluateJavascript(
                            "window.onVoiceState && window.onVoiceState(" + listening + ")",
                            null); } catch (Exception ignored) {}
                }
            });
        } catch (Exception ignored) {}
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions,
                                           int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        try {
            if (requestCode == REQ_RECORD_AUDIO) {
                if (grantResults.length > 0
                        && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    beginListening(pendingVoiceLang);
                } else {
                    Toast.makeText(this,
                            "🎤 ke liye mic permission chahiye",
                            Toast.LENGTH_LONG).show();
                    voiceErrorToJs();
                }
            }
        } catch (Exception ignored) {}
    }
}
