/** app.js — Alpine.js 主应用状态 */

function appState() {
  return {
    currentStep: 1,
    totalSteps: 6,
    steps: [
      { num: 1, title: '宿主机环境', icon: '🌏' },
      { num: 2, title: '基础环境配置', icon: '💻' },
      { num: 3, title: '编程语言', icon: '🛠️' },
      { num: 4, title: 'AI 工具', icon: '🤖' },
      { num: 5, title: '其他工具', icon: '🔧' },
      { num: 6, title: '自定义层', icon: '📝' },
    ],
    outputTab: 'dockerfile',

    /* 配置状态 */
    region: 'china',
    deployPlatform: 'local', // 'local' | 'cnb'
    codeServer: true,
    extensions: DEFAULTS.codeServerExtensions.filter(e => e.checked).map(e => e.id),
    customExtensions: '',
    languages: [],
    languageVersions: {},
    aiTools: [],
    aiToolVersions: {},
    claudeMcpServers: [],  // [{name: 'my-server', json: '{"type":"http","url":"..."}', jsonValid: true}]
    codexMcpServers: [],  // 与 Claude MCP 使用同一套 name + JSON 模型
    importedSkills: [], // [{folderName, valid, error, files:[{path, base64, size}]}]
    skillImportError: '',

    /* Claude Code 和 Codex 配置 */
    claudeOutputStyle: '',    // 已选中的输出样式 ID
    claudeDisableTelemetry: false, // 禁止遥测与更新
    codexOutputStyle: 'default',
    codexCustomAgentsText: '',
    gitUserName: '',
    gitUserEmail: '',
    rootPassword: '',
    csPassword: '',
    sshPrivateKey: '',
    sshPublicKey: '',
    cfTunnel: false,
    cfToken: '',
    frpcEnabled: false,
    frpcConfigUrl: '',
    vibeCommand: false,
    vibeCommandText: DEFAULTS.vibeDefaultCommand,
    volumeMode: 'named',
    generateEnvFileEnabled: false, // 是否生成 .env 文件，默认禁用
    customDockerfile: '',
    currentPreset: '',

    /* OSS 对象存储持久化配置 (仅 CNB 平台) */
    ossEnabled: true,  // 默认启用
    ossEndpoint: '',
    ossAccessKey: '',
    ossSecretKey: '',
    ossBucket: '',
    ossRegion: 'auto',
    ossProject: 'devbox',
    ossPaths: '/root/.ssh,/root/.claude,/root/.codex,/root/.agents,/root/.cc-switch,/root/.local/share/code-server/User/globalStorage,/root/.vscode-server/data/User/globalStorage',
    ossKeepCount: 5,
    ossSyncInterval: 5,

    /* 生成结果 */
    generatedDockerfile: '',
    generatedEntrypoint: '',
    generatedCompose: '',
    generatedDeploy: '',
    generatedCnbYml: '',
    generatedEnvFile: '',

    /** 初始化：加载默认预设，监听配置变更自动重新生成 */
    init() {
      this.applyPreset('default');
      const watched = [
        'region', 'deployPlatform', 'codeServer', 'extensions', 'customExtensions',
        'languages', 'languageVersions',
        'aiTools', 'aiToolVersions', 'claudeMcpServers', 'codexMcpServers', 'importedSkills',
        'claudeOutputStyle', 'claudeDisableTelemetry',
        'codexOutputStyle', 'codexCustomAgentsText',
        'gitUserName', 'gitUserEmail', 'sshPrivateKey',
        'cfTunnel', 'cfToken', 'frpcEnabled', 'frpcConfigUrl',
        'vibeCommand', 'vibeCommandText',
        'volumeMode', 'generateEnvFileEnabled', 'customDockerfile',
        'ossEnabled', 'ossEndpoint', 'ossAccessKey', 'ossSecretKey', 'ossBucket',
        'ossRegion', 'ossProject', 'ossPaths', 'ossKeepCount', 'ossSyncInterval',
      ];
      watched.forEach(key => this.$watch(key, () => this.generate()));
    },

    /* 步骤导航 */
    goToStep(step) { if (step >= 1 && step <= this.totalSteps) this.currentStep = step; },
    nextStep() { if (this.currentStep < this.totalSteps) this.currentStep++; },
    prevStep() { if (this.currentStep > 1) this.currentStep--; },

    isStepCompleted(step) {
      if (step === 1) return !!this.region;
      return true; // 步骤 2-6 无必填项
    },

    /* 多选 toggle 系列 */
    toggleLanguage(langId) {
      const idx = this.languages.indexOf(langId);
      if (idx >= 0) {
        this.languages.splice(idx, 1);
      } else {
        this.languages.push(langId);
        // 首次选中时填入默认版本
        const lang = DEFAULTS.languages.find(l => l.id === langId);
        if (lang && lang.hasVersion && !this.languageVersions[langId]) {
          this.languageVersions[langId] = lang.defaultVersion;
        }
      }
    },
    hasLanguage(langId) { return this.languages.includes(langId); },

    toggleExtension(extId) {
      const idx = this.extensions.indexOf(extId);
      idx >= 0 ? this.extensions.splice(idx, 1) : this.extensions.push(extId);
    },
    hasExtension(extId) { return this.extensions.includes(extId); },

    toggleAiTool(toolId) {
      const idx = this.aiTools.indexOf(toolId);
      if (idx >= 0) {
        this.aiTools.splice(idx, 1);
        // 取消选中 claude-code 时清空 MCP、输出样式和遥测配置
        if (toolId === 'claude-code') {
          this.claudeMcpServers = [];
          this.claudeOutputStyle = '';
          this.claudeDisableTelemetry = false;
          // 同时取消依赖 claude-code 的工具
          this.aiTools = this.aiTools.filter(id => {
            const t = DEFAULTS.aiTools.find(a => a.id === id);
            return !t || t.requiresTool !== 'claude-code';
          });
        }
        if (toolId === 'codex') {
          this.codexOutputStyle = 'default';
          this.codexCustomAgentsText = '';
          this.codexMcpServers = [];
        }
      } else {
        this.aiTools.push(toolId);
        // 首次选中 claude-code 时初始化默认输出样式
        if (toolId === 'claude-code') {
          this.claudeOutputStyle = 'default';
        }
        if (toolId === 'codex') {
          this.codexOutputStyle = 'default';
        }
      }
    },
    hasAiTool(toolId) { return this.aiTools.includes(toolId); },

    /* MCP 管理 */
    getMcpServers(toolId = 'claude-code') {
      return toolId === 'codex' ? this.codexMcpServers : this.claudeMcpServers;
    },
    addMcpServer(toolId = 'claude-code') {
      this.getMcpServers(toolId).push({ name: '', json: '', jsonValid: true });
    },
    removeMcpServer(toolId, index) {
      this.getMcpServers(toolId).splice(index, 1);
    },
    validateMcpJson(toolId, idx) {
      const mcp = this.getMcpServers(toolId)[idx];
      if (!mcp) return;
      if (!mcp.json.trim()) {
        mcp.jsonValid = true;
        return;
      }
      try {
        JSON.parse(mcp.json);
        mcp.jsonValid = true;
      } catch {
        mcp.jsonValid = false;
      }
    },
    hasMcpPreset(toolId, presetId) {
      return this.getMcpServers(toolId).some(s => s.name === presetId);
    },
    toggleMcpPreset(toolId, preset) {
      const servers = this.getMcpServers(toolId);
      const idx = servers.findIndex(s => s.name === preset.name);
      if (idx >= 0) {
        servers.splice(idx, 1);
      } else {
        servers.push({ name: preset.name, json: preset.json, jsonValid: true });
      }
    },
    hasMcpJsonError() {
      return [...this.claudeMcpServers, ...this.codexMcpServers].some(s => s.jsonValid === false);
    },

    /* Skills 文件夹导入 */
    getSkillTargetSummary() {
      const targets = [];
      if (this.hasAiTool('claude-code')) targets.push('/root/.claude/skills/<skill-folder>/');
      if (this.hasAiTool('codex')) targets.push('/root/.codex/skills/<skill-folder>/');
      return targets.length ? targets.join(' 与 ') : '未选择 Claude Code 或 Codex 时不会安装 Skills';
    },
    isSafeRelativePath(path) {
      const normalized = String(path || '').replace(/\\/g, '/');
      if (!normalized || normalized.startsWith('/') || normalized.includes('\0')) return false;
      return normalized.split('/').every(part => part && part !== '..');
    },
    async fileToBase64(file) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      let binary = '';
      const chunkSize = 0x8000;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
      }
      return btoa(binary);
    },
    getSkillGroupsFromFiles(files) {
      const entries = files.map(file => {
        const rawPath = file.webkitRelativePath || file.name;
        const path = String(rawPath).replace(/\\/g, '/');
        return { file, path, parts: path.split('/').filter(Boolean) };
      }).filter(entry => entry.parts.length > 0);

      const rootSkillEntry = entries.find(entry => entry.parts.length === 2 && entry.parts[1] === 'SKILL.md');
      if (rootSkillEntry) {
        const rootFolder = rootSkillEntry.parts[0];
        return [{
          folderName: rootFolder,
          entries: entries
            .filter(entry => entry.parts[0] === rootFolder && entry.parts.length > 1)
            .map(entry => ({ file: entry.file, relativePath: entry.parts.slice(1).join('/') })),
        }];
      }

      const grouped = new Map();
      entries.forEach(entry => {
        if (entry.parts.length < 3) return;
        const folderName = entry.parts[1];
        if (!grouped.has(folderName)) grouped.set(folderName, []);
        grouped.get(folderName).push({ file: entry.file, relativePath: entry.parts.slice(2).join('/') });
      });

      return [...grouped.entries()]
        .filter(([, groupEntries]) => groupEntries.some(entry => entry.relativePath === 'SKILL.md'))
        .map(([folderName, groupEntries]) => ({ folderName, entries: groupEntries }));
    },
    async importSkillFolders(event) {
      const files = Array.from(event.target.files || []);
      event.target.value = '';
      if (!files.length) return;

      try {
        const groups = this.getSkillGroupsFromFiles(files);
        if (!groups.length) {
          this.skillImportError = '所选目录根部或一级子目录中未找到 SKILL.md';
          return;
        }

        const imported = [];
        for (const group of groups) {
          const errors = [];
          if (!this.isSafeRelativePath(group.folderName)) {
            errors.push('文件夹名非法');
          }

          const normalizedFiles = [];
          for (const entry of group.entries) {
            if (!this.isSafeRelativePath(entry.relativePath)) {
              errors.push(`跳过非法路径：${entry.relativePath || '(空路径)'}`);
              continue;
            }
            normalizedFiles.push({
              path: entry.relativePath,
              base64: await this.fileToBase64(entry.file),
              size: entry.file.size,
            });
          }

          const hasSkillMd = normalizedFiles.some(file => file.path === 'SKILL.md');
          if (!hasSkillMd) errors.push('缺少 SKILL.md');

          imported.push({
            folderName: group.folderName,
            valid: errors.length === 0,
            error: errors.join('；'),
            files: normalizedFiles,
          });
        }

        imported.forEach(skill => {
          const idx = this.importedSkills.findIndex(existing => existing.folderName === skill.folderName);
          if (idx >= 0) {
            this.importedSkills.splice(idx, 1, skill);
          } else {
            this.importedSkills.push(skill);
          }
        });

        const invalid = imported.filter(skill => !skill.valid);
        this.skillImportError = invalid.length
          ? invalid.map(skill => `${skill.folderName}: ${skill.error}`).join('；')
          : '';
        this.generate();
      } catch (err) {
        this.skillImportError = err.message || 'Skill 文件夹导入失败';
      }
    },
    removeImportedSkill(folderName) {
      const idx = this.importedSkills.findIndex(skill => skill.folderName === folderName);
      if (idx >= 0) this.importedSkills.splice(idx, 1);
    },

    /** AI 工具依赖 Node.js */
    needsNodejs() {
      return this.aiTools.length > 0 || this.languages.includes('nodejs');
    },

    /** 汇总所有语言所需的 apt 包 */
    getAptPackages() {
      const pkgs = new Set(['git', 'wget', 'unzip', 'curl', 'ca-certificates', 'openssh-server', 'openssh-client']);
      this.languages.forEach(langId => {
        const lang = DEFAULTS.languages.find(l => l.id === langId);
        if (lang) lang.aptPkgs.forEach(p => pkgs.add(p));
      });
      return [...pkgs];
    },

    /** 应用预设：深拷贝配置并触发生成 */
    applyPreset(presetId) {
      const p = DEFAULTS.presets[presetId];
      if (!p) return;
      this.currentPreset = presetId;
      this.region = p.region;
      this.codeServer = p.codeServer;
      this.extensions = [...p.extensions];
      this.customExtensions = p.customExtensions;
      this.languages = [...p.languages];
      this.languageVersions = { ...p.languageVersions };
      this.aiTools = [...p.aiTools];
      this.aiToolVersions = { ...p.aiToolVersions };
      this.claudeMcpServers = p.claudeMcpServers ? p.claudeMcpServers.map(s => ({...s})) : [];
      this.claudeOutputStyle = p.claudeOutputStyle || '';
      this.claudeDisableTelemetry = p.claudeDisableTelemetry || false;
      this.codexMcpServers = p.codexMcpServers ? p.codexMcpServers.map(s => ({...s})) : [];
      this.importedSkills = p.importedSkills ? p.importedSkills.map(s => ({...s, files: (s.files || []).map(file => ({...file}))})) : [];
      this.skillImportError = '';
      this.codexOutputStyle = p.codexOutputStyle || 'default';
      this.codexCustomAgentsText = p.codexCustomAgentsText || '';
      this.gitUserName = p.gitUserName || '';
      this.gitUserEmail = p.gitUserEmail || '';
      this.rootPassword = p.rootPassword || '';
      this.csPassword = p.csPassword || '';
      this.sshPrivateKey = p.sshPrivateKey || '';
      this.sshPublicKey = p.sshPublicKey || '';
      this.cfTunnel = p.cfTunnel;
      this.cfToken = p.cfToken;
      this.frpcEnabled = p.frpcEnabled || false;
      this.frpcConfigUrl = p.frpcConfigUrl || '';
      this.vibeCommand = p.vibeCommand;
      this.vibeCommandText = p.vibeCommandText;
      this.volumeMode = p.volumeMode || 'named';
      this.customDockerfile = p.customDockerfile || '';
      this.generate();
    },

    /** 调用生成器，刷新语法高亮 */
    generate() {
      const config = this.getConfig();
      // 所有平台都生成 Dockerfile 和 entrypoint.sh
      this.generatedDockerfile = generateDockerfile(config);
      this.generatedEntrypoint = generateEntrypoint(config);

      // 根据部署平台生成不同文件
      switch (this.deployPlatform) {
        case 'cnb': // CNB 云平台
          this.generatedCompose = '';
          this.generatedDeploy = '';
          this.generatedCnbYml = generateCnbYml(config);
          this.generatedEnvFile = '';
          break;
        case 'local': // 本机/Docker
        default:
          this.generatedCompose = generateCompose(config);
          this.generatedDeploy = generateDeploy(config);
          this.generatedCnbYml = '';
          this.generatedEnvFile = this.generateEnvFileEnabled ? generateEnvFile(config) : '';
          break;
      }
      this.$nextTick(() => highlightAll());
    },

    /** 收集当前 UI 状态为生成器配置对象 */
    getConfig() {
      return {
        region: this.region, deployPlatform: this.deployPlatform, baseImage: DEFAULTS.baseImage,
        codeServer: this.codeServer, extensions: this.extensions, customExtensions: this.customExtensions,
        languages: this.languages, languageVersions: this.languageVersions,
        aiTools: this.aiTools, aiToolVersions: this.aiToolVersions, claudeMcpServers: this.claudeMcpServers,
        claudeOutputStyle: this.claudeOutputStyle,
        claudeDisableTelemetry: this.claudeDisableTelemetry,
        codexOutputStyle: this.codexOutputStyle,
        codexCustomAgentsText: this.codexCustomAgentsText,
        codexMcpServers: this.hasAiTool('codex') ? this.codexMcpServers : [],
        skills: (this.hasAiTool('claude-code') || this.hasAiTool('codex')) ? this.importedSkills.filter(skill => skill.valid) : [],
        installClaudeSkills: this.hasAiTool('claude-code'),
        installCodexSkills: this.hasAiTool('codex'),
        gitUserName: this.gitUserName, gitUserEmail: this.gitUserEmail,
        rootPassword: this.rootPassword, csPassword: this.csPassword,
        sshPrivateKey: this.sshPrivateKey,
        cfTunnel: this.cfTunnel, cfToken: this.cfToken,
        frpcEnabled: this.frpcEnabled, frpcConfigUrl: this.frpcConfigUrl,
        vibeCommand: this.vibeCommand, vibeCommandText: this.vibeCommandText,
        volumeMode: this.volumeMode,
        generateEnvFileEnabled: this.generateEnvFileEnabled,
        customDockerfile: this.customDockerfile,
        needsNodejs: this.needsNodejs(),
        // OSS 对象存储配置
        ossEnabled: this.ossEnabled,
        ossEndpoint: this.ossEndpoint,
        ossAccessKey: this.ossAccessKey,
        ossSecretKey: this.ossSecretKey,
        ossBucket: this.ossBucket,
        ossRegion: this.ossRegion,
        ossProject: this.ossProject,
        ossPaths: this.ossPaths,
        ossKeepCount: this.ossKeepCount,
        ossSyncInterval: this.ossSyncInterval,
      };
    },

    /** 复制文本到剪贴板，附带按钮反馈 */
    async copyToClipboard(text, btnId) {
      try {
        await navigator.clipboard.writeText(text);
        const btn = document.getElementById(btnId);
        if (btn) {
          btn.classList.add('copied');
          btn.textContent = '已复制!';
          setTimeout(() => { btn.classList.remove('copied'); btn.textContent = '复制'; }, 2000);
        }
      } catch {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
    },

    downloadFile(filename, content) { downloadSingleFile(filename, content); },

    async downloadAllZip() {
      // 所有平台都包含的基础文件
      const files = {
        'Dockerfile': this.generatedDockerfile,
        'entrypoint.sh': this.generatedEntrypoint,
      };

      // 根据部署平台添加不同文件
      switch (this.deployPlatform) {
        case 'cnb': // CNB 云平台
          files['.cnb.yml'] = this.generatedCnbYml;
          break;
        case 'local': // 本机/Docker
        default:
          files['docker-compose.yml'] = this.generatedCompose;
          files['deploy.sh'] = this.generatedDeploy;
          if (this.generatedEnvFile) {
            files['.env'] = this.generatedEnvFile;
          }
          break;
      }
      await downloadAllAsZip(files);
    },
  };
}
