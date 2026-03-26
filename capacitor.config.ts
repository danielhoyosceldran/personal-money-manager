import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'personal-money-manager',
  webDir: 'dist',
  server: { androidScheme: 'https' }
};

export default config;
