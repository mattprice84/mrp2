import { Manrope_400Regular } from '@expo-google-fonts/manrope/400Regular';
import { Manrope_500Medium } from '@expo-google-fonts/manrope/500Medium';
import { Manrope_600SemiBold } from '@expo-google-fonts/manrope/600SemiBold';
import { Manrope_700Bold } from '@expo-google-fonts/manrope/700Bold';
import { Sora_600SemiBold } from '@expo-google-fonts/sora/600SemiBold';
import { Sora_700Bold } from '@expo-google-fonts/sora/700Bold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { WelcomeSplash } from '@/components/WelcomeSplash';
import { AppLock } from '@/providers/AppLock';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Sora_600SemiBold,
    Sora_700Bold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });
  const ready = fontsLoaded || !!fontError;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.page }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <AuthProvider>
          <Gate />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/** Face ID first, then sign-in → pairing → the app. */
function Gate() {
  const { loading, session, paired } = useAuth();
  const [booted, setBooted] = useState(false);
  const [welcome, setWelcome] = useState(false);
  const welcomedOnce = useRef(false);

  // Hold the first screen until we know who's signed in; after that, keep the
  // navigator mounted through later refreshes.
  if (!loading && !booted) setBooted(true);

  // The welcome photo plays after the first unlock of each launch.
  const onUnlock = useCallback(() => {
    if (welcomedOnce.current) return;
    welcomedOnce.current = true;
    setWelcome(true);
  }, []);

  return (
    <AppLock onUnlock={onUnlock}>
      {booted ? (
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.page } }}>
            <Stack.Protected guard={!session}>
              <Stack.Screen name="sign-in" />
            </Stack.Protected>
            <Stack.Protected guard={!!session && !paired}>
              <Stack.Screen name="pair" />
            </Stack.Protected>
            <Stack.Protected guard={paired}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="privacy" options={{ presentation: 'modal' }} />
            </Stack.Protected>
          </Stack>
          {welcome && paired ? <WelcomeSplash onDone={() => setWelcome(false)} /> : null}
        </View>
      ) : (
        <View style={{ flex: 1, backgroundColor: colors.page }} />
      )}
    </AppLock>
  );
}
