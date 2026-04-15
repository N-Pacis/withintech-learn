"use client";

import { useParams } from "next/navigation";
import { ChallengeWorkspace } from "@/components/ChallengeWorkspace";

export default function ChallengePage() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <ChallengeWorkspace
      slug={slug}
      backHref="/learn/challenges"
      isInsideLayout
    />
  );
}
