package expo.modules.myvpn

import android.content.Intent
import android.net.VpnService
import android.util.Log
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.*

class MyVpnModule : Module() {
    private val TAG = "MyVpnModule"
    private var isConnected = false
    private val VPN_REQUEST_CODE = 12345
    
    override fun define() = ModuleDefinition {
        Name("MyVpnModule")
        
        AsyncFunction("connect") { configUrl: String ->
            withContext(Dispatchers.IO) {
                try {
                    val activity = appContext.currentActivity
                    if (activity == null) {
                        return@withContext "ERROR: No activity"
                    }
                    
                    val intent = VpnService.prepare(activity)
                    if (intent != null) {
                        activity.startActivityForResult(intent, VPN_REQUEST_CODE)
                        return@withContext "REQUEST_PERMISSION"
                    }
                    
                    isConnected = true
                    Log.d(TAG, "VPN Connected to: $configUrl")
                    return@withContext "CONNECTED"
                } catch (e: Exception) {
                    Log.e(TAG, "Error: ${e.message}")
                    return@withContext "ERROR: ${e.message}"
                }
            }
        }
        
        AsyncFunction("disconnect") {
            isConnected = false
            return@AsyncFunction "DISCONNECTED"
        }
        
        AsyncFunction("getStatus") {
            return@AsyncFunction isConnected
        }
    }
}
