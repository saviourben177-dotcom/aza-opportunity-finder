// The app has no accounts yet, so "Saved" is scoped by an anonymous
// per-browser device ID instead of a user ID. It's generated once and
// persisted in localStorage; the same ID is sent with every /saved
// request so the backend can group a person's saves without knowing
// who they are. This is real persistence — it survives reloads and
// tab closes — it just doesn't follow someone across devices/browsers
// the way a real account would.
const DEVICE_ID_KEY = 'aza-device-id';

export function getDeviceId(): string {
  if (typeof window === 'undefined') {
    // Shouldn't be called during SSR/build, but fail safe rather than throw.
    return '';
  }

  const existing = window.localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;

  const generated = crypto.randomUUID();
  window.localStorage.setItem(DEVICE_ID_KEY, generated);
  return generated;
}
