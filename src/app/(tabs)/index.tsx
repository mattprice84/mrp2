import { StyleSheet, View } from 'react-native';

import { PrivacyButton } from '@/components/HeaderButton';
import { Icon } from '@/components/Icon';
import { AvatarPair, Card, Pill, Screen, Soon, Txt } from '@/components/ui';
import { useAuth } from '@/providers/AuthProvider';
import { colors, space } from '@/theme';

export default function Home() {
  const { me, spouse } = useAuth();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const spouseName = spouse?.display_name ?? 'your spouse';

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Txt variant="small">{today}</Txt>
          <Txt variant="title" style={{ marginTop: space.xs }}>
            Hi {me?.display_name ?? 'there'}
          </Txt>
        </View>
        <View style={styles.headerRight}>
          <AvatarPair />
          <PrivacyButton />
        </View>
      </View>

      <Card tint={colors.lavenderTint}>
        <Txt variant="eyebrow" style={{ color: colors.lavenderText }}>
          TODAY’S QUESTION
        </Txt>
        <Txt variant="cardTitle">A new question for the two of you, every morning at 7.</Txt>
        <Soon>Arrives in Milestone 3. {spouseName}’s answer stays hidden until you answer.</Soon>
      </Card>

      <Card tint={colors.peachTint} style={{ borderColor: colors.peachBorder }}>
        <View style={styles.inline}>
          <Icon name="alert" color={colors.amberText} />
          <Txt variant="eyebrow" style={{ color: colors.amberText, fontSize: 13 }}>
            Needs attention
          </Txt>
        </View>
        <Txt variant="bodyStrong">Calendar conflicts will show up here.</Txt>
        <Soon>Calendars connect in Milestone 3.</Soon>
      </Card>

      <Card>
        <Txt variant="eyebrow" style={{ color: colors.mintText }}>
          QUICK RATING · HELPS FUTURE PICKS
        </Txt>
        <Txt variant="bodyStrong">After each date, a one-tap rating.</Txt>
        <View style={styles.inline}>
          <Pill label="Loved it" disabled />
          <Pill label="It was fine" disabled />
          <Pill label="Skip next time" disabled />
        </View>
        <Soon>Ratings start in Milestone 5.</Soon>
      </Card>

      <Card tint={colors.coral}>
        <Txt variant="eyebrow" style={{ color: colors.text, opacity: 0.8 }}>
          NEXT UP
        </Txt>
        <Txt variant="cardTitle" style={styles.bold}>
          Date night — not planned yet
        </Txt>
        <Txt variant="small" style={{ color: colors.text }}>
          Planning arrives in Milestone 5.
        </Txt>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.xl },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' },
  bold: { fontSize: 20 },
});
