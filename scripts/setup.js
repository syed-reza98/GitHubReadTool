#!/usr/bin/env node

/**
 * Resume Builder Setup Script
 * 
 * Helps users set up the interactive resume builder with proper environment
 * configuration and validates GitHub Models integration.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SetupWizard {
  constructor() {
    this.envPath = path.join(__dirname, '..', '.env');
    this.projectRoot = path.join(__dirname, '..');
  }

  async run() {
    console.log('🚀 GitHubReadTool Resume Builder Setup');
    console.log('=====================================\n');

    await this.checkNodeVersion();
    await this.setupEnvironment();
    await this.validateDirectories();
    await this.installDependencies();
    await this.testConfiguration();
    
    console.log('\n✅ Setup completed successfully!');
    console.log('\n📚 Next Steps:');
    console.log('1. Start the server: npm start');
    console.log('2. Open http://localhost:3000 in your browser');
    console.log('3. Click "Open Resume Builder" to start creating tailored resumes');
    console.log('\n🔧 For development: npm run dev (auto-restart on changes)');
  }

  async checkNodeVersion() {
    console.log('🔍 Checking Node.js version...');
    const version = process.version;
    const majorVersion = parseInt(version.slice(1).split('.')[0]);
    
    if (majorVersion < 18) {
      console.error(`❌ Node.js 18+ required, found ${version}`);
      console.error('Please update Node.js: https://nodejs.org/');
      process.exit(1);
    }
    
    console.log(`✅ Node.js ${version} (OK)\n`);
  }

  async setupEnvironment() {
    console.log('⚙️ Setting up environment configuration...');
    
    if (fs.existsSync(this.envPath)) {
      console.log('✅ .env file already exists\n');
      return;
    }

    const envTemplate = `# GitHubReadTool Resume Builder Configuration

# GitHub Models API Configuration (Required for AI features)
GITHUB_MODELS_TOKEN=your_github_models_token_here
MODEL_ENDPOINT=https://models.inference.ai.azure.com
DEFAULT_MODEL=gpt-4

# GitHub API Configuration (Required for project data)
GITHUB_TOKEN=your_github_token_here

# Server Configuration
PORT=3000
NODE_ENV=development

# Resume Configuration
MAX_PROJECTS=8
DEFAULT_TEMPERATURE=0.7
MAX_TOKENS=2000

# Instructions:
# 1. Get GitHub Models token from: https://github.com/marketplace/models
# 2. Get GitHub token from: https://github.com/settings/tokens
# 3. Replace the token placeholders above
# 4. Save this file and restart the server
`;

    fs.writeFileSync(this.envPath, envTemplate);
    console.log('📝 Created .env file with configuration template');
    console.log('⚠️  Please edit .env and add your API tokens before starting the server\n');
  }

  async validateDirectories() {
    console.log('📁 Validating directory structure...');
    
    const requiredDirs = [
      'docs/content/github-models',
      'docs/projects',
      'models',
      'images'
    ];

    for (const dir of requiredDirs) {
      const fullPath = path.join(this.projectRoot, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`📂 Created directory: ${dir}`);
      }
    }

    console.log('✅ Directory structure validated\n');
  }

  async installDependencies() {
    console.log('📦 Installing dependencies...');
    
    try {
      const { execSync } = await import('child_process');
      execSync('npm install', { 
        stdio: 'inherit', 
        cwd: this.projectRoot 
      });
      console.log('✅ Dependencies installed successfully\n');
    } catch (error) {
      console.log('⚠️  Please run "npm install" manually\n');
    }
  }

  async testConfiguration() {
    console.log('🔧 Testing configuration...');
    
    // Check if critical files exist
    const criticalFiles = [
      'interactive-resume-builder.html',
      'resume-server.js',
      'models/github-models.js',
      'docs/user-profile.json'
    ];

    let allFilesPresent = true;
    for (const file of criticalFiles) {
      const fullPath = path.join(this.projectRoot, file);
      if (!fs.existsSync(fullPath)) {
        console.log(`❌ Missing file: ${file}`);
        allFilesPresent = false;
      }
    }

    if (allFilesPresent) {
      console.log('✅ All critical files present');
    }

    // Check environment variables
    if (fs.existsSync(this.envPath)) {
      const envContent = fs.readFileSync(this.envPath, 'utf8');
      
      const hasGithubModelsToken = !envContent.includes('GITHUB_MODELS_TOKEN=your_github_models_token_here');
      const hasGithubToken = !envContent.includes('GITHUB_TOKEN=your_github_token_here');

      if (!hasGithubModelsToken) {
        console.log('⚠️  GitHub Models token not configured - AI features will not work');
      }
      
      if (!hasGithubToken) {
        console.log('⚠️  GitHub token not configured - project data may be limited');
      }

      if (hasGithubModelsToken && hasGithubToken) {
        console.log('✅ Environment tokens configured');
      }
    }

    console.log('');
  }

  static showHelp() {
    console.log(`
GitHubReadTool Resume Builder Setup

Usage:
  node scripts/setup.js                 Run interactive setup
  node scripts/setup.js --help          Show this help

Features:
  - Interactive resume builder with AI assistance
  - Job description-based resume tailoring
  - Conversational editing with GitHub Models
  - Professional A4 PDF export
  - Integration with GitHub project portfolio

Requirements:
  - Node.js 18+
  - GitHub Models API token (for AI features)
  - GitHub API token (for project data)

For more information, visit:
  https://github.com/syed-reza98/GitHubReadTool
`);
  }
}

// Run setup if called directly
if (process.argv[1] === __filename) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    SetupWizard.showHelp();
  } else {
    const setup = new SetupWizard();
    setup.run().catch(error => {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    });
  }
}

export default SetupWizard;