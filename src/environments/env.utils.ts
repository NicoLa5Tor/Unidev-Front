const runtimeEnv = (import.meta?.env ?? {}) as Record<string, string | undefined>;

export function readEnv(key: string, fallback?: string): string {
  const value = runtimeEnv[key];
  if (value === undefined || value === '') {
    return fallback ?? '';
  }
  return value;
}
