"use client";

import { JobCard } from "@/components/job-card";
import type { MatchResult } from "@/lib/schemas";
import { Card, CardContent } from "@/components/ui/card";

interface MatchResultsProps {
  results: MatchResult[];
  loading: boolean;
  loadingStage: string;
}

function SkeletonCard() {
  return (
    <Card className="h-full animate-pulse">
      <CardContent className="p-6 space-y-4">
        <div className="h-5 bg-muted rounded w-3/4" />
        <div className="h-2 bg-muted rounded w-full" />
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded w-1/4" />
          <div className="flex gap-2">
            <div className="h-5 bg-muted rounded w-16" />
            <div className="h-5 bg-muted rounded w-20" />
            <div className="h-5 bg-muted rounded w-14" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded w-1/4" />
          <div className="flex gap-2">
            <div className="h-5 bg-muted rounded w-18" />
            <div className="h-5 bg-muted rounded w-12" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MatchResults({ results, loading, loadingStage }: MatchResultsProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          {loadingStage}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (results.length === 0) return null;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground text-center">
        找到 {results.length} 个匹配岗位
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((result, i) => (
          <JobCard key={i} result={result} />
        ))}
      </div>
    </div>
  );
}
