'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useToggleLike } from '@/hooks/queries/showcase';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface Props {
  projectId: string;
  likeCount: number;
  hasLiked?: boolean;
  redirectPath?: string;
}

export function LikeButton({ projectId, likeCount, hasLiked, redirectPath }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const { mutateAsync: toggleLike, isPending } = useToggleLike();

  const handleClick = async () => {
    if (!user) {
      router.push(`/sign-in?next=${redirectPath ?? `/showcase/${projectId}`}`);
      return;
    }
    try {
      await toggleLike(projectId);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-body font-medium transition-all',
        hasLiked
          ? 'border-red-200 bg-red-50 text-red-500'
          : 'border-[#E5E7EB] text-[#9CA3AF] hover:border-red-200 hover:bg-red-50 hover:text-red-400',
      )}
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill={hasLiked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {likeCount}
    </button>
  );
}
