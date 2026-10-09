import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Avatar, Button, Card, Pill, Screen, Txt } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { colors, fonts, radius, space, touch, type Role } from '@/theme';

type Mode = 'choose' | 'show' | 'enter';

const JOIN_ERRORS: Record<string, string> = {
  invalid: 'That code didn’t work. Check it, or ask your spouse to tap “New code”.',
  too_many_attempts: 'Too many wrong codes. Wait an hour, then try again.',
  already_paired: 'This account is already paired.',
};

/** One phone shows a code; the other types it in. */
export default function Pair() {
  const { me, appleGivenName, refresh, signOut } = useAuth();
  const [mode, setMode] = useState<Mode>('choose');
  const [name, setName] = useState(me?.display_name ?? appleGivenName ?? '');
  const [role, setRole] = useState<Role | null>(me?.role ?? null);
  const [code, setCode] = useState<string | null>(null);
  const [entry, setEntry] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // While a code is showing, check every few seconds whether the spouse joined.
  useEffect(() => {
    if (mode !== 'show' || !code) return;
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, [mode, code, refresh]);

  const nameOk = name.trim().length > 0 && name.trim().length <= 40;

  async function showCode() {
    if (!role) return;
    setBusy(true);
    setError(null);
    const { data, error: rpcError } = await supabase.rpc('create_couple', { p_display_name: name.trim(), p_role: role });
    setBusy(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    setCode(data as string);
    setMode('show');
  }

  async function join() {
    setBusy(true);
    setError(null);
    const { data, error: rpcError } = await supabase.rpc('join_couple', { p_code: entry, p_display_name: name.trim() });
    setBusy(false);
    if (rpcError) {
      setError('Something went wrong. Check your connection and try again.');
      return;
    }
    if (data === 'ok') {
      await refresh();
      return;
    }
    setError(JOIN_ERRORS[data as string] ?? 'That code didn’t work.');
  }

  return (
    <Screen>
      <Txt variant="title">Pair your phones</Txt>
      <Txt variant="small">MRP² connects exactly two phones. Once you’re both in, nobody else can join.</Txt>

      {mode === 'choose' ? (
        <>
          <Card>
            <Txt variant="eyebrow" style={{ color: colors.lavenderText }}>
              YOUR FIRST NAME
            </Txt>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="First name"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={40}
              style={styles.input}
              accessibilityLabel="Your first name"
            />
          </Card>

          <Card>
            <Txt variant="eyebrow" style={{ color: colors.lavenderText }}>
              SHOWING THE CODE? PICK YOUR AVATAR
            </Txt>
            <View style={styles.roles}>
              <RoleChoice role="H" label="Husband" selected={role === 'H'} onPress={() => setRole('H')} />
              <RoleChoice role="W" label="Wife" selected={role === 'W'} onPress={() => setRole('W')} />
            </View>
            <Button
              label="Show a code"
              kind="dark"
              disabled={!nameOk || !role}
              busy={busy}
              onPress={showCode}
              style={{ marginTop: space.sm }}
            />
          </Card>

          <Card>
            <Txt variant="bodyStrong">Your spouse already has a code?</Txt>
            <Button label="I have a code" kind="outline" disabled={!nameOk} onPress={() => setMode('enter')} />
          </Card>
        </>
      ) : null}

      {mode === 'show' && code ? (
        <Card tint={colors.lavenderTint} style={styles.codeCard}>
          <Txt variant="eyebrow" style={{ color: colors.lavenderText }}>
            ON YOUR SPOUSE’S PHONE, TAP “I HAVE A CODE”
          </Txt>
          <Txt style={styles.code} accessibilityLabel={`Code ${code.split('').join(' ')}`}>
            {code}
          </Txt>
          <Txt variant="small">Works once, for 24 hours. Waiting for your spouse…</Txt>
          <View style={styles.row}>
            <Button label="New code" kind="outline" busy={busy} onPress={showCode} style={styles.flex} />
            <Button label="Back" kind="quiet" onPress={() => setMode('choose')} style={styles.flex} />
          </View>
        </Card>
      ) : null}

      {mode === 'enter' ? (
        <Card>
          <Txt variant="eyebrow" style={{ color: colors.lavenderText }}>
            TYPE THE CODE FROM YOUR SPOUSE’S PHONE
          </Txt>
          <TextInput
            value={entry}
            onChangeText={(t) => setEntry(t.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
            placeholder="ABC234"
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="characters"
            autoCorrect={false}
            autoComplete="off"
            maxLength={6}
            style={[styles.input, styles.codeInput]}
            accessibilityLabel="Pairing code"
          />
          <Button label="Pair" kind="dark" disabled={entry.length !== 6} busy={busy} onPress={join} />
          <Button label="Back" kind="quiet" onPress={() => setMode('choose')} />
        </Card>
      ) : null}

      {error ? (
        <Txt variant="small" style={{ color: colors.coralText }}>
          {error}
        </Txt>
      ) : null}

      <Button label="Sign out" kind="quiet" onPress={signOut} style={{ marginTop: space.xl }} />
    </Screen>
  );
}

function RoleChoice({ role, label, selected, onPress }: { role: Role; label: string; selected: boolean; onPress: () => void }) {
  return (
    <View style={styles.roleChoice}>
      <Avatar role={role} size={48} />
      <Pill label={label} selected={selected} onPress={onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: touch + 4,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    paddingHorizontal: space.lg,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.text,
  },
  codeInput: { fontFamily: fonts.heading, fontSize: 24, letterSpacing: 6, textAlign: 'center' },
  roles: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: space.sm },
  roleChoice: { alignItems: 'center', gap: space.sm },
  codeCard: { alignItems: 'center', gap: space.md, paddingVertical: space.xxl },
  code: { fontFamily: fonts.heading, fontSize: 44, letterSpacing: 8, color: colors.text },
  row: { flexDirection: 'row', gap: space.sm, alignSelf: 'stretch' },
  flex: { flex: 1 },
});
