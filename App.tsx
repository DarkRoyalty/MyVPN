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

// Базовый URL для ваших конфигов
const BASE_URL = 'https://raw.githubusercontent.com/DarkRoyalty/shnajder-vpn-configs/main/githubmirror/';

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

  // Загрузка всех 26 файлов с серверами
  useEffect(() => {
    loadAllServers();
  }, []);

  const loadAllServers = async () => {
    setStatusText('🔄 Загрузка серверов...');
    const allServers: Server[] = [];
    
    for (let i = 1; i <= 26; i++) {
      try {
        const url = `${BASE_URL}${i}.txt`;
        const response = await fetch(url);
        const content = await response.text();
        
        // Парсим VLESS ссылки из файла
        const lines = content.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('vless://') || trimmed.startsWith('trojan://') || trimmed.startsWith('vmess://')) {
            // Извлекаем название из ссылки (после #)
            let name = `Сервер ${i}`;
            const hashIndex = trimmed.indexOf('#');
            if (hashIndex !== -1) {
              name = decodeURIComponent(trimmed.substring(hashIndex + 1)).replace(/[^\w\sА-Яа-я-]/g, '');
              if (name.length > 30) name = name.substring(0, 30);
            }
            
            allServers.push({
              id: `${i}-${allServers.length}`,
              name: name,
              url: trimmed,
              location: `Сервер ${i}`,
            });
          }
        }
        console.log(`Загружено из ${i}.txt: ${lines.length} строк`);
      } catch (error) {
        console.error(`Ошибка загрузки ${i}.txt:`, error);
      }
    }
    
    setServers(allServers);
    setStatusText(`✅ Загружено ${allServers.length} серверов`);
    console.log('Всего серверов:', allServers.length);
  };

  const connectVPN = async () => {
    if (servers.length === 0) {
      Alert.alert('Ошибка', 'Нет доступных серверов. Проверьте интернет.');
      return;
    }

    setIsLoading(true);
    setStatusText('🔄 Подключение к серверу...');

    try {
      // Берём первый сервер из списка
      const server = servers[0];
      setCurrentServer(server);
      
      // TODO: Здесь будет реальное VPN подключение через react-native-vpn
      // Пока имитируем подключение
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsConnected(true);
      setStatusText(`✅ Подключено (${server.name})`);
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
          Сервер: {currentServer.name}
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
        🔒 Всего серверов: {servers.length}
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
