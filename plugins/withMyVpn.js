const { withDangerousMod, withPlugins } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withMyVpn = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const androidPath = path.join(config.modRequest.platformProjectRoot, 'app', 'src', 'main', 'java', 'com', 'myvpn');
      
      // Создаём папку если нет
      if (!fs.existsSync(androidPath)) {
        fs.mkdirSync(androidPath, { recursive: true });
      }
      
      // Создаём файл модуля
      const moduleContent = `
package com.myvpn;

import android.content.Intent;
import android.net.VpnService;
import android.util.Log;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class MyVpnModule extends ReactContextBaseJavaModule {
    private static final String TAG = "MyVpnModule";
    private static final int VPN_REQUEST_CODE = 12345;
    private ReactApplicationContext reactContext;
    private boolean isConnected = false;
    
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
            Intent intent = VpnService.prepare(reactContext);
            if (intent != null) {
                if (getCurrentActivity() != null) {
                    getCurrentActivity().startActivityForResult(intent, VPN_REQUEST_CODE);
                }
                promise.resolve("REQUEST_PERMISSION");
                return;
            }
            isConnected = true;
            Log.d(TAG, "Connected to: " + configUrl);
            promise.resolve("CONNECTED");
        } catch (Exception e) {
            promise.reject("VPN_ERROR", e.getMessage());
        }
    }
    
    @ReactMethod
    public void disconnect(Promise promise) {
        isConnected = false;
        promise.resolve("DISCONNECTED");
    }
    
    @ReactMethod
    public void getStatus(Promise promise) {
        promise.resolve(isConnected);
    }
}
      `;
      
      fs.writeFileSync(path.join(androidPath, 'MyVpnModule.java'), moduleContent);
      
      return config;
    },
  ]);
};

module.exports = withMyVpn;
