
# Todo List (待办事项)

## 短期目标 (上线部署验证)
- [ ] 本地彻底测试 Agent Loop：上传真实简历并输入 51job 链接，观察终端里的 Tool Calling 循环是否稳定、是否能准确跳出循环并输出 JSON。
- [ ] Git 归档：将重构后的代码以及上述文档执行 `git add .` 和 `git commit`。
- [ ] 线上部署：将本地仓库 Push 到 GitHub，并部署至云容器平台（如 Zeabur 或基于 Oracle Cloud 的自建环境）打通公网访问。

## 长期规划 (性能与产品迭代)
- [ ] 深度抓取升级：赋予 `scrape_website` 提取列表页中前 N 个详情页 URL 并并发抓取底层 JD 的能力。
- [ ] 流式输出 (Streaming UI)：改造前端状态，让大模型在思考和匹配时能实时吐出文字，缓解用户等待焦虑。