# FindyJoby 项目开发铁律

## 1. 架构约束
- 本项目采用基于大模型的 ReAct Agent 架构 (Skills + Actions)。
- 绝不要在 API 路由中硬编码业务的流转顺序。

## 2. 工具 (Skills) 规范
- 所有物理探针代码必须存放在 `src/skills/` 目录下。
- 每个 Skill 必须包含 `schema.ts` (供 LLM 调用的说明) 和 `index.ts` (执行逻辑)。

## 3. 抓取与部署限制
- 遇到纯动态渲染的页面，禁止仅使用 Axios，必须调用底层封装的 Puppeteer。
- 必须使用 Next.js 的 `standalone` 模式构建，确保运行环境至少 1GB 内存。