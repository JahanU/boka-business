# Expo Mobile App – Migration Summary

This document summarises the migration of the existing **Boka Businesses** Vite + React web app into a new **Expo mobile app** (`apps/mobile`), alongside the refactor required to share code between web and mobile.

---

## 1. What was built

### 1.1 High-level architecture

```
boka-businesses/
├── apps/mobile/                 # Expo SDK 56 + React Native 0.85 + Expo Router
├── packages/shared/             # Shared business logic, types, utilities, services
├── src/                         # Existing Vite + React web app
├── netlify/                     # Existing Netlify functions
```

The repo is now an **npm workspace**. Web and mobile depend on `@boka/shared` instead of duplicating code.

### 1.2 Tech stack

| Layer | Web | Mobile |
|-------|-----|--------|
| Framework | Vite + React 19 | Expo SDK 56 + React Native 0.85 |
| Routing | React Router | Expo Router |
| UI | shadcn/ui + Tailwind CSS | React Native Paper + custom themed components |
| State / auth | Supabase Auth (`@supabase/supabase-js`) | Supabase Auth with `expo-secure-store` session persistence |
| Charts | Recharts | Custom `BarChart` built with React Native views |
| Icons | Lucide React | `@expo/vector-icons` (Ionicons / MaterialCommunityIcons) |
| Tests | Vitest | Jest + `jest-expo` |

### 1.3 Shared package (`packages/shared`)

Created `@boka/shared` and moved everything both apps need:

- `types/` – TypeScript interfaces (`Appointment`, `Staff`, `Business`, etc.)
- `utils/` – helpers such as `formatBusinessName`
- `dashboardUtils.ts` – metric calculations and the `DashboardMetrics` interface
- `services/appointmentService.ts`, `services/availabilityService.ts`, `services/staffService.ts`, `services/businessService.ts`
- `supabase.ts` – shared Supabase client factory

The web app’s imports were repointed from `@/services/...`, `@/lib/...`, etc., to `@boka/shared/...`. All 111 web tests pass after the move.

### 1.4 Mobile app screens

| Screen | File | Notes |
|--------|------|-------|
| Login | `apps/mobile/app/(auth)/index.tsx` | Email + password or password reset. Styled to match the web card design. |
| Dashboard | `apps/mobile/app/(app)/index.tsx` | Header, horizontally-scrollable metric cards, custom 7-day revenue chart, weekly insights, today’s schedule. |
| Bookings | `apps/mobile/app/(app)/bookings.tsx` | Tabbed list (upcoming / past / cancelled), cancel action, empty states. |
| Settings | `apps/mobile/app/(app)/settings.tsx` | Business info placeholder, `StaffAvailability`, logout button. |
| Staff Availability | `apps/mobile/src/components/StaffAvailability/` | Weekly schedule toggles + time pickers, annual leave calendar. |

### 1.5 Theming

`apps/mobile/src/theme.ts` defines a React Native Paper theme that mirrors the web’s Tailwind/shadcn colours:

- Background: `#151d27`
- Card surface: `#16202b`
- Border: `#3a4f64`
- Primary: `#2b8bf7`
- Accent: `#4dd9e6`
- Muted text: `#8fa4b8`
- Destructive: `#ef4444`

`ScreenBackground` (`apps/mobile/src/components/ScreenBackground/`) adds subtle radial gradients behind each screen to match the web’s background glow.

---

## 2. Key decisions and why

### 2.1 Why npm workspaces + `@boka/shared`?

The web app already contained business rules, service calls, and dashboard math that the mobile app needed. Copying them would create a maintenance burden. A shared package keeps one source of truth for:

- Supabase service calls
- Dashboard metrics
- Types and helpers

Both apps import the same compiled JS from `packages/shared/dist`.

### 2.2 Why Expo Router?

The user already planned to use Expo. Expo Router provides file-system based routing, deep-linking, and auth-based groups (`(auth)`, `(app)`) out of the box, which matches the web app’s page structure.

### 2.3 Why React Native Paper?

It gives Material-Design-inspired components (`Card`, `Button`, `TextInput`, `Switch`, etc.) with a mature dark-theme API. We override its colour tokens to match the existing Tailwind palette instead of using Material’s defaults.

### 2.4 Why replace `lucide-react-native`, `react-native-gifted-charts`, and `react-native-svg`?

During iOS simulator testing the app crashed with:

```
Unsupported top level event type "topSvgLayout" dispatched
```

This is a known `react-native-svg` + React Native **New Architecture (Fabric)** incompatibility. Because the project is run inside **Expo Go** (a pre-built client), we cannot patch the native side or downgrade the architecture for that binary.

**Decision:** remove all SVG-dependent packages and replace them:

- Icons → `@expo/vector-icons` (ships with Expo Go)
- Charts → lightweight custom `BarChart` component built from React Native `View`s

Trade-off: the chart is less feature-rich than Recharts, but it is stable and matches the brand colours.

### 2.5 Why a custom `BarChart` instead of another chart library?

Most React Native chart libraries depend on `react-native-svg`. Re-implementing a simple 7-day revenue bar chart in plain React Native views avoided re-introducing the SVG dependency and kept full control over styling.

### 2.6 Why `expo-secure-store` for Supabase auth?

Mobile apps should not persist sessions in plain `localStorage`. `expo-secure-store` stores the Supabase session in the device keychain/keystore and is compatible with Supabase auth’s storage adapter.

### 2.7 Why add `metro.config.js` with package exports?

`date-fns` v4 is ESM-only and uses Node.js package exports. React Native’s Metro bundler needs:

```js
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ['require', 'default', 'node'];
```

Without this, the mobile bundle fails to resolve `date-fns` modules.

### 2.8 Why `newArchEnabled: false` in `app.json`?

Even though we removed SVG dependencies, the project initially hit the Fabric event bug. Setting `newArchEnabled: false` ensures any future **development build** or **EAS build** uses the legacy architecture, which is currently the safest default for this stack.

### 2.9 Why `appointmentService.cancel()` accepts `apiBaseUrl`?

The web app sends cancellation emails via a Netlify function (`/.netlify/functions/cancel-booking`). Netlify functions are not reachable from a mobile app running against a separate API. The shared service now accepts an optional `apiBaseUrl`:

```ts
await appointmentService.cancel(
  booking,
  staff.email,
  business.name,
  { apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL }
);
```

Mobile can point to the user’s separate API; the web app continues to use the relative Netlify path.

---

## 3. Project navigation

### 3.1 Running the web app

```bash
npm install
npm run dev        # Vite dev server
npm run test       # Vitest
npm run typecheck  # Root TypeScript check
npm run lint       # ESLint across all packages
```

### 3.2 Running the mobile app

```bash
cd apps/mobile
npx expo start -c   # -c clears Metro cache
# Press i for iOS simulator, a for Android emulator
```

Mobile-specific checks:

```bash
cd apps/mobile
npm test            # Jest / jest-expo
npx tsc --noEmit    # TypeScript
```

### 3.3 Environment variables

Copy `apps/mobile/.env.example` to `apps/mobile/.env` and fill in:

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_API_BASE_URL=          # optional, for mobile cancellation endpoint
```

### 3.4 Important files

| File | Purpose |
|------|---------|
| `apps/mobile/app/_layout.tsx` | Root layout: theme, safe area, auth provider |
| `apps/mobile/app/(app)/_layout.tsx` | Tab layout for authenticated screens |
| `apps/mobile/app/(app)/index.tsx` | Dashboard |
| `apps/mobile/app/(app)/bookings.tsx` | Bookings list |
| `apps/mobile/app/(app)/settings.tsx` | Settings + logout |
| `apps/mobile/src/theme.ts` | Navy colour theme |
| `apps/mobile/src/components/ScreenBackground/` | Gradient background wrapper |
| `apps/mobile/src/components/BarChart/` | Custom chart component |
| `apps/mobile/src/contexts/AuthContext.tsx` | Auth state + Supabase secure storage |
| `apps/mobile/metro.config.js` | Metro config for `date-fns` package exports |
| `packages/shared/src/` | Shared types, utils, services |

---

## 4. Current status

### 4.1 Completed

- [x] Workspace + shared package setup
- [x] Web app repointed to `@boka/shared`; all tests pass
- [x] Expo mobile scaffold with Router, Paper, secure Supabase auth
- [x] Login, Dashboard, Bookings, Settings screens
- [x] Staff Availability (weekly schedule + annual leave)
- [x] Custom theme matching web shadcn/Tailwind
- [x] Custom BarChart replacing SVG chart library
- [x] Logout button in Settings
- [x] Mobile Jest smoke tests
- [x] Metro config for `date-fns` v4
- [x] `newArchEnabled: false`
- [x] EAS build profiles and deep-linking scheme configured

### 4.2 Known limitations / decisions left

1. **Charts are basic.** The custom `BarChart` only supports the current dashboard use case. If you need line charts, pie charts, tooltips, etc., you will need to extend it or evaluate a stable non-SVG library.

2. **Business Information card is a placeholder.** The web app has the same placeholder right now. Editing business details from mobile was not in scope.

3. **Push notifications** are not implemented. This would require Expo push tokens and backend integration.

4. **Offline support / pull-to-refresh** are not implemented yet.

5. **External cancellation API.** The mobile app is wired to call `EXPO_PUBLIC_API_BASE_URL/cancel-booking`, but the separate API endpoint must be built/verified.

6. **Development build.** The app currently runs in Expo Go. For production or advanced native modules you should build a custom development client:
   ```bash
   cd apps/mobile
   npx expo run:ios
   # or use EAS Build with the development profile
   ```

---

## 5. Recommended next steps

1. **Verify the external cancellation API** and set `EXPO_PUBLIC_API_BASE_URL` in `apps/mobile/.env`.
2. **Build a development client** (`npx expo run:ios` / `npx expo run:android`) so you are not constrained by Expo Go.
3. **Add pull-to-refresh** on Dashboard and Bookings lists.
4. **Implement business info editing** in Settings if needed.
5. **Add push notifications** for new bookings.
6. **Run EAS builds** for TestFlight / Play Console distribution using the existing `eas.json` profiles.

---

## 6. How to compare web vs mobile styling

To see the web app in a mobile viewport:

```bash
npm run dev
```

Open the URL in Chrome/Safari, enable DevTools device emulation (e.g., iPhone 14 Pro), and visit `/login`, `/dashboard`, `/bookings`, `/settings`. The mobile app aims to mirror the same navy card-based aesthetic, typography hierarchy, and iconography.
