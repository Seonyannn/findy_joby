"use client";

import { useState, useCallback, useRef } from "react";
import { ResumeUpload } from "@/components/resume-upload";
import { UrlInput } from "@/components/url-input";
import { ConfigSliders } from "@/components/config-sliders";
import { MatchResults } from "@/components/match-results";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { MatchResult, ResumeData } from "@/lib/schemas";

type ParseStatus = "idle" | "parsing" | "parsed" | "error";
type MatchStage = "idle" | "scraping" | "matching" | "done";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [parseStatus, setParseStatus] = useState<ParseStatus>("idle");
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);

  const [url, setUrl] = useState("");
  const [topPercent, setTopPercent] = useState(20);
  const [maxResults, setMaxResults] = useState(10);
  const [matchStage, setMatchStage] = useState<MatchStage>("idle");
  const [results, setResults] = useState<MatchResult[]>([]);

  const abortRef = useRef<AbortController | null>(null);

  const isMatching = matchStage === "scraping" || matchStage === "matching";

  // 上传文件后自动解析
  const handleFileChange = useCallback(async (newFile: File | null) => {
    setFile(newFile);
    setResumeData(null);
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
      const data: ResumeData = await res.json();
      setResumeData(data);
      setParseStatus("parsed");
      toast.success("简历解析完成");
    } catch (err) {
      setParseStatus("error");
      toast.error(err instanceof Error ? err.message : "简历解析失败");
    }
  }, []);

  // 匹配：只做抓取 + 匹配
  async function handleMatch() {
    if (!resumeData) {
      toast.error("请先上传并解析简历");
      return;
    }
    if (!url.trim()) {
      toast.error("请输入招聘官网链接");
      return;
    }

    abortRef.current = new AbortController();

    try {
      // Step 1: 抓取岗位
      setMatchStage("scraping");
      setResults([]);
      const scrapeRes = await fetch("/api/scrape-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
        signal: abortRef.current.signal,
      });
      if (!scrapeRes.ok) {
        const err = await scrapeRes.json().catch(() => ({}));
        throw new Error(err.error || "岗位抓取失败");
      }
      const { jobs } = await scrapeRes.json();

      // Step 2: 匹配
      setMatchStage("matching");
      const matchRes = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: resumeData,
          jobs,
          topPercent,
          maxResults,
        }),
        signal: abortRef.current.signal,
      });
      if (!matchRes.ok) {
        const err = await matchRes.json().catch(() => ({}));
        throw new Error(err.error || "匹配失败");
      }
      const { results: matchResults } = await matchRes.json();

      setResults(matchResults);
      setMatchStage("done");
      toast.success(`找到 ${matchResults.length} 个匹配岗位`);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setMatchStage("idle");
      toast.error(err instanceof Error ? err.message : "未知错误");
    }
  }

  const matchStageText: Record<MatchStage, string> = {
    idle: "开始匹配",
    scraping: "正在抓取岗位...",
    matching: "AI 匹配分析中...",
    done: "重新匹配",
  };

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
          resumeData={resumeData}
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
            {isMatching ? matchStageText[matchStage] : matchStageText[matchStage]}
          </Button>
        </div>

        {/* Results */}
        <MatchResults
          results={results}
          loading={isMatching}
          loadingStage={
            matchStage === "scraping"
              ? "正在抓取岗位信息..."
              : "AI 匹配分析中..."
          }
        />
      </div>
    </main>
  );
}
