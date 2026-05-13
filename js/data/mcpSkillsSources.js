/** mcpSkillsSources.js — MCP 默认源与内置预设 */

const DEFAULT_MCP_SOURCE_CONFIG = {
  version: 1,
  mcpSources: [
    {
      id: 'aitmpl-mcps',
      name: 'AITmpl MCPs',
      url: 'https://aitmpl.com/mcps/',
      fetchMode: 'page',
      enabled: true,
    },
    {
      id: 'mcp-cn',
      name: 'MCP 中文社区',
      url: 'https://mcp-cn.com/',
      fetchMode: 'page',
      enabled: true,
    },
    {
      id: 'mcpmarket-zh',
      name: 'MCP Market 中文',
      url: 'https://mcpmarket.com/zh',
      fetchMode: 'page',
      enabled: true,
    },
  ],
};

const DEFAULT_MCP_PRESET_ITEMS = DEFAULTS.mcpPresets.map(preset => ({
  id: preset.id,
  name: preset.name,
  label: preset.label,
  description: preset.desc,
  json: preset.json,
}));
