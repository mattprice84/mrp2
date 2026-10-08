import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Txt } from '@/components/ui';
import { pickWelcomePhoto } from '@/lib/welcome-photos';
import { useAuth } from '@/providers/AuthProvider';
import { colors, fonts } from '@/theme';

const HOLD_MS = 2400;
const FADE_MS = 900;
/** How long to wait for a photo before showing the words on their own. */
const PHOTO_WAIT_MS = 1200;

/**
 * Full-screen couple photo with a slow zoom and "Matt & Megan · date · N years".
 * Fades into Home after about 2.4s. A tap skips it.
 */
export function WelcomeSplash({ onDone }: { onDone: () => void }) {
  const { me, spouse, couple } = useAuth();
  const [photo, setPhoto] = useState<{ uri: string; cacheKey: string } | null>(null);
  // With no couple there is no photo to wait for.
  const [ready, setReady] = useState(!couple?.id);
  const [zoom] = useState(() => new Animated.Value(1.08));
  const [words] = useState(() => new Animated.Value(0));
  const [fade] = useState(() => new Animated.Value(1));
  const finished = useRef(false);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    onDone();
  };

  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(() => !cancelled && setReady(true), PHOTO_WAIT_MS);
    if (couple?.id) {
      pickWelcomePhoto(couple.id)
        .then((p) => {
          if (cancelled) return;
          setPhoto(p);
          if (!p) setReady(true);
        })
        .catch(() => !cancelled && setReady(true));
    }
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [couple?.id]);

  useEffect(() => {
    if (!ready) return;
    Animated.parallel([
      Animated.timing(zoom, { toValue: 1, duration: 3300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(words, { toValue: 1, duration: 1000, delay: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(fade, { toValue: 0, duration: FADE_MS, delay: HOLD_MS, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]).start(({ finished: done }) => done && finish());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const names = [me, spouse]
    .filter((p) => p?.role)
    .sort((a, b) => (a!.role! < b!.role! ? -1 : 1))
    .map((p) => p!.display_name)
    .filter(Boolean)
    .join(' & ');

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, { opacity: fade }]}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={finish}
        accessibilityRole="button"
        accessibilityLabel="Skip welcome photo">
        <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ scale: zoom }] }]}>
          {photo ? (
            <Image
              source={{ uri: photo.uri, cacheKey: photo.cacheKey }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              cachePolicy="disk"
              onLoad={() => setReady(true)}
              onError={() => setReady(true)}
              transition={300}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.photoPlaceholder }]} />
          )}
        </Animated.View>

        <Svg style={styles.scrim} width="100%" height="100%" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id="scrim" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0" stopColor={colors.text} stopOpacity={0.72} />
              <Stop offset="1" stopColor={colors.text} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#scrim)" />
        </Svg>

        <Animated.View
          style={[
            styles.words,
            { opacity: words, transform: [{ translateY: words.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] },
          ]}>
          <Txt style={styles.names}>{names || 'MRP²'}</Txt>
          {couple?.wedding_date ? <Txt style={styles.date}>{dateLine(couple.wedding_date)}</Txt> : null}
        </Animated.View>
        <Txt style={styles.skip}>Tap to skip</Txt>
      </Pressable>
    </Animated.View>
  );
}

/** "OCT 20, 2016 · 10 YEARS" */
function dateLine(isoDate: string) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const wed = new Date(y, m - 1, d);
  const now = new Date();
  let years = now.getFullYear() - y;
  if (now.getMonth() < m - 1 || (now.getMonth() === m - 1 && now.getDate() < d)) years -= 1;
  const date = wed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const yrs = years === 1 ? '1 YEAR' : `${Math.max(years, 0)} YEARS`;
  return `${date.toUpperCase()} · ${yrs}`;
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.page, zIndex: 50 },
  scrim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 320 },
  words: { position: 'absolute', left: 0, right: 0, bottom: 96, alignItems: 'center', gap: 6 },
  names: { fontFamily: fonts.headingSemi, fontSize: 34, letterSpacing: -0.5, color: colors.textOnDark },
  date: { fontFamily: fonts.bodySemi, fontSize: 14, letterSpacing: 2, color: colors.textOnDark, opacity: 0.9 },
  skip: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 40,
    textAlign: 'center',
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textOnDark,
    opacity: 0.75,
  },
});
