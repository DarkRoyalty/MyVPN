import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';

// ⚠️ ВАЖНО: ЗАМЕНИТЕ ЭТУ ССЫЛКУ НА ВАШУ
const SERVERS_URL = 'https://raw.githubusercontent.com/DarkRoyalty/shnajder-vpn-configs/main/vless-configs/servers.json';

interface Server {
  id: string;
  name: string;
  url: string;
  location: string;
}

const App = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('Готов к подключению');
  const [servers, setServers] = useState<Server[]>([]);
  const [currentServer, setCurrentServer] = useState<Server | null>(null);

  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = async () => {
    try {
      const response = await fetch(SERVERS_URL);
      const data = await response.json();
      setServers(data.servers);
      console.log('Загружено серверов:', data.servers.length);
    } catch (error) {
      console.error('Ошибка загрузки серверов:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить список серверов');
    }
  };

  const connectVPN = async () => {
    if (!servers.length) {
      Alert.alert('Ошибка', 'Нет доступных серверов');
      return;
    }

    setIsLoading(true);
    setStatusText('🔄 Подключение к серверу...');

    try {
      const server = servers[0];
      setCurrentServer(server);
      
      // Здесь будет реальное VPN подключение
      // Пока имитируем подключение
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsConnected(true);
      setStatusText(`✅ Подключено (${server.location})`);
    } catch (error) {
      console.error('VPN ошибка:', error);
      setStatusText('❌ Ошибка подключения');
      Alert.alert('Ошибка', 'Не удалось подключиться к VPN');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectVPN = async () => {
    setIsLoading(true);
    setStatusText('⏹️ Отключение...');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsConnected(false);
      setStatusText('Готов к подключению');
      setCurrentServer(null);
    } catch (error) {
      console.error('Ошибка отключения:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePress = () => {
    if (isConnected) {
      disconnectVPN();
    } else {
      connectVPN();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      <Text style={styles.title}>One Button VPN</Text>

      {currentServer && (
        <Text style={styles.serverInfo}>
          Сервер: {currentServer.location}
        </Text>
      )}

      <Text style={styles.statusText}>{statusText}</Text>

      <TouchableOpacity
        style={[
          styles.button,
          isConnected ? styles.buttonConnected : styles.buttonDisconnected,
          isLoading && styles.buttonLoading,
        ]}
        onPress={handlePress}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>
            {isConnected ? 'ОТКЛЮЧИТЬСЯ' : 'ПОДКЛЮЧИТЬСЯ'}
          </Text>
        )}
      </TouchableOpacity>

      <Text style={styles.footer}>
        🔒 Ваше подключение защищено
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a2e',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  serverInfo: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 18,
    color: '#aaaaaa',
    marginBottom: 50,
    textAlign: 'center',
  },
  button: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisconnected: {
    backgroundColor: '#4CAF50',
  },
  buttonConnected: {
    backgroundColor: '#F44336',
  },
  buttonLoading: {
    backgroundColor: '#666666',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    fontSize: 12,
    color: '#666666',
  },
});

export default App;
