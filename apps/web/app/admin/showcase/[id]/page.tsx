'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAdminShowcaseProject } from '@/hooks/queries/showcase';
import { Badge, Button, PageLoader } from '@/components/ui';
import { StatusBadge } from '@/components/showcase/StatusBadge';
import { CategoryIcon } from '@/components/showcase/CategoryIcon';
import { ProjectThumbnail } from '@/components/showcase/ProjectThumbnail';
import { ReviewActions } from './components/ReviewActions';

export default function AdminShowcaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading } = useAdminShowcaseProject(id);

  if (isLoading) return <PageLoader type="detail" />;
  if (!project) return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <p className="font-body text-[#6B7280]">Project not found.</p>
      <Button asChild variant="secondary" size="md" className="mt-4">
        <Link href="/admin/showcase">Back to Showcase</Link>
      </Button>
    </div>
  );

  const likeCount = project._count?.likes ?? 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button asChild variant="ghost" size="sm" className="mb-5">
        <Link href="/admin/showcase">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Showcase
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {project.thumbnailUrl && (
            <div className="rounded-xl overflow-hidden aspect-video bg-[#F9FAFB]">
              <ProjectThumbnail url={project.thumbnailUrl} title={project.title} />
            </div>
          )}

          <div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1 className="font-heading font-bold text-2xl text-[#0F0F0F]">{project.title}</h1>
              <div className="flex items-center gap-2 shrink-0">
                {project.featuredAt && <Badge variant="orange">Featured</Badge>}
                <StatusBadge status={project.status} />
              </div>
            </div>
            <p className="font-body text-sm text-[#9CA3AF]">
              By {project.author.firstName} {project.author.lastName} · {project.author.email}
            </p>
            {project.categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {project.categories.map(({ category }) => (
                  <span key={category} className="inline-flex items-center gap-1 text-xs font-body text-[#6B7280] bg-[#F9FAFB] border border-[#E5E7EB] px-2 py-0.5 rounded">
                    <CategoryIcon category={category} size={11} />
                    {category}
                  </span>
                ))}
              </div>
            )}
          </div>

          {project.status === 'REJECTED' && project.rejectionReason && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="font-body text-sm text-red-700">
                <span className="font-semibold">Rejection reason: </span>
                {project.rejectionReason}
              </p>
            </div>
          )}

          <section>
            <h2 className="font-heading font-bold text-base text-[#0F0F0F] mb-2">Problem Statement</h2>
            <p className="font-body text-sm text-[#374151] leading-relaxed whitespace-pre-wrap">{project.problemStatement}</p>
          </section>

          {project.description && (
            <section>
              <h2 className="font-heading font-bold text-base text-[#0F0F0F] mb-2">Description</h2>
              <p className="font-body text-sm text-[#374151] leading-relaxed whitespace-pre-wrap">{project.description}</p>
            </section>
          )}

          {(project.aiUsageDescription || project.aiTools.length > 0) && (
            <section>
              <h2 className="font-heading font-bold text-base text-[#0F0F0F] mb-2">AI Usage</h2>
              {project.aiTools.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {project.aiTools.map((t) => (
                    <Badge key={t.name} variant="default" size="sm">{t.name}</Badge>
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
              <h2 className="font-heading font-bold text-base text-[#0F0F0F] mb-3">Gallery</h2>
              <div className="grid grid-cols-3 gap-2">
                {project.images.map((img) => (
                  <div key={img.id} className="aspect-video rounded-lg overflow-hidden bg-[#F9FAFB]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-5">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <h2 className="font-heading font-bold text-base text-[#0F0F0F] mb-4">Actions</h2>
            <ReviewActions project={project} />
          </div>

          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 flex flex-col gap-3">
            <h2 className="font-heading font-bold text-base text-[#0F0F0F]">Details</h2>

            <div className="flex items-center gap-2 text-sm font-body text-[#6B7280]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {likeCount} {likeCount === 1 ? 'like' : 'likes'}
            </div>

            {project.techTags.length > 0 && (
              <div>
                <p className="font-body text-xs text-[#9CA3AF] mb-1.5 uppercase tracking-wide">Technologies</p>
                <div className="flex flex-wrap gap-1">
                  {project.techTags.map((t) => (
                    <span key={t.name} className="text-xs font-body bg-[#F3F4F6] text-[#374151] px-2 py-0.5 rounded">
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-body text-sm text-[#3D006B] hover:underline">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
              </a>
            )}

            {project.demoUrl && (
              <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-body text-sm text-[#3D006B] hover:underline">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Live Demo
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
