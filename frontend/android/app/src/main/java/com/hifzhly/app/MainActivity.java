package com.hifzhly.app;

import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.webkit.DownloadListener;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.widget.Toast;
import androidx.core.content.FileProvider;
import com.getcapacitor.BridgeActivity;
import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Locale;

public class MainActivity extends BridgeActivity {
    private long downloadId = -1;
    private BroadcastReceiver onDownloadCompleteReceiver;

    public class InAppUpdaterBridge {
        @JavascriptInterface
        public void startInAppDownload(final String downloadUrl) {
            new Thread(new Runnable() {
                @Override
                public void run() {
                    HttpURLConnection conn = null;
                    InputStream input = null;
                    OutputStream output = null;
                    try {
                        URL url = new URL(downloadUrl);
                        conn = (HttpURLConnection) url.openConnection();
                        conn.setInstanceFollowRedirects(true);
                        conn.setRequestProperty("User-Agent", "Mozilla/5.0 Hifzhly-Android-App");
                        conn.connect();

                        // Penanganan HTTP Redirects (GitHub Release diarahkan ke AWS S3)
                        int status = conn.getResponseCode();
                        if (status == HttpURLConnection.HTTP_MOVED_TEMP || status == HttpURLConnection.HTTP_MOVED_PERM || status == 307 || status == 308) {
                            String redirectUrl = conn.getHeaderField("Location");
                            if (redirectUrl != null) {
                                conn.disconnect();
                                url = new URL(redirectUrl);
                                conn = (HttpURLConnection) url.openConnection();
                                conn.setRequestProperty("User-Agent", "Mozilla/5.0 Hifzhly-Android-App");
                                conn.connect();
                            }
                        }

                        int fileLength = conn.getContentLength();
                        if (fileLength <= 0) {
                            fileLength = 20 * 1024 * 1024; // Estimasi 20MB
                        }

                        File downloadDir = getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
                        if (downloadDir == null) {
                            downloadDir = getCacheDir();
                        }
                        final File outputFile = new File(downloadDir, "hifzhly-latest.apk");
                        if (outputFile.exists()) {
                            outputFile.delete();
                        }

                        input = new BufferedInputStream(conn.getInputStream());
                        output = new FileOutputStream(outputFile);

                        byte[] data = new byte[16384];
                        long total = 0;
                        int count;
                        long lastReportTime = 0;

                        while ((count = input.read(data)) != -1) {
                            total += count;
                            output.write(data, 0, count);

                            long now = System.currentTimeMillis();
                            if (now - lastReportTime > 150) {
                                lastReportTime = now;
                                int percent = (int) Math.min(99, (total * 100) / fileLength);
                                String loadedMB = String.format(Locale.US, "%.1f", total / (1024.0 * 1024.0));
                                String totalMB = String.format(Locale.US, "%.1f", fileLength / (1024.0 * 1024.0));
                                dispatchDownloadProgress(percent, loadedMB, totalMB, false, "");
                            }
                        }

                        output.flush();
                        output.close();
                        input.close();
                        conn.disconnect();

                        String finalMB = String.format(Locale.US, "%.1f", total / (1024.0 * 1024.0));
                        dispatchDownloadProgress(100, finalMB, finalMB, true, "");

                        // Otomatis langsung buka Package Installer Android tanpa keluar dari aplikasi
                        runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                try {
                                    Uri apkUri;
                                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                                        apkUri = FileProvider.getUriForFile(MainActivity.this, getPackageName() + ".fileprovider", outputFile);
                                    } else {
                                        apkUri = Uri.fromFile(outputFile);
                                    }

                                    Intent installIntent = new Intent(Intent.ACTION_VIEW);
                                    installIntent.setDataAndType(apkUri, "application/vnd.android.package-archive");
                                    installIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                                    installIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                                    startActivity(installIntent);
                                } catch (Exception e) {
                                    Toast.makeText(getApplicationContext(), "Pemasang paket gagal terbuka: " + e.getMessage(), Toast.LENGTH_LONG).show();
                                }
                            }
                        });

                    } catch (final Exception e) {
                        dispatchDownloadProgress(0, "0", "0", false, e.getMessage());
                    } finally {
                        try {
                            if (output != null) output.close();
                            if (input != null) input.close();
                            if (conn != null) conn.disconnect();
                        } catch (Exception ignored) {}
                    }
                }
            }).start();
        }
    }

    private void dispatchDownloadProgress(final int percent, final String loadedMB, final String totalMB, final boolean isComplete, final String error) {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (getBridge() != null && getBridge().getWebView() != null) {
                    String js = String.format(Locale.US,
                        "window.dispatchEvent(new CustomEvent('hifzhly_in_app_update_progress', { detail: { percent: %d, loadedMB: '%s', totalMB: '%s', isComplete: %b, error: '%s' } }));",
                        percent, loadedMB, totalMB, isComplete, error
                    );
                    getBridge().getWebView().evaluateJavascript(js, null);
                }
            }
        });
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Receiver untuk otomatis membuka installer setelah DownloadManager selesai mengunduh APK
        onDownloadCompleteReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                long id = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1);
                if (downloadId != -1 && id == downloadId) {
                    try {
                        DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
                        DownloadManager.Query query = new DownloadManager.Query();
                        query.setFilterById(id);
                        Cursor cursor = dm.query(query);
                        if (cursor != null && cursor.moveToFirst()) {
                            int statusIndex = cursor.getColumnIndex(DownloadManager.COLUMN_STATUS);
                            if (statusIndex != -1 && cursor.getInt(statusIndex) == DownloadManager.STATUS_SUCCESSFUL) {
                                File apkFile = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), "hifzhly-update.apk");
                                if (apkFile.exists()) {
                                    Uri apkUri;
                                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                                        apkUri = FileProvider.getUriForFile(context, getPackageName() + ".fileprovider", apkFile);
                                    } else {
                                        apkUri = Uri.fromFile(apkFile);
                                    }

                                    Intent installIntent = new Intent(Intent.ACTION_VIEW);
                                    installIntent.setDataAndType(apkUri, "application/vnd.android.package-archive");
                                    installIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                                    installIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                                    startActivity(installIntent);
                                }
                            }
                            cursor.close();
                        }
                    } catch (Exception e) {
                        Toast.makeText(getApplicationContext(), "Pembaruan selesai diunduh. Silakan buka folder Download untuk memasang.", Toast.LENGTH_LONG).show();
                    }
                }
            }
        };

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                registerReceiver(onDownloadCompleteReceiver, new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE), Context.RECEIVER_EXPORTED);
            } else {
                registerReceiver(onDownloadCompleteReceiver, new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE));
            }
        } catch (Exception ignored) {}

        // Konfigurasi WebView untuk In-App Downloader & Resilient Audio Playback
        if (this.getBridge() != null && this.getBridge().getWebView() != null) {
            WebSettings settings = this.getBridge().getWebView().getSettings();
            settings.setMediaPlaybackRequiresUserGesture(false);

            // Daftarkan Javascript Interface resmi untuk In-App Update
            this.getBridge().getWebView().addJavascriptInterface(new InAppUpdaterBridge(), "AndroidAppUpdater");

            // Pasang DownloadListener cadangan
            this.getBridge().getWebView().setDownloadListener(new DownloadListener() {
                @Override
                public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimeType, long contentLength) {
                    try {
                        File oldFile = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), "hifzhly-update.apk");
                        if (oldFile.exists()) {
                            oldFile.delete();
                        }

                        DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
                        request.setMimeType("application/vnd.android.package-archive");
                        request.setDescription("Mengunduh Pembaruan Hifzhly...");
                        request.setTitle("hifzhly-update.apk");
                        request.allowScanningByMediaScanner();
                        request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                        request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, "hifzhly-update.apk");

                        DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
                        if (dm != null) {
                            downloadId = dm.enqueue(request);
                        }
                    } catch (Exception e) {
                        try {
                            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            startActivity(intent);
                        } catch (Exception ignored) {}
                    }
                }
            });
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (onDownloadCompleteReceiver != null) {
            try {
                unregisterReceiver(onDownloadCompleteReceiver);
            } catch (Exception ignored) {}
        }
    }
}
