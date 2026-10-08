# MRP²

A private iPhone app for Matt and Megan. Not for public release.

- **App:** Expo SDK 57 (React Native, TypeScript, Expo Router), iOS only for now.
- **Backend:** Supabase project `mrp2` (Price Family org). Row-level security on every table.
- **Builds:** EAS Build → TestFlight, two testers.
- **Design reference:** the clickable prototype on claude.ai (23 screens).

## Where things live

| Path | What it is |
|---|---|
| `src/theme/index.ts` | Every color, font, radius and spacing value. Screens use these tokens only. |
| `src/app/` | Screens (Expo Router). `(tabs)/` holds Home · Chat · Plan · Us · Calendar. |
| `src/providers/AppLock.tsx` | Face ID lock at launch and on return from background; blank app-switcher preview. |
| `src/providers/AuthProvider.tsx` | Sign-in session, my profile, my spouse, our couple. |
| `src/components/WelcomeSplash.tsx` | The 2.4s welcome photo after unlock. Tap to skip. |
| `src/lib/supabase.ts` | Supabase client. Session stored in the iOS Keychain. |
| `supabase/migrations/` | Database tables, policies and pairing functions. |

## Rules

- No secrets in this repository. The Supabase **publishable** key in `src/lib/supabase.ts` is meant to ship in the app; the service-role key never goes here or in the app.
- API keys for later milestones go into EAS or Supabase secrets, never into code or chat.
- Pairing is enforced in the database: a couple has at most two members, and once both have joined no code can be created or redeemed for it.

## Developer commands

```sh
npm install
npm run typecheck
npx eslint src
npx expo start          # needs a development build for Face ID / Sign in with Apple
```
