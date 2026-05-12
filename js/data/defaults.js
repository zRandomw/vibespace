/** defaults.js — 全局配置常量 */

const DEFAULTS = {
  /* 基础镜像 — 固定使用 Ubuntu 24.04 LTS */
  baseImage: 'ubuntu:24.04',

  /* code-server 扩展 (checked: 预设默认选中) */
  codeServerExtensions: [
    { id: 'MS-CEINTL.vscode-language-pack-zh-hans', label: '中文语言包', checked: true },
    { id: 'GitHub.github-vscode-theme', label: 'GitHub 主题', checked: true },
    { id: 'DavidAnson.vscode-markdownlint', label: 'Markdown Lint', checked: true },
    { id: 'golang.go', label: 'Go', checked: false },
    { id: 'streetsidesoftware.code-spell-checker', label: '拼写检查', checked: false },
    { id: 'ms-python.python', label: 'Python', checked: false },
    { id: 'g2developer.browser-in-vscode', label: '内置浏览器', checked: true },
    { id: 'FittenTech.Fitten-Code', label: 'Fitten Code', checked: false },
    { id: 'saltcoreyan.json-format-sortcore', label: 'JSON 格式化', checked: true },
    { id: 'redhat.vscode-yaml', label: 'YAML 支持', checked: true },
    { id: 'RooVeterinaryInc.roo-cline', label: 'Roo Cline', checked: false },
    { id: 'Anthropic.claude-code', label: 'Claude Code', checked: false },
    { id: 'eamodio.gitlens', label: 'GitLens', checked: false },
    { id: 'aminer.codegeex', label: 'CodeGeeX智谱代码补全', checked: false },
    { id: 'MarsCode.marscode-extension', label: 'Trae代码补全', checked: false },
  ],

  /* 编程语言 — aptPkgs: 通过 apt 安装; devTools: 额外开发工具
   *   hasVersion: 是否支持版本选择
   *   versions: 可选版本列表
   *   installNote: 安装方式说明，提示用户确认版本可用性
   */
  languages: [
    {
      id: 'go', label: 'Go', icon: '🐹',
      hasVersion: true, defaultVersion: '1.23.6',
      versions: ['1.24.1', '1.23.6', '1.22.12'],
      installNote: '通过官方二进制包安装，版本号需与 go.dev/dl 一致',
      aptPkgs: [],
      devTools: [
        { cmd: 'go install -v golang.org/x/tools/gopls@latest', label: 'gopls' },
        { cmd: 'go install -v github.com/go-delve/delve/cmd/dlv@latest', label: 'dlv' },
        { cmd: 'go install -v honnef.co/go/tools/cmd/staticcheck@latest', label: 'staticcheck' },
      ],
    },
    {
      id: 'c', label: 'C', icon: '🔧',
      hasVersion: true, defaultVersion: 'system',
      versions: ['system', '14', '13', '12'],
      installNote: 'system 使用系统默认 gcc；指定版本通过 apt 安装 gcc-{version}，需确认源中包含对应版本',
      aptPkgs: ['make', 'build-essential'], devTools: [],
    },
    {
      id: 'cpp', label: 'C++', icon: '⚙️',
      hasVersion: true, defaultVersion: 'system',
      versions: ['system', '14', '13', '12'],
      installNote: 'system 使用系统默认 g++；指定版本通过 apt 安装 g++-{version}，需确认源中包含对应版本',
      aptPkgs: ['make', 'build-essential', 'cmake'], devTools: [],
    },
    {
      id: 'java', label: 'Java', icon: '☕',
      hasVersion: true, defaultVersion: '21',
      versions: ['21', '17', '11', '8'],
      installNote: '通过 apt 安装 OpenJDK，请确认基础镜像源中包含对应版本',
      aptPkgs: [], devTools: [],
    },
    {
      id: 'nodejs', label: 'Node.js / Ts / npm', icon: '🟢',
      hasVersion: true, defaultVersion: '24',
      versions: ['24', '22', '20'],
      installNote: '通过 nvm 安装，版本号为 Node.js 大版本号',
      aptPkgs: [], isNodejs: true, devTools: [],
    },
    {
      id: 'python', label: 'Python', icon: '🐍',
      hasVersion: true, defaultVersion: '3.12',
      versions: ['3.14', '3.13', '3.12', '3.11', '3.10'],
      installNote: '通过 uv 安装和管理 Python 解释器',
      aptPkgs: [], devTools: [],
    },
    { id: 'rust', label: 'Rust', icon: '🦀', hasVersion: false, installNote: '通过 rustup 安装最新稳定版', aptPkgs: [], devTools: [] },
  ],

  /* AI 工具 — npmPkg: npm 包名; isScript: 脚本安装; requiresTool: 依赖其他工具 */
  aiTools: [
    { id: 'cc-switch', label: 'CC-Switch', desc: 'ClaudeCode/Codex 提供商 MCP Skils管理工具', hasVersion: false, isScript: true },
    { id: 'claude-code', label: 'Claude Code', desc: 'Anthropic CLI 开发工具', hasVersion: true, defaultVersion: 'latest', npmPkg: '@anthropic-ai/claude-code', hasMcp: true },
    { id: 'codex', label: 'Codex CLI', desc: 'OpenAI Codex 命令行开发工具', hasVersion: true, defaultVersion: 'latest', npmPkg: '@openai/codex' },
    { id: 'ccline', label: 'CCLine', desc: 'Claude Code 状态行工具', hasVersion: false, npmPkg: '@cometix/ccline', requiresTool: 'claude-code' },
    { id: 'claude-code-router', label: 'Claude Code Router', desc: '将Gemini/Openai格式转换为anthropic格式', hasVersion: false, npmPkg: '@musistudio/claude-code-router', requiresTool: 'claude-code' },
  ],

  /* 中国镜像源 */
  chinaMirrors: {
    dns: URLS.mirrors.dns,
    aptScript: `curl -sSL ${URLS.mirrors.aptScript} | bash -s -- --source mirrors.pku.edu.cn --protocol http --use-intranet-source false --backup false --upgrade-software false --clean-cache false --ignore-backup-tips`,
    npm: URLS.mirrors.npmRegistry,
    pip: URLS.mirrors.pipIndex,
    goProxy: URLS.mirrors.goProxy,
    ghProxy: URLS.mirrors.ghProxy,
  },

  /* 工具下载地址 — url: 官方源, mirrorUrl: gh-proxy 镜像 */
  cloudflared: {
    url: URLS.tools.cloudflared.url,
    mirrorUrl: URLS.withGhProxy(URLS.tools.cloudflared.url),
  },
  ccSwitch: {
    url: URLS.tools.ccSwitch.url,
    mirrorUrl: URLS.withGhProxy(URLS.tools.ccSwitch.url),
  },
  frpc: {
    url: URLS.tools.frpc.url,
    mirrorUrl: URLS.withGhProxy(URLS.tools.frpc.url),
  },

  /* MCP Server 预设 */
  mcpPresets: [
    {
      id: 'context7',
      label: 'Context7',
      desc: '自动获取最新文档上下文',
      name: 'context7',
      json: '{"command":"npx","args":["-y","@upstash/context7-mcp@latest"]}',
    },
    {
      id: 'mcp-deepwiki',
      label: 'DeepWiki',
      desc: '查询开源项目 Wiki 知识库',
      name: 'mcp-deepwiki',
      json: '{"command":"npx","args":["-y","mcp-deepwiki@latest"]}',
    },
    {
      id: 'filesystem',
      label: 'Filesystem',
      desc: '安全的读取文件',
      name: 'filesystem',
      json: '{"command":"npx","args":["-y","@modelcontextprotocol/server-filesystem"]}',
    },
    {
      id: 'exa',
      label: 'exa',
      desc: '高效的AI搜索服务，需要提供APIKEY',
      name: 'exa',
      json: '{"type":"http","url":"https://mcp.exa.ai/mcp?exaApiKey=[你的APIKEY]"}',
    },
    {
      id: 'firecrawl',
      label: 'firecrawl',
      desc: '网页爬取工具，需要提供APIKEY',
      name: 'firecrawl',
      json: '{"type":"http","url":"https://mcp.firecrawl.dev/[你的apikey]/v2/mcp"}',
    },
  ],

  /* Claude Code 输出样式预设
   * isCustom: 是否需要模板文件
   * - true: 需要复制模板文件到 ~/.claude/output-styles/
   * - false: 内置样式，直接设置 outputStyle 配置
   */
  claudeOutputStyles: [
    {
      id: 'default',
      label: '默认',
      desc: 'Claude Code 默认输出样式',
      isCustom: false,
    },
    {
      id: 'engineer-professional',
      label: '工程师专业版（UfoMiao/zcf）',
      desc: '遵循SOLID、KISS、DRY、YAGNI原则，专业简洁',
      isCustom: true,
    },
    {
      id: 'nekomata-engineer',
      label: '猫又工程师（UfoMiao/zcf）',
      desc: '可爱但专业的工程师风格',
      isCustom: true,
    },
    {
      id: 'laowang-engineer',
      label: '老王工程师（UfoMiao/zcf）',
      desc: '资深工程师风格，经验丰富',
      isCustom: true,
    },
    {
      id: 'ojousama-engineer',
      label: '大小姐工程师（UfoMiao/zcf）',
      desc: '优雅专业的工程师风格',
      isCustom: true,
    },
    {
      id: 'rem-engineer',
      label: '雷姆工程师（UfoMiao/zcf）',
      desc: '温柔专业的工程师风格',
      isCustom: true,
    },
    {
      id: 'leibus-engineer',
      label: '雷布斯工程师（UfoMiao/zcf）',
      desc: '极客风格的工程师',
      isCustom: true,
    },
    {
      id: 'explanatory',
      label: '解释型（Claudecode官方提供）',
      desc: '详细解释每一步操作',
      isCustom: false,
    },
    {
      id: 'learning',
      label: '学习型（Claudecode官方提供）',
      desc: '适合学习新技术的风格',
      isCustom: false,
    },
  ],

  /* Codex AGENTS.md 输出样式 */
  codexOutputStyles: [
    {
      id: 'default',
      label: '默认',
      desc: '面向容器开发环境的 Codex 默认指导',
      isCustom: false,
      agentsText: `# Codex 工作区指南

你是运行在 Vibe Space 容器中的 Codex CLI。请优先遵循当前用户项目中的 AGENTS.md、README 和开发文档。

## 工作原则

- 先阅读相关文件，再修改代码。
- 保持改动聚焦，避免无关重构。
- 不主动执行 git commit、git push、git reset 或分支操作，除非用户明确要求。
- 不写入真实 API Key、Token、SSH 私钥或其他敏感信息。
- 生成器、脚本和配置改动完成后，给出可复现的验证步骤。

## 项目约定

- 纯静态项目保持无构建链风格。
- JavaScript 使用 2 空格缩进、单引号和分号。
- 注释语言与所在文件保持一致。
- 新增远程地址优先集中到 js/data/urls.js。
- 生成器保持纯函数形态：接收 config，返回字符串。`,
    },
    {
      id: 'engineer-professional',
      label: '工程师专业版（UfoMiao/zcf）',
      desc: '遵循SOLID、KISS、DRY、YAGNI原则，专业简洁',
      isCustom: true,
    },
    {
      id: 'nekomata-engineer',
      label: '猫又工程师（UfoMiao/zcf）',
      desc: '可爱但专业的工程师风格',
      isCustom: true,
    },
    {
      id: 'laowang-engineer',
      label: '老王工程师（UfoMiao/zcf）',
      desc: '资深工程师风格，经验丰富',
      isCustom: true,
    },
    {
      id: 'ojousama-engineer',
      label: '大小姐工程师（UfoMiao/zcf）',
      desc: '优雅专业的工程师风格',
      isCustom: true,
    },
    {
      id: 'rem-engineer',
      label: '雷姆工程师（UfoMiao/zcf）',
      desc: '温柔专业的工程师风格',
      isCustom: true,
    },
    {
      id: 'leibus-engineer',
      label: '雷布斯工程师（UfoMiao/zcf）',
      desc: '极客风格的工程师',
      isCustom: true,
    },
    {
      id: 'explanatory',
      label: '解释型（Claudecode官方提供）',
      desc: '详细解释每一步操作',
      isCustom: false,
      agentsText: `# Codex 解释型输出样式

你是运行在 Vibe Space 容器中的 Codex CLI。请用解释型风格协助开发。

## 输出要求

- 在执行关键操作前简要说明目的。
- 修改代码后说明变更原因、影响范围和验证方式。
- 遇到失败时说明失败原因、已验证的事实和下一步建议。
- 保持说明聚焦当前任务，不展开无关背景。

## 工作约束

- 优先遵循用户项目中的 AGENTS.md、README 和开发文档。
- 不主动执行 git commit、git push、git reset 或分支操作，除非用户明确要求。
- 不写入真实 API Key、Token、SSH 私钥或其他敏感信息。`,
    },
    {
      id: 'learning',
      label: '学习型（Claudecode官方提供）',
      desc: '适合学习新技术的风格',
      isCustom: false,
      agentsText: `# Codex 学习型输出样式

你是运行在 Vibe Space 容器中的 Codex CLI。请用适合学习的方式协助开发。

## 输出要求

- 在给出方案时点明关键概念和选择理由。
- 对非显而易见的代码改动补充简短解释。
- 给出验证步骤时说明每一步验证了什么。
- 保持内容简洁，避免把简单任务讲复杂。

## 工作约束

- 优先遵循用户项目中的 AGENTS.md、README 和开发文档。
- 不主动执行 git commit、git push、git reset 或分支操作，除非用户明确要求。
- 不写入真实 API Key、Token、SSH 私钥或其他敏感信息。`,
    },
    {
      id: 'custom',
      label: '自定义',
      desc: '原样写入 /root/.codex/AGENTS.md',
      isCustom: false,
      isUserCustom: true,
      agentsText: '',
    },
  ],

  vibeDefaultCommand: 'IS_SANDBOX=1 claude --dangerously-skip-permissions',

  /* 预设模板 — 每个预设是一份完整的配置快照 */
  presets: {
    default: {
      label: '默认', desc: 'Node.js + Claude Code',
      region: 'international',
      codeServer: true,
      extensions: ['MS-CEINTL.vscode-language-pack-zh-hans', 'GitHub.github-vscode-theme', 'DavidAnson.vscode-markdownlint', 'g2developer.browser-in-vscode', 'saltcoreyan.json-format-sortcore', 'redhat.vscode-yaml', 'Anthropic.claude-code'],
      customExtensions: '',
      languages: ['nodejs'], languageVersions: { nodejs: '24' },
      aiTools: ['cc-switch', 'claude-code'], aiToolVersions: {},
      claudeOutputStyle: 'default',
      codexOutputStyle: 'default',
      codexCustomAgentsText: '',
      cfTunnel: false, cfToken: '', frpcEnabled: false, frpcConfigUrl: '', cnbProjectName: '', volumeMode: 'named',
      vibeCommand: true, vibeCommandText: 'IS_SANDBOX=1 claude --dangerously-skip-permissions',
      customDockerfile: '',
    },
  },
};
