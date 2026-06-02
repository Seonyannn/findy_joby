# FindyJoby 🤖

FindyJoby 是一个基于大模型自主编排架构（Agentic ReAct）开发的智能简历-岗位撮合系统。

## ✨ 核心特性

- **Agentic 架构**：抛弃传统流水线，系统自主决定调用解析工具与抓取工具。
- **简历智能解析 (Skill)**：自动提取本地简历文件的纯文本信息。
- **动态网页穿透 (Skill)**：内置无头浏览器 (Puppeteer)，支持抓取现代 SPA 动态招聘网页的真实 JD 数据。
- **多维匹配推理 (Action)**：大模型中枢根据双端数据自动计算匹配度并输出结构化结果。

## 🛠 技术栈

- **框架**：Next.js (App Router) + React
- **UI 组件**：TailwindCSS + Shadcn/ui
- **爬虫底座**：Puppeteer + Cheerio
- **AI 编排**：自研 Agent Loop 控制流

## 🚀 本地启动

1. 安装依赖：
```bash
npm install