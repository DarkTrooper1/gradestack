// ============================================================
// PASTE THIS ENTIRE FILE as lib/tariff-lookup.ts
// Replaces the existing file completely.
// ============================================================

import type {
  ParsedQualification,
  ResolvedQualification,
  TariffResult,
  AppliedRule,
} from './types'

import { tariffEntries } from './tariff-data'

const AS_LEVEL_POINTS: Record<string, number> = { 'A': 20, 'B': 16, 'C': 12, 'D': 10, 'E': 6 }
const IB_DIPLOMA_POINTS: Record<number, number> = { 45:720,44:698,43:676,42:654,41:632,40:611,39:589,38:567,37:545,36:523,35:501,34:479,33:457,32:435,31:413,30:392,29:370,28:348,27:326,26:304,25:282,24:260 }

// ============================================================
// GRADE HELPERS — type-specific only
// ============================================================

// For T-Level only: parser outputs full words, DB stores single letters
function parsedGradeToTLevel(grade: string): string {
  const g = grade.trim()
  if (g === 'Distinction*') return 'D*'
  if (g.toLowerCase() === 'distinction') return 'D'
  if (g.toLowerCase() === 'merit') return 'M'
  if (g.toLowerCase() === 'pass') return 'P'
  return g // already 'D', 'M', 'P', 'D*' etc
}

// For music-grade only: parser outputs full words, DB also stores full words
// But DB uses D/M/P shorthand — normalize both sides
function normalizeMusic(grade: string): string {
  const g = grade.trim().toLowerCase()
  if (g === 'd' || g === 'distinction') return 'distinction'
  if (g === 'm' || g === 'merit') return 'merit'
  if (g === 'p' || g === 'pass') return 'pass'
  return g
}

// Generic: case-insensitive exact match
function gradeMatch(a: string, b: string): boolean {
  return a.trim().toUpperCase() === b.trim().toUpperCase()
}

// BTEC size inference from grade string (fallback only)
function inferBtecSize(grade: string): string | null {
  const g = grade.trim().toUpperCase().replace(/\s+/g, '')
  // Count components: D*D*D* has 3 stars = 3 components
  // Simple heuristic: length of grade string
  const hasTriple = /^[DMP*]{3,}/.test(g) && (g.length >= 3 && g.replace('*', '').length >= 3)
  const hasDouble = g.length === 2 || (g.length === 3 && g.includes('*') && g.replace('*','').length === 2)
  const hasSingle = g.length === 1 || (g.length === 2 && g.includes('*'))
  
  // More reliable: count letters ignoring *
  const letters = g.replace(/\*/g, '')
  if (letters.length >= 3) return 'Extended Diploma'
  if (letters.length === 2) return 'Diploma'
  if (letters.length === 1) return 'Extended Certificate'
  return null
}

// ============================================================
// DETERMINISTIC TYPE CORRECTION
// Catches AI misclassifications by matching the raw input string.
// Runs before any type-based routing.
// ============================================================
const WELSH_BACC_RAW = /\b(welsh\s+bac(c(alaureate)?)?|wbq)\b/i
const WELSH_BACC_VALID_GRADES = new Set(['A*', 'A', 'B', 'C', 'D', 'E'])

function correctType(parsed: ParsedQualification): ParsedQualification {
  const raw = (parsed.raw ?? '').trim()
  if (WELSH_BACC_RAW.test(raw)) {
    const withType: ParsedQualification = parsed.type !== 'welsh-bacc'
      ? { ...parsed, type: 'welsh-bacc' }
      : parsed
    // If the AI picked up "advanced" or any other non-grade word as the grade, clear it
    // so the ambiguity path fires and asks the user for their letter grade.
    const grade = (withType.grade ?? '').trim().toUpperCase()
    if (grade && !WELSH_BACC_VALID_GRADES.has(grade)) {
      return { ...withType, grade: '' }
    }
    return withType
  }
  return parsed
}

// ============================================================
// MAIN LOOKUP
// ============================================================
export function lookupQualification(input: ParsedQualification): ResolvedQualification {
  const parsed = correctType(input)
  const base: ResolvedQualification = {
    ...parsed,
    points: 0,
    display_name: '',
    tariff_entry_id: '',
    lookup_status: 'error',
  }

  if (parsed.type === 'as-level') {
    const g = (parsed.grade ?? '').trim().toUpperCase()
    if (AS_LEVEL_POINTS[g] !== undefined) return { ...base, points: AS_LEVEL_POINTS[g], display_name: `AS Level`, tariff_entry_id: `as-level-${g}`, lookup_status: 'found' }
  }
  if (parsed.type === 'ib-diploma' && parsed.ib_score) {
    const pts = IB_DIPLOMA_POINTS[parsed.ib_score]
    if (pts !== undefined) return { ...base, type: 'ib-diploma', points: pts, display_name: `IB Diploma (${parsed.ib_score} points)`, tariff_entry_id: `ib-diploma-${parsed.ib_score}`, lookup_status: 'found' }
  }
  if (parsed.type === 'ib-subject-hl' || parsed.type === 'ib-subject-sl') {
    const prefix = parsed.type === 'ib-subject-hl' ? 'H' : 'S'
    const dbGrade = `${prefix}${(parsed.grade ?? '').trim()}`
    const entry = tariffEntries.find(e => e.type === parsed.type && e.grade === dbGrade)
    if (entry) return { ...base, points: entry.points, display_name: entry.display_name, tariff_entry_id: entry.id, lookup_status: 'found' }
  }

  if (!parsed.grade && parsed.type !== 'access-to-he') {
    return { ...base, lookup_status: 'ambiguous', needs_clarification: `What grade did you get?` }
  }

  // Route by type
  if (parsed.type === 'music-grade') return lookupMusicGrade(parsed, base)
  if (parsed.type === 'ib-diploma') return lookupIBDiploma(parsed, base)
  if (parsed.type === 'access-to-he') return lookupAccessToHE(parsed, base)
  if (parsed.type === 'btec') return lookupBTEC(parsed, base)
  if (parsed.type === 't-level') return lookupTLevel(parsed, base)

  // ── Generic lookup (a-level, as-level, epq, core-maths, welsh-bacc,
  //    scottish-higher, scottish-advanced-higher, cambridge-pre-u,
  //    cambridge-technical, ib-subject-hl, ib-subject-sl, etc.)
  const candidates = tariffEntries.filter(e => {
    if (e.type !== parsed.type) return false
    if (!gradeMatch(e.grade, parsed.grade!)) return false
    // Size: only filter on size if BOTH parsed and entry have it
    if (parsed.size && e.size && !gradeMatch(e.size, parsed.size)) return false
    return true
  })

  if (candidates.length === 0) {
    return {
      ...base,
      lookup_status: 'not_in_tariff',
      lookup_note: `No tariff entry found for ${parsed.type} grade "${parsed.grade}"`,
    }
  }

  // If multiple matches, prefer the one whose size matches exactly, else take first
  const entry = candidates.find(e => e.size === (parsed.size ?? null)) ?? candidates[0]

  return {
    ...base,
    points: entry.points,
    display_name: entry.display_name,
    tariff_entry_id: entry.id,
    lookup_status: 'found',
  }
}

// ── BTEC ─────────────────────────────────────────────────────
function lookupBTEC(parsed: ParsedQualification, base: ResolvedQualification): ResolvedQualification {
  // Parser should provide size; if not, infer from grade string
  const size = parsed.size ?? inferBtecSize(parsed.grade ?? '')

  const candidates = tariffEntries.filter(e => {
    if (e.type !== 'btec') return false
    if (!gradeMatch(e.grade, parsed.grade!)) return false
    if (size && e.size && !gradeMatch(e.size, size)) return false
    return true
  })

  if (candidates.length === 0) {
    return {
      ...base,
      lookup_status: 'not_in_tariff',
      lookup_note: `No BTEC tariff entry found for grade "${parsed.grade}" size "${size}"`,
    }
  }

  // Prefer entry whose size matches exactly
  const entry = size
    ? (candidates.find(e => e.size?.toLowerCase() === size.toLowerCase()) ?? candidates[0])
    : candidates[0]

  return {
    ...base,
    points: entry.points,
    display_name: entry.display_name,
    tariff_entry_id: entry.id,
    lookup_status: 'found',
  }
}

// ── T-LEVEL ──────────────────────────────────────────────────
function lookupTLevel(parsed: ParsedQualification, base: ResolvedQualification): ResolvedQualification {
  // Convert parsed grade to DB format (D/M/P/D*)
  const dbGrade = parsedGradeToTLevel(parsed.grade ?? '')

  // Try: full T-Level (no QAN, title contains 'FULL T LEVEL')
  const fullEntry = tariffEntries.find(e =>
    e.type === 't-level' &&
    e.display_name?.toUpperCase().includes('FULL T LEVEL') &&
    gradeMatch(e.grade, dbGrade)
  )

  if (fullEntry) {
    return {
      ...base,
      points: fullEntry.points,
      display_name: fullEntry.display_name,
      tariff_entry_id: fullEntry.id,
      lookup_status: 'found',
    }
  }

  // Fallback: any t-level entry matching grade
  const entry = tariffEntries.find(e =>
    e.type === 't-level' && gradeMatch(e.grade, dbGrade)
  )

  if (!entry) {
    return {
      ...base,
      lookup_status: 'not_in_tariff',
      lookup_note: `No T-Level tariff entry found for grade "${parsed.grade}"`,
    }
  }

  return {
    ...base,
    points: entry.points,
    display_name: entry.display_name,
    tariff_entry_id: entry.id,
    lookup_status: 'found',
  }
}

// ── ACCESS TO HE ─────────────────────────────────────────────
function lookupAccessToHE(parsed: ParsedQualification, base: ResolvedQualification): ResolvedQualification {
  const grade = (parsed.grade || parsed.raw || '').trim()

  // Try unit-based match: D30M15P0 format
  const unitMatch = grade.match(/D(\d+)M(\d+)P(\d+)/i)
  console.log('[lookupAccessToHE] parsed.grade:', JSON.stringify(parsed.grade), '| unitMatch:', unitMatch)
  if (unitMatch) {
    const d = parseInt(unitMatch[1])
    const m = parseInt(unitMatch[2])
    const p = parseInt(unitMatch[3])

    const entry = tariffEntries.find(e =>
      e.type === 'access-to-he' &&
      e.d_units === d &&
      e.m_units === m &&
      e.p_units === p
    )
    console.log('[lookupAccessToHE] parsed d/m/p:', d, m, p, '| entry found:', entry ? `id=${entry.id} d=${entry.d_units} m=${entry.m_units} p=${entry.p_units}` : 'none')

    if (entry) {
      return {
        ...base,
        points: entry.points,
        display_name: entry.display_name,
        tariff_entry_id: entry.id,
        lookup_status: 'found',
      }
    }
  }

  // Fallback: direct grade string match (e.g. "75%+")
  const entry = tariffEntries.find(e =>
    e.type === 'access-to-he' && gradeMatch(e.grade, grade)
  )

  if (!entry) {
    return {
      ...base,
      lookup_status: 'not_in_tariff',
      lookup_note: `No Access to HE entry found. Try format like D30M15P0 or a percentage grade like 75%+`,
    }
  }

  return {
    ...base,
    points: entry.points,
    display_name: entry.display_name,
    tariff_entry_id: entry.id,
    lookup_status: 'found',
  }
}

// ── MUSIC GRADE ───────────────────────────────────────────────
function lookupMusicGrade(parsed: ParsedQualification, base: ResolvedQualification): ResolvedQualification {
  const gradeNum = parsed.music_grade_number

  if (!gradeNum || gradeNum < 6) {
    return {
      ...base,
      lookup_status: 'not_in_tariff',
      lookup_note: `Only music Grades 6, 7, and 8 attract UCAS tariff points.`,
      points: 0,
    }
  }

  if (!parsed.grade) {
    return {
      ...base,
      lookup_status: 'ambiguous',
      needs_clarification: `What grade did you get for Grade ${gradeNum}? (Pass, Merit, or Distinction)`,
    }
  }

  const normalizedGrade = normalizeMusic(parsed.grade)

  // Filter by grade number and grade
  const candidates = tariffEntries.filter(e =>
    e.type === 'music-grade' &&
    e.music_grade_num === gradeNum &&
    normalizeMusic(e.grade) === normalizedGrade
  )

  if (candidates.length === 0) {
    return {
      ...base,
      lookup_status: 'not_in_tariff',
      lookup_note: `No music tariff entry found for Grade ${gradeNum} ${parsed.grade}`,
    }
  }

  // Prefer specific awarding body if given
  const entry = parsed.awarding_body
    ? (candidates.find(e => e.awarding_body?.toLowerCase() === parsed.awarding_body!.toLowerCase()) ?? candidates[0])
    : candidates[0]

  return {
    ...base,
    points: entry.points,
    display_name: `${entry.awarding_body ?? 'Music'} Grade ${gradeNum} ${parsed.grade}`,
    tariff_entry_id: entry.id,
    lookup_status: 'found',
  }
}

// ── IB DIPLOMA ────────────────────────────────────────────────
function lookupIBDiploma(parsed: ParsedQualification, base: ResolvedQualification): ResolvedQualification {
  const score = parsed.ib_score
  if (!score || score < 24 || score > 45) {
    return {
      ...base,
      lookup_status: 'ambiguous',
      needs_clarification: `Your IB total score should be between 24 and 45. What was your score?`,
    }
  }

  const entry = tariffEntries.find(e =>
    e.type === 'ib-diploma' && parseInt(e.grade) === score
  )

  if (!entry) return { ...base, lookup_status: 'not_in_tariff' }

  return {
    ...base,
    points: entry.points,
    display_name: `IB Diploma (${score} points)`,
    tariff_entry_id: entry.id,
    lookup_status: 'found',
  }
}

// ============================================================
// RESOLVE ALL
// ============================================================
export function resolveAll(qualifications: ParsedQualification[]): ResolvedQualification[] {
  return qualifications.map(lookupQualification)
}

// ============================================================
// CALCULATE
// ============================================================
export function calculate(qualifications_input: ResolvedQualification[]): TariffResult {
  let qualifications = qualifications_input
  const warnings: string[] = []
  const appliedRules: AppliedRule[] = []

  let countable = qualifications.filter(q => q.lookup_status === 'found')

  const hasFullIB = countable.some(q => q.lookup_status === 'found' && q.type === 'ib-diploma')
  console.log('[IB exclusion] hasFullIB:', hasFullIB, '| countable item types:', countable.map(q => q.type))
  if (hasFullIB) {
    warnings.push('Individual IB subject points excluded — full IB Diploma score used instead.')
    countable = countable.filter(q => q.type !== 'ib-subject-hl' && q.type !== 'ib-subject-sl')
    qualifications = qualifications.map(q =>
      (q.type === 'ib-subject-hl' || q.type === 'ib-subject-sl')
        ? { ...q, excluded: true, excluded_reason: 'IB Diploma score used' }
        : q
    )
  }

  // AS cannot double-count with A-level in same subject
  const asLevels = countable.filter(q => q.type === 'as-level')
  const aLevelSubjects = countable.filter(q => q.type === 'a-level').map(q => q.subject?.toLowerCase()).filter(Boolean)
  const duplicateAS = asLevels.filter(q => q.subject && aLevelSubjects.includes(q.subject.toLowerCase()))
  if (duplicateAS.length > 0) {
    const pointsRemoved = duplicateAS.reduce((sum, q) => sum + q.points, 0)
    appliedRules.push({
      rule_key: 'as-level/cannot_double_count',
      affected_quals: duplicateAS.map(q => q.raw),
      points_removed: pointsRemoved,
      explanation: `AS Level in the same subject as a full A-level cannot be double-counted.`,
    })
    warnings.push(`AS Level(s) in the same subject as a full A-level excluded.`)
    countable = countable.filter(q => !duplicateAS.includes(q))
  }

  // Music: only best per instrument
  const musicGrades = countable.filter(q => q.type === 'music-grade')
  const seenInstruments = new Map<string, ResolvedQualification>()
  const excludedMusic: ResolvedQualification[] = []
  for (const mg of musicGrades) {
    const instrument = mg.subject?.toLowerCase() ?? 'unknown'
    const existing = seenInstruments.get(instrument)
    if (!existing || mg.points > existing.points) {
      if (existing) excludedMusic.push(existing)
      seenInstruments.set(instrument, mg)
    } else {
      excludedMusic.push(mg)
    }
  }
  if (excludedMusic.length > 0) {
    appliedRules.push({
      rule_key: 'music-grade/unique_per_instrument',
      affected_quals: excludedMusic.map(q => q.raw),
      points_removed: excludedMusic.reduce((sum, q) => sum + q.points, 0),
      explanation: `Only the highest grade per instrument counts.`,
    })
    warnings.push(`Only the highest music grade per instrument has been counted.`)
    countable = countable.filter(q => !excludedMusic.includes(q))
  }

  const total = countable.reduce((sum, q) => sum + q.points, 0)

  return {
    qualifications,
    total_points: total,
    rules_applied: appliedRules,
    warnings,
    context: {
      summary: '',
      tier_label: getTierLabel(total),
      tier_description: '',
      quick_wins: [],
    },
    generated_at: new Date().toISOString(),
  }
}

function getTierLabel(points: number): string {
  if (points >= 168) return 'Top achiever'
  if (points >= 144) return 'High achiever'
  if (points >= 120) return 'Russell Group range'
  if (points >= 96)  return 'Mid-tier competitive'
  if (points >= 48)  return 'Post-92 entry range'
  return 'Foundation / Access level'
}

export function applyScenario(
  current: TariffResult,
  edits: { original: ParsedQualification; edited: ParsedQualification }[]
): TariffResult {
  const editedQuals = current.qualifications.map(q => {
    const edit = edits.find(e => e.original.raw === q.raw)
    return edit ? lookupQualification(edit.edited) : q as ResolvedQualification
  })
  return calculate(editedQuals)
}
