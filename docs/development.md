# 开发文档

本文面向 Vibe Space 的维护者、贡献者，以及使用 AI 助手修改项目的开发者。`README.md` 主要说明项目能力、使用方式和部署方式；本文聚焦本地开发、代码结构、模块职责、扩展流程、验证清单和维护规范。

## 项目定位

Vibe Space 是一个无构建步骤的静态 Web 应用。页面通过 Alpine.js 管理配置向导状态，根据用户选择生成容器化开发环境所需文件，例如 `Dockerfile`、`docker-compose.yml`、`entrypoint.sh`、`.cnb.yml`、`.env` 和部署脚本。

项目没有后端服务，也没有 npm 构建链。核心逻辑由浏览器直接加载 `index.html`、`css/style.css` 和 `js/` 下的脚本完成。

## 本地开发

### 直接打开页面

最简单的预览方式是直接用浏览器打开项目根目录的 `index.html`。

这种方式适合快速检查 UI、配置项和生成结果。如果浏览器或系统策略限制本地文件访问，可以改用本地 HTTP 服务。

### 使用本地 HTTP 服务

在项目根目录执行：

```bash
python3 -m http.server 8000
```

然后访问：

```text
http://localhost:8000
```

### 依赖说明

项目依赖以下前端库，均通过 CDN 在 `index.html` 中加载，不需要执行 `npm install`：

- Alpine.js：管理响应式状态和交互。
- Tailwind CSS：提供页面基础样式能力。
- Prism.js：为生成结果提供语法高亮。
- JSZip：在浏览器中打包下载 ZIP 文件。

CDN 地址在 `index.html` 中直接引用，同时在 `js/data/urls.js` 的 `URLS.cdn` 中保留注册信息。修改依赖版本时，需要同步确认这两处信息是否一致。

## 核心数据流

项目的主流程从 `index.html` 启动：

1. `index.html` 加载 CDN 依赖、数据常量、生成器、工具函数和 `js/app.js`。
2. 页面根节点使用 `x-data="appState()"` 创建 Alpine.js 状态对象，并通过 `x-init="init()"` 初始化。
3. `js/app.js` 中的 `appState()` 管理当前步骤、表单配置、预设应用、输出内容和下载行为。
4. `init()` 调用默认预设，并监听关键字段变化。配置变化后自动调用 `generate()`。
5. `getConfig()` 将 UI 状态统一组装为生成器需要的配置对象。
6. `generate()` 根据当前配置调用各生成器，更新输出预览，并通过 `highlightAll()` 刷新 Prism 高亮。
7. `downloadAllZip()` 根据部署平台打包不同文件：
   - `local`：包含 `Dockerfile`、`entrypoint.sh`、`docker-compose.yml`、`deploy.sh`，启用 `.env` 时额外包含 `.env`。
   - `cnb`：包含 `Dockerfile`、`entrypoint.sh`、`.cnb.yml`。

## 目录职责

### 根目录

- `index.html`：主页面和 6 步配置向导 UI。
- `css/style.css`：项目自定义样式。
- `README.md`：面向使用者的功能介绍、快速开始和部署说明。
- `AGENTS.md`、`CLAUDE.md`：AI 助手协作相关说明。

### `js/data/`

- `js/data/urls.js`：远程地址、镜像地址、下载地址和 CDN 地址注册表。远程 URL 应优先集中维护在这里，避免散落在生成器中。
- `js/data/defaults.js`：语言、AI 工具、MCP 预设、输出样式、Code-Server 扩展和预设配置。

### `js/generators/`

该目录包含输出文件生成器。生成器应保持纯函数形态：接收 `config`，返回字符串，不直接读写 DOM，不触发下载，也不修改全局状态。

- `dockerfile.js`：生成 `Dockerfile`。
- `compose.js`：生成 `docker-compose.yml`。
- `entrypoint.js`：生成 `entrypoint.sh`。
- `deploy.js`：生成本地部署脚本 `deploy.sh`。
- `cnb.js`：生成 CNB 平台配置 `.cnb.yml`。
- `envFile.js`：生成可选 `.env` 文件。

### `js/utils/`

- `js/utils/download.js`：单文件下载和 ZIP 打包下载。
- `js/utils/highlight.js`：Prism 语法高亮刷新工具。

### `build-test/`

`build-test/` 存放参考输出，用于验证生成结果是否能通过 Docker 构建和 Compose 配置检查。

- `build-test/Dockerfile`：参考 Dockerfile。
- `build-test/docker-compose.yml`：参考 Compose 配置。
- `build-test/entrypoint.sh`：参考启动脚本。
- `build-test/About.md`：测试环境说明文件。

当生成逻辑发生用户可见变化时，需要判断是否同步更新 `build-test/` 下的参考文件。

## 生成器约定

### 纯函数

所有生成器保持以下形式：

```js
function generateX(config) {
  return '...';
}
```

生成器只负责把配置转换为文本输出。不要在生成器中直接操作页面、访问表单、写文件、触发下载或刷新高亮。

### 配置入口

新增 UI 配置项时，通常需要同步检查以下位置：

1. `js/app.js` 中 `appState()` 的默认状态。
2. `init()` 中的监听字段列表，确保配置变化后能实时重新生成。
3. `getConfig()` 的输出字段，确保生成器能拿到新配置。
4. `index.html` 中对应 UI 控件和绑定。
5. 相关 `js/generators/` 文件。
6. `downloadAllZip()` 或 `js/utils/download.js`，如果新增输出文件或改变打包规则。
7. `build-test/`，如果生成结果的参考样例需要同步更新。

### 常量与远程地址

- 语言、工具、预设、选项列表优先放入 `js/data/defaults.js`。
- 下载地址、镜像地址、GitHub raw 地址、CDN 地址优先放入 `js/data/urls.js`。
- 生成器中可以组合 URL，但不应随意硬编码新的远程地址。

### 输出文件

修改输出格式时，需要同时考虑：

- 页面预览是否正确更新。
- ZIP 下载是否包含正确文件。
- 本地 Docker 场景是否仍能启动。
- CNB 场景是否仍生成正确 `.cnb.yml`。
- `build-test/` 是否需要更新。

## 常见扩展指南

### 新增编程语言

1. 在 `js/data/defaults.js` 的 `DEFAULTS.languages` 中新增语言定义，包括 `id`、`label`、`icon`、版本信息、安装说明和 apt 依赖；如果是随语言安装的构建工具版本，优先挂到对应语言的 `extraVersions`。
2. 如果语言有特殊安装流程，在 `js/generators/dockerfile.js` 中补充对应安装逻辑。
3. 如果语言需要额外启动时配置，在 `js/generators/entrypoint.js` 中补充。
4. 检查 `index.html` 中语言选择 UI 是否能自动展示该语言。
5. 在浏览器中选择新语言，确认输出预览实时更新。
6. 如果生成的 Dockerfile 参考样例应包含该语言，同步更新 `build-test/` 并执行验证命令。

### 新增 AI 工具

1. 在 `js/data/defaults.js` 的 `DEFAULTS.aiTools` 中新增工具定义。
2. 如果工具通过 npm 安装，确认 `npmPkg`、版本字段和 Node.js 依赖行为。
3. 如果工具通过脚本或二进制安装，优先把下载地址放入 `js/data/urls.js`。
4. 在 `js/generators/dockerfile.js` 中补充安装逻辑。
5. 如果工具需要启动时配置、配置文件或环境变量，在 `js/generators/entrypoint.js` 中补充。
6. 如有工具依赖关系，使用现有 `requiresTool` 模式，避免 UI 中出现无效组合。
7. 浏览器中选择该工具，确认 Dockerfile、entrypoint 和下载 ZIP 内容符合预期。

### 新增 MCP 预设

1. 在 `js/data/defaults.js` 的 `DEFAULTS.mcpPresets` 中新增预设。
2. 保持 `json` 字段为可被 `JSON.parse()` 解析的字符串。
3. 不要在预设中写入真实 API Key、Token 或私人地址。
4. 在浏览器中切换该预设，确认 MCP JSON 校验状态正常。
5. 选择 Claude Code 后生成输出，确认 entrypoint 中 MCP 配置符合预期。

### 新增部署平台或输出文件

1. 在 `js/app.js` 中为 `deployPlatform` 增加平台值和默认行为。
2. 在 `index.html` 的部署平台选择控件中增加选项。
3. 新增或复用 `js/generators/` 下的生成器函数。
4. 在 `generate()` 中按平台调用对应生成器。
5. 在输出预览区域增加对应 tab 或展示逻辑。
6. 在 `downloadAllZip()` 中定义该平台需要打包的文件。
7. 如平台需要参考样例，补充或更新 `build-test/`。

### 更新 `build-test/` 的时机

以下情况通常需要更新 `build-test/`：

- Dockerfile 生成逻辑发生变化。
- entrypoint 行为、环境变量、启动顺序或权限处理发生变化。
- docker-compose.yml 端口、卷、环境变量或服务定义发生变化。
- 新增默认启用的语言、工具、MCP 预设或输出文件。
- 修复了生成输出中的语法或行为问题，需要参考样例覆盖。

如果只是修改页面文案、样式或开发文档，通常不需要更新 `build-test/`。

## 验证清单

### 文档或样式变更

- 浏览器打开 `index.html` 或访问 `http://localhost:8000`。
- 确认 6 步向导可以正常切换。
- 检查页面没有明显布局错位或文案错误。

### 生成逻辑变更

- 修改关键配置后，确认输出预览实时更新。
- 切换 `local` 和 `cnb` 部署平台，确认输出文件集合正确。
- 下载 ZIP，确认文件名和内容符合当前平台预期。
- 如启用 `.env` 输出，确认 ZIP 中包含 `.env`。

### 本地 Docker 场景

验证 Compose 配置：

```bash
docker compose -f "build-test/docker-compose.yml" config --quiet
```

验证镜像构建：

```bash
docker build -f "build-test/Dockerfile" "build-test"
```

可选执行 Dockerfile lint：

```bash
docker run --rm -i hadolint/hadolint < "build-test/Dockerfile"
```

## 维护规范

- JavaScript 使用 2 空格缩进、单引号和分号。
- 保持现有无构建风格，不引入 npm、打包器或框架迁移，除非有明确需求。
- 注释语言与所在文件保持一致，面向用户的页面文案和说明优先使用中文。
- 遵循 KISS 和 YAGNI：只实现当前明确需要的功能，不提前堆叠复杂抽象。
- 遵循 DRY：重复的常量、URL、选项和预设应收敛到 `js/data/`。
- 生成器保持单一职责：只根据 `config` 生成字符串。
- 不提交真实 API Key、SSH 私钥、Cloudflare Tunnel Token、`.env` secrets 或其他敏感信息。
- 示例中使用占位符，避免把个人配置写入仓库。
- 不主动执行 `git commit`、`git push`、分支切换、分支删除等 Git 操作，除非维护者明确要求。
- 生成输出发生变化时，同步评估 `build-test/` 是否需要更新。

## 修改前检查

开始修改前，建议先阅读：

1. `README.md`：理解用户侧功能和部署路径。
2. `index.html`：确认 UI 控件、步骤和输出预览结构。
3. `js/app.js`：理解状态、监听、配置收集和生成调度。
4. `js/data/defaults.js`、`js/data/urls.js`：确认常量和远程地址来源。
5. 目标生成器文件：确认输出字符串的现有组织方式。

先读后改可以减少误改 UI 状态、生成配置和参考输出之间的联动关系。
