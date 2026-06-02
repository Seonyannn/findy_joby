# Project Memory (项目记忆与状态)

## 当前阶段: MVP 重构完成 (Agentic 化)
FindyJoby 简历-岗位匹配系统已经完成了从“固定流水线”到“智能体自主编排”的底层架构升级。

## 当前业务流转逻辑
1. 用户在前端上传简历，触发初步解析（不调用 LLM，仅提取生肉文本）并缓存为 `resumeText`。
2. 用户输入招聘目标 URL，前端将 `resumeText` 和 `jobUrl` 等配置发送至唯一的 `Agent` 路由。
3. Agent 启动循环，自主判断并调用 `parse_resume` 工具结构化简历，调用 `scrape_website` 工具获取 JD。
4. 信息收集完毕后，Agent 内部执行匹配推理，输出最终 JSON，由前端渲染匹配卡片。

## 已知问题与妥协
- 性能瓶颈：Puppeteer 每次请求均冷启动 Chromium，抓取速度偏慢（约 10-20 秒）。
- 状态：目前为 MVP 阶段，API Key 硬编码共享，尚未引入独立用户鉴权系统。