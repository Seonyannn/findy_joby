"use client";

import { useState, useCallback, useRef } from "react";
import { ResumeUpload } from "@/components/resume-upload";
import { UrlInput } from "@/components/url-input";
import { ConfigSliders } from "@/components/config-sliders";
import { MatchResults } from "@/components/match-results";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { MatchResult } from "@/lib/schemas";

type ParseStatus = "idle" | "parsing" | "parsed" | "error";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [parseStatus, setParseStatus] = useState<ParseStatus>("idle");
  const [resumeText, setResumeText] = useState<string>("");

  const [url, setUrl] = useState("");
  const [topPercent, setTopPercent] = useState(20);
  const [maxResults, setMaxResults] = useState(10);
  const [isMatching, setIsMatching] = useState(false);
  const [results, setResults] = useState<MatchResult[]>([]);

  const abortRef = useRef<AbortController | null>(null);

  // 上传文件后自动提取文本
  const handleFileChange = useCallback(async (newFile: File | null) => {
    setFile(newFile);
    setResumeText("");
    setResults([]);

    if (!newFile) {
      setParseStatus("idle");
      return;
    }

    setParseStatus("parsing");
    try {
      const formData = new FormData();
      formData.append("file", newFile);
      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "简历解析失败");
      }
      const { text } = await res.json();
      setResumeText(text);
      setParseStatus("parsed");
      toast.success("简历已加载");
    } catch (err) {
      setParseStatus("error");
      toast.error(err instanceof Error ? err.message : "简历解析失败");
    }
  }, []);

  // 匹配：调用 Agent 接口
  async function handleMatch() {
    if (!resumeText) {
      toast.error("请先上传简历");
      return;
    }
    if (!url.trim()) {
      toast.error("请输入招聘官网链接");
      return;
    }

    abortRef.current = new AbortController();
    setIsMatching(true);
    setResults([]);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobUrl: url,
          topPercent,
          maxResults,
        }),
        signal: abortRef.current.signal,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "匹配失败");
      }
      const { results: matchResults } = await res.json();

      setResults(matchResults);
      toast.success(`找到 ${matchResults.length} 个匹配岗位`);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      toast.error(err instanceof Error ? err.message : "未知错误");
    } finally {
      setIsMatching(false);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">FindyJoby</h1>
          <p className="text-muted-foreground">
            上传简历，输入招聘链接，AI 帮你找到最匹配的岗位
          </p>
        </div>

        {/* Step 1: 简历上传 */}
        <ResumeUpload
          file={file}
          onFileChange={handleFileChange}
          parseStatus={parseStatus}
        />

        {/* Step 2: URL + 配置 + 匹配按钮 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UrlInput url={url} onUrlChange={setUrl} />
          <ConfigSliders
            topPercent={topPercent}
            maxResults={maxResults}
            onTopPercentChange={setTopPercent}
            onMaxResultsChange={setMaxResults}
          />
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleMatch}
            disabled={isMatching || parseStatus !== "parsed"}
            className="px-8"
          >
            {isMatching ? "AI 匹配分析中..." : "开始匹配"}
          </Button>
        </div>

        {/* Results */}
        <MatchResults
          results={results}
          loading={isMatching}
          loadingStage="Agent 正在分析简历与岗位..."
        />
      </div>
    </main>
  );
}
