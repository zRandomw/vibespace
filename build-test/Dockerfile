FROM ubuntu:24.04

ENV LANG=C.UTF-8 \
    LANGUAGE=C.UTF-8 \
    GOLANG_VERSION=1.23.6 \
    GOPATH=/root/go \
    GOPROXY=https://goproxy.cn,direct \
    MAVEN_HOME=/opt/maven \
    NVM_DIR=/root/.nvm \
    NVM_SYMLINK_CURRENT=true \
    UV_DEFAULT_INDEX=https://pypi.tuna.tsinghua.edu.cn/simple \
    PIP_INDEX_URL=https://pypi.tuna.tsinghua.edu.cn/simple \
    PATH=$PATH:/usr/local/go/bin:/root/go/bin:/root/.local/bin:/opt/maven/bin:/root/.nvm/current/bin:/root/.cargo/bin

# 层1: 系统包 + 基础工具
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && curl -sSL https://gitee.com/SuperManito/LinuxMirrors/raw/main/ChangeMirrors.sh | bash -s -- --source mirrors.pku.edu.cn --protocol http --use-intranet-source false --backup false --upgrade-software false --clean-cache false --ignore-backup-tips \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential ca-certificates cmake cron curl g++ gcc git make nano openjdk-21-jdk openssh-client openssh-server rclone unzip vim wget xz-utils zstd \
    && apt-get autoremove -y \
    && apt-get clean

# 层2: 语言运行时
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash \
    && . "$NVM_DIR/nvm.sh" && nvm install 24 && nvm alias default 24 && nvm use default \
    && curl -LsSf https://astral.sh/uv/install.sh | sh \
    && uv python install 3.12 --default \
    && wget -q https://dlcdn.apache.org/maven/maven-3/3.9.16/binaries/apache-maven-3.9.16-bin.tar.gz \
    && tar -C /opt -xzf apache-maven-3.9.16-bin.tar.gz \
    && ln -s /opt/apache-maven-3.9.16 /opt/maven \
    && rm -f apache-maven-3.9.16-bin.tar.gz \
    && wget -q https://golang.google.cn/dl/go${GOLANG_VERSION}.linux-amd64.tar.gz \
    && tar -C /usr/local -xzf go${GOLANG_VERSION}.linux-amd64.tar.gz \
    && rm -f go${GOLANG_VERSION}.linux-amd64.tar.gz \
    && curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y \
    && echo 'source $HOME/.cargo/env' >> /root/.bashrc

# 层3: 全局 npm 包
RUN npm config set registry https://registry.npmmirror.com \
    && npm install -g typescript ts-node \
    && npm cache clean --force

# 层4: 语言开发工具
RUN go install -v golang.org/x/tools/gopls@latest \
    && go install -v github.com/go-delve/delve/cmd/dlv@latest \
    && go install -v honnef.co/go/tools/cmd/staticcheck@latest \
    && go clean -modcache \
    && go clean -cache

# 层5a: 安装 code-server
RUN curl -fsSL https://raw.githubusercontent.com/coder/code-server/main/install.sh | sh \
    && rm -rf /tmp/*

# 层5b: code-server 扩展
RUN code-server --install-extension MS-CEINTL.vscode-language-pack-zh-hans \
    && code-server --install-extension GitHub.github-vscode-theme \
    && code-server --install-extension DavidAnson.vscode-markdownlint \
    && code-server --install-extension g2developer.browser-in-vscode \
    && code-server --install-extension saltcoreyan.json-format-sortcore \
    && code-server --install-extension redhat.vscode-yaml \
    && code-server --install-extension Anthropic.claude-code \
    && code-server --install-extension eamodio.gitlens \
    && code-server --install-extension golang.go \
    && code-server --install-extension streetsidesoftware.code-spell-checker \
    && code-server --install-extension FittenTech.Fitten-Code \
    && code-server --install-extension RooVeterinaryInc.roo-cline \
    && code-server --install-extension aminer.codegeex \
    && code-server --install-extension ms-python.python \
    && rm -rf /tmp/* /root/.cache

# 层6: AI 工具
RUN npm install -g @anthropic-ai/claude-code @openai/codex @cometix/ccline @musistudio/claude-code-router \
    && npm cache clean --force \
    && CC_SWITCH_FORCE=1 curl -fsSL https://gh-proxy.org/https://github.com/SaladDay/cc-switch-cli/releases/latest/download/install.sh | bash \
    && echo '#!/bin/bash' > /usr/local/bin/vibe \
    && echo 'IS_SANDBOX=1 claude --dangerously-skip-permissions "$@"' >> /usr/local/bin/vibe \
    && chmod +x /usr/local/bin/vibe

# 层6b: Claude Code 配置
RUN mkdir -p ~/.claude \
    && printf '%s' '{"statusLine":{"type":"command","command":"ccline","padding":0},"env":{"CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC":"1","DISABLE_AUTOUPDATER":"1"}}' > ~/.claude/settings.json \
    && mkdir -p ~/.claude/output-styles \
    && (claude config set outputStyle "default" -g 2>/dev/null || true) \
    && (claude mcp add-json -s user 'context7' '{"command":"npx","args":["-y","@upstash/context7-mcp@latest"]}' || true) \
    && (claude mcp add-json -s user 'filesystem' '{"command":"npx","args":["-y","@modelcontextprotocol/server-filesystem"]}' || true) \
    && (claude mcp add-json -s user 'firecrawl' '{"type":"http","url":"https://mcp.firecrawl.dev/[你的apikey]/v2/mcp"}' || true) \
    && (claude mcp add-json -s user 'exa' '{"type":"http","url":"https://mcp.exa.ai/mcp?exaApiKey=[你的APIKEY]"}' || true) \
    && (claude mcp add-json -s user 'mcp-deepwiki' '{"command":"npx","args":["-y","mcp-deepwiki@latest"]}' || true)

# 层6c: Codex 配置
RUN mkdir -p /root/.codex \
    && printf '%s\n' \
        '# Codex 工作区指南' \
        '' \
        '你是运行在 Vibe Space 容器中的 Codex CLI。请优先遵循当前用户项目中的 AGENTS.md、README 和开发文档。' \
        '' \
        '## 工作原则' \
        '' \
        '- 先阅读相关文件，再修改代码。' \
        '- 保持改动聚焦，避免无关重构。' \
        '- 不主动执行 git commit、git push、git reset 或分支操作，除非用户明确要求。' \
        '- 不写入真实 API Key、Token、SSH 私钥或其他敏感信息。' \
        '- 生成器、脚本和配置改动完成后，给出可复现的验证步骤。' \
        '' \
        '## 项目约定' \
        '' \
        '- 纯静态项目保持无构建链风格。' \
        '- JavaScript 使用 2 空格缩进、单引号和分号。' \
        '- 注释语言与所在文件保持一致。' \
        '- 新增远程地址优先集中到 js/data/urls.js。' \
        '- 生成器保持纯函数形态：接收 config，返回字符串。' \
    > /root/.codex/AGENTS.md

# 层7: SSH 配置
RUN mkdir -p /run/sshd \
    && sed -i 's/^#*PermitRootLogin.*/PermitRootLogin yes/' /etc/ssh/sshd_config \
    && sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config

# 创建 vibespace 管理命令
RUN echo '#!/bin/bash' > /usr/local/bin/vibespace \
    && echo '/usr/local/bin/entrypoint.sh --commands' >> /usr/local/bin/vibespace \
    && chmod +x /usr/local/bin/vibespace

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
COPY config.toml /root/.codex/config.toml
RUN chmod +x /usr/local/bin/entrypoint.sh

# 备份 /root，防止 volume 挂载覆盖镜像内文件
RUN mkdir /root-defaults && cp -a /root /root-defaults

WORKDIR /workspace
EXPOSE 12345 22
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
