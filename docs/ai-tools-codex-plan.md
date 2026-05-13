# AI 工具与 Codex 配置区计划

本文只描述 AI 工具页中 Claude Code 与 Codex CLI 的调整。语言运行时改造维护在 [语言运行时管理计划](language-runtime-management-plan.md)，整体文档导航见 [二次开发总纲](secondary-development-outline.md)。

## 目标

- 新增 **Codex CLI** 工具项。
- 默认配置仍保留 Claude Code，不切换为 Codex。
- Claude Code 暂时保留输出样式配置。
- 删除 Claude Code 下方现有的 **ZCF 预设工作流** 区块。
- Codex 输出样式写入全局 `/root/.codex/AGENTS.md`。
- Codex 配置不污染 `/workspace`，避免把生成的指导文件写入用户项目仓库。

## AI 工具列表

- 在 `DEFAULTS.aiTools` 新增 `codex`：
  - `id: 'codex'`
  - `label: 'Codex CLI'`
  - `npmPkg: '@openai/codex'`
  - `hasVersion: true`
  - `defaultVersion: 'latest'`
- 默认预设不变：
  - `presets.default.aiTools` 继续使用 `cc-switch` + `claude-code`。
  - 默认不选中 Codex。
- AI npm 工具安装逻辑需要抽象，统一处理：
  - `npmPkg`
  - `hasVersion`
  - `defaultVersion`
  - 用户填写的固定版本。
- 后续 Gemini CLI / OpenCode 可复用该安装抽象，但本期不在 UI 中暴露。

## Claude Code 区块

- 保留 Claude Code 本身的工具项。
- 保留 Claude Code 输出样式选择。
- 删除现有 ZCF 预设工作流区块。
- 删除或停用相关状态：
  - `claudeWorkflows`
  - `toggleClaudeWorkflow()`
  - `hasClaudeWorkflow()`
- 删除 Dockerfile 中 ZCF 工作流安装逻辑。
- 不再展示“预设工作流”标题、说明和工作流卡片。

## Codex 配置区

- 仅在用户选中 Codex 时显示 Codex 配置区。
- Codex 配置区只负责 Codex 自身配置：
  - 输出样式选择。
  - 自定义 `AGENTS.md` 内容。
- 新增状态：
  - `codexOutputStyle`
  - `codexCustomAgentsText`
- Codex 输出样式不复用 Claude/ZCF 下载模板。
- Codex 默认样式应是面向 Codex 的本地模板文本。
- 自定义样式模式下，用户输入内容原样写入 `/root/.codex/AGENTS.md`。

## AGENTS.md 生成

- 选择 Codex 后，在镜像中创建 `/root/.codex`。
- 当选择默认 Codex 样式时，生成内置默认 `AGENTS.md`。
- 当选择自定义样式时，生成用户填写的 `AGENTS.md`。
- 不写入 `/workspace/AGENTS.md`。
- 不把 Claude Code 输出样式、ZCF 工作流或 Claude 专属说明混入 Codex `AGENTS.md`。

## Dockerfile 行为

- 选择 Codex 后安装：

```bash
npm install -g @openai/codex
```

- 用户填写固定版本时安装：

```bash
npm install -g @openai/codex@<version>
```

- Codex 依赖 Node/npm。Node/npm 安装策略由 [语言运行时管理计划](language-runtime-management-plan.md) 负责。
- Codex 不触发 Claude 专属命令：
  - 不调用 `claude config set`。
  - 不执行 Claude Code 专属外部配置命令。
  - 不安装 ZCF 工作流。

## 持久化

- CNB OSS 默认持久化路径加入 `/root/.codex`。
- 修正现有默认路径中的 `/root/.shh` 为 `/root/.ssh`。
- 本地 Docker 场景继续依赖已有 `/root` 挂载持久化，不新增单独 volume。

## 公共接口变化

- AI 工具列表新增 `Codex CLI`。
- Claude Code 下方不再出现 ZCF 预设工作流。
- Codex 选中后出现 Codex 配置区。
- 生成结果新增或影响 `/root/.codex/AGENTS.md`。

## 验证清单

- 默认打开页面时仍选中 Claude 默认预设，Codex 未默认选中。
- AI 工具列表出现 Codex CLI。
- 勾选 Codex 后出现 Codex 配置区。
- 取消 Codex 后 Codex 配置区隐藏。
- Claude 输出样式仍可选择。
- ZCF 预设工作流区块不再出现。
- 选择 Codex 后 Dockerfile 包含 `npm install -g @openai/codex`。
- 固定版本时生成 `@openai/codex@<version>`。
- Codex `AGENTS.md` 只写入 `/root/.codex/AGENTS.md`。
- 该文档只覆盖 Claude Code 与 Codex CLI 的配置边界。

## 参考

- OpenAI Codex CLI Getting Started: <https://help.openai.com/en/articles/11096431-openai-codex-cli-getting-started>
- Codex AGENTS.md: <https://developers.openai.com/codex/guides/agents-md>
