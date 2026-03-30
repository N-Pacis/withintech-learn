import Link from 'next/link';
import { Button } from '@/components/ui';
import { type ShowcaseProject } from '@/hooks/queries/showcase';
import { StatusBadge } from '@/components/showcase/StatusBadge';
import { CategoryIcon } from '@/components/showcase/CategoryIcon';
import { ProjectThumbnail } from '@/components/showcase/ProjectThumbnail';

interface Props {
  project: ShowcaseProject;
  onArchive?: (id: string) => void;
  archiving?: boolean;
}

export function ShowcaseProjectCard({ project, onArchive, archiving }: Props) {
  const likeCount = project._count?.likes ?? 0;

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-[#F9FAFB] overflow-hidden">
        <ProjectThumbnail url={project.thumbnailUrl} title={project.title} />
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-heading font-bold text-sm text-[#0F0F0F] line-clamp-1 flex-1">{project.title}</h3>
          <StatusBadge status={project.status} />
        </div>

        {project.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {project.categories.slice(0, 2).map(({ category }) => (
              <span key={category} className="inline-flex items-center gap-1 text-[10px] font-body text-[#6B7280]">
                <CategoryIcon category={category} size={11} />
                {category}
              </span>
            ))}
            {project.categories.length > 2 && (
              <span className="text-[10px] font-body text-[#9CA3AF]">+{project.categories.length - 2}</span>
            )}
          </div>
        )}

        <p className="font-body text-xs text-[#6B7280] line-clamp-2 mb-3 flex-1">
          {project.problemStatement}
        </p>

        <div className="flex flex-wrap gap-1 mb-3">
          {project.techTags.slice(0, 3).map((t) => (
            <span key={t.name} className="text-[10px] font-body font-medium bg-[#F3F4F6] text-[#374151] px-1.5 py-0.5 rounded">
              {t.name}
            </span>
          ))}
          {project.techTags.length > 3 && (
            <span className="text-[10px] font-body text-[#9CA3AF]">+{project.techTags.length - 3} more</span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#F3F4F6]">
          <span className="font-body text-xs text-[#9CA3AF] flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {likeCount}
          </span>

          <div className="flex items-center gap-2">
            {project.status === 'APPROVED' && (
              <Button asChild variant="secondary" size="sm">
                <Link href={`/showcase/${project.id}`} target="_blank">View</Link>
              </Button>
            )}
            {onArchive && (
              <Button
                variant="secondary"
                size="sm"
                loading={archiving}
                onClick={() => onArchive(project.id)}
              >
                Archive
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
