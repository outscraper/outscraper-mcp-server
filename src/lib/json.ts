export function removeEmpty<T extends object>(value: T): Partial<T> {
  const entries = Object.entries(value).filter(([, entry]) => {
    if (entry === undefined || entry === null) {
      return false;
    }

    if (typeof entry === "string") {
      return entry.trim().length > 0;
    }

    if (Array.isArray(entry)) {
      return entry.length > 0;
    }

    return true;
  });

  return Object.fromEntries(entries) as Partial<T>;
}

export function stringifyJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}
