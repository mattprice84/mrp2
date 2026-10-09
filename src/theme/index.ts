/**
 * MRP² design tokens. Every screen takes its colors, fonts, radii and spacing
 * from here; never hard-code a one-off value in a component.
 */

export const colors = {
  // Surfaces
  page: '#F4EFEA',
  surface: '#FFFFFF',
  border: '#ECE6E0',
  borderStrong: '#E2DCE8', // outlined buttons and inputs
  hover: '#FFF8F3',

  // Text
  text: '#221C2B',
  textSecondary: '#6B6380',
  textTertiary: '#7A728C',
  textMuted: '#4A4458',
  textOnDark: '#FFFFFF',
  tabInactive: '#8A8299',

  // Accent fills (use dark text on top)
  coral: '#FF7A59',
  mint: '#5FD3B5',
  lavender: '#B8A6FF',
  amber: '#FFB547',

  // Accent text on white (darkened for contrast)
  coralText: '#C94A26',
  mintText: '#17785F',
  lavenderText: '#5B3FC4',
  amberText: '#9A5B00',

  // Tinted cards
  lavenderTint: '#EFEAFF',
  peachTint: '#FFF0E8',
  mintTint: '#E5F6F0',
  amberTint: '#FFF3DE',
  peachBorder: '#F3C6B2',
  track: '#ECE6F1',

  // Selected pills and segmented controls
  selected: '#221C2B',
  onSelected: '#FFFFFF',

  // Splash
  photoPlaceholder: '#E8DED6',
  scrim: 'rgba(34,28,43,0.72)',
  scrimClear: 'rgba(34,28,43,0)',
} as const;

/** Avatar colors: H = Matt (lavender), W = Megan (coral). */
export const roleColor = { H: colors.lavender, W: colors.coral } as const;
export type Role = keyof typeof roleColor;

export const fonts = {
  heading: 'Sora_700Bold',
  headingSemi: 'Sora_600SemiBold',
  body: 'Manrope_400Regular',
  bodyMedium: 'Manrope_500Medium',
  bodySemi: 'Manrope_600SemiBold',
  bodyBold: 'Manrope_700Bold',
} as const;

export const radius = {
  card: 20,
  tile: 18,
  row: 16,
  control: 12,
  sheet: 28,
  pill: 999,
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  gutter: 18,
} as const;

/** Minimum touch target, in points. */
export const touch = 44;

export const type = {
  title: { fontFamily: fonts.heading, fontSize: 28, letterSpacing: -0.5, color: colors.text },
  cardTitle: { fontFamily: fonts.headingSemi, fontSize: 19, lineHeight: 25, color: colors.text },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 0.2 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: colors.text },
  bodyStrong: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.text },
  small: { fontFamily: fonts.bodyMedium, fontSize: 13, lineHeight: 18, color: colors.textSecondary },
  caption: { fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 17, color: colors.textTertiary },
} as const;
