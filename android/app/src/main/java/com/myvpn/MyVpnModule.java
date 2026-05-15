package com.myvpn;

import android.content.Intent;
import android.net.VpnService;
import android.os.ParcelFileDescriptor;
import android.util.Log;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;

public class MyVpnModule extends ReactContextBaseJavaModule {
    private static final String TAG = "MyVpnModule";
    private static final int VPN_REQUEST_CODE = 12345;
    private ReactApplicationContext reactContext;
    private ParcelFileDescriptor vpnInterface = null;
    private Thread vpnThread = null;
    private boolean running = false;
    
    public MyVpnModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
    }
    
    @Override
    public String getName() {
        return "MyVpnModule";
    }
    
    @ReactMethod
    public void connect(String configUrl, Promise promise) {
        try {
            Log.d(TAG, "Connecting to: " + configUrl);
            Intent intent = VpnService.prepare(reactContext);
            if (intent != null) {
                if (getCurrentActivity() != null) {
                    getCurrentActivity().startActivityForResult(intent, VPN_REQUEST_CODE);
                }
                promise.resolve("REQUEST_PERMISSION");
                return;
            }
            
            // Создаём VPN интерфейс
            VpnService.Builder builder = new VpnService.Builder();
            builder.setSession("MyVPN")
                .addAddress("10.0.0.2", 32)
                .addRoute("0.0.0.0", 0)
                .addDnsServer("8.8.8.8")
                .addDnsServer("8.8.4.4")
                .setMtu(1500)
                .setBlocking(true);
            
            vpnInterface = builder.establish();
            
            if (vpnInterface == null) {
                promise.reject("VPN_FAILED", "Failed to establish VPN");
                return;
            }
            
            running = true;
            vpnThread = new Thread(() -> {
                FileInputStream input = null;
                FileOutputStream output = null;
                try {
                    input = new FileInputStream(vpnInterface.getFileDescriptor());
                    output = new FileOutputStream(vpnInterface.getFileDescriptor());
                    byte[] buffer = new byte[32767];
                    while (running) {
                        int length = input.read(buffer);
                        if (length > 0) {
                            output.write(buffer, 0, length);
                        }
                    }
                } catch (IOException e) {
                    Log.e(TAG, "Tunnel error", e);
                }
            });
            vpnThread.start();
            
            promise.resolve("CONNECTED");
        } catch (Exception e) {
            Log.e(TAG, "Connect error", e);
            promise.reject("VPN_ERROR", e.getMessage());
        }
    }
    
    @ReactMethod
    public void disconnect(Promise promise) {
        try {
            running = false;
            if (vpnThread != null) {
                vpnThread.interrupt();
                vpnThread = null;
            }
            if (vpnInterface != null) {
                vpnInterface.close();
                vpnInterface = null;
            }
            promise.resolve("DISCONNECTED");
        } catch (Exception e) {
            promise.reject("DISCONNECT_ERROR", e.getMessage());
        }
    }
    
    @ReactMethod
    public void getStatus(Promise promise) {
        promise.resolve(vpnInterface != null);
    }
}
