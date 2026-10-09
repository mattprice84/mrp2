import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { Avatar, Pill, Txt } from '@/components/ui';
import { useAuth } from '@/providers/AuthProvider';
import { colors, fonts, radius, space } from '@/theme';

export default function Chat() {
  const { spouse } = useAuth();
  const insets = useSafeAreaInsets();
  const name = spouse?.display_name ?? 'Your spouse';

  return (
    <View style={styles.page}>
      <View style={[styles.header, { paddingTop: insets.top + space.md }]}>
        <Avatar role={spouse?.role ?? 'W'} size={44} />
        <View style={{ flex: 1 }}>
          <Txt style={styles.name}>{name}</Txt>
          <Txt variant="caption" style={{ color: colors.mintText }}>
            End-to-end encrypted chat arrives in Milestone 2
          </Txt>
        </View>
      </View>

      <View style={styles.thread}>
        <View style={styles.empty}>
          <Icon name="chat" size={36} color={colors.textTertiary} strokeWidth={1.4} />
          <Txt variant="small" style={{ textAlign: 'center' }}>
            Text, voice notes, photos and videos that only your two phones can read.
          </Txt>
        </View>
      </View>

      <View style={styles.composer}>
        <View style={styles.timer}>
          <Txt variant="caption" style={{ color: colors.textSecondary }}>
            Media timer
          </Txt>
          <Pill label="View once" disabled />
          <Pill label="24 hours" disabled />
          <Pill label="Keep" selected disabled />
        </View>
        <View style={styles.inputRow}>
          <View style={[styles.round, { backgroundColor: colors.mint }]}>
            <Icon name="camera" />
          </View>
          <View style={styles.input}>
            <Txt variant="body" style={{ color: colors.textTertiary }}>
              Message {name}
            </Txt>
          </View>
          <View style={[styles.round, { backgroundColor: colors.coral }]}>
            <Icon name="mic" />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.page },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.gutter,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  name: { fontFamily: fonts.heading, fontSize: 18, color: colors.text },
  thread: { flex: 1, justifyContent: 'center', paddingHorizontal: space.xxl * 2 },
  empty: { alignItems: 'center', gap: space.md },
  composer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    opacity: 0.6,
  },
  timer: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  round: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  input: {
    flex: 1,
    height: 48,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    paddingHorizontal: space.lg,
  },
});
