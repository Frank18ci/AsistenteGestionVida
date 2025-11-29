import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { initDatabase } from '../src/database/database'; // Asegúrate que la ruta sea correcta

// Mantiene la pantalla de carga (Splash) visible hasta que le digamos lo contrario
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // 1. Inicializamos la Base de Datos
        console.log('Iniciando carga de Base de Datos...');
        await initDatabase();
        
        // 2. Aquí podrías cargar fuentes personalizadas si quisieras
        // await Font.loadAsync({ ... });
        
      } catch (e) {
        console.warn('Error iniciando la app:', e);
      } finally {
        // 3. Decimos a la app que ya terminó de cargar todo
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // Esta función oculta la pantalla de carga cuando la UI ya se renderizó
  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
      console.log('App lista y visible');
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null; // Muestra la pantalla de carga nativa mientras espera
  }

  return (
    // El View con onLayout es el truco para ocultar el Splash Screen en el momento exacto
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Cargamos el grupo de pestañas (Tabs) como pantalla principal */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </View>
  );
}