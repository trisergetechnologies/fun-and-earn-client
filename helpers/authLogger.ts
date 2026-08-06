type AuthLogLevel = 'info' | 'success' | 'warn' | 'error';

const PREFIX = '[DreamMart Auth]';

function maskToken(token?: string | null): string {
  if (!token) return '(none)';
  if (token.length <= 12) return `${token.slice(0, 4)}…`;
  return `${token.slice(0, 8)}…${token.slice(-4)} (len=${token.length})`;
}

/** Dev-visible auth/refresh logs — filter Metro/console by "DreamMart Auth". */
export function authLog(
  level: AuthLogLevel,
  event: string,
  details?: Record<string, unknown>
) {
  const payload = {
    at: new Date().toISOString(),
    event,
    ...details,
  };

  const line = `${PREFIX} ${event}`;
  if (level === 'error') {
    console.error(line, payload);
  } else if (level === 'warn') {
    console.warn(line, payload);
  } else if (level === 'success') {
    console.log(`✅ ${line}`, payload);
  } else {
    console.log(line, payload);
  }
}

export function authLogToken(label: string, token?: string | null) {
  return { [label]: maskToken(token) };
}
