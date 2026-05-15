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
  Platform,
} from 'react-native';
import Vpn from 'react-native-vpn';

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
        {
          headers: {
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(15000),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      let serverList: string[] = [];
      
      if (Array.isArray(data)) {
        serverList = data;
      } else if (data.servers && Array.isArray(data.servers)) {
        serverList = data.servers;
      }
      
      const vlessServers = serverList.filter(s => 
        typeof s === 'string' && s.startsWith('vless://')
      );
      
      if (vlessServers.length === 0) {
        throw new Error('No VLESS servers found');
      }

      const limitedServers = vlessServers.slice(0, 200);
      setServers(limitedServers);
      
      Alert.alert('✅ Успех', `Загружено ${limitedServers.length} серверов`);
      
    } catch (error) {
      console.error('Load error:', error);
      Alert.alert('❌ Ошибка', 'Не удалось загрузить сервера. Проверьте интернет.');
      setServers([
        'vless://test1@example.com:443',
        'vless://test2@example.com:443',
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Парсинг VLESS URL
  const parseVlessUrl = (url: string) => {
    try {
      const withoutProtocol = url.substring(8);
      const uuid = withoutProtocol.substring(0, withoutProtocol.indexOf('@'));
      const hostPort = withoutProtocol.substring(withoutProtocol.indexOf('@') + 1);
      const host = hostPort.split(':')[0];
      const port = parseInt(hostPort.split(':')[1].split('?')[0]);
      
      return { uuid, host, port };
    } catch (e) {
      return null;
    }
  };

  // Подключение к VPN
  const connectToVPN = async (server: string) => {
    try {
      const parsed = parseVlessUrl(server);
      if (!parsed) {
        throw new Error('Invalid VLESS URL');
      }
      
      if (Platform.OS === 'android') {
        const isSupported = await Vpn.isSupported();
        if (!isSupported) {
          throw new Error('VPN not supported on this device');
        }
        
        Alert.alert('Подключение', `Соединение с ${parsed.host}:${parsed.port}`);
        
        const config = {
          server: parsed.host,
          port: parsed.port,
          username: parsed.uuid,
          password: parsed.uuid,
        };
        
        const isConnected = await Vpn.connect(config);
        if (isConnected) {
          setConnected(true);
          setCurrentServer(`${parsed.host}:${parsed.port}`);
          Alert.alert('✅ Подключено', `VPN активен на ${parsed.host}`);
        } else {
          throw new Error('Connection failed');
        }
      } else {
        Alert.alert('Ошибка', 'VPN доступен только на Android');
      }
      
    } catch (error) {
      Alert.alert('❌ Ошибка подключения', String(error));
      console.error(error);
    }
  };

  const disconnect = async () => {
    try {
      await Vpn.disconnect();
      setConnected(false);
      setCurrentServer('');
      Alert.alert('✅ Отключено', 'VPN отключен');
    } catch (error) {
      Alert.alert('❌ Ошибка', 'Не удалось отключиться');
      console.error(error);
    }
  };

  const connectRandom = () => {
    if (servers.length === 0) {
      Alert.alert('Ошибка', 'Нет доступных серверов');
      return;
    }
    const randomIndex = Math.floor(Math.random() * servers.length);
    connectToVPN(servers[randomIndex]);
  };

  useEffect(() => {
    loadServers();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Загрузка серверов...</Text>
        <Text style={styles.smallText}>Это может занять до 10 секунд</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>MyVPN</Text>
      <Text style={styles.subtitle}>Одна кнопка — безопасный интернет</Text>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          📡 Серверов: {servers.length}
        </Text>
        <Text style={styles.statsText}>
          🔒 Статус: {connected ? 'Подключено' : 'Отключено'}
        </Text>
        {connected && (
          <Text style={styles.serverInfo}>
            🌐 {currentServer}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.button, connected && styles.buttonDisconnect]}
        onPress={connected ? disconnect : connectRandom}
      >
        <Text style={styles.buttonText}>
          {connected ? 'ОТКЛЮЧИТЬ' : 'ПОДКЛЮЧИТЬСЯ'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.refreshButton} onPress={loadServers}>
        <Text style={styles.refreshText}>🔄 Обновить сервера</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Случайный сервер из {servers.length} доступных
      </Text>
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 40,
  },
  statsContainer: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 15,
    width: '100%',
    marginBottom: 30,
  },
  statsText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  serverInfo: {
    color: '#4CD964',
    fontSize: 12,
    marginTop: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '80%',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisconnect: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  refreshButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    backgroundColor: '#2a2a2a',
  },
  refreshText: {
    color: '#007AFF',
    fontSize: 14,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 20,
  },
  smallText: {
    color: '#888',
    fontSize: 12,
    marginTop: 10,
  },
  footer: {
    color: '#555',
    fontSize: 12,
    marginTop: 40,
    textAlign: 'center',
  },
});

export default App;
