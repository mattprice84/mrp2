import { StyleSheet, View } from 'react-native';

import { PrivacyButton } from '@/components/HeaderButton';
import { Icon, type IconName } from '@/components/Icon';
import { Card, Screen, Txt } from '@/components/ui';
import { useAuth } from '@/providers/AuthProvider';
import { colors, radius, space } from '@/theme';

export default function Us() {
  const { spouse } = useAuth();
  const spouseName = spouse?.display_name ?? 'your spouse';

  const rows: { title: string; note: string; icon: IconName; bg: string; fg: string }[] = [
    { title: 'Memories', note: 'On this day, timeline, welcome photos · Milestone 4', icon: 'photo', bg: colors.peachTint, fg: colors.coralText },
    { title: `My notebook about ${spouseName}`, note: 'Private · feeds gift ideas · Milestone 4', icon: 'notebook', bg: colors.mintTint, fg: colors.mintText },
    { title: 'Just us', note: 'Private check-in · separate lock · Milestone 4', icon: 'heart', bg: colors.lavenderTint, fg: colors.lavenderText },
    { title: 'Our tastes', note: 'Music, comedy, shows, food, TV', icon: 'list', bg: colors.amberTint, fg: colors.amberText },
    { title: 'Our playlist', note: 'Shared · Spotify or Apple Music, later', icon: 'music', bg: colors.mintTint, fg: colors.mintText },
  ];

  return (
    <Screen>
      <View style={styles.header}>
        <Txt variant="title">Us</Txt>
        <PrivacyButton />
      </View>

      <Card tint={colors.lavenderTint}>
        <Txt variant="eyebrow" style={{ color: colors.lavenderText }}>
          TODAY’S QUESTION
        </Txt>
        <Txt variant="cardTitle" style={{ fontSize: 17 }}>
          Daily questions and your streak arrive in Milestone 3.
        </Txt>
      </Card>

      {rows.map((r) => (
        <View key={r.title} style={styles.row}>
          <View style={[styles.badge, { backgroundColor: r.bg }]}>
            <Icon name={r.icon} color={r.fg} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt variant="bodyStrong">{r.title}</Txt>
            <Txt variant="small">{r.note}</Txt>
          </View>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 64,
    padding: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.tile,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badge: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
