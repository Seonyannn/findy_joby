"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { MatchResult } from "@/lib/schemas";

function getProgressColor(pct: number) {
  if (pct >= 80) return "bg-green-500";
  if (pct >= 60) return "bg-blue-500";
  if (pct >= 40) return "bg-yellow-500";
  return "bg-red-500";
}

export function JobCard({ result }: { result: MatchResult }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight">
            {result.job_title}
          </CardTitle>
          <span className="text-2xl font-bold tabular-nums shrink-0">
            {result.match_percentage}%
          </span>
        </div>
        <Progress
          value={result.match_percentage}
          className={`h-2 [&>div]:${getProgressColor(result.match_percentage)}`}
        />
      </CardHeader>
      <CardContent className="space-y-3">
        {result.match_reasons.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">
              匹配原因
            </p>
            <div className="flex flex-wrap gap-1.5">
              {result.match_reasons.map((reason, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {reason}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {result.missing_skills.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">
              缺失技能
            </p>
            <div className="flex flex-wrap gap-1.5">
              {result.missing_skills.map((skill, i) => (
                <Badge key={i} variant="destructive" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
