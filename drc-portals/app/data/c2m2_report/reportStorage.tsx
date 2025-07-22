// app/data/c2m2_report/reportStorage.ts
// No 'use client' needed here!

import type { SavedChart } from '../c2m2_summary/CartContext';

const STORAGE_KEY = 'c2m2_saved_reports';

export function saveReport(id: string, charts: SavedChart[]) {
  if (typeof window === 'undefined') return;
  const raw = localStorage.getItem(STORAGE_KEY);
  const all: Record<string, SavedChart[]> = raw ? JSON.parse(raw) : {};
  all[id] = charts;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function getReport(id: string): SavedChart[] | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  const all: Record<string, SavedChart[]> = raw ? JSON.parse(raw) : {};
  return all[id] || null;
}
