import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Button, Card, Screen, Txt } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { listWelcomePhotos, removeWelcomePhoto, uploadWelcomePhoto, type WelcomePhoto } from '@/lib/welcome-photos';
import { useAuth } from '@/providers/AuthProvider';
import { colors, fonts, radius, space, touch } from '@/theme';

export default function Privacy() {
  const { couple, refresh, signOut } = useAuth();
  const [photos, setPhotos] = useState<WelcomePhoto[]>([]);
  const [busy, setBusy] = useState(false);
  const [date, setDate] = useState(couple?.wedding_date ?? '');
  const [dateMsg, setDateMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!couple) return;
    try {
      const next = await listWelcomePhotos(couple.id);
      setPhotos(next);
    } catch {
      // Leave the list as is; the user can retry by reopening.
    }
  }, [couple]);

  useEffect(() => {
    let alive = true;
    if (couple) {
      listWelcomePhotos(couple.id)
        .then((next) => alive && setPhotos(next))
        .catch(() => {});
    }
    return () => {
      alive = false;
    };
  }, [couple]);

  async function addPhotos() {
    if (!couple) return;
    // Apple's system photo picker: no full-library permission needed.
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 10,
      quality: 0.85,
    });
    if (result.canceled) return;
    setBusy(true);
    try {
      for (const asset of result.assets) {
        await uploadWelcomePhoto(couple.id, asset.uri, asset.mimeType ?? 'image/jpeg');
      }
      await load();
    } catch {
      Alert.alert('Upload failed', 'Some photos didn’t upload. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  function confirmRemove(photo: WelcomePhoto) {
    Alert.alert('Remove this photo?', 'It will stop appearing on the welcome screen for both of you.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeWelcomePhoto(photo.path);
            await load();
          } catch {
            Alert.alert('Couldn’t remove it', 'Try again in a moment.');
          }
        },
      },
    ]);
  }

  async function saveDate() {
    setDateMsg(null);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setDateMsg('Use the format YYYY-MM-DD, for example 2016-10-20.');
      return;
    }
    const { error } = await supabase.rpc('set_wedding_date', { p_date: date });
    if (error) {
      setDateMsg('That date didn’t save. Check it and try again.');
      return;
    }
    await refresh();
    setDateMsg('Saved.');
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Txt variant="title" style={{ fontSize: 24 }}>
          Privacy & Security
        </Txt>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={() => router.back()}
          style={styles.close}>
          <Icon name="close" color={colors.textMuted} />
        </Pressable>
      </View>

      <Card>
        <Txt variant="bodyStrong">Always on</Txt>
        <Bullet>Face ID (or your passcode) opens MRP² every time you come back to it.</Bullet>
        <Bullet>The app-switcher preview is blank, so nothing shows when you swipe between apps.</Bullet>
        <Bullet>Only your two phones are paired. Nobody else can join.</Bullet>
        <Bullet>Lock-screen notifications will never show message previews (Milestone 2).</Bullet>
      </Card>

      <Card>
        <Txt variant="bodyStrong">Welcome photos</Txt>
        <Txt variant="small">
          One of these plays when MRP² opens. Either of you can add or remove them. Later, starring a photo in Memories will add
          it here.
        </Txt>
        <View style={styles.grid}>
          {photos.map((p) => (
            <Pressable
              key={p.path}
              onLongPress={() => confirmRemove(p)}
              accessibilityRole="imagebutton"
              accessibilityLabel="Welcome photo. Press and hold to remove."
              style={styles.thumbWrap}>
              <Image source={{ uri: p.uri, cacheKey: p.cacheKey }} style={styles.thumb} contentFit="cover" cachePolicy="disk" />
            </Pressable>
          ))}
        </View>
        <Button label={photos.length ? 'Add more photos' : 'Choose photos'} kind="outline" busy={busy} onPress={addPhotos} />
        {photos.length ? <Txt variant="caption">Press and hold a photo to remove it.</Txt> : null}
      </Card>

      <Card>
        <Txt variant="bodyStrong">Wedding date</Txt>
        <Txt variant="small">Shown on the welcome screen with how many years it’s been.</Txt>
        <TextInput
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textTertiary}
          keyboardType="numbers-and-punctuation"
          autoCorrect={false}
          maxLength={10}
          style={styles.input}
          accessibilityLabel="Wedding date"
        />
        <Button label="Save date" kind="dark" onPress={saveDate} />
        {dateMsg ? <Txt variant="caption">{dateMsg}</Txt> : null}
      </Card>

      <Button
        label="Sign out of this phone"
        kind="quiet"
        onPress={() =>
          Alert.alert('Sign out?', 'You’ll need to sign in with Apple again on this phone. Your pairing stays.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign out', style: 'destructive', onPress: signOut },
          ])
        }
      />
    </Screen>
  );
}

function Bullet({ children }: { children: string }) {
  return (
    <View style={styles.bullet}>
      <Icon name="check" size={16} color={colors.mintText} />
      <Txt variant="small" style={{ flex: 1, color: colors.textMuted }}>
        {children}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.sm },
  close: {
    width: touch,
    height: touch,
    borderRadius: touch / 2,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bullet: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginVertical: space.xs },
  thumbWrap: { width: 72, height: 72, borderRadius: radius.control, overflow: 'hidden' },
  thumb: { width: '100%', height: '100%' },
  input: {
    minHeight: touch + 4,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: space.lg,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.text,
  },
});
