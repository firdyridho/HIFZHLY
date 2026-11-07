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
import android.widget.Toast;
import androidx.core.content.FileProvider;
import com.getcapacitor.BridgeActivity;
import java.io.File;

public class MainActivity extends BridgeActivity {
    private long downloadId = -1;
    private BroadcastReceiver onDownloadCompleteReceiver;

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

        // Pasang DownloadListener pada WebView agar saat berkas .apk diunduh,
        // sistem Android langsung menyimpannya ke folder Download HP via DownloadManager
        if (this.getBridge() != null && this.getBridge().getWebView() != null) {
            this.getBridge().getWebView().setDownloadListener(new DownloadListener() {
                @Override
                public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimeType, long contentLength) {
                    try {
                        // Hapus file lama jika ada agar unduhan selalu bersih
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
                            Toast.makeText(getApplicationContext(), "Mengunduh pembaruan di latar belakang... Pemasang otomatis terbuka saat selesai.", Toast.LENGTH_LONG).show();
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
