/**
 * Round-robin across groups (keeping each group's order), so a mixed list opens with a bit of everything
 * instead of ten pairs of socks. Shared by the server's first render and the client's full list.
 */
export function interleave<T>(items: T[], key: (t: T) => string, limit = Infinity): T[] {
  const groups = new Map<string, T[]>();
  for (const it of items) {
    const k = key(it);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(it);
  }
  const lists = [...groups.values()];
  const out: T[] = [];
  for (let i = 0; out.length < limit && lists.some((l) => l.length > i); i++) {
    for (const l of lists) if (l[i] !== undefined && out.length < limit) out.push(l[i]);
  }
  return out;
}

export const groupKey = (c: { d: string; c: string }) => `${c.d}/${c.c}`;
