// Normalizes any free-text label into a consistent, URL-safe key. Used for
// workshop session codes so that "Sept 2026 Cohort", "sept-2026-cohort ",
// and "SEPT 2026 COHORT" all collapse to the same value, and so no
// participant-facing text entry can produce inconsistent grouping keys.
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// Turns a slug back into a readable label for display, e.g.
// "september-2026-cohort" -> "September 2026 Cohort". Purely cosmetic;
// the underlying grouping key is always the slug.
export function unslugify(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => (word.length ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}
