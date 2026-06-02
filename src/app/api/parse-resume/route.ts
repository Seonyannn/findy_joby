import { NextResponse } from "next/server";
import { extractText } from "@/lib/resume-parser";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "请上传简历文件" }, { status: 400 });
    }

    const text = await extractText(file);

    if (!text.trim()) {
      return NextResponse.json(
        { error: "无法从文件中提取文本" },
        { status: 400 }
      );
    }

    return NextResponse.json({ text });
  } catch (err) {
    console.error("简历解析错误:", err);
    const message = err instanceof Error ? err.message : "简历解析失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
