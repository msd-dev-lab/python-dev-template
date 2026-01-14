#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, silent = false) {
  try {
    return execSync(command, {
      encoding: 'utf8',
      stdio: silent ? 'pipe' : 'inherit'
    });
  } catch (error) {
    if (!silent) {
      log(`✗ ${error.message}`, 'red');
    }
    throw error;
  }
}

// テンプレートディレクトリのパス（スクリプトと同じ階層）
const TEMPLATE_DIR = path.join(__dirname, 'templates');
// ユーザーの作業ディレクトリ
const TARGET_DIR = process.cwd();

async function setup() {
  log('\n🚀 Python Development Template Setup\n', 'blue');

  // プロジェクト名をディレクトリ名から取得
  const projectName = path.basename(TARGET_DIR);
  log(`📁 プロジェクト: ${projectName}\n`, 'green');

  // Step 1: cc-sdd の確認
  log('📋 Step 1: cc-sdd の確認', 'yellow');
  try {
    exec('which cc-sdd', true);
    log('✓ cc-sdd インストール済み', 'green');
  } catch {
    log('ℹ cc-sdd が見つかりません（オプション）', 'blue');
  }

  // Step 2: 品質ルールを .kiro/steering/ に配置
  log('\n📁 Step 2: 品質ルールを .kiro/steering/ に配置', 'yellow');
  const steeringDir = path.join(TARGET_DIR, '.kiro', 'steering');

  if (!fs.existsSync(steeringDir)) {
    fs.mkdirSync(steeringDir, { recursive: true });
    log('ℹ .kiro/steering/ ディレクトリを作成しました', 'blue');
  }

  const filesToCopy = [
    { src: 'QUALITY.md', dest: 'quality.md' },
    { src: 'REVIEW_LOG.md', dest: 'review-log.md' },
    { src: 'DEVELOPMENT_GUIDE.md', dest: 'development-guide.md' },
  ];

  for (const file of filesToCopy) {
    const srcPath = path.join(TEMPLATE_DIR, file.src);
    const destPath = path.join(steeringDir, file.dest);

    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      log(`✓ ${file.src} → ${path.relative(TARGET_DIR, destPath)}`, 'green');
    } else {
      log(`⚠ ${file.src} が見つかりません`, 'red');
    }
  }

  // Step 3: pyproject.toml を作成
  log('\n📝 Step 3: pyproject.toml のプロジェクト名を設定', 'yellow');
  const pyprojectSrc = path.join(TEMPLATE_DIR, 'pyproject.toml');
  const pyprojectDest = path.join(TARGET_DIR, 'pyproject.toml');

  if (!fs.existsSync(pyprojectDest)) {
    if (fs.existsSync(pyprojectSrc)) {
      let content = fs.readFileSync(pyprojectSrc, 'utf8');
      content = content.replace(/name = "your-project-name"/, `name = "${projectName}"`);
      content = content.replace(/name = ".*?"/, `name = "${projectName}"`);
      fs.writeFileSync(pyprojectDest, content);
      log(`✓ pyproject.toml を作成しました (name: ${projectName})`, 'green');
    } else {
      log('⚠ pyproject.toml テンプレートが見つかりません', 'red');
    }
  } else {
    // 既存のpyproject.tomlがある場合は名前だけ更新
    let content = fs.readFileSync(pyprojectDest, 'utf8');
    if (content.includes('your-project-name')) {
      content = content.replace(/name = "your-project-name"/, `name = "${projectName}"`);
      fs.writeFileSync(pyprojectDest, content);
      log(`✓ pyproject.toml のプロジェクト名を "${projectName}" に更新しました`, 'green');
    } else {
      log('ℹ pyproject.toml は既に設定済みです', 'blue');
    }
  }

  // Step 3.5: README.md を作成
  const readmeSrc = path.join(TEMPLATE_DIR, 'README.md');
  const readmeDest = path.join(TARGET_DIR, 'README.md');

  if (!fs.existsSync(readmeDest)) {
    if (fs.existsSync(readmeSrc)) {
      let content = fs.readFileSync(readmeSrc, 'utf8');
      content = content.replace(/\{\{PROJECT_NAME\}\}/g, projectName);
      fs.writeFileSync(readmeDest, content);
      log('✓ README.md を作成しました', 'green');
    }
  }

  // Step 3.6: src/ と tests/ ディレクトリを作成
  const srcDir = path.join(TARGET_DIR, 'src');
  const testsDir = path.join(TARGET_DIR, 'tests');

  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
    fs.writeFileSync(path.join(srcDir, '__init__.py'), '');
    log('✓ src/ ディレクトリを作成しました', 'green');
  }

  if (!fs.existsSync(testsDir)) {
    fs.mkdirSync(testsDir, { recursive: true });
    fs.writeFileSync(path.join(testsDir, '__init__.py'), '');
    log('✓ tests/ ディレクトリを作成しました', 'green');
  }

  // Step 4: Python 環境のセットアップ (uv)
  log('\n🐍 Step 4: Python 環境のセットアップ (uv)', 'yellow');

  // uv がインストールされているか確認
  let useUv = false;
  try {
    exec('which uv', true);
    useUv = true;
  } catch {
    log('ℹ uv が見つかりません。python3 -m venv を使用します', 'blue');
  }

  const venvPath = path.join(TARGET_DIR, '.venv');

  if (!fs.existsSync(venvPath)) {
    try {
      if (useUv) {
        log('ℹ 仮想環境を作成中 (uv venv)...', 'blue');
        exec('uv venv');
      } else {
        log('ℹ 仮想環境を作成中 (python3 -m venv)...', 'blue');
        exec('python3 -m venv .venv');
      }
      log('✓ 仮想環境を作成しました', 'green');
    } catch (error) {
      log('✗ 仮想環境の作成に失敗しました', 'red');
      log(`  Command failed: ${error.message}`, 'red');
      return;
    }
  } else {
    log('ℹ 仮想環境は既に存在します', 'blue');
  }

  // 依存関係のインストール
  try {
    if (useUv) {
      log('ℹ 依存関係をインストール中 (uv pip)...', 'blue');
      exec('uv pip install -e ".[dev]"');
    } else {
      log('ℹ 依存関係をインストール中 (pip)...', 'blue');
      exec('bash -c "source .venv/bin/activate && pip install -e .[dev]"');
    }
    log('✓ 依存関係をインストールしました', 'green');
  } catch (error) {
    log('✗ Python 環境のセットアップに失敗しました', 'red');
    log(`  Command failed: ${error.message}`, 'red');
    return;
  }

  // Step 5: pre-commit のセットアップ
  log('\n🔧 Step 5: pre-commit のセットアップ', 'yellow');
  const precommitConfig = path.join(TARGET_DIR, '.pre-commit-config.yaml');

  if (!fs.existsSync(precommitConfig)) {
    // 基本的な pre-commit 設定を作成
    const precommitContent = `repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.4.0
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.8.0
    hooks:
      - id: mypy
        additional_dependencies: []
        args: [--ignore-missing-imports]
`;
    fs.writeFileSync(precommitConfig, precommitContent);
    log('✓ .pre-commit-config.yaml を作成しました', 'green');
  }

  try {
    if (useUv) {
      exec('bash -c "source .venv/bin/activate && pre-commit install"', true);
    } else {
      exec('bash -c "source .venv/bin/activate && pre-commit install"', true);
    }
    log('✓ pre-commit をインストールしました', 'green');
  } catch {
    log('ℹ pre-commit のインストールをスキップしました', 'blue');
  }

  // 完了メッセージ
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'green');
  log('🎉 セットアップ完了！', 'green');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'green');

  log('\n📋 次のステップ:', 'blue');
  log('1. 仮想環境をアクティベート:', 'blue');
  log('   source .venv/bin/activate', 'yellow');
  log('\n2. 開発を開始:', 'blue');
  log('   # src/ にコードを追加', 'yellow');
  log('   # tests/ にテストを追加', 'yellow');
  log('\n3. 品質チェック:', 'blue');
  log('   ruff check src tests', 'yellow');
  log('   mypy src', 'yellow');
  log('   pytest', 'yellow');
  log('');
}

setup().catch(error => {
  log(`\n❌ エラーが発生しました: ${error.message}`, 'red');
  process.exit(1);
});
