import 'abort-controller';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import MyVpnModule from './native-modules/MyVpnModule';

const App = () => {
  const [servers, setServers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [currentServer, setCurrentServer] = useState('');

  // Загрузка серверов
  const loadServers = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(
        'https://raw.githubusercontent.com/DarkRoyalty/shnajder-vpn-configs/main/servers.json',
        { signal: AbortSignal.timeout(15000) }
      );

      const data = await response.json();
      let serverList = Array.isArray(data) ? data : data.servers || [];
      const vlessServers = serverList.filter(s => s?.startsWith?.('vless://'));
      
      if (vlessServers.length === 0) throw new Error('No servers');
      
      setServers(vlessServers.slice(0, 200));
      Alert.alert('✅ Успех', `Загружено ${vlessServers.length} серверов`);
    } catch (error) {
      Alert.alert('❌ Ошибка', 'Не удалось загрузить сервера');
      setServers(['vless://test@example.com:443']);
    } finally {
      setLoading(false);
    }
  };

  const connectToVPN = async (server: string) => {
    try {
      const result = await MyVpnModule.connect(server);
      if (result === 'REQUEST_PERMISSION') {
        Alert.alert('Разрешение', 'Разрешите VPN в следующем окне');
        return;
      }
      setConnected(true);
      setCurrentServer(server.substring(0, 50));
      Alert.alert('✅ Подключено', 'VPN активен');
    } catch (error) {
      Alert.alert('❌ Ошибка', String(error));
    }
  };

  const disconnect = async () => {
    await MyVpnModule.disconnect();
    setConnected(false);
    setCurrentServer('');
    Alert.alert('✅ Отключено', 'VPN отключен');
  };

  useEffect(() => { loadServers(); }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Загрузка серверов...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>MyVPN</Text>
      <Text style={styles.subtitle}>Одна кнопка — безопасный интернет</Text>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>📡 Серверов: {servers.length}</Text>
        <Text style={styles.statsText}>🔒 Статус: {connected ? 'Подключено' : 'Отключено'}</Text>
        {connected && <Text style={styles.serverInfo}>🌐 {currentServer}</Text>}
      </View>

      <TouchableOpacity
        style={[styles.button, connected && styles.buttonDisconnect]}
        onPress={connected ? disconnect : () => {
          const randomIndex = Math.floor(Math.random() * servers.length);
          connectToVPN(servers[randomIndex]);
        }}
      >
        <Text style={styles.buttonText}>{connected ? 'ОТКЛЮЧИТЬ' : 'ПОДКЛЮЧИТЬСЯ'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.refreshButton} onPress={loadServers}>
        <Text style={styles.refreshText}>🔄 Обновить сервера</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 32, fontWeight: 'bold', color: '#007AFF', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#888', marginBottom: 40 },
  statsContainer: { backgroundColor: '#1a1a1a', padding: 20, borderRadius: 15, width: '100%', marginBottom: 30 },
  statsText: { color: '#fff', fontSize: 16, marginBottom: 8 },
  serverInfo: { color: '#4CD964', fontSize: 12, marginTop: 8 },
  button: { backgroundColor: '#007AFF', paddingVertical: 18, paddingHorizontal: 40, borderRadius: 30, width: '80%', alignItems: 'center', marginBottom: 20 },
  buttonDisconnect: { backgroundColor: '#FF3B30' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  refreshButton: { paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25, backgroundColor: '#2a2a2a' },
  refreshText: { color: '#007AFF', fontSize: 14 },
  loadingText: { color: '#fff', fontSize: 18, marginTop: 20 },
});

export default App;
