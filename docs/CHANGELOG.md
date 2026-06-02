# Changelog (变更日志)

## [Unreleased]
### Refactored (架构重构)
- **重构系统架构为 ReAct 范式**：
  - 建立全局技能中心 (`src/skills/`)，封装 `parse_resume` 和 `scrape_website`。
  - 创建 Agent 中枢控制流 (`src/lib/agent.ts`) 取代强顺序调用的 API 路由。
  - 优化前端交互，引入 `resumeText` 状态缓存，避免频繁重新解析简历文件。
- **容器化部署适配**：
  - 配置 `next.config.ts` 输出 `standalone` 产物。
  - 创建多阶段构建 Dockerfile，适配 Puppeteer 所需的 Debian 系统底层依赖库。