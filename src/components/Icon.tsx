import Svg, { Circle, Path, Polygon, Rect } from 'react-native-svg';

import { colors } from '@/theme';

/** Stroke icons drawn to match the prototype (24×24, 1.8 stroke). */
const glyphs = {
  home: <Path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />,
  chat: <Path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />,
  plan: (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M15.5 8.5l-2 5-5 2 2-5z" />
    </>
  ),
  heart: <Path d="M12 20s-7-4.5-9-9a4.5 4.5 0 0 1 9-3 4.5 4.5 0 0 1 9 3c-2 4.5-9 9-9 9z" />,
  calendar: (
    <>
      <Rect x="3" y="5" width="18" height="16" rx="2" />
      <Path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  calendarPlus: (
    <>
      <Rect x="3" y="5" width="18" height="16" rx="2" />
      <Path d="M3 10h18M8 3v4M16 3v4M12 14v4M10 16h4" />
    </>
  ),
  lock: (
    <>
      <Rect x="5" y="11" width="14" height="10" rx="2" />
      <Path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  alert: <Path d="M12 3l10 18H2zM12 10v5M12 18v.5" />,
  camera: (
    <>
      <Path d="M4 7h3l2-3h6l2 3h3v13H4z" />
      <Circle cx="12" cy="13" r="4" />
    </>
  ),
  photo: (
    <>
      <Rect x="3" y="5" width="18" height="14" rx="2" />
      <Circle cx="9" cy="10" r="2" />
      <Path d="M21 16l-5-5-8 8" />
    </>
  ),
  notebook: <Path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM9 9h6M9 13h4" />,
  list: <Path d="M4 6h16M4 12h10M4 18h6" />,
  music: (
    <>
      <Path d="M9 18V5l12-2v13" />
      <Circle cx="6" cy="18" r="3" />
      <Circle cx="18" cy="16" r="3" />
    </>
  ),
  gift: (
    <>
      <Rect x="3" y="8" width="18" height="13" rx="1" />
      <Path d="M12 8v13M3 12h18M12 8c-2-4-6-4-6-1s6 1 6 1zm0 0c2-4 6-4 6-1s-6 1-6 1z" />
    </>
  ),
  tv: (
    <>
      <Rect x="3" y="5" width="18" height="12" rx="2" />
      <Path d="M8 21h8M12 17v4" />
    </>
  ),
  pot: <Path d="M4 11h16v2a7 7 0 0 1-7 7h-2a7 7 0 0 1-7-7zM8 7c0-1 1-1.5 1-3M12 7c0-1 1-1.5 1-3M16 7c0-1 1-1.5 1-3" />,
  mic: (
    <>
      <Rect x="9" y="3" width="6" height="11" rx="3" />
      <Path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </>
  ),
  check: <Path d="M5 12l5 5L20 7" />,
  chevron: <Path d="M9 6l6 6-6 6" />,
  close: <Path d="M6 6l12 12M18 6L6 18" />,
  more: (
    <>
      <Circle cx="12" cy="5" r="1" />
      <Circle cx="12" cy="12" r="1" />
      <Circle cx="12" cy="19" r="1" />
    </>
  ),
  play: <Polygon points="7 5 19 12 7 19 7 5" />,
  plus: <Path d="M12 5v14M5 12h14" />,
  trash: <Path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
  faceId: <Path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M9 9v1M15 9v1M12 9v4h-1M9 16c1.5 1 4.5 1 6 0" />,
} as const;

export type IconName = keyof typeof glyphs;

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function Icon({ name, size = 20, color = colors.text, strokeWidth = 1.8 }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round">
      {glyphs[name]}
    </Svg>
  );
}
