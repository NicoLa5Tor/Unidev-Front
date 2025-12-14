const runtimeEnv = (import.meta?.env ?? {}) as Record<string, string | undefined>;

export function readEnv(key: string, fallback?: string): string {
  const value = runtimeEnv[key];
  if (value !== undefined && value !== '') {
    return value;
  }

  if (fallback !== undefined) {
    return fallback;
  }

  throw new Error(`Missing environment variable ${key}. Please set it in your .env file.`);
}
