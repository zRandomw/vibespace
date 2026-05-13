# 阶段二：Codex CLI 与 AI 工具区调整

> 历史记录：该计划保留阶段二执行背景。当前正式规格以 `docs/ai-tools-codex-plan.md` 为准。

## 范围

- 新增 Codex CLI 工具项。
- 删除 Claude Code 的 ZCF 预设工作流入口与生成逻辑。
- 保留 Claude Code 输出样式配置。
- 为 Codex 新增独立配置区，生成 `/root/.codex/AGENTS.md`。
- 修正 CNB OSS 默认持久化路径，加入 `/root/.codex` 并修正 `/root/.ssh`。

## 执行步骤

1. 更新默认数据：AI 工具、Codex 输出样式、预设快照。
2. 更新 Alpine 状态：移除 Claude 工作流状态，新增 Codex 配置状态。
3. 更新 AI 工具页面：删除工作流区块，新增 Codex 配置区。
4. 更新 Dockerfile 生成器：抽象 npm 工具安装，新增 Codex AGENTS.md 写入，移除 ZCF 安装。
5. 更新 CNB 持久化默认路径。
6. 执行静态检查和生成器验证。

## 验收标准

- 默认仍选择 Claude Code，不默认选择 Codex。
- AI 工具列表出现 Codex CLI。
- 勾选 Codex 后显示 Codex 配置区，取消后隐藏。
- Claude 输出样式仍可配置。
- 页面不再出现 ZCF 预设工作流区块。
- 选择 Codex 后 Dockerfile 包含 `npm install -g @openai/codex`。
- 固定版本时 Dockerfile 包含 `@openai/codex@<version>`。
- Codex 配置只写入 `/root/.codex/AGENTS.md`。
- CNB OSS 默认路径包含 `/root/.codex` 且不包含 `/root/.shh`。
