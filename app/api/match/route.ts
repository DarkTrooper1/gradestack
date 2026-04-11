import { UNIVERSITIES } from '@/lib/universities';

type MatchResult = {
  name: string;
  city: string;
  course: string;
  min_points: number;
  typical_points: number;
  url: string;
  label: 'Likely' | 'Target' | 'Aspirational';
};

export async function POST(req: Request) {
  const { total_points } = await req.json();
  const pts = Number(total_points);

  const results: MatchResult[] = [];

  for (const uni of UNIVERSITIES) {
    for (const course of uni.courses) {
      const gap = course.min_points - pts;
      let label: 'Likely' | 'Target' | 'Aspirational' | null = null;

      if (gap <= 0) {
        // Student meets or exceeds minimum — Likely
        // Only include if they're not way over (keep within 40 pts above typical)
        if (pts <= course.typical_points + 40) {
          label = 'Likely';
        }
      } else if (gap <= 20) {
        // Min is within 20 pts above total — Target
        label = 'Target';
      } else if (gap <= 40) {
        // Min is 20-40 pts above total — Aspirational
        label = 'Aspirational';
      }

      if (label) {
        results.push({
          name: uni.name,
          city: uni.city,
          course: course.name,
          min_points: course.min_points,
          typical_points: course.typical_points,
          url: course.url,
          label,
        });
      }
    }
  }

  // Sort by typical_points descending
  results.sort((a, b) => b.typical_points - a.typical_points);

  return Response.json(results);
}
