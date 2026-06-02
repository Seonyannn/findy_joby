import axios from "axios";
import * as cheerio from "cheerio";

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
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
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

    // 等待内容渲染
    await new Promise((r) => setTimeout(r, 2000));

    const html = await page.content();
    return cleanText(html);
  } finally {
    await browser.close();
  }
}

export async function scrapePage(url: string): Promise<string> {
  // 先尝试 axios（快速，适用于 SSR 页面）
  let text = await scrapeWithAxios(url);

  // 如果内容太短，说明是 SPA，用 Puppeteer 渲染
  if (text.length < 300) {
    console.log("axios 抓取内容过短，切换 Puppeteer 渲染...");
    text = await scrapeWithPuppeteer(url);
  }

  if (text.length < 100) {
    throw new Error("页面内容为空或无法解析");
  }

  return text.slice(0, 20000);
}
