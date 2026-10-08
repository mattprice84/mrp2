import * as LocalAuthentication from 'expo-local-authentication';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState, StyleSheet, View, type AppStateStatus } from 'react-native';

import { Icon } from '@/components/Icon';
import { Button, Txt } from '@/components/ui';
import { colors, fonts, space } from '@/theme';

/**
 * Face ID gate for the whole app.
 *
 * - Nothing inside renders until the first successful unlock.
 * - Going to the background locks the app again.
 * - While the app is inactive (app switcher, Control Center, a system prompt)
 *   an opaque cover hides the content, so the app-switcher preview is blank.
 * - Face ID falls back to the device passcode (the iOS default).
 */
export function AppLock({ children, onUnlock }: { children: ReactNode; onUnlock?: () => void }) {
  const [unlocked, setUnlocked] = useState(false);
  const [everUnlocked, setEverUnlocked] = useState(false);
  const [covered, setCovered] = useState(AppState.currentState !== 'active');
  const [message, setMessage] = useState<string | null>(null);
  const prompting = useRef(false);
  // True at launch and after each trip to the background; cleared when the
  // prompt is shown. Closing the Face ID sheet (inactive -> active) doesn't
  // set it, so Cancel never loops back into another prompt.
  const needsPrompt = useRef(true);

  const unlock = useCallback(async () => {
    if (prompting.current) return;
    prompting.current = true;
    setMessage(null);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock MRP²',
        cancelLabel: 'Cancel',
      });
      if (result.success) {
        setUnlocked(true);
        setEverUnlocked(true);
        onUnlock?.();
      } else if (result.error === 'passcode_not_set' || result.error === 'not_enrolled') {
        setMessage('Set up Face ID or a passcode in iPhone Settings to use MRP².');
      } else if (result.error === 'lockout') {
        setMessage('Too many tries. Lock and unlock your iPhone, then try again.');
      } else if (result.error !== 'user_cancel' && result.error !== 'system_cancel' && result.error !== 'app_cancel') {
        setMessage('That didn’t work. Tap to try again.');
      }
    } finally {
      prompting.current = false;
    }
  }, [onUnlock]);

  const promptIfNeeded = useCallback(() => {
    if (!needsPrompt.current) return;
    needsPrompt.current = false;
    unlock();
  }, [unlock]);

  useEffect(() => {
    if (AppState.currentState === 'active') promptIfNeeded();
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'background') {
        needsPrompt.current = true;
        setUnlocked(false);
        setCovered(true);
      } else if (next === 'inactive') {
        // App switcher, Control Center, or the Face ID sheet itself.
        setCovered(true);
      } else if (next === 'active') {
        setCovered(false);
        promptIfNeeded();
      }
    });
    return () => sub.remove();
  }, [promptIfNeeded]);

  const showLock = !unlocked || covered;

  return (
    <View style={styles.fill}>
      {everUnlocked ? children : null}
      {showLock ? (
        <View style={[StyleSheet.absoluteFill, styles.lock]} accessibilityViewIsModal>
          <Txt style={styles.wordmark}>
            MRP<Txt style={styles.sup}>2</Txt>
          </Txt>
          {!covered || !unlocked ? (
            <View style={styles.actions}>
              <Icon name="faceId" size={44} color={colors.textMuted} strokeWidth={1.4} />
              {message ? (
                <Txt variant="small" style={styles.center}>
                  {message}
                </Txt>
              ) : null}
              {!covered ? <Button label="Unlock" kind="dark" onPress={unlock} style={styles.button} /> : null}
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.page },
  lock: {
    backgroundColor: colors.page,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xxl,
    paddingHorizontal: space.xxl,
    zIndex: 100,
  },
  wordmark: { fontFamily: fonts.heading, fontSize: 40, color: colors.text, letterSpacing: -1 },
  sup: { fontFamily: fonts.heading, fontSize: 20, color: colors.coralText },
  actions: { alignItems: 'center', gap: space.lg, alignSelf: 'stretch' },
  center: { textAlign: 'center' },
  button: { alignSelf: 'stretch' },
});
