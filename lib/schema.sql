-- ============================================================
-- UCAS TARIFF DATABASE
-- Pointwise / Gradestack
-- Last verified against: UCAS Tariff Tables 2024-25
-- ============================================================

-- Enumerated qualification types for clean filtering
CREATE TYPE qual_type AS ENUM (
  'a-level',
  'as-level',
  'epq',
  'core-maths',
  'btec',
  'cambridge-technical',
  't-level',
  'ib-diploma',            -- Full diploma score (24–45)
  'ib-subject-hl',         -- Individual Higher Level subject
  'ib-subject-sl',         -- Individual Standard Level subject
  'scottish-higher',
  'scottish-advanced-higher',
  'cambridge-pre-u',       -- Principal Subject
  'cambridge-pre-u-gpr',   -- Global Perspectives & Research
  'music-grade',           -- Grades 6–8 only (ABRSM, Trinity, LCM, RSL)
  'welsh-bacc',
  'access-to-he',
  'other'
);

-- ============================================================
-- CORE TARIFF TABLE
-- ============================================================
CREATE TABLE tariff_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  type            qual_type NOT NULL,
  awarding_body   TEXT,         -- 'AQA', 'ABRSM', 'Trinity', 'Pearson', etc.
  size            TEXT,         -- For multi-size quals: 'Extended Diploma', 'Diploma', etc.
  grade           TEXT NOT NULL,
  points          INTEGER NOT NULL CHECK (points >= 0),

  -- Canonical display name for the qualification
  display_name    TEXT NOT NULL,

  -- For music grades
  instrument_agnostic BOOLEAN DEFAULT TRUE,

  notes           TEXT,
  valid_from      DATE NOT NULL DEFAULT '2017-09-01',
  valid_to        DATE,  -- NULL = currently valid

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TARIFF RULES TABLE
-- Rules that modify how points are counted (not just looked up)
-- ============================================================
CREATE TABLE tariff_rules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        qual_type NOT NULL,
  rule_key    TEXT NOT NULL,   -- e.g. 'max_count', 'cannot_combine_with'
  rule_value  JSONB NOT NULL,
  notes       TEXT
);

-- Index for fast lookups
CREATE INDEX idx_tariff_type ON tariff_entries(type);
CREATE INDEX idx_tariff_type_size_grade ON tariff_entries(type, size, grade);

-- ============================================================
-- SEED DATA
-- ============================================================

-- ----------------------------------------------------------
-- A-LEVELS
-- Source: UCAS Tariff Tables 2024-25
-- ----------------------------------------------------------
INSERT INTO tariff_entries (type, display_name, grade, points) VALUES
  ('a-level', 'A Level', 'A*', 56),
  ('a-level', 'A Level', 'A',  48),
  ('a-level', 'A Level', 'B',  40),
  ('a-level', 'A Level', 'C',  32),
  ('a-level', 'A Level', 'D',  24),
  ('a-level', 'A Level', 'E',  16);

-- ----------------------------------------------------------
-- AS-LEVELS
-- ----------------------------------------------------------
INSERT INTO tariff_entries (type, display_name, grade, points) VALUES
  ('as-level', 'AS Level', 'A', 20),
  ('as-level', 'AS Level', 'B', 16),
  ('as-level', 'AS Level', 'C', 12),
  ('as-level', 'AS Level', 'D', 10),
  ('as-level', 'AS Level', 'E',  6);

-- ----------------------------------------------------------
-- EXTENDED PROJECT QUALIFICATION (EPQ)
-- ----------------------------------------------------------
INSERT INTO tariff_entries (type, display_name, grade, points) VALUES
  ('epq', 'Extended Project Qualification (EPQ)', 'A*', 28),
  ('epq', 'Extended Project Qualification (EPQ)', 'A',  24),
  ('epq', 'Extended Project Qualification (EPQ)', 'B',  20),
  ('epq', 'Extended Project Qualification (EPQ)', 'C',  16),
  ('epq', 'Extended Project Qualification (EPQ)', 'D',  12),
  ('epq', 'Extended Project Qualification (EPQ)', 'E',   8);

-- ----------------------------------------------------------
-- CORE MATHS (AQA Level 3 Certificate, OCR, Edexcel)
-- Same tariff as AS Level
-- ----------------------------------------------------------
INSERT INTO tariff_entries (type, display_name, grade, points) VALUES
  ('core-maths', 'Core Maths', 'A', 20),
  ('core-maths', 'Core Maths', 'B', 16),
  ('core-maths', 'Core Maths', 'C', 12),
  ('core-maths', 'Core Maths', 'D', 10),
  ('core-maths', 'Core Maths', 'E',  6);

-- ----------------------------------------------------------
-- BTEC LEVEL 3 NATIONALS (Pearson)
-- Sizes: Extended Diploma (XD), Diploma (D), Extended Certificate (XC), Certificate (C)
-- Grade strings: combinations of D* D M P
-- ----------------------------------------------------------

-- Extended Diploma (equiv ~3 A-levels, 1080 GLH)
INSERT INTO tariff_entries (type, awarding_body, size, display_name, grade, points) VALUES
  ('btec', 'Pearson', 'Extended Diploma', 'BTEC Level 3 National Extended Diploma', 'D*D*D*', 168),
  ('btec', 'Pearson', 'Extended Diploma', 'BTEC Level 3 National Extended Diploma', 'D*D*D',  160),
  ('btec', 'Pearson', 'Extended Diploma', 'BTEC Level 3 National Extended Diploma', 'D*DD',   152),
  ('btec', 'Pearson', 'Extended Diploma', 'BTEC Level 3 National Extended Diploma', 'DDD',    144),
  ('btec', 'Pearson', 'Extended Diploma', 'BTEC Level 3 National Extended Diploma', 'DDM',    128),
  ('btec', 'Pearson', 'Extended Diploma', 'BTEC Level 3 National Extended Diploma', 'DMM',    112),
  ('btec', 'Pearson', 'Extended Diploma', 'BTEC Level 3 National Extended Diploma', 'MMM',     96),
  ('btec', 'Pearson', 'Extended Diploma', 'BTEC Level 3 National Extended Diploma', 'MMP',     80),
  ('btec', 'Pearson', 'Extended Diploma', 'BTEC Level 3 National Extended Diploma', 'MPP',     64),
  ('btec', 'Pearson', 'Extended Diploma', 'BTEC Level 3 National Extended Diploma', 'PPP',     48);

-- Diploma (equiv ~2 A-levels, 720 GLH)
INSERT INTO tariff_entries (type, awarding_body, size, display_name, grade, points) VALUES
  ('btec', 'Pearson', 'Diploma', 'BTEC Level 3 National Diploma', 'D*D*', 112),
  ('btec', 'Pearson', 'Diploma', 'BTEC Level 3 National Diploma', 'D*D',  104),
  ('btec', 'Pearson', 'Diploma', 'BTEC Level 3 National Diploma', 'DD',    96),
  ('btec', 'Pearson', 'Diploma', 'BTEC Level 3 National Diploma', 'DM',    80),
  ('btec', 'Pearson', 'Diploma', 'BTEC Level 3 National Diploma', 'MM',    64),
  ('btec', 'Pearson', 'Diploma', 'BTEC Level 3 National Diploma', 'MP',    48),
  ('btec', 'Pearson', 'Diploma', 'BTEC Level 3 National Diploma', 'PP',    32);

-- Extended Certificate (equiv ~1 A-level, 360 GLH)
INSERT INTO tariff_entries (type, awarding_body, size, display_name, grade, points) VALUES
  ('btec', 'Pearson', 'Extended Certificate', 'BTEC Level 3 National Extended Certificate', 'D*', 56),
  ('btec', 'Pearson', 'Extended Certificate', 'BTEC Level 3 National Extended Certificate', 'D',  48),
  ('btec', 'Pearson', 'Extended Certificate', 'BTEC Level 3 National Extended Certificate', 'M',  32),
  ('btec', 'Pearson', 'Extended Certificate', 'BTEC Level 3 National Extended Certificate', 'P',  16);

-- Certificate (180 GLH)
INSERT INTO tariff_entries (type, awarding_body, size, display_name, grade, points) VALUES
  ('btec', 'Pearson', 'Certificate', 'BTEC Level 3 National Certificate', 'D*', 28),
  ('btec', 'Pearson', 'Certificate', 'BTEC Level 3 National Certificate', 'D',  24),
  ('btec', 'Pearson', 'Certificate', 'BTEC Level 3 National Certificate', 'M',  16),
  ('btec', 'Pearson', 'Certificate', 'BTEC Level 3 National Certificate', 'P',   8);

-- ----------------------------------------------------------
-- T-LEVELS
-- Source: DfE / UCAS 2023-25
-- NOTE: T-Level tariff was revised in 2023. Verify annually.
-- ----------------------------------------------------------
INSERT INTO tariff_entries (type, display_name, grade, points, notes) VALUES
  ('t-level', 'T Level', 'Distinction*', 168, 'A* on core component + Distinction on occupational specialism'),
  ('t-level', 'T Level', 'Distinction',  144, NULL),
  ('t-level', 'T Level', 'Merit',        120, NULL),
  ('t-level', 'T Level', 'Pass (C)',      96, 'Pass with grade C or above on core component'),
  ('t-level', 'T Level', 'Pass (D)',      72, 'Pass with grade D on core component');

-- ----------------------------------------------------------
-- IB DIPLOMA (Full Diploma Score 24–45)
-- Source: UCAS Tariff Tables 2024-25
-- ----------------------------------------------------------
INSERT INTO tariff_entries (type, display_name, grade, points) VALUES
  ('ib-diploma', 'International Baccalaureate Diploma', '45', 720),
  ('ib-diploma', 'International Baccalaureate Diploma', '44', 698),
  ('ib-diploma', 'International Baccalaureate Diploma', '43', 676),
  ('ib-diploma', 'International Baccalaureate Diploma', '42', 654),
  ('ib-diploma', 'International Baccalaureate Diploma', '41', 632),
  ('ib-diploma', 'International Baccalaureate Diploma', '40', 611),
  ('ib-diploma', 'International Baccalaureate Diploma', '39', 589),
  ('ib-diploma', 'International Baccalaureate Diploma', '38', 567),
  ('ib-diploma', 'International Baccalaureate Diploma', '37', 545),
  ('ib-diploma', 'International Baccalaureate Diploma', '36', 523),
  ('ib-diploma', 'International Baccalaureate Diploma', '35', 501),
  ('ib-diploma', 'International Baccalaureate Diploma', '34', 479),
  ('ib-diploma', 'International Baccalaureate Diploma', '33', 457),
  ('ib-diploma', 'International Baccalaureate Diploma', '32', 435),
  ('ib-diploma', 'International Baccalaureate Diploma', '31', 413),
  ('ib-diploma', 'International Baccalaureate Diploma', '30', 392),
  ('ib-diploma', 'International Baccalaureate Diploma', '29', 370),
  ('ib-diploma', 'International Baccalaureate Diploma', '28', 348),
  ('ib-diploma', 'International Baccalaureate Diploma', '27', 326),
  ('ib-diploma', 'International Baccalaureate Diploma', '26', 304),
  ('ib-diploma', 'International Baccalaureate Diploma', '25', 282),
  ('ib-diploma', 'International Baccalaureate Diploma', '24', 260);

-- IB Individual Subjects – Higher Level (HL)
INSERT INTO tariff_entries (type, display_name, grade, points) VALUES
  ('ib-subject-hl', 'IB Higher Level Subject', '7', 56),
  ('ib-subject-hl', 'IB Higher Level Subject', '6', 48),
  ('ib-subject-hl', 'IB Higher Level Subject', '5', 32),
  ('ib-subject-hl', 'IB Higher Level Subject', '4', 24),
  ('ib-subject-hl', 'IB Higher Level Subject', '3', 12);

-- IB Individual Subjects – Standard Level (SL)
INSERT INTO tariff_entries (type, display_name, grade, points) VALUES
  ('ib-subject-sl', 'IB Standard Level Subject', '7', 28),
  ('ib-subject-sl', 'IB Standard Level Subject', '6', 24),
  ('ib-subject-sl', 'IB Standard Level Subject', '5', 16),
  ('ib-subject-sl', 'IB Standard Level Subject', '4', 12),
  ('ib-subject-sl', 'IB Standard Level Subject', '3',  6);

-- ----------------------------------------------------------
-- SCOTTISH QUALIFICATIONS AUTHORITY
-- ----------------------------------------------------------

-- Scottish Higher
INSERT INTO tariff_entries (type, awarding_body, display_name, grade, points) VALUES
  ('scottish-higher', 'SQA', 'Scottish Higher', 'A', 33),
  ('scottish-higher', 'SQA', 'Scottish Higher', 'B', 27),
  ('scottish-higher', 'SQA', 'Scottish Higher', 'C', 21),
  ('scottish-higher', 'SQA', 'Scottish Higher', 'D', 15);

-- Scottish Advanced Higher
INSERT INTO tariff_entries (type, awarding_body, display_name, grade, points) VALUES
  ('scottish-advanced-higher', 'SQA', 'Scottish Advanced Higher', 'A', 56),
  ('scottish-advanced-higher', 'SQA', 'Scottish Advanced Higher', 'B', 48),
  ('scottish-advanced-higher', 'SQA', 'Scottish Advanced Higher', 'C', 40),
  ('scottish-advanced-higher', 'SQA', 'Scottish Advanced Higher', 'D', 32);

-- ----------------------------------------------------------
-- CAMBRIDGE PRE-U
-- Principal Subject grades: D1 (highest) through P3 (lowest)
-- ----------------------------------------------------------
INSERT INTO tariff_entries (type, awarding_body, size, display_name, grade, points) VALUES
  ('cambridge-pre-u', 'Cambridge Assessment', 'Principal Subject', 'Cambridge Pre-U Principal Subject', 'D1', 145),
  ('cambridge-pre-u', 'Cambridge Assessment', 'Principal Subject', 'Cambridge Pre-U Principal Subject', 'D2', 136),
  ('cambridge-pre-u', 'Cambridge Assessment', 'Principal Subject', 'Cambridge Pre-U Principal Subject', 'D3', 128),
  ('cambridge-pre-u', 'Cambridge Assessment', 'Principal Subject', 'Cambridge Pre-U Principal Subject', 'M1', 120),
  ('cambridge-pre-u', 'Cambridge Assessment', 'Principal Subject', 'Cambridge Pre-U Principal Subject', 'M2', 112),
  ('cambridge-pre-u', 'Cambridge Assessment', 'Principal Subject', 'Cambridge Pre-U Principal Subject', 'M3',  96),
  ('cambridge-pre-u', 'Cambridge Assessment', 'Principal Subject', 'Cambridge Pre-U Principal Subject', 'P1',  72),
  ('cambridge-pre-u', 'Cambridge Assessment', 'Principal Subject', 'Cambridge Pre-U Principal Subject', 'P2',  56),
  ('cambridge-pre-u', 'Cambridge Assessment', 'Principal Subject', 'Cambridge Pre-U Principal Subject', 'P3',  40);

-- Global Perspectives & Research (GPR) — Short Course
INSERT INTO tariff_entries (type, awarding_body, size, display_name, grade, points) VALUES
  ('cambridge-pre-u-gpr', 'Cambridge Assessment', 'Short Course', 'Cambridge Pre-U Global Perspectives', 'D1', 56),
  ('cambridge-pre-u-gpr', 'Cambridge Assessment', 'Short Course', 'Cambridge Pre-U Global Perspectives', 'D2', 56),
  ('cambridge-pre-u-gpr', 'Cambridge Assessment', 'Short Course', 'Cambridge Pre-U Global Perspectives', 'D3', 48),
  ('cambridge-pre-u-gpr', 'Cambridge Assessment', 'Short Course', 'Cambridge Pre-U Global Perspectives', 'M1', 48),
  ('cambridge-pre-u-gpr', 'Cambridge Assessment', 'Short Course', 'Cambridge Pre-U Global Perspectives', 'M2', 40),
  ('cambridge-pre-u-gpr', 'Cambridge Assessment', 'Short Course', 'Cambridge Pre-U Global Perspectives', 'M3', 40),
  ('cambridge-pre-u-gpr', 'Cambridge Assessment', 'Short Course', 'Cambridge Pre-U Global Perspectives', 'P1', 32),
  ('cambridge-pre-u-gpr', 'Cambridge Assessment', 'Short Course', 'Cambridge Pre-U Global Perspectives', 'P2', 32),
  ('cambridge-pre-u-gpr', 'Cambridge Assessment', 'Short Course', 'Cambridge Pre-U Global Perspectives', 'P3', 32);

-- ----------------------------------------------------------
-- MUSIC GRADES (ABRSM, Trinity College London, LCM, RSL)
-- Only Grades 6–8 attract UCAS tariff points
-- Instrument-agnostic: Grade 8 violin = Grade 8 piano
-- ----------------------------------------------------------

-- Grade 6
INSERT INTO tariff_entries (type, awarding_body, size, display_name, grade, points, instrument_agnostic) VALUES
  ('music-grade', 'ABRSM',           'Grade 6', 'ABRSM Grade 6',           'Distinction', 15, TRUE),
  ('music-grade', 'ABRSM',           'Grade 6', 'ABRSM Grade 6',           'Merit',       13, TRUE),
  ('music-grade', 'ABRSM',           'Grade 6', 'ABRSM Grade 6',           'Pass',        10, TRUE),
  ('music-grade', 'Trinity',         'Grade 6', 'Trinity Grade 6',         'Distinction', 15, TRUE),
  ('music-grade', 'Trinity',         'Grade 6', 'Trinity Grade 6',         'Merit',       13, TRUE),
  ('music-grade', 'Trinity',         'Grade 6', 'Trinity Grade 6',         'Pass',        10, TRUE),
  ('music-grade', 'LCM',             'Grade 6', 'LCM Grade 6',             'Distinction', 15, TRUE),
  ('music-grade', 'LCM',             'Grade 6', 'LCM Grade 6',             'Merit',       13, TRUE),
  ('music-grade', 'LCM',             'Grade 6', 'LCM Grade 6',             'Pass',        10, TRUE),
  ('music-grade', 'RSL',             'Grade 6', 'RSL Grade 6',             'Distinction', 15, TRUE),
  ('music-grade', 'RSL',             'Grade 6', 'RSL Grade 6',             'Merit',       13, TRUE),
  ('music-grade', 'RSL',             'Grade 6', 'RSL Grade 6',             'Pass',        10, TRUE);

-- Grade 7
INSERT INTO tariff_entries (type, awarding_body, size, display_name, grade, points, instrument_agnostic) VALUES
  ('music-grade', 'ABRSM',   'Grade 7', 'ABRSM Grade 7',   'Distinction', 26, TRUE),
  ('music-grade', 'ABRSM',   'Grade 7', 'ABRSM Grade 7',   'Merit',       23, TRUE),
  ('music-grade', 'ABRSM',   'Grade 7', 'ABRSM Grade 7',   'Pass',        20, TRUE),
  ('music-grade', 'Trinity', 'Grade 7', 'Trinity Grade 7', 'Distinction', 26, TRUE),
  ('music-grade', 'Trinity', 'Grade 7', 'Trinity Grade 7', 'Merit',       23, TRUE),
  ('music-grade', 'Trinity', 'Grade 7', 'Trinity Grade 7', 'Pass',        20, TRUE),
  ('music-grade', 'LCM',     'Grade 7', 'LCM Grade 7',     'Distinction', 26, TRUE),
  ('music-grade', 'LCM',     'Grade 7', 'LCM Grade 7',     'Merit',       23, TRUE),
  ('music-grade', 'LCM',     'Grade 7', 'LCM Grade 7',     'Pass',        20, TRUE),
  ('music-grade', 'RSL',     'Grade 7', 'RSL Grade 7',     'Distinction', 26, TRUE),
  ('music-grade', 'RSL',     'Grade 7', 'RSL Grade 7',     'Merit',       23, TRUE),
  ('music-grade', 'RSL',     'Grade 7', 'RSL Grade 7',     'Pass',        20, TRUE);

-- Grade 8
INSERT INTO tariff_entries (type, awarding_body, size, display_name, grade, points, instrument_agnostic) VALUES
  ('music-grade', 'ABRSM',   'Grade 8', 'ABRSM Grade 8',   'Distinction', 40, TRUE),
  ('music-grade', 'ABRSM',   'Grade 8', 'ABRSM Grade 8',   'Merit',       35, TRUE),
  ('music-grade', 'ABRSM',   'Grade 8', 'ABRSM Grade 8',   'Pass',        30, TRUE),
  ('music-grade', 'Trinity', 'Grade 8', 'Trinity Grade 8', 'Distinction', 40, TRUE),
  ('music-grade', 'Trinity', 'Grade 8', 'Trinity Grade 8', 'Merit',       35, TRUE),
  ('music-grade', 'Trinity', 'Grade 8', 'Trinity Grade 8', 'Pass',        30, TRUE),
  ('music-grade', 'LCM',     'Grade 8', 'LCM Grade 8',     'Distinction', 40, TRUE),
  ('music-grade', 'LCM',     'Grade 8', 'LCM Grade 8',     'Merit',       35, TRUE),
  ('music-grade', 'LCM',     'Grade 8', 'LCM Grade 8',     'Pass',        30, TRUE),
  ('music-grade', 'RSL',     'Grade 8', 'RSL Grade 8',     'Distinction', 40, TRUE),
  ('music-grade', 'RSL',     'Grade 8', 'RSL Grade 8',     'Merit',       35, TRUE),
  ('music-grade', 'RSL',     'Grade 8', 'RSL Grade 8',     'Pass',        30, TRUE);

-- ----------------------------------------------------------
-- WELSH BACCALAUREATE
-- Advanced Skills Challenge Certificate
-- ----------------------------------------------------------
INSERT INTO tariff_entries (type, awarding_body, display_name, grade, points) VALUES
  ('welsh-bacc', 'Qualifications Wales', 'Welsh Baccalaureate Advanced Skills Challenge Certificate', 'A*', 56),
  ('welsh-bacc', 'Qualifications Wales', 'Welsh Baccalaureate Advanced Skills Challenge Certificate', 'A',  48),
  ('welsh-bacc', 'Qualifications Wales', 'Welsh Baccalaureate Advanced Skills Challenge Certificate', 'B',  40),
  ('welsh-bacc', 'Qualifications Wales', 'Welsh Baccalaureate Advanced Skills Challenge Certificate', 'C',  32),
  ('welsh-bacc', 'Qualifications Wales', 'Welsh Baccalaureate Advanced Skills Challenge Certificate', 'D',  24),
  ('welsh-bacc', 'Qualifications Wales', 'Welsh Baccalaureate Advanced Skills Challenge Certificate', 'E',  16);

-- ----------------------------------------------------------
-- ACCESS TO HE DIPLOMA
-- Graded unit: Pass (P), Merit (M), Distinction (D) across 45 credits
-- UCAS tariff depends on grade profile — simplified model:
-- Full Distinction profile = 168 pts, Full Merit = 96 pts, Full Pass = 48 pts
-- NOTE: Real tariff is calculated per unit. This is the aggregate shorthand.
-- ----------------------------------------------------------
INSERT INTO tariff_entries (type, display_name, grade, points, notes) VALUES
  ('access-to-he', 'Access to HE Diploma', 'All Distinctions (45 credits)', 168, 'Max possible on full Distinction profile'),
  ('access-to-he', 'Access to HE Diploma', 'All Merits (45 credits)',        96, 'Approximate — actual varies per unit profile'),
  ('access-to-he', 'Access to HE Diploma', 'All Passes (45 credits)',        48, 'Approximate — actual varies per unit profile');

-- ============================================================
-- TARIFF RULES
-- Logical rules that can't be expressed in the points table
-- ============================================================
INSERT INTO tariff_rules (type, rule_key, rule_value, notes) VALUES
  -- Most universities only count best 3 A-levels (some count 4)
  ('a-level', 'default_max_count', '3', 'Standard: best 3 A-levels. Some courses/unis accept 4.'),

  -- AS-levels: usually only count if standalone (not cashed in from A-level)
  ('as-level', 'cannot_double_count', '"a-level"', 'Cannot count both AS and A-level in same subject'),

  -- Music grades: usually only best grade per instrument counts
  -- (i.e. G8 piano + G7 piano doesn't stack)
  ('music-grade', 'unique_per_instrument', 'true', 'Only highest grade per instrument counts'),

  -- EPQ: usually counted in addition to A-levels (not instead)
  ('epq', 'additive', 'true', 'Counts on top of A-levels at most institutions'),

  -- IB: if taking full diploma, individual subject points usually don't stack on top
  ('ib-diploma', 'excludes_ib_subjects', 'true', 'Full IB Diploma tariff replaces individual IB subject tariff'),

  -- BTECs: if taking Extended Diploma, smaller BTEC sizes in same subject don't stack
  ('btec', 'no_double_counting', 'true', 'Cannot count multiple BTEC sizes in the same subject');

-- ============================================================
-- VIEW: Simplified lookup (for UI dropdowns / autocomplete)
-- ============================================================
CREATE VIEW tariff_summary AS
SELECT
  type,
  awarding_body,
  size,
  display_name,
  grade,
  points,
  notes
FROM tariff_entries
WHERE valid_to IS NULL
ORDER BY type, awarding_body, size, points DESC;
