// ============================================================
// TARIFF DATA — Thin wrapper over JSON source
// Source: official UCAS Tariff Tables (tariff-september-2026-v1_5_1.xlsx)
// DO NOT EDIT — regenerate from source spreadsheet
// ============================================================

// eslint-disable-next-line @typescript-eslint/no-require-imports
const raw = require('./tariff-entries.json') as RawEntry[]

interface RawEntry {
  id: string
  type: string
  n: string    // display_name
  g: string    // grade
  p: number    // points
  ab: string | null   // awarding_body
  sz: string | null   // size
  qan: string | null
  mgn: number | null  // music_grade_num
  du: number | null   // d_units (Access to HE)
  mu: number | null   // m_units
  pu: number | null   // p_units
}

export interface TariffEntry {
  id: string
  type: string
  display_name: string
  grade: string
  points: number
  awarding_body: string | null
  size: string | null
  qan: string | null
  music_grade_num: number | null
  d_units: number | null
  m_units: number | null
  p_units: number | null
}

export const tariffEntries: TariffEntry[] = raw.map((e: RawEntry) => ({
  id: e.id,
  type: e.type,
  display_name: e.n,
  grade: e.g,
  points: e.p,
  awarding_body: e.ab,
  size: e.sz,
  qan: e.qan,
  music_grade_num: e.mgn,
  d_units: e.du,
  m_units: e.mu,
  p_units: e.pu,
}))

export const tariffRules: {
  type: string
  rule_key: string
  rule_value: string
  notes: string
}[] = []
