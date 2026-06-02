"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface UrlInputProps {
  url: string;
  onUrlChange: (url: string) => void;
}

export function UrlInput({ url, onUrlChange }: UrlInputProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">招聘官网链接</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          type="url"
          placeholder="https://careers.example.com/jobs"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
        />
        <p className="text-xs text-muted-foreground mt-2">
          输入企业招聘页面 URL，系统将自动抓取岗位信息
        </p>
      </CardContent>
    </Card>
  );
}
