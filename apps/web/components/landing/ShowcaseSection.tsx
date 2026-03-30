'use client';

// ─── Showcase Section ──────────────────────────────────────────────────────────
// Shows top 3 most-liked approved projects. Clicking any card → sign-in.

import Link from 'next/link';
import { usePublicShowcaseProjects } from '@/hooks/queries/showcase';
import { CategoryIcon } from '@/components/showcase/CategoryIcon';
import { ProjectThumbnail } from '@/components/showcase/ProjectThumbnail';

function TeaserCard({ project }: { project: import('@/hooks/queries/showcase').ShowcaseProject }) {
  const likeCount = project._count?.likes ?? 0;

  return (
    <Link
      href="/sign-in"
      className="group bg-white rounded-xl border border-[#E5E7EB] overflow-hidden hover:shadow-lg transition-all flex flex-col"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-[#F9FAFB] overflow-hidden">
        <ProjectThumbnail
          url={project.thumbnailUrl}
          title={project.title}
          className="group-hover:scale-105 transition-transform duration-300"
        />
        {project.featuredAt && (
          <div className="absolute top-2 left-2 bg-[#F97316] text-white text-[10px] font-body font-semibold px-2 py-0.5 rounded">
            Featured
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-heading font-bold text-sm text-[#0F0F0F] line-clamp-1 mb-1 group-hover:text-[#3D006B] transition-colors">
          {project.title}
        </h3>

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
          </div>
        )}

        <p className="font-body text-xs text-[#6B7280] line-clamp-2 mb-3 flex-1">
          {project.problemStatement}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-[#F9FAFB]">
          <div className="flex flex-wrap gap-1">
            {project.techTags.slice(0, 2).map((t) => (
              <span key={t.name} className="text-[10px] font-body bg-[#F3F4F6] text-[#374151] px-1.5 py-0.5 rounded">
                {t.name}
              </span>
            ))}
            {project.techTags.length > 2 && (
              <span className="text-[10px] font-body text-[#9CA3AF]">+{project.techTags.length - 2}</span>
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

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden animate-pulse">
      <div className="aspect-video bg-[#F3F4F6]" />
      <div className="p-4 flex flex-col gap-2">
        <div className="h-3.5 bg-[#F3F4F6] rounded w-3/4" />
        <div className="h-2.5 bg-[#F3F4F6] rounded w-1/3" />
        <div className="h-2 bg-[#F3F4F6] rounded w-full mt-1" />
        <div className="h-2 bg-[#F3F4F6] rounded w-5/6" />
      </div>
    </div>
  );
}

export default function ShowcaseSection() {
  const { data, isLoading } = usePublicShowcaseProjects({ limit: 3, sort: 'mostLiked' });
  const projects = data?.projects ?? [];
  const hasProjects = !isLoading && projects.length > 0;

  return (
    <section id="showcase" className="bg-[#FAFAFA] py-20 lg:py-28 border-t border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <p className="font-heading text-xs tracking-widest uppercase text-[#3D006B] font-bold mb-3">
              Student Showcase
            </p>
            <h2 className="font-heading font-black text-3xl lg:text-4xl text-[#0F0F0F] tracking-tight leading-tight max-w-lg">
              Students building real solutions.
            </h2>
            <p className="font-body text-base text-[#6B7280] mt-3 max-w-md leading-relaxed">
              Browse projects that tackle real challenges across Rwanda — from healthcare to agriculture to digital access.
            </p>
          </div>
          <Link
            href="/showcase"
            className="shrink-0 inline-flex items-center gap-2 font-body text-sm font-medium bg-[#3D006B] text-white px-5 py-2.5 rounded-md hover:bg-[#2A004A] transition-colors"
          >
            Browse all projects
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>

        {/* Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : hasProjects ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => (
              <TeaserCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-[#F3E8FF] flex items-center justify-center mx-auto mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3D006B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <p className="font-heading font-bold text-base text-[#0F0F0F] mb-1">Projects coming soon</p>
            <p className="font-body text-sm text-[#6B7280]">Be the first to submit a project to the showcase.</p>
          </div>
        )}

        {/* CTA strip */}
        {hasProjects && (
          <div className="mt-8 text-center">
            <p className="font-body text-sm text-[#9CA3AF] mb-3">
              Sign in to see full project details, like projects, and submit your own.
            </p>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 font-body text-sm font-medium text-[#3D006B] border border-[#3D006B] px-5 py-2.5 rounded-md hover:bg-[#F3E8FF] transition-colors"
            >
              Sign in to explore
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
