// src/lib/budgetPeriods.js
export const DURATION_CONFIG = {
  '1 Day':    { unit: 'day', count: 1 },
  '1 Week':   { unit: 'day', count: 7 },
  '2 Weeks':  { unit: 'day', count: 14 },
  '1 Month':  { unit: 'month', count: 1 },
  '6 Months': { unit: 'month', count: 6 },
  '1 Year':   { unit: 'month', count: 12 },
};

export function addDuration(date, duration, n = 1) {
  const { unit, count } = DURATION_CONFIG[duration];
  const d = new Date(date);
  if (unit === 'day') d.setDate(d.getDate() + count * n);
  else d.setMonth(d.getMonth() + count * n);
  return d;
}

export function periodsElapsed(start, duration, now) {
  const { unit, count } = DURATION_CONFIG[duration];
  let n;
  if (unit === 'day') {
    n = Math.floor((now - start) / (86400000 * count));
  } else {
    const monthsDiff =
      (now.getFullYear() - start.getFullYear()) * 12 +
      (now.getMonth() - start.getMonth()) -
      (now.getDate() < start.getDate() ? 1 : 0);
    n = Math.floor(monthsDiff / count);
  }
  return Math.max(n, 0);
}

export function getCurrentPeriod(rule, now = new Date()) {
  const start = new Date(rule.start_datetime);

  if (start > now) {
    return { index: 0, start, end: addDuration(start, rule.duration), status: 'upcoming' };
  }
  if (!rule.is_recurring) {
    const end = addDuration(start, rule.duration);
    if (end <= now) return null;
    return { index: 0, start, end, status: 'ongoing' };
  }
  let n = periodsElapsed(start, rule.duration, now);
  let periodStart = addDuration(start, rule.duration, n);
  let periodEnd = addDuration(periodStart, rule.duration);
  while (periodEnd <= now) { n++; periodStart = periodEnd; periodEnd = addDuration(periodStart, rule.duration); }
  while (periodStart > now) { n--; periodEnd = periodStart; periodStart = addDuration(periodEnd, rule.duration, -1); }
  return { index: n, start: periodStart, end: periodEnd, status: 'ongoing' };
}

// bonus: history is just "every period from 0 up to the current one"
export function getPeriodHistory(rule, now = new Date()) {
  const current = getCurrentPeriod(rule, now);
  if (!current || current.status === 'upcoming') return [];
  const periods = [];
  for (let i = 0; i <= current.index; i++) {
    const periodStart = addDuration(rule.start_datetime, rule.duration, i);
    const periodEnd = addDuration(periodStart, rule.duration);
    periods.push({ index: i, start: periodStart, end: periodEnd });
  }
  return periods.reverse(); // newest first
}

export function getSpentForBudget(budget, period, transactions) {
    const startISO = period.start.toISOString();
    const endISO = period.end.toISOString();
    return transactions
        .filter(t =>
        t.category_id === budget.category_id &&
        t.transaction_datetime >= startISO &&
        t.transaction_datetime <= endISO
        )
        .reduce((sum, t) => sum + t.amount_cents, 0)
}