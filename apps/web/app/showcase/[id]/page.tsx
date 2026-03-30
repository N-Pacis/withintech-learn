'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { usePublicShowcaseProject } from '@/hooks/queries/showcase';
import { Badge, Button, PageLoader } from '@/components/ui';
import { LikeButton } from '@/components/showcase/LikeButton';
import { CategoryIcon } from '@/components/showcase/CategoryIcon';
import { ProjectThumbnail } from '@/components/showcase/ProjectThumbnail';

export default function PublicShowcaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading } = usePublicShowcaseProject(id);

  if (isLoading) return <PageLoader type="detail" />;
  if (!project) return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <p className="font-body text-[#6B7280]">Project not found.</p>
      <Button asChild variant="secondary" size="md" className="mt-4">
        <Link href="/showcase">Back to Showcase</Link>
      </Button>
    </div>
  );

  const likeCount = project._count?.likes ?? 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Button asChild variant="ghost" size="sm" className="mb-5">
        <Link href="/showcase">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          All Projects
        </Link>
      </Button>

      {/* Hero */}
      {project.thumbnailUrl && (
        <div className="rounded-2xl overflow-hidden aspect-video bg-[#F9FAFB] mb-6">
          <ProjectThumbnail url={project.thumbnailUrl} title={project.title} />
        </div>
      )}

      {/* Title & meta */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {project.featuredAt && <Badge variant="orange">Featured</Badge>}
            {project.categories.map(({ category }) => (
              <Badge key={category} variant="default">
                <span className="flex items-center gap-1">
                  <CategoryIcon category={category} size={11} />
                  {category}
                </span>
              </Badge>
            ))}
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#0F0F0F]">{project.title}</h1>
          <p className="font-body text-sm text-[#9CA3AF] mt-1">
            By {project.author.firstName} {project.author.lastName}
          </p>
        </div>

        <LikeButton
          projectId={id}
          likeCount={likeCount}
          hasLiked={project.hasLiked}
          redirectPath={`/showcase/${id}`}
        />
      </div>

      {/* Links */}
      {(project.githubUrl || project.demoUrl) && (
        <div className="flex items-center gap-3 mb-6">
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" size="sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="mr-1.5">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
              </Button>
            </a>
          )}
          {project.demoUrl && (
            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" size="sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Live Demo
              </Button>
            </a>
          )}
        </div>
      )}

      <div className="flex flex-col gap-7">
        <section>
          <h2 className="font-heading font-bold text-lg text-[#0F0F0F] mb-2">Problem Statement</h2>
          <p className="font-body text-sm text-[#374151] leading-relaxed whitespace-pre-wrap">{project.problemStatement}</p>
        </section>

        {project.description && (
          <section>
            <h2 className="font-heading font-bold text-lg text-[#0F0F0F] mb-2">About the Project</h2>
            <p className="font-body text-sm text-[#374151] leading-relaxed whitespace-pre-wrap">{project.description}</p>
          </section>
        )}

        {project.techTags.length > 0 && (
          <section>
            <h2 className="font-heading font-bold text-lg text-[#0F0F0F] mb-3">Technologies</h2>
            <div className="flex flex-wrap gap-2">
              {project.techTags.map((t) => (
                <span key={t.name} className="font-body text-sm font-medium bg-[#F3F4F6] text-[#374151] px-3 py-1 rounded-full">
                  {t.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {(project.aiTools.length > 0 || project.aiUsageDescription) && (
          <section>
            <h2 className="font-heading font-bold text-lg text-[#0F0F0F] mb-3">AI Usage</h2>
            {project.aiTools.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {project.aiTools.map((t) => (
                  <Badge key={t.name} variant="default" size="md">{t.name}</Badge>
                ))}
              </div>
            )}
            {project.aiUsageDescription && (
              <p className="font-body text-sm text-[#374151] leading-relaxed whitespace-pre-wrap">{project.aiUsageDescription}</p>
            )}
          </section>
        )}

        {project.images.length > 0 && (
          <section>
            <h2 className="font-heading font-bold text-lg text-[#0F0F0F] mb-3">Gallery</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {project.images.map((img) => (
                <a key={img.id} href={img.imageUrl} target="_blank" rel="noopener noreferrer">
                  <div className="aspect-video rounded-xl overflow-hidden bg-[#F9FAFB] hover:opacity-90 transition-opacity">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
