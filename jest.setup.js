// Configuração global dos testes (Jest)
import '@testing-library/react-native';

// AsyncStorage em memória
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// SafeAreaView/Provider sem módulo nativo
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

// Firebase nunca é chamado de verdade nos testes
jest.mock('./src/config/firebase', () => ({
  db: {},
  isFirebaseConfigured: () => true,
  firebaseConfig: {},
}));

// Notificações: evita carregar o módulo nativo real (que emite avisos do Expo Go)
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('mock-notification-id'),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(null),
  AndroidImportance: { HIGH: 6 },
  SchedulableTriggerInputTypes: { DATE: 'date' },
}));

// expo-crypto é nativo: no Jest usamos o módulo "crypto" do Node (mesmo algoritmo SHA-256)
jest.mock('expo-crypto', () => {
  const nodeCrypto = require('crypto');
  return {
    CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
    digestStringAsync: jest.fn(async (algorithm, data) =>
      nodeCrypto.createHash('sha256').update(data).digest('hex'),
    ),
    randomUUID: jest.fn(() => nodeCrypto.randomUUID()),
  };
});
