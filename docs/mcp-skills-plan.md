# MCP 与 Skills 功能计划

本文描述 AI 工具页中的 MCP 与 Skills 配置边界。Claude Code / Codex 自身配置见 [AI 工具与 Codex 配置区计划](ai-tools-codex-plan.md)，更细的 UI 设计和视觉参考见 [MCP 与 Skills 导入体验设计](mcp-skills-import-design.md)。

## 目标

- 在 AI 工具步骤中，用 MCP / Skills 配置区承接原先的扩展能力位置。
- MCP 使用可编辑 `name + JSON` 模型，支持预设快捷按钮和手动录入。
- Skills 使用文件夹导入模型，不再使用 marketplace item 或手填 JSON 条目。
- Claude Code 与 Codex 共用一份 Skills 导入列表，按已选工具安装到各自目录。
- 保持静态页面、Alpine.js 状态管理和纯前端生成模式。

## UI 位置

- Claude Code 配置区包含：
  - Claude MCP
  - Claude 输出样式
- Codex 配置区包含：
  - Codex `AGENTS.md` 输出样式
  - Codex MCP
- Skills 导入卡为共享配置：
  - 选择 Claude Code 或 Codex 任一工具时显示
  - 根据已选工具动态展示目标目录摘要

## MCP 模型

- Claude Code 与 Codex 都使用同一套交互：
  - 预设快捷按钮
  - `+ 添加 MCP`
  - 可编辑配置行
- 每条 MCP 包含：
  - `name`
  - JSON textarea
  - 删除按钮
  - JSON 校验状态
- 预设由当前 `DEFAULTS.mcpPresets` 提供，不再依赖旧市场源模型。

示例：

```json
{"command":"npx","args":["-y","@upstash/context7-mcp@latest"]}
```

```json
{"type":"http","url":"https://mcp.exa.ai/mcp?exaApiKey=[YOUR_API_KEY]"}
```

生成规则：

- Claude Code：使用 `claude mcp add-json`
- Codex：生成 `/root/.codex/config.toml`
- JSON 非法时不进入生成

## Skills 模型

- Skills 只支持文件夹导入，不支持 market item、URL 安装或 JSON 条目输入。
- 有效 Skill 的判断标准：
  - 文件夹根部包含 `SKILL.md`
  - 文件路径为安全相对路径
- 导入列表为全局共享：
  - 只选 Claude Code：安装到 `/root/.claude/skills/<skill-folder>/`
  - 只选 Codex：安装到 `/root/.codex/skills/<skill-folder>/`
  - 同时选择：同一份文件夹同时安装到两个目录
- 文件内容在 Dockerfile 中按原相对路径还原，不解析、不改写 `SKILL.md`。

## 生成接入

- `config.claudeMcpServers`：Claude MCP 配置
- `config.codexMcpServers`：Codex MCP 配置
- `config.skills`：导入且校验通过的 Skill 文件夹列表
- `config.installClaudeSkills` / `config.installCodexSkills`：按已选工具控制还原目标目录
- 未选择对应工具时，不生成对应 Skills 目录
- CNB OSS 默认持久化路径保持：
  - `/root/.ssh`
  - `/root/.claude`
  - `/root/.codex`
  - `/root/.cc-switch`
- 不引入旧的 agents 目录持久化方案

## 验证清单

- Claude Code 与 Codex 都可编辑 `name + JSON` 形式的 MCP。
- exa 预设直接展示 `https://mcp.exa.ai/mcp?exaApiKey=[YOUR_API_KEY]` 占位符。
- Skills 仅表现为文件夹导入，不出现 marketplace 条目、手填 `id/name/description/sourceUrl/installMode` 或 URL 安装入口。
- Claude Skills 路径为 `/root/.claude/skills/<skill-folder>/`。
- Codex Skills 路径为 `/root/.codex/skills/<skill-folder>/`。
- 工作区和正式文档中不再使用旧的 agents 路径描述 Skills。

## 参考

- Claude Code Skills: <https://code.claude.com/docs/en/skills>
- Codex MCP: <https://developers.openai.com/codex/mcp>
