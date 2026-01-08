#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const prompts = require('prompts');

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
      log(`Error executing: ${command}`, 'red');
      log(error.message, 'red');
    }
    throw error;
  }
}

async function setup() {
  log('\n🚀 Python Development Template Setup\n', 'blue');

  // 1. プロジェクト名を取得
  const response = await prompts({
    type: 'text',
    name: 'projectName',
    message: 'プロジェクト名を入力してください (例: my-awesome-project):',
    initial: path.basename(process.cwd()),
    validate: value => value.length > 0 || 'プロジェクト名を入力してください'
  });

  if (!response.projectName) {
    log('\n❌ セットアップをキャンセルしました', 'red');
    process.exit(0);
  }

  const projectName = response.projectName;
  log(`\n✅ プロジェクト名: ${projectName}\n`, 'green');

  // 2. .kiro/steering/ ディレクトリ作成
  log('📁 .kiro/steering/ ディレクトリを作成中...', 'yellow');
  const steeringDir = path.join(process.cwd(), '.kiro', 'steering');
  if (!fs.existsSync(steeringDir)) {
    fs.mkdirSync(steeringDir, { recursive: true });
    log('✅ .kiro/steering/ を作成しました', 'green');
  } else {
    log('ℹ️  .kiro/steering/ は既に存在します', 'blue');
  }

  // 3. QUALITY.md と REVIEW_LOG.md をコピー
  log('\n📄 品質ルールファイルをコピー中...', 'yellow');
  const qualitySource = path.join(process.cwd(), 'QUALITY.md');
  const reviewLogSource = path.join(process.cwd(), 'REVIEW_LOG.md');
  const qualityDest = path.join(steeringDir, 'quality.md');
  const reviewLogDest = path.join(steeringDir, 'review-log.md');

  if (fs.existsSync(qualitySource)) {
    fs.copyFileSync(qualitySource, qualityDest);
    log('✅ QUALITY.md → .kiro/steering/quality.md', 'green');
  } else {
    log('⚠️  QUALITY.md が見つかりません', 'red');
  }

  if (fs.existsSync(reviewLogSource)) {
    fs.copyFileSync(reviewLogSource, reviewLogDest);
    log('✅ REVIEW_LOG.md → .kiro/steering/review-log.md', 'green');
  } else {
    log('⚠️  REVIEW_LOG.md が見つかりません', 'red');
  }

  // 4. pyproject.toml のプロジェクト名を更新
  log('\n📝 pyproject.toml のプロジェクト名を更新中...', 'yellow');
  const pyprojectPath = path.join(process.cwd(), 'pyproject.toml');

  if (fs.existsSync(pyprojectPath)) {
    let pyprojectContent = fs.readFileSync(pyprojectPath, 'utf8');
    pyprojectContent = pyprojectContent.replace(
      /name = ".*?"/,
      `name = "${projectName}"`
    );
    fs.writeFileSync(pyprojectPath, pyprojectContent);
    log(`✅ プロジェクト名を "${projectName}" に設定しました`, 'green');
  } else {
    log('⚠️  pyproject.toml が見つかりません', 'red');
  }

  // 5. Python 仮想環境の作成
  log('\n🐍 Python 仮想環境を作成中...', 'yellow');
  const venvPath = path.join(process.cwd(), 'venv');

  if (!fs.existsSync(venvPath)) {
    try {
      exec('python3 -m venv venv');
      log('✅ 仮想環境を作成しました', 'green');
    } catch (error) {
      log('⚠️  仮想環境の作成に失敗しました。後で手動で実行してください: python3 -m venv venv', 'yellow');
    }
  } else {
    log('ℹ️  仮想環境は既に存在します', 'blue');
  }

  // 6. 依存関係のインストール
  log('\n📦 依存関係をインストール中...', 'yellow');
  try {
    const activateCommand = process.platform === 'win32'
      ? 'venv\\Scripts\\activate.bat && pip install -e ".[dev]"'
      : 'source venv/bin/activate && pip install -e ".[dev]"';

    exec(`bash -c "${activateCommand}"`, true);
    log('✅ 依存関係をインストールしました', 'green');
  } catch (error) {
    log('⚠️  依存関係のインストールに失敗しました。後で手動で実行してください:', 'yellow');
    log('   source venv/bin/activate && pip install -e ".[dev]"', 'blue');
  }

  // 7. pre-commit のセットアップ
  log('\n🔧 pre-commit をセットアップ中...', 'yellow');
  try {
    exec('bash -c "source venv/bin/activate && pre-commit install"', true);
    log('✅ pre-commit をインストールしました', 'green');
  } catch (error) {
    log('⚠️  pre-commit のインストールに失敗しました。後で手動で実行してください:', 'yellow');
    log('   source venv/bin/activate && pre-commit install', 'blue');
  }

  // 8. Skills を同期
  log('\n🎯 Claude Code Skills を同期中...', 'yellow');
  const skillsSyncScript = path.join(
    process.env.HOME,
    'Desktop',
    'project',
    'skills',
    'sync-skills.sh'
  );

  if (fs.existsSync(skillsSyncScript)) {
    try {
      exec(`bash ${skillsSyncScript}`, true);
      log('✅ Skills を同期しました', 'green');
      log('   - codex-review', 'blue');
      log('   - codex-review-requirements', 'blue');
      log('   - gemini-research', 'blue');
    } catch (error) {
      log('⚠️  Skills の同期に失敗しました。後で手動で実行してください:', 'yellow');
      log(`   bash ${skillsSyncScript}`, 'blue');
    }
  } else {
    log('ℹ️  Skills 同期スクリプトが見つかりません', 'blue');
    log(`   期待されるパス: ${skillsSyncScript}`, 'blue');
  }

  // 完了メッセージ
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'green');
  log('🎉 セットアップ完了！', 'green');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'green');

  log('\n📋 次のステップ:', 'blue');
  log('1. プロジェクトメモリを作成:', 'blue');
  log('   /kiro:steering', 'yellow');
  log('\n2. GitHubにアップロード:', 'blue');
  log('   git init', 'yellow');
  log('   git add .', 'yellow');
  log('   git commit -m "Initial setup"', 'yellow');
  log(`   gh repo create msd-dev-lab/${projectName} --public`, 'yellow');
  log(`   git remote add origin https://github.com/msd-dev-lab/${projectName}.git`, 'yellow');
  log('   git push -u origin main', 'yellow');
  log('\n3. Claude Code Actions をセットアップ:', 'blue');
  log('   claude /install-github-app', 'yellow');
  log('');
}

setup().catch(error => {
  log(`\n❌ エラーが発生しました: ${error.message}`, 'red');
  process.exit(1);
});
