#!/usr/bin/env node

/**
 * Node.js Version Checker
 * Ensures the required Node.js version is available
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json to get required Node version
const packagePath = path.join(__dirname, '..', 'package.json');
const packageContent = fs.readFileSync(packagePath, 'utf-8');
const packageJson = JSON.parse(packageContent);

const requiredVersion = packageJson.engines.node.replace('>=', '');
const currentVersion = process.version.replace('v', '');

function compareVersions(current, required) {
  const currentParts = current.split('.').map(Number);
  const requiredParts = required.split('.').map(Number);
  
  for (let i = 0; i < Math.max(currentParts.length, requiredParts.length); i++) {
    const currentPart = currentParts[i] || 0;
    const requiredPart = requiredParts[i] || 0;
    
    if (currentPart > requiredPart) return 1;
    if (currentPart < requiredPart) return -1;
  }
  return 0;
}

if (compareVersions(currentVersion, requiredVersion) < 0) {
  console.error(`❌ Node.js version ${requiredVersion}+ is required. You are using v${currentVersion}.`);
  console.error(`Please upgrade your Node.js version and try again.`);
  console.error(`Visit https://nodejs.org/ to download the latest version.`);
  process.exit(1);
}

console.log(`✅ Node.js version v${currentVersion} meets the requirement (>=${requiredVersion})`);