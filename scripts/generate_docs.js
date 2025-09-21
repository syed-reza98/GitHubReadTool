#!/usr/bin/env node
// Minimal Node.js GitHub repo-to-markdown generator
// Usage: node scripts/generate_docs.js --user <github-username> [--out docs/projects] [--limit N]

import fs from 'fs';
import path from 'path';
import https from 'https';

function usage() {
  console.log('Usage: node scripts/generate_docs.js --user <github-username> [--out docs/projects] [--limit N]');
  console.log('Requires GITHUB_REPO_TOKEN or GITHUB_TOKEN env var for higher rate limits (optional for public repos).');
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

const GITHUB_REPO_TOKEN = process.env.GITHUB_REPO_TOKEN || process.env.GITHUB_TOKEN || null;

function ghGet(pathname, retries = 3) {
  const options = {
    hostname: 'api.github.com',
    path: pathname,
    method: 'GET',
    headers: { 
      'User-Agent': 'githubreadtool', 
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  };
  if (GITHUB_REPO_TOKEN) options.headers['Authorization'] = `Bearer ${GITHUB_REPO_TOKEN}`;

  return new Promise((resolve, reject) => {
    const makeRequest = (attempt) => {
      const req = https.request(options, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try { 
              const result = JSON.parse(data);
              resolve(result); 
            }
            catch(e){ 
              console.error(`JSON parse error for ${pathname}:`, e.message);
              reject(e); 
            }
          } else if (res.statusCode === 404) {
            resolve(null);
          } else if (res.statusCode >= 500 && attempt < retries) {
            console.log(`Server error ${res.statusCode} for ${pathname}, retrying... (${attempt}/${retries})`);
            setTimeout(() => makeRequest(attempt + 1), 1000 * attempt);
          } else {
            const error = new Error(`GitHub API ${res.statusCode}: ${data}`);
            console.error(`API Error for ${pathname}:`, error.message);
            reject(error);
          }
        });
      });
      req.on('error', (error) => {
        if (attempt < retries) {
          console.log(`Network error for ${pathname}, retrying... (${attempt}/${retries})`);
          setTimeout(() => makeRequest(attempt + 1), 1000 * attempt);
        } else {
          console.error(`Network error for ${pathname}:`, error.message);
          reject(error);
        }
      });
      req.setTimeout(30000); // 30 second timeout
      req.end();
    };
    
    makeRequest(1);
  });
}

async function run() {
  try {
    let repos = [];
    console.log(`Fetching repositories for ${user}...`);

    // If a token is present, try to detect authenticated user and use /user/repos to include private/collaborator repos.
    let authUser = null;
    if (GITHUB_REPO_TOKEN) {
      try {
        const me = await ghGet(`/user`);
        if (me && me.login) {
          authUser = me.login;
          console.log(`Authenticated as ${authUser}`);
        }
      } catch (e) {
        console.warn('Authentication check failed, continuing with public repos only');
      }
    }

    // If authenticated and requested user matches auth user, fetch /user/repos with affiliation to include owner/collaborator/org repos.
    if (GITHUB_REPO_TOKEN && authUser && authUser.toLowerCase() === user.toLowerCase()) {
      console.log('Fetching all repositories (public + private)...');
      let page = 1;
      let allRepos = [];
      while (true) {
        try {
          const batch = await ghGet(`/user/repos?per_page=100&page=${page}&affiliation=owner,collaborator,organization_member&sort=updated`);
          if (!batch || batch.length === 0) break;
          allRepos = allRepos.concat(batch);
          console.log(`  - Fetched page ${page}: ${batch.length} repositories`);
          page++;
          if (batch.length < 100) break; // last page
        } catch (e) {
          console.error(`Error fetching page ${page}:`, e.message);
          break;
        }
      }
      repos = allRepos;
    } else {
      console.log('Fetching public repositories only...');
      let page = 1;
      let allRepos = [];
      while (true) {
        try {
          const batch = await ghGet(`/users/${user}/repos?per_page=100&page=${page}&sort=updated`);
          if (!batch || batch.length === 0) break;
          allRepos = allRepos.concat(batch);
          console.log(`  - Fetched page ${page}: ${batch.length} repositories`);
          page++;
          if (batch.length < 100) break; // last page
        } catch (e) {
          console.error(`Error fetching page ${page}:`, e.message);
          break;
        }
      }
      repos = allRepos;
    }

    // Enhanced filtering for repositories without meaningful code contributions
    console.log(`Found ${repos.length} repositories. Applying enhanced filtering...`);
    const filteredRepos = [];
    
    for (const repo of repos) {
      // Skip forks unless they have commits from the user
      if (repo.fork) {
        try {
          const commits = await ghGet(`/repos/${repo.owner.login}/${repo.name}/commits?author=${user}&per_page=1`);
          if (!commits || commits.length === 0) {
            console.log(`  - Skipping fork ${repo.name} (no commits by ${user})`);
            continue;
          } else {
            console.log(`  - Including fork ${repo.name} (has commits by ${user})`);
          }
        } catch (e) {
          console.log(`  - Skipping fork ${repo.name} (cannot verify commits: ${e.message})`);
          continue;
        }
      }

      // Skip repositories with no meaningful code content
      if (repo.size === 0) {
        console.log(`  - Skipping ${repo.name} (empty repository)`);
        continue;
      }

      // Skip repositories that are likely documentation-only or have minimal content
      if (!repo.language && repo.size < 100) {
        console.log(`  - Skipping ${repo.name} (no primary language, size < 100KB)`);
        continue;
      }

      // Skip archived repositories unless they have significant community engagement
      if (repo.archived && (repo.stargazers_count || 0) < 5 && (repo.forks_count || 0) < 2) {
        console.log(`  - Skipping archived ${repo.name} (low significance: ${repo.stargazers_count || 0} stars, ${repo.forks_count || 0} forks)`);
        continue;
      }

      // Additional check for repositories that might be templates or boilerplate
      const suspiciousNames = ['template', 'boilerplate', 'starter', 'scaffold', 'example'];
      const isSuspicious = suspiciousNames.some(name => 
        repo.name.toLowerCase().includes(name) || 
        (repo.description && repo.description.toLowerCase().includes(name))
      );
      
      if (isSuspicious && (repo.stargazers_count || 0) < 3) {
        console.log(`  - Skipping ${repo.name} (appears to be template/boilerplate with low engagement)`);
        continue;
      }

      console.log(`  ✓ Including ${repo.name} (${repo.language || 'mixed'}, ${repo.size}KB, ${repo.stargazers_count || 0} stars)`);
      filteredRepos.push(repo);
    }

    repos = limit > 0 ? filteredRepos.slice(0, limit) : filteredRepos;
    console.log(`\nProcessing ${repos.length} repositories with meaningful code contributions...`);

    const processedRepos = [];
    for (const r of repos) {
      const name = r.name;
      const repoOwner = r.owner.login;
      console.log(`\n📝 Processing ${name} (${r.language || 'unknown'})...`);
      
      // Get README with better error handling
      let readme = '';
      let readmeLines = [];
      try {
        const rd = await ghGet(`/repos/${repoOwner}/${name}/readme`);
        if (rd && rd.content) {
          readme = Buffer.from(rd.content, 'base64').toString('utf8');
          readmeLines = readme.split('\n').filter(line => line.trim().length > 0);
          console.log(`  - README found (${readmeLines.length} lines)`);
        } else {
          console.log(`  - No README found`);
        }
      } catch (e) {
        console.log(`  - README fetch failed: ${e.message}`);
      }

      // Get detailed language breakdown with error handling
      let languages = {};
      let primaryLang = r.language || 'unknown';
      try {
        const langs = await ghGet(`/repos/${repoOwner}/${name}/languages`);
        if (langs && Object.keys(langs).length > 0) {
          languages = langs;
          primaryLang = Object.keys(langs).sort((a,b) => langs[b] - langs[a])[0];
          console.log(`  - Languages detected: ${Object.keys(langs).join(', ')}`);
        }
      } catch (e) {
        console.log(`  - Language detection failed: ${e.message}`);
      }

      // Get repository statistics with better error handling
      let stats = {
        commits: 0,
        contributors: 0,
        stars: r.stargazers_count || 0,
        forks: r.forks_count || 0
      };

      try {
        const contributors = await ghGet(`/repos/${repoOwner}/${name}/contributors`);
        if (contributors && Array.isArray(contributors)) {
          stats.contributors = contributors.length;
          console.log(`  - Contributors: ${stats.contributors}`);
        }
      } catch (e) {
        console.log(`  - Contributors fetch failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }

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
          .sort(([,a], [,b]) => Number(b) - Number(a))
          .slice(0, 5)
          .map(([lang, bytes]) => {
            const total = Object.values(languages).reduce((sum, b) => sum + Number(b), 0);
            const percent = ((Number(bytes) / total) * 100).toFixed(1);
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
      
      // Enhanced framework/tech stack detection with safer property access
      const techStack = [];
      const hasLanguage = (lang) => languages.hasOwnProperty(lang);
      
      if (hasLanguage('JavaScript') || hasLanguage('TypeScript')) {
        if (name.includes('next') || name.includes('react') || readme.toLowerCase().includes('next.js') || readme.toLowerCase().includes('react')) {
          techStack.push('React/Next.js');
        } else if (name.includes('vue') || name.includes('nuxt') || readme.toLowerCase().includes('vue') || readme.toLowerCase().includes('nuxt')) {
          techStack.push('Vue.js/Nuxt.js');
        } else {
          techStack.push('JavaScript/Node.js');
        }
      }
      
      if (hasLanguage('PHP')) {
        if (name.includes('laravel') || readme.toLowerCase().includes('laravel')) {
          techStack.push('Laravel Framework');
        } else {
          techStack.push('PHP');
        }
      }
      
      if (hasLanguage('Python')) {
        if (readme.toLowerCase().includes('flask')) {
          techStack.push('Flask Framework');
        } else if (readme.toLowerCase().includes('django')) {
          techStack.push('Django Framework');
        } else if (readme.toLowerCase().includes('fastapi')) {
          techStack.push('FastAPI');
        } else {
          techStack.push('Python');
        }
      }
      
      if (hasLanguage('C') || hasLanguage('C++')) {
        techStack.push('C/C++');
      }
      
      if (hasLanguage('Java')) {
        if (readme.toLowerCase().includes('spring')) {
          techStack.push('Java/Spring');
        } else {
          techStack.push('Java');
        }
      }
      
      if (hasLanguage('Go')) {
        techStack.push('Go');
      }
      
      if (hasLanguage('Rust')) {
        techStack.push('Rust');
      }
      
      if (techStack.length > 0) {
        md.push(`- **Technology Stack:** ${techStack.join(', ')}\n`);
      }
      
      // Enhanced architecture detection
      let architecture = 'Monolithic Application';
      const readmeLower = readme.toLowerCase();
      if (readmeLower.includes('microservice') || readmeLower.includes('micro-service')) {
        architecture = 'Microservices';
      } else if (readmeLower.includes('api') || readmeLower.includes('rest') || readmeLower.includes('graphql')) {
        architecture = 'REST API';
      } else if (readmeLower.includes('serverless') || readmeLower.includes('lambda')) {
        architecture = 'Serverless';
      } else if (readmeLower.includes('spa') || readmeLower.includes('single page')) {
        architecture = 'Single Page Application';
      }
      
      md.push(`- **Architecture:** ${architecture}\n`);

      md.push('\n## Project Status\n\n');
      md.push(`- **Status:** ${r.archived ? '🔒 Archived' : '✅ Active'}\n`);
      md.push(`- **Visibility:** ${r.private ? '🔐 Private' : '🌐 Public'}\n`);
      if (r.homepage) {
        md.push(`- **Live Demo:** [${r.homepage}](${r.homepage})\n`);
      }

      md.push('\n## Development Notes\n\n');
      
      // Extract setup/usage instructions from README if available
      if (readme) {
        const setupSection = readme.match(/(?:## Installation|## Setup|## Getting Started|## Usage|## Quick Start)([\s\S]*?)(?=##|$)/i);
        if (setupSection) {
          const setupText = setupSection[1].trim().substring(0, 400);
          if (setupText) {
            md.push(`${setupText}${setupText.length === 400 ? '...' : ''}\n\n`);
          }
        }
      }
      
      md.push(`- For detailed setup instructions, refer to the [repository README](https://github.com/${repoOwner}/${name}#readme)\n`);
      md.push(`- Contributing guidelines and project documentation available in the repository\n`);

      // Write the markdown file
      try {
        fs.writeFileSync(out, md.join(''));
        console.log(`  ✅ Generated: ${out}`);
        processedRepos.push({ name, file: out, stats });
      } catch (e) {
        console.error(`  ❌ Failed to write ${out}:`, e instanceof Error ? e.message : 'Unknown error');
      }
    }
    
    // Summary
    console.log(`\n🎉 Documentation generation complete!`);
    console.log(`📊 Summary:`);
    console.log(`  - Total repositories found: ${repos.length + (filteredRepos.length - repos.length)}`);
    console.log(`  - Repositories with meaningful contributions: ${filteredRepos.length}`);
    console.log(`  - Documentation files generated: ${processedRepos.length}`);
    console.log(`  - Output directory: ${outDir}`);
    
    if (processedRepos.length > 0) {
      console.log(`\n📁 Generated files:`);
      processedRepos.forEach(repo => {
        console.log(`  - ${repo.file} (${repo.stats.stars} ⭐, ${repo.stats.forks} 🍴)`);
      });
    }
    
  } catch (e) {
    console.error('\n❌ Fatal error:', e instanceof Error ? e.message : 'Unknown error');
    if (e instanceof Error && e.stack) {
      console.error('Stack trace:', e.stack);
    }
    process.exitCode = 2;
  }
}

run();
