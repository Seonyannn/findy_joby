import axios from "axios";
import * as cheerio from "cheerio";
import { getLLM, getModel } from "@/lib/llm";
import { JobDescriptionSchema, type JobDescription } from "@/lib/schemas";
import { z } from "zod";

function cleanText(html: string): string {
  const $ = cheerio.load(html);
  $("script, style, nav, footer, header, iframe, noscript, svg").remove();
  $('[role="navigation"]').remove();
  $(".nav, .footer, .header, .sidebar, .menu, .ad, .advertisement").remove();
  return $.text()
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, "\n")
    .trim();
}

async function scrapeWithAxios(url: string): Promise<string> {
  const { data: html } = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    },
    timeout: 15000,
    maxRedirects: 10,
    validateStatus: (status) => status < 400,
  });
  return cleanText(html);
}

async function scrapeWithPuppeteer(url: string): Promise<string> {
  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });
  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    await new Promise((r) => setTimeout(r, 2000));
    const html = await page.content();
    return cleanText(html);
  } finally {
    await browser.close();
  }
}

async function scrapeRawText(url: string): Promise<string> {
  let text = await scrapeWithAxios(url);
  if (text.length < 300) {
    console.log("axios 抓取内容过短，切换 Puppeteer 渲染...");
    text = await scrapeWithPuppeteer(url);
  }
  if (text.length < 100) {
    throw new Error("页面内容为空或无法解析");
  }
  return text.slice(0, 20000);
}

export async function execute(url: string): Promise<JobDescription[]> {
  const pageText = await scrapeRawText(url);

  const completion = await getLLM().chat.completions.create({
    model: getModel(),
    messages: [
      {
        role: "system",
        content: `你是一个招聘信息提取专家。请从网页文本中提取所有招聘岗位信息。
必须严格返回以下 JSON 数组格式，不要包含任何其他文字：
[
  {
    "job_title": "岗位名称",
    "department": "部门",
    "location": "工作地点",
    "requirements": ["任职要求1", "任职要求2"],
    "description": "岗位描述摘要",
    "url": "岗位链接（如有）"
  }
]
如果某个字段信息缺失，使用空字符串或空数组。如果没有找到任何岗位信息，返回空数组 []。`,
      },
      {
        role: "user",
        content: `以下是招聘页面的文本内容，请提取所有岗位信息：\n\n${pageText}`,
      },
    ],
    temperature: 0.1,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("LLM 未返回有效内容");

  const jsonStr = content.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
  const parsed = JSON.parse(jsonStr);
  return z.array(JobDescriptionSchema).parse(parsed);
}
