'use client';

import { useParams } from 'next/navigation';
import { ChallengeWorkspace } from '@/components/ChallengeWorkspace';

export default function PublicChallengePage() {
  const { slug } = useParams<{ slug: string }>();
  return <ChallengeWorkspace slug={slug} backHref="/challenges" />;
}
