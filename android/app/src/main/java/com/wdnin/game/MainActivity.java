package com.wdnin.game;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.webkit.PermissionRequest;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(MicrophonePermissionPlugin.class);
        super.onCreate(savedInstanceState);

        // Configure WebView WebChromeClient to smoothly allow WebRTC audio capture
        // once native RECORD_AUDIO permission has been granted
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().setWebChromeClient(new BridgeWebChromeClient(getBridge()) {
                @Override
                public void onPermissionRequest(final PermissionRequest request) {
                    MainActivity.this.runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            boolean hasAudioCapture = false;
                            if (request.getResources() != null) {
                                for (String resource : request.getResources()) {
                                    if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource)) {
                                        hasAudioCapture = true;
                                        break;
                                    }
                                }
                            }
                            if (hasAudioCapture && ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
                                request.grant(new String[]{ PermissionRequest.RESOURCE_AUDIO_CAPTURE });
                            } else {
                                request.deny();
                            }
                        }
                    });
                }
            });
        }
    }
}

