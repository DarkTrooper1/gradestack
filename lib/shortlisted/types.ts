export interface CriterionFree {
  score: number;
}

export interface CriterionFull {
  score: number;
  summary: string;
  top_fix: string;
}

export interface ParagraphAnnotation {
  paragraph_index: number;
  paragraph_preview: string;
  rating: "strong" | "adequate" | "weak";
  comment: string;
}

export interface RewriteSuggestion {
  criterion: string;
  original: string;
  rewrite: string;
  reason: string;
}

export interface FreeAnalysis {
  overall_score: number;
  overall_verdict: string;
  overall_summary: string;
  criteria: {
    passion_motivation: CriterionFull;
    academic_potential: CriterionFree;
    relevant_experience: CriterionFree;
    writing_quality: CriterionFree;
    course_suitability: CriterionFree;
  };
}

export interface PaidAnalysis {
  overall_score: number;
  overall_verdict: string;
  overall_summary: string;
  criteria: {
    passion_motivation: CriterionFull;
    academic_potential: CriterionFull;
    relevant_experience: CriterionFull;
    writing_quality: CriterionFull;
    course_suitability: CriterionFull;
  };
  paragraph_annotations: ParagraphAnnotation[];
  rewrite_suggestions: RewriteSuggestion[];
}

export interface SessionData {
  statement: string;
  email: string;
  free?: FreeAnalysis;
  paid?: PaidAnalysis;
}
