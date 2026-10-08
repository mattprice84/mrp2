import { StyleSheet, View } from 'react-native';

import { Card, Screen, Soon, Txt } from '@/components/ui';
import { useAuth } from '@/providers/AuthProvider';
import { colors, fonts, radius, roleColor, space } from '@/theme';

export default function Calendar() {
  const { me, spouse } = useAuth();
  const today = new Date();
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  const people = [me, spouse]
    .filter((p) => p?.role)
    .sort((a, b) => (a!.role! < b!.role! ? -1 : 1))
    .map((p) => ({ label: p!.display_name ?? p!.role!, color: roleColor[p!.role!] }));

  return (
    <Screen>
      <View style={styles.header}>
        <Txt variant="title" style={{ fontSize: 26 }}>
          Our week
        </Txt>
        <View style={styles.legend}>
          {[...people, { label: 'Us', color: colors.mint }].map((p) => (
            <View key={p.label} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: p.color }]} />
              <Txt variant="caption" style={{ color: colors.textSecondary }}>
                {p.label}
              </Txt>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.days}>
        {week.map((d, i) => (
          <View key={d.toISOString()} style={[styles.day, i === 0 && { backgroundColor: colors.peachTint }]}>
            <Txt variant="caption" style={{ color: colors.textSecondary }}>
              {d.toLocaleDateString('en-US', { weekday: 'short' })}
            </Txt>
            <Txt style={styles.dayNum}>{d.getDate()}</Txt>
          </View>
        ))}
      </View>

      <Card>
        <Txt variant="bodyStrong">Your calendars, side by side</Txt>
        <Txt variant="small">
          Both of your Apple calendars (and Google, if you use it) in one week view. Work events show only as “busy” unless
          you share them. Conflicts get a suggested fix.
        </Txt>
        <Soon>Arrives in Milestone 3.</Soon>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: space.xl },
  legend: { flexDirection: 'row', gap: space.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  days: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { width: 44, alignItems: 'center', gap: 6, paddingVertical: space.sm, borderRadius: 14 },
  dayNum: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.text },
  card: { borderRadius: radius.row },
});
