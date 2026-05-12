# 语言运行时管理计划

本文聚焦编程语言步骤中的 Node/npm 与 Python 安装策略改造。整体路线见 [二次开发总纲](secondary-development-outline.md)，AI 工具接入见 [AI 工具与 Codex 配置区计划](ai-tools-codex-plan.md)。

## 实施状态

- 状态：已完成。
- 完成提交：`a82f558 feat: 使用 nvm 和 uv 管理语言运行时`。
- 主要改动：
  - `js/generators/dockerfile.js` 改为通过 nvm 安装 Node/npm，通过 uv 安装 Python。
  - `js/data/defaults.js` 更新 Node/Python 安装说明、默认版本和版本列表。
  - `js/data/urls.js` 集中维护 nvm 与 uv 安装脚本 URL。
  - `js/app.js` 与 `index.html` 移除 `pythonVenv` 状态和 Python venv 勾选项。
  - `build-test/Dockerfile` 同步参考输出。
- 已验证：
  - `git diff --check`
  - `node --check js/data/urls.js`
  - `node --check js/data/defaults.js`
  - `node --check js/app.js`
  - `node --check js/generators/dockerfile.js`
  - 生成器场景：Node 24、AI-only Node 22、Python 3.12、Python 3.13。
  - `docker compose -f "build-test/docker-compose.yml" config --quiet`
- 未完成验证：
  - `docker build -f "build-test/Dockerfile" "build-test"` 已尝试，但 apt 下载依赖体积较大且上游出现 `502 Bad Gateway`，已中止，需后续在网络稳定时重跑。
  - Playwright 浏览器冒烟因当前环境缺少 Chrome 未执行。

## 目标

- Node/npm 改用 nvm 管理，不再使用 NodeSource 安装脚本。
- Python 改用 uv 管理，不再使用 deadsnakes、`get-pip.py`、`python3-pip`、`python3-venv`。
- AI 工具隐式依赖 Node/npm 时，使用稳定默认版本。
- 保持 Dockerfile 输出清晰，减少重复安装路径和版本分歧。

## Node/npm 策略

- 安装 nvm 到 `/root/.nvm`。
- Dockerfile 中设置：
  - `NVM_DIR=/root/.nvm`
  - 当前 Node 版本 bin 路径加入 `PATH`
- 用户显式选择 Node.js 语言时：
  - 使用 nvm 安装用户选择的 Node 版本。
  - 版本列表保留 `24`、`22`、`20`。
- 仅 AI 工具需要 Node/npm，用户未选择 Node.js 语言时：
  - 默认安装 **Node 22 LTS**。
- npm 由 nvm 安装的 Node 提供。
- 中国区继续配置 npm registry 为 `https://registry.npmmirror.com`。

## Node 生成行为

- 删除现有 NodeSource 逻辑：
  - 不再生成 `curl -fsSL https://deb.nodesource.com/setup_*.x | bash -`。
  - 不再通过 apt 安装 `nodejs`。
- nvm 安装示例行为：

```bash
export NVM_DIR="/root/.nvm"
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
. "$NVM_DIR/nvm.sh"
nvm install 22
nvm alias default 22
nvm use default
```

- Dockerfile 中需要保证后续非交互 RUN 层可以直接使用：
  - `node`
  - `npm`
  - `npx`
- 全局 npm 包仍在 npm 工具层安装：
  - 用户选择 Node.js 语言时安装 `typescript`、`ts-node`。
  - AI 工具安装层使用同一个 npm。

## Python/uv 策略

- 选择 Python 时安装 uv。
- 由 uv 安装 Python 解释器。
- 用户未选择 Python 版本时默认安装 **Python 3.12**。
- 用户选择版本时安装对应版本。
- 版本列表调整为：
  - `3.14`
  - `3.13`
  - `3.12`
  - `3.11`
  - `3.10`
- 移除 `system` 版本选项。
- 移除 Python 卡片里的 `python3-venv` 勾选项。

## Python 生成行为

- 删除现有 Python 旧逻辑：
  - 不再通过 apt 安装 `python3`、`python3-pip`。
  - 不再使用 deadsnakes PPA。
  - 不再执行 `get-pip.py`。
  - 不再安装 `python*-venv`。
  - 不再生成 `pip3 config set global.index-url ...`。
- uv 安装示例行为：

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
uv python install 3.12 --default
```

- Dockerfile 中需要保证后续层可以直接使用：
  - `uv`
  - `python`
  - `python3`
- 中国区优先配置 uv / pip 相关索引到现有清华 PyPI 镜像。

## UI 与状态调整

- `DEFAULTS.languages` 中 Node.js 描述改为 nvm 安装。
- `DEFAULTS.languages` 中 Python 描述改为 uv 安装。
- Python 默认版本从 `system` 改为 `3.12`。
- 移除或废弃 `pythonVenv`：
  - UI 不再显示该选项。
  - watcher 和 `getConfig()` 不再需要把它作为生成 Python venv 的依据。
- `needsNodejs()` 继续用于判断 AI 工具隐式 Node 依赖。
- 新增辅助逻辑区分：
  - 用户显式选择 Node.js。
  - AI 工具隐式需要 Node.js。

## 公共接口变化

- 编程语言步骤中，Node.js 说明从 NodeSource 改为 nvm。
- 编程语言步骤中，Python 说明从 apt / deadsnakes 改为 uv。
- Python 版本不再提供 `system`。
- Python 不再提供 `python3-venv` 勾选项。
- Dockerfile 输出不再包含旧安装方式。

## 验证清单

- 只选择 Node.js 22：
  - Dockerfile 使用 nvm 安装 Node 22。
  - 输出中不包含 NodeSource。
- 只选择 Codex 或 Claude Code，不选择 Node.js：
  - Dockerfile 仍通过 nvm 安装 Node 22 LTS。
  - AI npm 工具安装可使用 npm。
- 选择 Node.js 24：
  - Dockerfile 使用 nvm 安装 Node 24。
  - `typescript`、`ts-node` 仍安装。
- 选择 Python，不改版本：
  - Dockerfile 安装 uv。
  - Dockerfile 执行 `uv python install 3.12 --default`。
- 选择 Python 3.13 或 3.14：
  - Dockerfile 执行对应版本的 uv 安装命令。
- Dockerfile 不再出现：
  - `deb.nodesource.com`
  - `add-apt-repository -y ppa:deadsnakes/ppa`
  - `get-pip.py`
  - `python3-venv`
  - `pip3 config set global.index-url`

## 假设

- AI 工具隐式 Node 版本固定为 Node 22 LTS。
- Python 默认版本固定为 3.12。
- 本期不实现 Python 项目模板或自动创建虚拟环境；uv 只负责解释器和工具链基础能力。
- uv 和 nvm 安装脚本 URL 应集中维护在 `js/data/urls.js`。

## 参考

- nvm: <https://github.com/nvm-sh/nvm>
- uv installation: <https://docs.astral.sh/uv/getting-started/installation/>
- uv Python versions: <https://docs.astral.sh/uv/concepts/python-versions/>
