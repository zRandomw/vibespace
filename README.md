# 🚀 Vibe Space

**Vibe Space** — 通过可视化向导，根据你的开发技术栈，配置语言环境、AI 工具、MCP 与 Skills 导入，一键生成生产可用的容器化 Vibe 开发环境。当前支持 Claude Code、Codex CLI、CC-Switch、CCLine、Claude Code Router 等工具，减少手工拼 Dockerfile、AI 工具配置和容器初始化脚本的成本。

## 功能特性

- **向导配置** — 地区选择、Code-Server、编程语言、AI 工具、附加工具、自定义层，逐步引导完成配置
- **区域感知** — 自动配置国内镜像源（apt / npm / pip / Go / GitHub proxy），解决网络问题
- **多语言支持** — Go、Node.js、Python、Rust、Java/Maven、C、C++，支持版本选择与自定义版本号
- **AI 工具集成** — Claude Code、Codex CLI、CCLine、CC-Switch、Claude Code Router，支持可编辑 MCP 配置、Claude 输出样式、Codex `config.toml` / `AGENTS.md` 和共享 Skills 文件夹导入
- **双访问模式** — SSH + 浏览器端 Code-Server (VS Code)，灵活选择开发方式
- **实时预览** — 配置变更即时反映到生成结果，所见即所得
- **一键导出** — 打包下载 Dockerfile、docker-compose.yml、entrypoint.sh、deploy.sh 等部署文件，启用 Codex 配置时包含 `config.toml`，启用 `.env` 生成时包含 `.env`

## 界面预览

![地区选择与镜像源配置](assets/img/readme-preview1.png)

![AI 工具与 MCP Server 配置](assets/img/readme-preview2.png)

![输出样式与 Skills 导入](assets/img/readme-preview3.png)

## 快速开始

### 使用方法

通过以下任一方法，进入 VibeSpace DIY 页面，根据自己的需求选择语言环境、AI 工具、MCP、Skills 与部署方式，生成可直接使用的部署文件。

方法1：使用已部署的在线页面 [点击此处进入 Vibe Space DIY](https://vibespace.xyzen.de/)

方法2： [点此下载本项目压缩包](https://codeload.github.com/zRandomw/vibespace/zip/refs/heads/main) ，解压后打开 index.html 在本地浏览器中操作

方法3：

```bash
git clone https://github.com/zRandomw/vibespace.git
cd vibespace
```

然后直接打开 `index.html` 在本地浏览器中操作

### 部署到云平台（CNB）

#### CNB：
[CNB](https://cnb.cool/) 平台提供每月免费1600核时的云开发环境时长，足够每天使用8小时6核心12G内存的VibeSpace

部署方法：在CNB平台新建一个仓库，将生成的 Dockerfile、entrypoint.sh、.cnb.yml 上传到仓库根目录；如果启用了 Codex 配置，还需要同时上传 `config.toml`，然后点击云原生开发即可
![CNB部署仓库示意](assets/img/readme-doc-cnb-1.png) 
### 部署到自有机器

```bash
# 解压并执行部署脚本
unzip devbox-config.zip -d devbox && cd devbox
chmod +x deploy.sh entrypoint.sh
./deploy.sh

# 按提示编辑环境变量后启动
docker compose up -d
```

### 常用命令

```bash
docker compose up -d          # 启动容器
docker compose down           # 停止容器
docker compose logs -f        # 查看日志
docker compose up -d --build  # 重新构建并启动
docker exec -it devbox bash   # 进入容器
```

## 生成的文件说明

| 文件 | 说明 |
|------|------|
| `Dockerfile` | 多层优化的镜像构建文件，按变更频率分层以利用构建缓存 |
| `docker-compose.yml` | 容器编排配置，包含端口映射、数据持久化、环境变量 |
| `entrypoint.sh` | 容器启动脚本，运行时配置 Git、SSH、公钥、密码、FRPC、Cloudflare Tunnel、对象存储和 code-server |
| `deploy.sh` | 一键部署辅助脚本，检查环境并构建镜像 |
| `config.toml` | Codex CLI 配置文件，仅在生成了 Codex 配置时导出并复制到 `/root/.codex/config.toml` |
| `.cnb.yml` | CNB 云平台配置，仅在选择 CNB 部署时导出 |
| `.env` | 本机部署可选环境变量文件，仅在显式启用时导出 |

## 配置项详解

### 步骤 1：宿主机地区

| 选项 | 说明 |
|------|------|
| 中国大陆 | 自动配置 DNS、APT（北大镜像）、npm（npmmirror）、pip（清华）、Go（goproxy.cn）、GitHub（gh-proxy）、CodeServer镜像源下载|
| 国际 | 使用官方源 |

### 步骤 2：Code-Server

- 启用后可通过浏览器访问 VS Code（默认端口 12345）
- 常用预置扩展可选，支持自定义扩展
- 配置 SSH root 密码和 SSH 公钥，通过 SSH 连接到容器开发并使用 Git

### 步骤 3：编程语言

支持 7 种语言组合，部分可选版本：

- **Go** — 官方二进制包安装，附带 gopls / dlv / staticcheck
- **Node.js** — 通过 nvm 安装，附带 TypeScript / ts-node
- **Python** — 通过 uv 安装和管理解释器
- **Rust** — 通过rustup 安装最新稳定版
- **Java / Maven** — Java 通过 OpenJDK 安装，支持 8 / 11 / 17 / 21；Maven 支持版本选择
- **C / C++** — GCC / G++，支持指定编译器版本

### 步骤 4：AI 工具

- **CC-Switch** — Claude Code / Codex 提供商管理工具
- **Claude Code** — Anthropic CLI 开发工具，支持版本选择、遥测开关、可编辑 MCP 配置和输出样式
- **Codex CLI** — OpenAI Codex 命令行开发工具，支持版本选择、导入/编辑 `config.toml`、可编辑 MCP 配置和 `/root/.codex/AGENTS.md` 输出样式
- **Skills 导入** — Claude Code 与 Codex 共享一份 Skill 文件夹导入列表，按已选工具安装到各自目录
- **CCLine** — Claude Code 状态行工具（依赖 Claude Code）
- **Claude Code Router** — 代理转发工具，将 Gemini / OpenAI 格式转换为 Anthropic 格式

### 步骤 5：其他工具

- **Cloudflare Tunnel** — 内网穿透（通过环境变量传入 Token）
- **FRPC 内网穿透** — 通过直链下载 frpc 配置并在容器启动时拉起服务
- **Vibe 快捷命令** — 自定义 `vibe` 别名，一键进入AI工具的特权模式，在VibeSpace中无需担心AI工具损坏系统
- **数据持久化** — Docker 卷挂载 或 目录挂载

### 步骤 6：自定义层

在 AI 工具层之后、SSH 配置之前插入自定义 Dockerfile 指令（RUN / COPY / ENV 等）。

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `ROOT_PASSWORD` | SSH root 密码 | `root123` |
| `GIT_USER_NAME` | Git 用户名 | — |
| `GIT_USER_EMAIL` | Git 邮箱 | — |
| `SSH_PUBLIC_KEY` | SSH 公钥 | — |
| `CS_PASSWORD` | Code-Server 密码（不设置则免密）| — |
| `CF_TUNNEL_TOKEN` | Cloudflare Tunnel Token | — |
| `FRPC_CONFIG_URL` | FRPC 配置文件直链 | — |

## 项目结构

```
├── index.html                 # 主页面（向导 UI）
├── css/style.css              # 暗色主题样式
├── js/
│   ├── data/
│   │   ├── urls.js            # 全局远程资源 URL 注册表
│   │   ├── defaults.js        # 配置常量（语言、工具、MCP 预设、输出样式）
│   │   ├── mcpSkillsSources.js # MCP / Skills 内置来源
│   │   └── skillsManifest.js   # Skills 内置清单
│   ├── generators/
│   │   ├── compose.js         # docker-compose.yml 生成器
│   │   ├── cnb.js             # .cnb.yml 生成器
│   │   ├── codexConfig.js     # Codex config.toml 生成器
│   │   ├── deploy.js          # deploy.sh 生成器
│   │   ├── dockerfile.js      # Dockerfile 生成器
│   │   ├── entrypoint.js      # entrypoint.sh 生成器
│   │   └── envFile.js         # .env 生成器
│   ├── utils/
│   │   ├── download.js        # 文件下载 & ZIP 打包
│   │   └── highlight.js       # 语法高亮
│   └── app.js                 # Alpine.js 应用状态
└── build-test/                # CI 构建测试用的全量配置
```

## 技术栈

- [Alpine.js](https://alpinejs.dev/) — 轻量级响应式框架
- [Tailwind CSS](https://tailwindcss.com/) — 原子化 CSS
- [Prism.js](https://prismjs.com/) — 语法高亮
- [JSZip](https://stuk.github.io/jszip/) — 客户端 ZIP 生成

纯静态页面，无需构建工具，无后端依赖。

## 开发计划
- 提供更多 AI 工具，如 Gemini CLI、OpenCode 的预设配置
- 提供终端工具，在终端中使用VibeSpace
- 融入Happy等远程vibe coding工具
- 支持部署到HuggingFace，魔搭创空间并支持数据持久化
- 预设更多语法的开发工具链
- 增加前后端集成版本，彻底的一键部署
- 为本项目制作Skill，通过AI对话，快速部署

## License

MIT
