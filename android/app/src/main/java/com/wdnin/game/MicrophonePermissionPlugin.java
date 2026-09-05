package com.wdnin.game;

import android.Manifest;
import android.content.Intent;
import android.net.Uri;
import android.provider.Settings;
import androidx.core.app.ActivityCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

@CapacitorPlugin(
    name = "MicrophonePermission",
    permissions = {
        @Permission(
            alias = "microphone",
            strings = { Manifest.permission.RECORD_AUDIO }
        )
    }
)
public class MicrophonePermissionPlugin extends Plugin {

    @PluginMethod
    public void checkMicrophonePermission(PluginCall call) {
        PermissionState state = getPermissionState("microphone");
        boolean isPermanentlyDenied = false;
        if (state == PermissionState.DENIED) {
            if (getActivity() != null && !ActivityCompat.shouldShowRequestPermissionRationale(getActivity(), Manifest.permission.RECORD_AUDIO)) {
                isPermanentlyDenied = true;
            }
        }

        JSObject ret = new JSObject();
        ret.put("permission", state != null ? state.toString() : "prompt");
        ret.put("isPermanentlyDenied", isPermanentlyDenied);
        call.resolve(ret);
    }

    @PluginMethod
    public void requestMicrophonePermission(PluginCall call) {
        if (getPermissionState("microphone") == PermissionState.GRANTED) {
            JSObject ret = new JSObject();
            ret.put("permission", "granted");
            ret.put("isPermanentlyDenied", false);
            call.resolve(ret);
        } else {
            requestPermissionForAlias("microphone", call, "microphonePermCallback");
        }
    }

    @PermissionCallback
    private void microphonePermCallback(PluginCall call) {
        PermissionState state = getPermissionState("microphone");
        boolean isPermanentlyDenied = false;
        if (state == PermissionState.DENIED) {
            if (getActivity() != null && !ActivityCompat.shouldShowRequestPermissionRationale(getActivity(), Manifest.permission.RECORD_AUDIO)) {
                isPermanentlyDenied = true;
            }
        }

        JSObject ret = new JSObject();
        ret.put("permission", state != null ? state.toString() : "prompt");
        ret.put("isPermanentlyDenied", isPermanentlyDenied);
        call.resolve(ret);
    }

    @PluginMethod
    public void openAppSettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            Uri uri = Uri.fromParts("package", getContext().getPackageName(), null);
            intent.setData(uri);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);

            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Could not open settings: " + e.getMessage());
        }
    }
}
