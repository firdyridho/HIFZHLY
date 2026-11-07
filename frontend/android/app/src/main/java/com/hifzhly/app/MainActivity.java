package com.hifzhly.app;

import android.app.DownloadManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.webkit.DownloadListener;
import android.widget.Toast;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Pasang DownloadListener pada WebView agar saat berkas .apk diunduh,
        // sistem Android langsung menyimpannya ke folder Download HP via DownloadManager
        // dan menampilkan progress unduhan di status bar notifikasi Android
        if (this.getBridge() != null && this.getBridge().getWebView() != null) {
            this.getBridge().getWebView().setDownloadListener(new DownloadListener() {
                @Override
                public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimeType, long contentLength) {
                    try {
                        DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
                        request.setMimeType("application/vnd.android.package-archive");
                        request.setDescription("Mengunduh Pembaruan Hifzhly...");
                        request.setTitle("hifzhly-update.apk");
                        request.allowScanningByMediaScanner();
                        request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                        request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, "hifzhly-update.apk");

                        DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
                        if (dm != null) {
                            dm.enqueue(request);
                            Toast.makeText(getApplicationContext(), "Mengunduh pembaruan di latar belakang... Silakan pantau di status bar", Toast.LENGTH_LONG).show();
                        }
                    } catch (Exception e) {
                        // Fallback jika DownloadManager dicegah: buka via browser eksternal
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
}
