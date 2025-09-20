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

let user = null; let outDir = 'docs/projects'; let limit = 0; // 0 = no limit, fetch all
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
    headers: { 'User-Agent': 'githubreadtool', 'Accept': 'application/vnd.github.v3+json' }
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
        } else if (res.statusCode === 404) {
          resolve(null);
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
    let repos = [];
    console.log(`Fetching repositories for ${user}...`);

    // If a token is present, try to detect authenticated user and use /user/repos to include private/collaborator repos.
    let authUser = null;
    if (GITHUB_TOKEN) {
      const me = await ghGet(`/user`);
      if (me && me.login) {
        authUser = me.login;
        console.log(`Authenticated as ${authUser}`);
      }
    }

    // If authenticated and requested user matches auth user, fetch /user/repos with affiliation to include owner/collaborator/org repos.
    if (GITHUB_TOKEN && authUser && authUser.toLowerCase() === user.toLowerCase()) {
      // paginate until we have all repos (remove limit for comprehensive fetch)
      let page = 1;
      let allRepos = [];
      while (true) {
        const batch = await ghGet(`/user/repos?per_page=100&page=${page}&affiliation=owner,collaborator,organization_member&sort=updated`);
        if (!batch || batch.length === 0) break;
        allRepos = allRepos.concat(batch);
        page++;
        if (batch.length < 100) break; // last page
      }
      repos = allRepos;
    } else {
      // fallback: fetch public repos for the given user (may be unauthenticated)
      let page = 1;
      let allRepos = [];
      while (true) {
        const batch = await ghGet(`/users/${user}/repos?per_page=100&page=${page}&sort=updated`);
        if (!batch || batch.length === 0) break;
        allRepos = allRepos.concat(batch);
        page++;
        if (batch.length < 100) break; // last page
      }
      repos = allRepos;
    }

    // Filter out repositories without meaningful code contributions
    console.log(`Found ${repos.length} repositories. Filtering...`);
    const filteredRepos = [];
    
    for (const repo of repos) {
      // Skip forks unless they have commits from the user
      if (repo.fork) {
        try {
          const commits = await ghGet(`/repos/${repo.owner.login}/${repo.name}/commits?author=${user}&per_page=1`);
          if (!commits || commits.length === 0) {
            console.log(`  - Skipping fork ${repo.name} (no commits by ${user})`);
            continue;
          }
        } catch (e) {
          console.log(`  - Skipping fork ${repo.name} (cannot check commits)`);
          continue;
        }
      }

      // Skip repositories with no code (documentation only, etc.)
      if (repo.size === 0 || (!repo.language && repo.size < 100)) {
        console.log(`  - Skipping ${repo.name} (no significant code)`);
        continue;
      }

      // Skip archived repositories unless they're significant
      if (repo.archived && repo.stargazers_count < 5) {
        console.log(`  - Skipping archived ${repo.name} (low significance)`);
        continue;
      }

      filteredRepos.push(repo);
    }

    repos = limit > 0 ? filteredRepos.slice(0, limit) : filteredRepos;
    console.log(`Processing ${repos.length} repositories with code contributions...`);

    for (const r of repos) {
      const name = r.name;
      const repoOwner = r.owner.login;
      console.log(`- Processing ${name} (${r.language || 'unknown'})`);
      
      // Get README (may 404)
      let readme = '';
      let readmeLines = [];
      try {
        const rd = await ghGet(`/repos/${repoOwner}/${name}/readme`);
        if (rd && rd.content) {
          // readme.content is base64
          readme = Buffer.from(rd.content, 'base64').toString('utf8');
          readmeLines = readme.split('\n').filter(l => l.trim().length > 0);
        }
      } catch(e) {
        // ignore
      }

      // Get detailed language breakdown
      let languages = {};
      let primaryLang = r.language || 'unknown';
      try {
        const langs = await ghGet(`/repos/${repoOwner}/${name}/languages`);
        if (langs && Object.keys(langs).length > 0) {
          languages = langs;
          primaryLang = Object.keys(langs).sort((a,b)=>langs[b]-langs[a])[0];
        }
      } catch(e) {}

      // Get repository statistics
      let stats = {
        commits: 0,
        contributors: 0,
        stars: r.stargazers_count || 0,
        forks: r.forks_count || 0
      };

      try {
        const contributors = await ghGet(`/repos/${repoOwner}/${name}/contributors`);
        if (contributors) stats.contributors = contributors.length;
      } catch(e) {}

      // Build enhanced description
      const shortDesc = r.description || (readmeLines[0] || 'No description');
      const filename = name.toLowerCase().replace(/[^a-z0-9-]/g,'-') + '.md';
      const out = path.join(outDir, filename);
      const md = [];
      
      md.push(`# ${name}\n`);
      md.push('## Overview\n\n');
      md.push(`${shortDesc}\n\n`);
      
      if (readmeLines.length > 1) {
        // Add first few lines of README as extended description
        const description = readmeLines.slice(1, 4).join('\n');
        if (description.trim()) {
          md.push(`${description}\n\n`);
        }
      }

      md.push('## Code & Repository\n\n');
      md.push(`- **GitHub:** https://github.com/${repoOwner}/${name}\n`);
      md.push(`- **Primary Language:** ${primaryLang}\n`);
      
      if (Object.keys(languages).length > 1) {
        const langBreakdown = Object.entries(languages)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([lang, bytes]) => {
            const total = Object.values(languages).reduce((sum, b) => sum + b, 0);
            const percent = ((bytes / total) * 100).toFixed(1);
            return `${lang} (${percent}%)`;
          })
          .join(', ');
        md.push(`- **Languages:** ${langBreakdown}\n`);
      }

      if (stats.stars > 0 || stats.forks > 0) {
        md.push(`- **Stats:** ⭐ ${stats.stars} stars, 🍴 ${stats.forks} forks\n`);
      }

      md.push(`- **Last Updated:** ${new Date(r.pushed_at).toLocaleDateString()}\n`);
      md.push(`- **Repository Size:** ~${Math.round((r.size || 0) / 1024)}MB\n`);

      md.push('\n## Architecture & Tech Stack\n\n');
      
      // Detect framework/tech stack from languages and repo structure
      const techStack = [];
      if (languages.JavaScript || languages.TypeScript) {
        if (name.includes('next') || name.includes('react')) techStack.push('React/Next.js');
        else if (name.includes('vue') || name.includes('nuxt')) techStack.push('Vue.js/Nuxt.js');
        else techStack.push('JavaScript/Node.js');
      }
      if (languages.PHP) {
        if (name.includes('laravel') || readme.toLowerCase().includes('laravel')) techStack.push('Laravel Framework');
        else techStack.push('PHP');
      }
      if (languages.Python) {
        if (readme.toLowerCase().includes('flask')) techStack.push('Flask Framework');
        else if (readme.toLowerCase().includes('django')) techStack.push('Django Framework');
        else techStack.push('Python');
      }
      if (languages.C || languages['C++']) techStack.push('C/C++');
      
      if (techStack.length > 0) {
        md.push(`- **Technology Stack:** ${techStack.join(', ')}\n`);
      }
      
      md.push(`- **Architecture:** ${readme.toLowerCase().includes('microservice') ? 'Microservices' : readme.toLowerCase().includes('api') ? 'REST API' : 'Monolithic Application'}\n`);

      md.push('\n## Project Status\n\n');
      md.push(`- **Status:** ${r.archived ? '🔒 Archived' : '✅ Active'}\n`);
      md.push(`- **Visibility:** ${r.private ? '🔐 Private' : '🌐 Public'}\n`);
      if (r.homepage) {
        md.push(`- **Live Demo:** [${r.homepage}](${r.homepage})\n`);
      }

      md.push('\n## Development Notes\n\n');
      
      // Extract setup/usage instructions from README if available
      if (readme) {
        const setupSection = readme.match(/(?:## Installation|## Setup|## Getting Started|## Usage)([\s\S]*?)(?=##|$)/i);
        if (setupSection) {
          const setupText = setupSection[1].trim().substring(0, 300);
          if (setupText) {
            md.push(`${setupText}${setupText.length === 300 ? '...' : ''}\n\n`);
          }
        }
      }
      
      md.push(`- For detailed setup instructions, refer to the [repository README](https://github.com/${repoOwner}/${name}#readme)\n`);
      md.push(`- Contributing guidelines and project documentation available in the repository\n`);

      fs.writeFileSync(out, md.join(''));
      console.log(`  -> wrote ${out}`);
    }
    console.log('Done.');
  } catch (e) {
    console.error('Error:', e.message || e);
    process.exitCode = 2;
  }
}

run();
