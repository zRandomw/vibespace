# AI 工具 Codex 配置清理执行计划

## 目标

- 按 `docs/ai-tools-codex-plan.md` 完成 Claude Code 与 Codex CLI 配置边界修正。
- 删除 Codex 配置中复用旧 ZCF / Claude 输出样式模板的逻辑。
- 确保 Codex 只写入 `/root/.codex/AGENTS.md`，不写入 `/workspace/AGENTS.md`。
- 修正 CNB OSS 默认持久化路径，包含 `/root/.codex` 并保持 `/root/.ssh`。
- 审查本次改动，剔除无用代码和文件，验证后提交并推送。

## 执行步骤

1. 调整 `js/data/defaults.js` 中 `codexOutputStyles`，保留 Codex 本地内置样式和自定义模式，删除 Codex 下旧 ZCF 样式项。
2. 调整 `js/generators/dockerfile.js` 的 Codex 配置分支，移除 Codex 对 `URLS.zcf.outputStyle()` 的依赖。
3. 调整 `js/generators/entrypoint.js` 的 CNB OSS 默认 `OSS_PATHS`，补齐 `/root/.codex`。
4. 同步 `build-test/` 中受生成器影响的样例输出。
5. 使用命令与 MCP 浏览器验证 UI 显示、Dockerfile 生成、固定版本安装、AGENTS.md 写入路径和 OSS 路径。
6. 审查 git diff，确认不包含无关文档改动。
7. 提交本次任务相关文件并推送远程。

## 验收标准

- 默认预设仍为 `cc-switch` + `claude-code`，Codex 不默认选中。
- AI 工具列表包含 Codex CLI。
- 选中 Codex 时显示 Codex 配置区，取消时隐藏。
- Codex 输出样式不再包含 UfoMiao/ZCF 或 Claude 官方文案。
- Codex Dockerfile 配置只写 `/root/.codex/AGENTS.md`。
- 固定版本时安装 `@openai/codex@<version>`。
- Codex 配置不调用 `claude config set`，不安装 ZCF 工作流。
- CNB OSS 默认路径包含 `/root/.codex` 和 `/root/.ssh`，不包含 `/root/.shh`。
