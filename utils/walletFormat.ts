export function formatDreamCash(amount: number) {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** DreamMart Coin number only — pair with DreamCashCoin / DreamCashAmount. */
export function formatDreamCashFigure(amount: number) {
  return amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatSignedDreamCash(amount: number, isCredit: boolean) {
  const prefix = isCredit ? '+' : '−';
  return `${prefix}${formatDreamCash(Math.abs(amount))}`;
}

export function formatSignedDreamCashFigure(amount: number, isCredit: boolean) {
  const prefix = isCredit ? '+' : '−';
  return `${prefix}${formatDreamCashFigure(Math.abs(amount))}`;
}

export function formatTransactionDate(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const time = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  if (isToday) return `Today · ${time}`;
  if (isYesterday) return `Yesterday · ${time}`;

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}
