/**
 * Demo mode flag.
 *
 * When enabled the app serves mocked data, bypasses authentication, and treats
 * every mutation (create/update/delete/cancel) as a no-op so prospects can
 * click around without affecting the real database.
 */
export const isDemoMode = () => import.meta.env.VITE_DEMO_MODE === 'true';
