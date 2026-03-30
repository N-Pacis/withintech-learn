import type { ChallengeCategory } from '@/hooks/queries/showcase';

interface Props {
  category: ChallengeCategory;
  size?: number;
  className?: string;
}

const PATHS: Record<ChallengeCategory, React.ReactNode> = {
  Agriculture: (
    <>
      <path d="M12 2a10 10 0 0 1 10 10" />
      <path d="M12 2C6.48 2 2 6.48 2 12" />
      <path d="M12 22V12" />
      <path d="M12 12C9 9 6 8 3 8" />
      <path d="M12 12c3-3 6-4 9-4" />
    </>
  ),
  Healthcare: (
    <>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </>
  ),
  Education: (
    <>
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </>
  ),
  Water: (
    <>
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </>
  ),
  Energy: (
    <>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </>
  ),
  Finance: (
    <>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </>
  ),
  Transport: (
    <>
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </>
  ),
  Environment: (
    <>
      <path d="M17 8C8 10 5.9 16.17 3.82 19.93" />
      <path d="M19.93 10.07C21.49 10.97 22 12.5 22 14c-4 0-6-1-8-4" />
      <path d="M3.32 20.46C4.71 21.41 5.96 22 8 22c8-8 3-18-8-18" />
    </>
  ),
  Employment: (
    <>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </>
  ),
  Digital: (
    <>
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </>
  ),
};

export function CategoryIcon({ category, size = 16, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {PATHS[category]}
    </svg>
  );
}
