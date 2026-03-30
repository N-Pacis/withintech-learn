import Link from 'next/link';
import { Badge } from '@/components/ui';
import { type ShowcaseProject } from '@/hooks/queries/showcase';
import { CategoryIcon } from '@/components/showcase/CategoryIcon';
import { ProjectThumbnail } from '@/components/showcase/ProjectThumbnail';

interface Props {
  project: ShowcaseProject;
}

export function ShowcaseCard({ project }: Props) {
  const likeCount = project._count?.likes ?? 0;

  return (
    <Link
      href={`/showcase/${project.id}`}
      className="group bg-white rounded-xl border border-[#E5E7EB] overflow-hidden hover:shadow-md transition-all flex flex-col"
    >
      <div className="relative aspect-video bg-[#F9FAFB] overflow-hidden">
        <ProjectThumbnail
          url={project.thumbnailUrl}
          title={project.title}
          className="group-hover:scale-105 transition-transform duration-300"
        />
        {project.featuredAt && (
          <div className="absolute top-2 left-2">
            <Badge variant="orange" size="sm">Featured</Badge>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-heading font-bold text-sm text-[#0F0F0F] line-clamp-1 mb-1">{project.title}</h3>

        <p className="font-body text-xs text-[#9CA3AF] mb-2">
          {project.author.firstName} {project.author.lastName}
        </p>
        {project.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {project.categories.slice(0, 2).map(({ category }) => (
              <span key={category} className="inline-flex items-center gap-1 text-[10px] font-body text-[#6B7280] bg-[#F9FAFB] border border-[#F3F4F6] px-1.5 py-0.5 rounded">
                <CategoryIcon category={category} size={10} />
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

        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {project.techTags.slice(0, 3).map((t) => (
              <span key={t.name} className="text-[10px] font-body bg-[#F3F4F6] text-[#374151] px-1.5 py-0.5 rounded">
                {t.name}
              </span>
            ))}
            {project.techTags.length > 3 && (
              <span className="text-[10px] font-body text-[#9CA3AF]">+{project.techTags.length - 3}</span>
            )}
          </div>
          <span className="font-body text-xs text-[#9CA3AF] flex items-center gap-1 shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {likeCount}
          </span>
        </div>
      </div>
    </Link>
  );
}
