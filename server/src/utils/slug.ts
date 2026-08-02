export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/**
 * Appends -2, -3, ... until the slug is free.
 * `exists` receives a candidate and reports whether it's taken.
 */
export async function uniqueSlug(
  base: string,
  exists: (candidate: string) => Promise<boolean>,
): Promise<string> {
  const root = slugify(base) || 'trip';
  let candidate = root;
  let n = 2;

  while (await exists(candidate)) {
    candidate = `${root}-${n}`;
    n += 1;
  }

  return candidate;
}
