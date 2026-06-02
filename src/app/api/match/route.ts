import { NextResponse } from "next/server";
import { matchJobs } from "@/lib/matcher";

export async function POST(request: Request) {
  try {
    const { resume, jobs, topPercent, maxResults } = await request.json();

    if (!resume || !jobs || !Array.isArray(jobs)) {
      return NextResponse.json(
        { error: "请提供简历和岗位数据" },
        { status: 400 }
      );
    }

    if (jobs.length === 0) {
      return NextResponse.json({ results: [] });
    }

    const results = await matchJobs(
      JSON.stringify(resume),
      JSON.stringify(jobs),
      topPercent ?? 20,
      maxResults ?? 10
    );

    return NextResponse.json({ results });
  } catch (err) {
    console.error("匹配错误:", err);
    const message =
      err instanceof Error ? err.message : "匹配失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
