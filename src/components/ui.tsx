import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, radius, roleColor, space, touch, type, type Role } from '@/theme';

type Variant = keyof typeof type;

export function Txt({ variant = 'body', style, ...rest }: TextProps & { variant?: Variant }) {
  const base: TextStyle = type[variant];
  const own = StyleSheet.flatten(style) ?? {};
  // A variant's line height is sized for its own font size. When a screen
  // makes the text bigger without giving a line height, grow the line too,
  // or iOS clips the tops of the letters.
  const size = own.fontSize ?? base.fontSize;
  const line = own.lineHeight ?? base.lineHeight;
  const fit = size && line && line < size * 1.2 ? { lineHeight: Math.round(size * 1.25) } : null;
  return <Text {...rest} style={[base, own, fit]} />;
}

/** Scrolling page with the warm background and room for the tab bar. */
export function Screen({
  children,
  scroll = true,
  style,
}: {
  children: ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  const pad = { paddingTop: insets.top + space.md, paddingBottom: space.xxl };
  if (!scroll) {
    return <View style={[styles.page, styles.content, pad, style]}>{children}</View>;
  }
  return (
    <ScrollView style={styles.page} contentContainerStyle={[styles.content, pad, style]}>
      {children}
    </ScrollView>
  );
}

export function Card({
  children,
  tint,
  style,
  onPress,
  accessibilityLabel,
}: {
  children: ReactNode;
  tint?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const body = [styles.card, tint ? { backgroundColor: tint, borderColor: tint } : null, style];
  if (!onPress) return <View style={body}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [body, pressed && { opacity: 0.85 }]}>
      {children}
    </Pressable>
  );
}

export function Avatar({ role, size = 40, ring }: { role: Role; size?: number; ring?: boolean }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: roleColor[role],
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: ring ? 3 : 0,
        borderColor: colors.page,
      }}>
      <Text style={{ fontFamily: fonts.bodyBold, fontSize: size * 0.4, color: colors.text }}>{role}</Text>
    </View>
  );
}

export function AvatarPair() {
  return (
    <View style={{ flexDirection: 'row' }}>
      <Avatar role="H" ring />
      <View style={{ marginLeft: -12 }}>
        <Avatar role="W" ring />
      </View>
    </View>
  );
}

type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  kind?: 'primary' | 'dark' | 'outline' | 'quiet';
  busy?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, kind = 'primary', busy, disabled, style, ...rest }: ButtonProps) {
  const fill: Record<NonNullable<ButtonProps['kind']>, ViewStyle> = {
    primary: { backgroundColor: colors.coral },
    dark: { backgroundColor: colors.selected },
    outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.borderStrong },
    quiet: { backgroundColor: colors.page },
  };
  const textColor = kind === 'dark' ? colors.onSelected : colors.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled || busy, busy }}
      disabled={disabled || busy}
      {...rest}
      style={({ pressed }) => [
        styles.button,
        fill[kind],
        (disabled || busy) && { opacity: 0.5 },
        pressed && { opacity: 0.8 },
        style,
      ]}>
      {busy ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={{ fontFamily: fonts.bodyBold, fontSize: 15, color: textColor }}>{label}</Text>
      )}
    </Pressable>
  );
}

export function Pill({
  label,
  selected,
  onPress,
  disabled,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={(touch - 36) / 2}
      style={[
        styles.pill,
        selected && { backgroundColor: colors.selected, borderColor: colors.selected },
        disabled && { opacity: 0.6 },
      ]}>
      <Text style={{ fontFamily: fonts.bodySemi, fontSize: 13, color: selected ? colors.onSelected : colors.textMuted }}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Small "arrives in Milestone N" note used on placeholder cards. */
export function Soon({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return (
    <Txt variant="caption" style={style}>
      {children}
    </Txt>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.page },
  content: { paddingHorizontal: space.gutter, gap: space.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.lg,
    gap: 6,
  },
  button: {
    minHeight: touch + 4,
    borderRadius: radius.control,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.lg,
  },
  pill: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
