# FindyJoby 🤖

> **AI-native Job Matching Agent** —— 简历与岗位的智能撮合专家。

FindyJoby 是一款基于大模型自主编排 (ReAct) 架构的求职辅助工具。它能够自动解析复杂的简历内容，并深度抓取目标招聘页面的岗位需求，通过 AI 推理引擎实现精准的简历-岗位匹配，大幅提升求职效率。

---

## ✨ 核心优势

- **Agentic 架构**：内置 ReAct (Reason + Act) 循环，系统自主判断何时解析简历、何时抓取 JD，无需手动介入。
- **智能工具链 (Skills)**：
  - `parse_resume`：基于语义解析的简历结构化工具。
  - `scrape_website`：集成了 Puppeteer 的动态网页穿透能力，轻松攻克 SPA 招聘网站。
- **精准匹配**：利用 LLM 强大的逻辑推理能力，进行多维度岗位评估。
- **容器化部署**：支持 Docker 一键部署，运行环境高度可控。

---

## 🏗 架构蓝图

我们采用模块化的 [Skills + Actions] 架构：

```mermaid
graph TD
    User[用户输入] --> Agent[Agent 中枢]
    Agent -->|调用| Skill1[Skills: parse_resume]
    Agent -->|调用| Skill2[Skills: scrape_website]
    Skill1 -->|返回 JSON| Agent
    Skill2 -->|返回 JSON| Agent
    Agent -->|推理匹配| Result[最终推荐列表]