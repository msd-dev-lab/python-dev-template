#!/usr/bin/env node

import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import * as readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  step: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}`),
};

function question(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function updatePyprojectToml() {
  log.step('📝 Step 1: pyproject.toml のプロジェクト名を設定');

  const pyprojectPath = join(process.cwd(), 'pyproject.toml');

  if (!existsSync(pyprojectPath)) {
    log.warning('pyproject.toml が見つかりません');
    return;
  }

  const currentDir = basename(process.cwd());
  const input = await question(`プロジェクト名を入力 (デフォルト: ${currentDir}): `);
  const finalName = input.trim() || currentDir;

  const content = readFileSync(pyprojectPath, 'utf-8');
  const updatedContent = content.replace(/name = ".*"/, `name = "${finalName}"`);
  writeFileSync(pyprojectPath, updatedContent);

  log.success(`プロジェクト名を "${finalName}" に設定しました`);
}

function setupPythonEnvironment() {
  log.step('🐍 Step 2: Python 環境のセットアップ (uv)');

  try {
    if (existsSync(join(process.cwd(), '.venv'))) {
      log.info('.venv は既に存在します（スキップ）');
    } else {
      log.info('仮想環境を作成中 (uv venv)...');
      execSync('uv venv', { stdio: 'inherit' });
      log.success('仮想環境を作成しました');
    }

    log.info('依存関係をインストール中 (uv pip)...');
    execSync('uv pip install -e ".[dev]"', { stdio: 'inherit' });
    log.success('依存関係をインストールしました');

    log.info('pre-commit をセットアップ中...');
    const activateCmd = process.platform === 'win32'
      ? '.venv\\Scripts\\activate && pre-commit install'
      : 'source .venv/bin/activate && pre-commit install';
    execSync(activateCmd, { stdio: 'inherit', shell: '/bin/bash' });
    log.success('pre-commit をセットアップしました');
  } catch (error) {
    log.error('Python 環境のセットアップに失敗しました');
    console.error(error.message);
    process.exit(1);
  }
}

function syncSkills() {
  log.step('🎯 Step 3: Claude Code Skills の同期');

  const skillsSource = join(projectRoot, 'skills');
  const skillsTargetGlobal = join(process.env.HOME, '.claude', 'skills');
  const skillsTargetLocal = join(process.cwd(), '.claude', 'skills');

  if (!existsSync(skillsSource)) {
    log.warning('skills/ ディレクトリが見つかりません');
    return;
  }

  const globalSkills = ['codex-review', 'gemini-research'];
  const localSkills = ['agent-memory'];
  let syncedCount = 0;

  for (const skillName of globalSkills) {
    const sourcePath = join(skillsSource, skillName, 'skill.md');
    const targetDir = join(skillsTargetGlobal, skillName);
    const targetPath = join(targetDir, 'skill.md');

    if (!existsSync(sourcePath)) {
      log.warning(`${skillName}/skill.md が見つかりません`);
      continue;
    }

    mkdirSync(targetDir, { recursive: true });
    copyFileSync(sourcePath, targetPath);
    log.success(`${skillName} を同期しました（グローバル）`);
    syncedCount++;
  }

  for (const skillName of localSkills) {
    const sourceDir = join(skillsSource, skillName);
    const targetDir = join(skillsTargetLocal, skillName);

    if (!existsSync(sourceDir)) {
      log.warning(`${skillName}/ ディレクトリが見つかりません`);
      continue;
    }

    mkdirSync(targetDir, { recursive: true });

    const filesToCopy = ['skill.md', '.gitignore'];
    for (const file of filesToCopy) {
      const sourceFile = join(sourceDir, file);
      const targetFile = join(targetDir, file);
      if (existsSync(sourceFile)) {
        copyFileSync(sourceFile, targetFile);
      }
    }

    const memoriesDir = join(targetDir, 'memories');
    mkdirSync(memoriesDir, { recursive: true });

    log.success(`${skillName} を同期しました（プロジェクトローカル）`);
    syncedCount++;
  }

  if (syncedCount > 0) {
    log.success(`${syncedCount} 個のスキルを同期しました`);
  }
}

function showNextSteps() {
  log.step('🎉 セットアップ完了！');

  console.log(`\n${colors.bright}次のステップ:${colors.reset}\n`);

  console.log(`${colors.cyan}1. Git リポジトリを初期化${colors.reset}`);
  console.log('   git init');
  console.log('   git add .');
  console.log('   git commit -m "Initial setup"\n');

  console.log(`${colors.cyan}2. GitHub リポジトリを作成${colors.reset}`);
  console.log('   gh repo create msd-dev-lab/<repository-name> --public\n');

  console.log(`${colors.cyan}3. リモートを追加してプッシュ${colors.reset}`);
  console.log('   git remote add origin https://github.com/msd-dev-lab/<repository-name>.git');
  console.log('   git push -u origin main\n');

  console.log(`${colors.cyan}4. Claude Code Actions をセットアップ${colors.reset}`);
  console.log('   claude /install-github-app\n');

  console.log(`${colors.bright}開発を開始:${colors.reset}`);
  console.log('   source .venv/bin/activate  # 仮想環境を有効化');
  console.log('   /codex-review             # コードレビュー');
  console.log('   /code-simplifier <file>   # コード簡潔化（PRレビュー前推奨）');
  console.log('   /agent-memory             # 作業の記憶・復元\n');
}

async function main() {
  console.log(`\n${colors.bright}${colors.green}🚀 Python Dev Template Setup (Lite)${colors.reset}\n`);
  console.log(`${colors.blue}ℹ${colors.reset} cc-sdd 無しの軽量セットアップです\n`);

  try {
    await updatePyprojectToml();
    setupPythonEnvironment();
    syncSkills();
    showNextSteps();
  } catch (error) {
    log.error('セットアップ中にエラーが発生しました');
    console.error(error);
    process.exit(1);
  }
}

main();
