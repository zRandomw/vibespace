#!/usr/bin/env node
/**
 * sync-skills.js — 同步项目 Skills 并生成前端清单
 *
 * 用法:
 *   node scripts/sync-skills.js
 *   node scripts/sync-skills.js "/path/to/skill-or-parent-directory"
 */

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const skillsRoot = path.join(repoRoot, 'skills');
const manifestFile = path.join(repoRoot, 'js/data/skillsManifest.js');

function normalizePath(value) {
  return String(value || '').replace(/\\/g, '/');
}

function isIgnoredFile(name) {
  return name.endsWith(':Zone.Identifier');
}

function isSafeSkillName(name) {
  return /^[A-Za-z0-9._-]+$/.test(name) && name !== '.' && name !== '..';
}

function hasSkillMd(dir) {
  const skillMd = path.join(dir, 'SKILL.md');
  return fs.existsSync(skillMd) && fs.statSync(skillMd).isFile();
}

function listSkillSourceDirs(sourceDir) {
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`路径不存在: ${sourceDir}`);
  }

  const stat = fs.statSync(sourceDir);
  if (!stat.isDirectory()) {
    throw new Error(`不是目录: ${sourceDir}`);
  }

  if (hasSkillMd(sourceDir)) return [sourceDir];

  return fs.readdirSync(sourceDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => path.join(sourceDir, entry.name))
    .filter(hasSkillMd);
}

function copyDirectory(sourceDir, targetDir) {
  fs.mkdirSync(targetDir, { recursive: true });

  fs.readdirSync(sourceDir, { withFileTypes: true }).forEach(entry => {
    if (isIgnoredFile(entry.name)) return;

    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isSymbolicLink()) return;
    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
      return;
    }
    if (entry.isFile()) {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}

function syncSkillDirectory(sourceDir) {
  const folderName = path.basename(sourceDir);
  if (!isSafeSkillName(folderName)) {
    throw new Error(`Skill 文件夹名非法: ${folderName}`);
  }

  const targetDir = path.join(skillsRoot, folderName);
  const sourceRealPath = fs.realpathSync(sourceDir);
  const targetRealPath = fs.existsSync(targetDir) ? fs.realpathSync(targetDir) : null;

  if (targetRealPath && sourceRealPath === targetRealPath) {
    return { folderName, skipped: true };
  }

  fs.rmSync(targetDir, { recursive: true, force: true });
  copyDirectory(sourceDir, targetDir);
  return { folderName, skipped: false };
}

function collectFiles(dir, baseDir = dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (isIgnoredFile(entry.name)) return [];

    const fullPath = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) return [];
    if (entry.isDirectory()) return collectFiles(fullPath, baseDir);
    if (!entry.isFile()) return [];

    return [fullPath];
  }).sort((a, b) => normalizePath(path.relative(baseDir, a)).localeCompare(normalizePath(path.relative(baseDir, b))));
}

function buildManifest() {
  if (!fs.existsSync(skillsRoot)) return [];

  return fs.readdirSync(skillsRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && isSafeSkillName(entry.name))
    .map(entry => ({
      folderName: entry.name,
      dir: path.join(skillsRoot, entry.name),
    }))
    .filter(skill => hasSkillMd(skill.dir))
    .sort((a, b) => a.folderName.localeCompare(b.folderName))
    .map(skill => ({
      folderName: skill.folderName,
      files: collectFiles(skill.dir).map(filePath => {
        const relativePath = normalizePath(path.relative(skill.dir, filePath));
        const sourcePath = `skills/${skill.folderName}/${relativePath}`;
        const content = fs.readFileSync(filePath);
        return {
          path: relativePath,
          sourcePath,
          size: content.length,
          base64: content.toString('base64'),
        };
      }),
    }));
}

function writeManifest(manifest) {
  const content = `/** skillsManifest.js — 项目内置 Skills 清单\n * 由 scripts/sync-skills.js 生成，请勿手动编辑。\n */\n\nconst DEFAULT_SKILLS_MANIFEST = ${JSON.stringify(manifest, null, 2)};\n`;
  fs.mkdirSync(path.dirname(manifestFile), { recursive: true });
  fs.writeFileSync(manifestFile, content);
}

function main() {
  fs.mkdirSync(skillsRoot, { recursive: true });

  const sourceArgs = process.argv.slice(2).filter(arg => arg !== '--refresh');
  sourceArgs.forEach(sourceArg => {
    const sourceDir = path.resolve(process.cwd(), sourceArg);
    const skillDirs = listSkillSourceDirs(sourceDir);
    if (!skillDirs.length) {
      throw new Error(`未找到包含 SKILL.md 的 Skill 目录: ${sourceDir}`);
    }

    skillDirs.forEach(skillDir => {
      const result = syncSkillDirectory(skillDir);
      const action = result.skipped ? '跳过' : '同步';
      console.log(`${action}: ${result.folderName}`);
    });
  });

  const manifest = buildManifest();
  writeManifest(manifest);
  console.log(`已生成: ${normalizePath(path.relative(repoRoot, manifestFile))}`);
  console.log(`Skills 数量: ${manifest.length}`);
}

try {
  main();
} catch (err) {
  console.error(err.message || err);
  process.exit(1);
}
