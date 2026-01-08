#!/usr/bin/env node

import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import * as readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Color codes
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

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

async function checkCCSDD() {
  log.step('📋 Step 1: cc-sdd の確認');

  const kiroDir = join(process.cwd(), '.kiro');

  if (!existsSync(kiroDir)) {
    log.error('cc-sdd がインストールされていません');
    console.log('\n先に cc-sdd をインストールしてください:');
    console.log(`${colors.cyan}npx cc-sdd@latest --claude --lang ja${colors.reset}\n`);
    process.exit(1);
  }

  log.success('cc-sdd インストール済み');
}

function setupQualityRules() {
  log.step('📁 Step 2: 品質ルールを .kiro/steering/ に配置');

  const steeringDir = join(process.cwd(), '.kiro', 'steering');

  // .kiro/steering/ ディレクトリを作成（存在しない場合）
  if (!existsSync(steeringDir)) {
    mkdirSync(steeringDir, { recursive: true });
    log.info('.kiro/steering/ ディレクトリを作成しました');
  }

  // QUALITY.md をコピー
  const qualitySource = join(projectRoot, 'QUALITY.md');
  const qualityDest = join(steeringDir, 'quality.md');

  if (existsSync(qualitySource)) {
    copyFileSync(qualitySource, qualityDest);
    log.success('QUALITY.md → .kiro/steering/quality.md');
  } else {
    log.warning('QUALITY.md が見つかりません');
  }

  // REVIEW_LOG.md をコピー
  const reviewLogSource = join(projectRoot, 'REVIEW_LOG.md');
  const reviewLogDest = join(steeringDir, 'review-log.md');

  if (existsSync(reviewLogSource)) {
    copyFileSync(reviewLogSource, reviewLogDest);
    log.success('REVIEW_LOG.md → .kiro/steering/review-log.md');
  } else {
    log.warning('REVIEW_LOG.md が見つかりません');
  }
}

async function updatePyprojectToml() {
  log.step('📝 Step 3: pyproject.toml のプロジェクト名を設定');

  const pyprojectPath = join(process.cwd(), 'pyproject.toml');

  if (!existsSync(pyprojectPath)) {
    log.warning('pyproject.toml が見つかりません');
    return;
  }

  const currentDir = process.cwd().split('/').pop();
  const projectName = await question(`プロジェクト名を入力 (デフォルト: ${currentDir}): `);
  const finalName = projectName.trim() || currentDir;

  let content = readFileSync(pyprojectPath, 'utf-8');
  content = content.replace(/name = ".*"/, `name = "${finalName}"`);
  writeFileSync(pyprojectPath, content);

  log.success(`プロジェクト名を "${finalName}" に設定しました`);
}

function setupPythonEnvironment() {
  log.step('🐍 Step 4: Python 環境のセットアップ');

  try {
    // venv が既に存在するかチェック
    if (existsSync(join(process.cwd(), 'venv'))) {
      log.info('venv は既に存在します（スキップ）');
    } else {
      log.info('仮想環境を作成中...');
      execSync('python3 -m venv venv', { stdio: 'inherit' });
      log.success('仮想環境を作成しました');
    }

    // pip install
    log.info('依存関係をインストール中...');
    const activateCmd = process.platform === 'win32'
      ? 'venv\\Scripts\\activate && pip install -e ".[dev]"'
      : 'source venv/bin/activate && pip install -e ".[dev]"';

    execSync(activateCmd, { stdio: 'inherit', shell: '/bin/bash' });
    log.success('依存関係をインストールしました');

    // pre-commit install
    log.info('pre-commit をセットアップ中...');
    const precommitCmd = process.platform === 'win32'
      ? 'venv\\Scripts\\activate && pre-commit install'
      : 'source venv/bin/activate && pre-commit install';

    execSync(precommitCmd, { stdio: 'inherit', shell: '/bin/bash' });
    log.success('pre-commit をセットアップしました');

  } catch (error) {
    log.error('Python 環境のセットアップに失敗しました');
    console.error(error.message);
    process.exit(1);
  }
}

function syncSkills() {
  log.step('🎯 Step 5: Claude Code Skills の同期');

  const skillsSource = join(projectRoot, 'skills');
  const skillsTarget = join(process.env.HOME, '.claude', 'skills');

  if (!existsSync(skillsSource)) {
    log.warning('skills/ ディレクトリが見つかりません');
    return;
  }

  const skills = ['codex-review', 'codex-review-requirements', 'gemini-research'];
  let syncedCount = 0;

  for (const skill of skills) {
    const sourcePath = join(skillsSource, skill, 'skill.md');
    const targetDir = join(skillsTarget, skill);
    const targetPath = join(targetDir, 'skill.md');

    if (existsSync(sourcePath)) {
      mkdirSync(targetDir, { recursive: true });
      copyFileSync(sourcePath, targetPath);
      log.success(`${skill} を同期しました`);
      syncedCount++;
    } else {
      log.warning(`${skill}/skill.md が見つかりません`);
    }
  }

  if (syncedCount > 0) {
    log.success(`${syncedCount} 個のスキルを ~/.claude/skills/ に同期しました`);
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
  console.log('   source venv/bin/activate  # 仮想環境を有効化');
  console.log('   /kiro:steering            # プロジェクトコンテキストを作成');
  console.log('   /kiro:spec-init <description>  # 機能開発を開始\n');
}

async function main() {
  console.log(`\n${colors.bright}${colors.green}🚀 Python Dev Template Setup${colors.reset}\n`);

  try {
    await checkCCSDD();
    setupQualityRules();
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
