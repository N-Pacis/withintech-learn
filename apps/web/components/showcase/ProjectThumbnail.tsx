interface Props {
  url?: string | null;
  title: string;
  className?: string;
}

export function ProjectThumbnail({ url, title, className }: Props) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt={title} className={`w-full h-full object-cover ${className ?? ''}`} />
    );
  }

  return (
    <div className={`w-full h-full flex items-center justify-center bg-[#F9FAFB] ${className ?? ''}`}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#D1D5DB"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    </div>
  );
}
