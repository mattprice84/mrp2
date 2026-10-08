import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen, Txt } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { colors, fonts, radius, space } from '@/theme';

export default function SignIn() {
  const { setAppleGivenName } = useAuth();
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setError(null);
    try {
      // Apple gets a hash of a one-time value; Supabase checks the original.
      const rawNonce = Crypto.randomUUID();
      const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME],
        nonce: hashedNonce,
      });
      if (!credential.identityToken) throw new Error('No identity token from Apple.');
      // Apple only shares the name on the very first sign-in.
      setAppleGivenName(credential.fullName?.givenName ?? null);
      const { error: authError } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
        nonce: rawNonce,
      });
      if (authError) throw authError;
    } catch (e: unknown) {
      if ((e as { code?: string })?.code === 'ERR_REQUEST_CANCELED') return;
      setError('Sign-in didn’t go through. Check your connection and try again.');
    }
  }

  return (
    <Screen scroll={false} style={styles.root}>
      <View style={styles.hero}>
        <Txt style={styles.wordmark}>
          MRP<Txt style={styles.sup}>2</Txt>
        </Txt>
        <Txt variant="body" style={styles.center}>
          Just for the two of you.
        </Txt>
      </View>
      <View style={styles.bottom}>
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={radius.control}
          style={styles.apple}
          onPress={signIn}
        />
        {error ? (
          <Txt variant="small" style={[styles.center, { color: colors.coralText }]}>
            {error}
          </Txt>
        ) : null}
        <Txt variant="caption" style={styles.center}>
          You sign in once on each phone. After that, Face ID opens the app.
        </Txt>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'space-between', paddingBottom: space.xxl * 2 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.sm },
  wordmark: { fontFamily: fonts.heading, fontSize: 56, letterSpacing: -1.5, color: colors.text },
  sup: { fontFamily: fonts.heading, fontSize: 28, color: colors.coralText },
  bottom: { gap: space.md },
  apple: { height: 52, alignSelf: 'stretch' },
  center: { textAlign: 'center' },
});
