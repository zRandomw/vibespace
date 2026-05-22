/** codexConfig.js — Codex config.toml 生成器 */

function normalizeTomlText(text) {
  return String(text || '').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function parseTomlHeaderPath(line) {
  const raw = String(line || '').trim();
  if (!raw.startsWith('[') || raw.startsWith('[[')) return null;

  let headerEnd = -1;
  let inQuotes = false;
  let escape = false;
  for (let idx = 0; idx < raw.length; idx += 1) {
    const ch = raw[idx];
    if (inQuotes) {
      if (escape) {
        escape = false;
      } else if (ch === '\\') {
        escape = true;
      } else if (ch === '"') {
        inQuotes = false;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }

    if (ch === ']') {
      headerEnd = idx;
      break;
    }
  }

  if (headerEnd < 0) return null;
  const trailer = raw.slice(headerEnd + 1).trim();
  if (trailer && !trailer.startsWith('#')) return null;

  const inner = raw.slice(1, headerEnd).trim();
  if (!inner) return null;

  const segments = [];
  let buffer = '';
  inQuotes = false;
  escape = false;
  let quotedSegment = false;

  const pushSegment = () => {
    const value = quotedSegment ? buffer : buffer.trim();
    if (value) segments.push(value);
    buffer = '';
    quotedSegment = false;
  };

  for (let idx = 0; idx < inner.length; idx += 1) {
    const ch = inner[idx];

    if (inQuotes) {
      if (escape) {
        switch (ch) {
          case 'n':
            buffer += '\n';
            break;
          case 'r':
            buffer += '\r';
            break;
          case 't':
            buffer += '\t';
            break;
          case '"':
            buffer += '"';
            break;
          case '\\':
            buffer += '\\';
            break;
          default:
            buffer += ch;
            break;
        }
        escape = false;
        continue;
      }

      if (ch === '\\') {
        escape = true;
        continue;
      }

      if (ch === '"') {
        inQuotes = false;
        continue;
      }

      buffer += ch;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      quotedSegment = true;
      continue;
    }

    if (ch === '.') {
      pushSegment();
      continue;
    }

    if (!buffer && !quotedSegment && /\s/.test(ch)) {
      continue;
    }

    buffer += ch;
  }

  if (escape) buffer += '\\';
  pushSegment();

  return segments.length ? segments : null;
}

function parseMcpJson(server) {
  if (!server || !server.name || !server.json) return null;
  try {
    return { name: String(server.name), config: JSON.parse(server.json) };
  } catch {
    return null;
  }
}

function normalizeMcpServers(servers) {
  const normalized = [];
  const seen = new Set();

  [...(servers || [])].reverse().forEach(server => {
    const parsed = parseMcpJson(server);
    if (!parsed || !parsed.name || seen.has(parsed.name)) return;
    seen.add(parsed.name);
    normalized.unshift(parsed);
  });

  return normalized;
}

function buildCodexMcpToml(servers) {
  const toml = [];

  normalizeMcpServers(servers).forEach(server => {
    const name = String(server.name).replace(/"/g, '\\"');
    const config = server.config || {};

    toml.push(`[mcp_servers."${name}"]`);
    if (config.type === 'http' || config.url) {
      toml.push(`url = ${JSON.stringify(config.url || '')}`);
    } else {
      toml.push(`command = ${JSON.stringify(config.command || '')}`);
      if (Array.isArray(config.args) && config.args.length) {
        toml.push(`args = ${JSON.stringify(config.args)}`);
      }
      if (config.env && Object.keys(config.env).length) {
        toml.push(`[mcp_servers."${name}".env]`);
        Object.entries(config.env).forEach(([key, value]) => {
          toml.push(`${JSON.stringify(key)} = ${JSON.stringify(String(value))}`);
        });
      }
    }
    toml.push('');
  });

  return toml.join('\n').trim();
}

function stripCodexMcpSections(tomlText, serverNames) {
  const names = new Set((serverNames || []).filter(Boolean).map(name => String(name)));
  if (!names.size) return normalizeTomlText(tomlText);

  const lines = normalizeTomlText(tomlText).split('\n');
  const output = [];
  let skipping = false;

  const isMatchedHeader = (pathSegments) => pathSegments
    && pathSegments[0] === 'mcp_servers'
    && pathSegments.length >= 2
    && names.has(pathSegments[1]);

  for (const line of lines) {
    const headerPath = parseTomlHeaderPath(line);
    if (headerPath) {
      if (isMatchedHeader(headerPath)) {
        skipping = true;
        continue;
      }

      skipping = false;
      output.push(line);
      continue;
    }

    if (skipping) continue;
    output.push(line);
  }

  return output.join('\n').replace(/\n{3,}/g, '\n\n').replace(/^\n+/, '');
}

function generateCodexConfigToml(config) {
  const importedText = normalizeTomlText(config && config.codexConfigTomlText ? config.codexConfigTomlText : '');
  const codexMcpServers = config && Array.isArray(config.codexMcpServers) ? config.codexMcpServers : [];
  const mcpToml = buildCodexMcpToml(codexMcpServers);
  const serverNames = codexMcpServers.map(server => server && server.name).filter(Boolean);

  const strippedImportedText = serverNames.length
    ? stripCodexMcpSections(importedText, serverNames)
    : importedText;

  const trimmedBase = strippedImportedText.replace(/\s*$/, '');
  if (!mcpToml) return strippedImportedText;
  if (!trimmedBase) return `${mcpToml}\n`;
  return `${trimmedBase}\n\n${mcpToml}\n`;
}
