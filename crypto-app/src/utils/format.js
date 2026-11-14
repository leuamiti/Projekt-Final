export const formatPrice = (n = 0) =>
  n >= 1
    ? `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `$${Number(n).toPrecision(3)}`;

export const formatUsd = (n = 0) =>
  `${n < 0 ? '-' : ''}$${Math.abs(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const formatQty = (n = 0) =>
  n >= 1 ? n.toLocaleString('en-US', { maximumFractionDigits: 4 }) : Number(n).toPrecision(4);

export const compact = (n = 0) => {
  const a = Math.abs(n);
  if (a >= 1e12) return (n / 1e12).toFixed(2) + 'T';
  if (a >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (a >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (a >= 1e3) return (n / 1e3).toFixed(2) + 'K';
  return String(Math.round(n));
};

export const GREEN = '#4ade80';
export const RED = '#f87171';
