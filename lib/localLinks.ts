// Remembers session links the facilitator has generated on this device, so
// they can be copied again later without retyping the exact label or
// digging through history. Deliberately local-only (not synced anywhere):
// this is a convenience for the person running the workshop, not shared
// data, and it survives page refreshes but not switching browsers/devices.

export type SavedLink = { slug: string; label: string; createdAt: string };

const STORAGE_KEY = "readiness-assessment-session-links";

export function getSavedLinks(): SavedLink[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLink(slug: string, label: string): SavedLink[] {
  const existing = getSavedLinks().filter((l) => l.slug !== slug);
  const updated = [{ slug, label, createdAt: new Date().toISOString() }, ...existing].slice(0, 25);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Storage can fail (private browsing, quota, etc.); the link still
    // copies successfully, it just won't be remembered for next time.
  }
  return updated;
}
