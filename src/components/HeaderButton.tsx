import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { Icon } from '@/components/Icon';
import { colors, touch } from '@/theme';

/** Round lock button that opens Privacy & Security. */
export function PrivacyButton() {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Privacy and security"
      onPress={() => router.push('/privacy')}
      style={({ pressed }) => [styles.button, pressed && { opacity: 0.7 }]}>
      <Icon name="lock" color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: touch,
    height: touch,
    borderRadius: touch / 2,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
