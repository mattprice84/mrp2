import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { Card, Screen, Soon, Txt } from '@/components/ui';
import { colors, fonts, radius, space, touch } from '@/theme';

const tiles: { title: string; note: string; icon: IconName; color: string }[] = [
  { title: 'Cook tonight', note: 'Recipes + groceries', icon: 'pot', color: colors.mintText },
  { title: 'Movie night', note: 'Your six services', icon: 'tv', color: colors.amberText },
  { title: 'Live events', note: 'Concerts, comedy, theater', icon: 'music', color: colors.amberText },
  { title: 'Gifts', note: 'From your notebook', icon: 'gift', color: colors.lavenderText },
];

export default function Plan() {
  return (
    <Screen>
      <Txt variant="title" style={{ marginTop: space.xl }}>
        Plan
      </Txt>

      <Card tint={colors.coral} style={{ gap: 10 }}>
        <Txt variant="eyebrow" style={{ color: colors.text, opacity: 0.8 }}>
          DATE NIGHT
        </Txt>
        <Txt variant="cardTitle" style={{ fontFamily: fonts.heading, fontSize: 20 }}>
          Skip the questions?
        </Txt>
        <View style={styles.quickRow}>
          {['Same vibe as last time', 'Surprise us', 'Ask me'].map((q) => (
            <View key={q} style={styles.quick}>
              <Txt style={styles.quickText}>{q}</Txt>
            </View>
          ))}
        </View>
        <Txt variant="small" style={{ color: colors.text }}>
          Restaurant picks arrive in Milestone 5.
        </Txt>
      </Card>

      <View style={styles.grid}>
        {tiles.map((t) => (
          <View key={t.title} style={styles.tile}>
            <Icon name={t.icon} color={t.color} />
            <Txt variant="bodyStrong">{t.title}</Txt>
            <Txt variant="caption" style={{ color: colors.textSecondary }}>
              {t.note}
            </Txt>
          </View>
        ))}
      </View>

      <Card style={{ gap: space.sm }}>
        <View style={styles.between}>
          <Txt variant="bodyStrong" style={{ fontSize: 13 }}>
            Monthly date budget
          </Txt>
          <Txt variant="small">Not set</Txt>
        </View>
        <View style={styles.track} />
        <Soon>Arrives in a later milestone.</Soon>
      </Card>

      <Card tint={colors.lavenderTint} style={styles.nudge}>
        <Icon name="calendarPlus" color={colors.lavenderText} />
        <Txt variant="small" style={{ flex: 1, color: colors.text }}>
          Date-night nudges find an evening you’re both free. Arrives in Milestone 3.
        </Txt>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  quickRow: { flexDirection: 'row', gap: space.sm },
  quick: {
    flex: 1,
    minHeight: touch,
    borderRadius: radius.control,
    backgroundColor: colors.page,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.sm,
    opacity: 0.7,
  },
  quickText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.text, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: {
    width: '48.5%',
    flexGrow: 1,
    flexBasis: '45%',
    minHeight: 84,
    backgroundColor: colors.surface,
    borderRadius: radius.tile,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: space.xs,
  },
  between: { flexDirection: 'row', justifyContent: 'space-between' },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.track },
  nudge: { flexDirection: 'row', alignItems: 'center', gap: space.md },
});
