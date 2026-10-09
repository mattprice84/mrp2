import * as Crypto from 'expo-crypto';
import { File } from 'expo-file-system';

import { supabase } from '@/lib/supabase';

/**
 * Welcome-screen photos live in the private `welcome-photos` bucket under
 * <couple id>/. Only the two spouses can list, add or remove them (enforced by
 * storage policies). Until Memories arrives in Milestone 4, these are photos
 * chosen in Privacy & Security.
 */
const BUCKET = 'welcome-photos';

export type WelcomePhoto = { path: string; uri: string; cacheKey: string };

export async function listWelcomePhotos(coupleId: string): Promise<WelcomePhoto[]> {
  const { data, error } = await supabase.storage.from(BUCKET).list(coupleId, {
    limit: 50,
    sortBy: { column: 'created_at', order: 'desc' },
  });
  if (error) throw error;
  const paths = (data ?? []).filter((f) => f.id).map((f) => `${coupleId}/${f.name}`);
  if (paths.length === 0) return [];
  const signed = await supabase.storage.from(BUCKET).createSignedUrls(paths, 60 * 60);
  if (signed.error) throw signed.error;
  return signed.data
    .flatMap((s) => (s.signedUrl && s.path ? [{ path: s.path, uri: s.signedUrl, cacheKey: `welcome:${s.path}` }] : []));
}

export async function pickWelcomePhoto(coupleId: string): Promise<WelcomePhoto | null> {
  const photos = await listWelcomePhotos(coupleId);
  if (photos.length === 0) return null;
  return photos[Math.floor(Math.random() * photos.length)];
}

export async function uploadWelcomePhoto(coupleId: string, localUri: string, mimeType = 'image/jpeg') {
  const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/heic' ? 'heic' : 'jpg';
  const path = `${coupleId}/${Crypto.randomUUID()}.${ext}`;
  const bytes = await new File(localUri).arrayBuffer();
  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, { contentType: mimeType });
  if (error) throw error;
}

export async function removeWelcomePhoto(path: string) {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}
