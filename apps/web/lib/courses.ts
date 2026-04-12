// ─── Deterministic gradient cover (used by CourseCard + courses page) ─────────

export const COURSE_GRADIENTS = [
  ['#3D006B', '#7C3AED'],
  ['#0F172A', '#1E40AF'],
  ['#064E3B', '#059669'],
  ['#78350F', '#D97706'],
  ['#4C0519', '#BE185D'],
  ['#1E3A5F', '#0EA5E9'],
  ['#312E81', '#6D28D9'],
  ['#134E4A', '#0D9488'],
] as const;

export function titleToGradientIndex(title: string): number {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) >>> 0;
  return h % COURSE_GRADIENTS.length;
}

export function titleGradient(title: string): [string, string] {
  return [...COURSE_GRADIENTS[titleToGradientIndex(title)]] as [string, string];
}
