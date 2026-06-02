"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface ConfigSlidersProps {
  topPercent: number;
  maxResults: number;
  onTopPercentChange: (val: number) => void;
  onMaxResultsChange: (val: number) => void;
}

export function ConfigSliders({
  topPercent,
  maxResults,
  onTopPercentChange,
  onMaxResultsChange,
}: ConfigSlidersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">推荐配置</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>匹配度阈值 (Top N%)</Label>
            <span className="text-sm font-mono text-muted-foreground">
              {topPercent}%
            </span>
          </div>
          <Slider
            value={[topPercent]}
            onValueChange={(val) => {
              const v = Array.isArray(val) ? val[0] : val;
              onTopPercentChange(Number(v));
            }}
            min={5}
            max={100}
            step={5}
          />
          <p className="text-xs text-muted-foreground">
            仅展示匹配度排名前 {topPercent}% 的岗位
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>最大展示条数</Label>
            <span className="text-sm font-mono text-muted-foreground">
              {maxResults}
            </span>
          </div>
          <Slider
            value={[maxResults]}
            onValueChange={(val) => {
              const v = Array.isArray(val) ? val[0] : val;
              onMaxResultsChange(Number(v));
            }}
            min={1}
            max={50}
            step={1}
          />
          <p className="text-xs text-muted-foreground">
            最多展示 {maxResults} 条推荐结果
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
