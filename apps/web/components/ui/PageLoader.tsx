import { cn } from '@/lib/utils';

// ─── Primitive ────────────────────────────────────────────────────────────────

function Bone({ className }: { className?: string }) {
  return <div className={cn('bg-[#E5E7EB] rounded-lg animate-pulse', className)} />;
}

// ─── Variants ─────────────────────────────────────────────────────────────────

/** Grid of card skeletons — courses list, any card grid */
function CardsLoader({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col rounded-xl border border-[#E5E7EB] overflow-hidden">
          <Bone className="h-40 rounded-none" />
          <div className="p-4 flex flex-col gap-2">
            <Bone className="h-4 w-3/4" />
            <Bone className="h-3 w-full" />
            <Bone className="h-3 w-2/3" />
            <div className="pt-3">
              <Bone className="h-3 w-1/3" />
            </div>
          </div>
          <div className="px-4 pb-4">
            <Bone className="h-8 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Detail page — course / module detail with header + multiple section cards */
function DetailLoader() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Back link */}
      <Bone className="h-4 w-28" />

      {/* Title row */}
      <div className="flex items-center gap-3">
        <Bone className="h-9 flex-1" />
        <Bone className="h-6 w-20 rounded-full" />
      </div>

      {/* Section cards */}
      {[140, 120, 90].map((h, i) => (
        <div key={i} className="rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <Bone className="h-4 w-24" />
            <Bone className="h-7 w-20 rounded-lg" />
          </div>
          <div className="p-6 flex flex-col gap-4" style={{ minHeight: h }}>
            <div className="flex flex-col gap-2">
              <Bone className="h-3 w-16" />
              <Bone className="h-9 w-full" />
            </div>
            <div className="flex flex-col gap-2">
              <Bone className="h-3 w-20" />
              <Bone className="h-16 w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Form page — create/edit form with a header and one or two section cards */
function FormLoader() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Back link */}
      <Bone className="h-4 w-28" />

      {/* Page title */}
      <div className="flex flex-col gap-2">
        <Bone className="h-9 w-56" />
        <Bone className="h-4 w-80" />
      </div>

      {/* Form card */}
      <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E7EB]">
          <Bone className="h-4 w-28" />
        </div>
        <div className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Bone className="h-3 w-12" />
            <Bone className="h-9 w-full" />
          </div>
          <div className="flex flex-col gap-2">
            <Bone className="h-3 w-20" />
            <Bone className="h-24 w-full" />
          </div>
        </div>
      </div>

      {/* Thumbnail card */}
      <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E7EB]">
          <Bone className="h-4 w-24" />
        </div>
        <div className="p-6">
          <Bone className="h-36 w-full rounded-xl" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Bone className="h-9 w-20 rounded-lg" />
        <Bone className="h-9 w-32 rounded-lg" />
      </div>
    </div>
  );
}

/** Content blocks — module editor with stacked block cards */
function ContentLoader({ blocks = 3 }: { blocks?: number }) {
  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Back + title */}
      <Bone className="h-4 w-28" />
      <div className="flex flex-col gap-2">
        <Bone className="h-3 w-20" />
        <Bone className="h-9 w-2/3" />
      </div>

      {/* Section heading */}
      <Bone className="h-5 w-24" />

      {/* Block cards */}
      <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
        {Array.from({ length: blocks }).map((_, i) => (
          <div key={i} className="flex gap-3 p-4 border-b border-[#E5E7EB] last:border-0">
            {/* Order column */}
            <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
              <Bone className="h-4 w-4 rounded" />
              <Bone className="h-4 w-4 rounded-full" />
              <Bone className="h-4 w-4 rounded" />
            </div>
            {/* Content */}
            <div className="flex-1 flex flex-col gap-2">
              <Bone className="h-5 w-12 rounded-full" />
              <Bone className="h-3 w-full" />
              <Bone className="h-3 w-4/5" />
              <Bone className="h-3 w-3/5" />
            </div>
          </div>
        ))}
      </div>

      {/* Add buttons */}
      <div className="flex gap-3">
        <Bone className="h-8 w-36 rounded-lg" />
        <Bone className="h-8 w-36 rounded-lg" />
      </div>
    </div>
  );
}

/** List rows — module list, user list, any vertical list */
function ListLoader({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <Bone className="h-7 w-40" />
        <Bone className="h-8 w-28 rounded-lg" />
      </div>

      {/* Rows */}
      <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-[#E5E7EB] last:border-0">
            <Bone className="h-6 w-6 rounded-full shrink-0" />
            <div className="flex-1 flex flex-col gap-1.5">
              <Bone className="h-3.5 w-48" />
              <Bone className="h-3 w-32" />
            </div>
            <Bone className="h-5 w-16 rounded-full" />
            <Bone className="h-3 w-20 hidden sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Public API ───────────────────────────────────────────────────────────────

export type PageLoaderType = 'cards' | 'detail' | 'form' | 'content' | 'list';

interface PageLoaderProps {
  type: PageLoaderType;
  /** cards: number of skeleton cards (default 8) */
  count?: number;
  className?: string;
}

export function PageLoader({ type, count, className }: PageLoaderProps) {
  return (
    <div className={cn('w-full', className)}>
      {type === 'cards'   && <CardsLoader   count={count} />}
      {type === 'detail'  && <DetailLoader  />}
      {type === 'form'    && <FormLoader    />}
      {type === 'content' && <ContentLoader blocks={count} />}
      {type === 'list'    && <ListLoader    rows={count} />}
    </div>
  );
}
