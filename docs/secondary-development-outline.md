# Vibe Space 二次开发总纲

本文是二次开发的总入口，负责说明目标、阶段、依赖关系和统一验收口径。专题实现细节分别维护在：

- [AI 工具与 Codex 配置区计划](ai-tools-codex-plan.md)
- [MCP 与 Skills 功能计划](mcp-skills-plan.md)
- [语言运行时管理计划](language-runtime-management-plan.md)

## 总体目标

- 扩展 Vibe Space 的 AI 工具能力，首期新增 Codex CLI，并为 Codex 提供独立配置区。
- 调整旧的 Claude Code 配置体验，删除 ZCF 预设工作流入口，保留输出样式。
- 增加 MCP / Skills 选择能力，支持默认源、自定义源、JSON 文件导入导出、实时抓取和手动 JSON 导入兜底。
- 升级语言运行时安装策略：Node/npm 改用 nvm，Python 改用 uv。
- 保持项目无构建链、纯静态页面、Alpine.js 状态管理和生成器纯函数模式。

## 阶段划分

### 阶段 1：语言运行时基础改造

**状态：已完成。** 记录提交：`a82f558 feat: 使用 nvm 和 uv 管理语言运行时`。

- 将 Node/npm 从 NodeSource 改为 nvm 管理。
- 将 Python 从 apt / deadsnakes / pip / venv 改为 uv 管理。
- 先完成该阶段，是因为 Codex、Claude Code、MCP 和 Skills 安装都依赖稳定的 Node/npm 环境。
- 详细计划见 [语言运行时管理计划](language-runtime-management-plan.md)。

### 阶段 2：Codex CLI 与 AI 工具区调整

- 新增 Codex CLI 工具项。
- 删除 ZCF 预设工作流区块。
- 为 Codex 新增全局 `AGENTS.md`、MCP、Skills 配置生成入口。
- 提取 AI npm 工具安装逻辑，为后续 Gemini CLI / OpenCode 留出扩展位置。
- 详细计划见 [AI 工具与 Codex 配置区计划](ai-tools-codex-plan.md)。

### 阶段 3：MCP / Skills 功能区

- 删除原“预设工作流”区块后，在该区域提供 MCP / Skills 选择能力。
- 支持默认源、自定义源、JSON 文件导入导出。
- 支持默认源实时抓取，失败时降级为外链浏览和手动 JSON 导入。
- 将选中的 MCP / Skills 数据接入 Codex 生成逻辑。
- 详细计划见 [MCP 与 Skills 功能计划](mcp-skills-plan.md)。

### 阶段 4：统一验证与样例同步

- 浏览器验证 UI 交互和实时预览。
- 验证 local / CNB 两种输出文件集合。
- 按需要更新 `build-test/` 参考输出。
- 执行 Compose 配置检查，必要时执行 Docker build。

## 全局实现约束

- 保持无构建步骤，不引入 npm bundler 或后端服务。
- 生成器继续保持纯函数形态：接收 `config`，返回字符串。
- 新增远程 URL 优先集中放入 `js/data/urls.js` 或新的数据文件中。
- 新增默认选项、市场源和工具定义优先放入 `js/data/`。
- UI 状态新增后必须同步检查：
  - `appState()` 默认状态。
  - `init()` watcher。
  - `applyPreset()`。
  - `getConfig()`。
  - 对应生成器。
- 不提交真实 API Key、Token、SSH key 或私人地址。
- 不执行 git commit / push / reset，除非用户明确要求。

## 依赖关系

- nvm 改造先于 Codex CLI 安装，否则 AI 工具依赖的 npm 路径会不稳定。
- uv 改造可独立实施，但应与 Dockerfile 基础层清理一起完成，避免保留 deadsnakes / pip 旧逻辑。
- MCP / Skills 功能区可以先做 UI 和 JSON 数据层，再接入 Codex 生成器。
- Codex MCP / Skills 生成依赖 MCP / Skills 条目结构确定。

## 统一验收标准

- 页面可以直接通过 `index.html` 或本地 HTTP 服务打开。
- 6 步向导能正常切换，新增配置区不会破坏现有步骤。
- 配置变化后输出预览实时刷新。
- 切换 `local` 和 `cnb` 平台时输出 tab 始终有效。
- ZIP 下载文件集合符合平台预期：
  - `local`：`Dockerfile`、`entrypoint.sh`、`docker-compose.yml`、`deploy.sh`，启用 `.env` 时包含 `.env`。
  - `cnb`：`Dockerfile`、`entrypoint.sh`、`.cnb.yml`。
- Dockerfile 不再包含被替换的旧语言安装路径：
  - NodeSource。
  - deadsnakes。
  - `get-pip.py`。
  - `python3-venv`。
- Codex 相关输出只在选择 Codex 后出现。

## 验证命令

任务完成后告知用户
由用户执行！！！！

```bash
docker compose -f "build-test/docker-compose.yml" config --quiet
```

如同步更新 `build-test/Dockerfile`，再执行：

```bash
docker build -f "build-test/Dockerfile" "build-test"
```

## 后续扩展

- Gemini CLI、OpenCode 可复用 AI npm 工具安装抽象。
- 更多部署平台可以在当前 `deployPlatform` 分支模式下扩展。
- MCP / Skills 源如果出现稳定公开 API，可从最佳努力抓取升级为正式目录同步。
