#!/usr/bin/env node
// Minimal Node.js GitHub repo-to-markdown generator
// Usage: node scripts/generate_docs.js --user <github-username> [--out docs/projects] [--limit N]

import fs from 'fs';
import path from 'path';
import https from 'https';

function usage() {
  console.log('Usage: node scripts/generate_docs.js --user <github-username> [--out docs/projects] [--limit N]');
  console.log('Requires GITHUB_TOKEN env var for higher rate limits (optional for public repos).');
}

const args = process.argv.slice(2);
if (args.includes('--help') || args.length === 0) {
  usage();
  process.exit(0);
}

let user = null; let outDir = 'docs/projects'; let limit = 10;
for (let i=0;i<args.length;i++){
  if (args[i]==='--user') user = args[++i];
  if (args[i]==='--out') outDir = args[++i];
  if (args[i]==='--limit') limit = Number(args[++i]);
}

if (!user) {
  console.error('Missing --user argument');
  usage();
  process.exit(1);
}

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || null;

function ghGet(pathname) {
  const options = {
    hostname: 'api.github.com',
    path: pathname,
    method: 'GET',
    headers: { 'User-Agent': 'githubreadtool' }
  };
  if (GITHUB_TOKEN) options.headers['Authorization'] = `token ${GITHUB_TOKEN}`;

  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(JSON.parse(data)); }
          catch(e){ reject(e); }
        } else {
          reject(new Error(`GitHub API ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  try {
    console.log(`Fetching public repos for ${user}...`);
    const repos = await ghGet(`/users/${user}/repos?per_page=${limit}&sort=updated`);
    for (const r of repos) {
      const name = r.name;
      console.log(`- Processing ${name} (${r.language || 'unknown'})`);
      // Get README (may 404)
      let readme = '';
      try {
        const rd = await ghGet(`/repos/${user}/${name}/readme`);
        // readme.content is base64
        readme = Buffer.from(rd.content, 'base64').toString('utf8');
      } catch(e) {
        // ignore
      }

      // build summary from repo metadata + readme first paragraph
      const shortDesc = r.description || (readme.split('\n').find(l => l.trim().length>0) || 'No description');
      const filename = name.toLowerCase().replace(/[^a-z0-9-]/g,'-') + '.md';
      const out = path.join(outDir, filename);
      const md = [];
      md.push(`# ${name}\n`);
      md.push('Overview\n\n');
      md.push(`${shortDesc}\n\n`);
      md.push('Code & Notes\n\n');
      md.push(`- GitHub: https://github.com/${user}/${name}\n`);
      md.push(`- Primary language: ${r.language || 'unknown'}\n`);
      md.push('\nArchitecture\n\n');
      md.push('- See README or repo files for architecture specifics.\n\n');
      md.push('Tech stack\n\n');
      md.push(`- Detected via GitHub metadata: ${r.language || 'unknown'}\n\n`);
      md.push('Status\n\n');
      md.push(`- Last pushed: ${r.pushed_at}\n\n`);
      md.push('Notes/Usage\n\n');
      md.push('- Add usage and run instructions here by inspecting repo.\n');

      fs.writeFileSync(out, md.join('\n'));
      console.log(`  -> wrote ${out}`);
    }
    console.log('Done.');
  } catch (e) {
    console.error('Error:', e.message || e);
    process.exitCode = 2;
  }
}

run();
