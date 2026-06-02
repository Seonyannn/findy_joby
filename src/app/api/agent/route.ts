import { NextResponse } from "next/server";
import { runAgent } from "@/lib/agent";

export async function POST(request: Request) {
  try {
    const { resumeText, jobUrl, topPercent, maxResults } = await request.json();

    if (!resumeText || typeof resumeText !== "string") {
      return NextResponse.json(
        { error: "请提供简历文本" },
        { status: 400 }
      );
    }

    if (!jobUrl || typeof jobUrl !== "string") {
      return NextResponse.json(
        { error: "请提供招聘页面 URL" },
        { status: 400 }
      );
    }

    const results = await runAgent({
      resumeText,
      jobUrl,
      topPercent: topPercent ?? 20,
      maxResults: maxResults ?? 10,
    });

    return NextResponse.json({ results });
  } catch (err) {
    console.error("Agent 错误:", err);
    const message = err instanceof Error ? err.message : "匹配失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
