// src/mocks/data.js

export const categories = [
  { id: '1', name: 'Food', icon_key: 'utensils', type: 'expense' },
  { id: '2', name: 'Transport', icon_key: 'car', type: 'expense' },
  { id: '3', name: 'Pet', icon_key: 'paw-print', type: 'expense' },
  { id: '4', name: 'Beauty', icon_key: 'sparkles', type: 'expense' },
  { id: '5', name: 'Income', icon_key: 'banknote', type: 'income' },
]

export const transactions = [
  {
    id: 't1',
    category_id: '1',
    type: 'expense',
    amount_dollars: 8.80,
    notes: 'Snack',
    transaction_datetime: '2026-06-18T12:30:00.000Z',
    is_recurring: false,
  },
  {
    id: 't2',
    category_id: '2',
    type: 'expense',
    amount_dollars: 14.80,
    notes: 'Lip Gloss',
    transaction_datetime: '2026-06-17T09:15:00.000Z',
    is_recurring: false,
  },
  {
    id: 't3',
    category_id: '3',
    type: 'expense',
    amount_dollars: 225.60,
    notes: 'Benny',
    transaction_datetime: '2026-06-15T18:00:00.000Z',
    is_recurring: false,
  },
  {
    id: 't4',
    category_id: '5',
    type: 'income',
    amount_dollars: 8888.80,
    notes: 'Payday',
    transaction_datetime: '2026-06-01T00:00:00.000Z',
    is_recurring: true,
  },
]

export const budgets = [
  {
    id: 'b1',
    category_id: '1',
    amount_dollars: 50.00,
    start_datetime: '2026-06-01T00:00:00.000Z',
    end_datetime: '2026-06-30T23:59:59.999Z',
    is_recurring: true,
  },
  {
    id: 'b2',
    category_id: '2',
    amount_dollars: 30.00,
    start_datetime: '2026-06-15T00:00:00.000Z',
    end_datetime: '2026-06-30T23:59:59.999Z',
    is_recurring: false,
  },
]