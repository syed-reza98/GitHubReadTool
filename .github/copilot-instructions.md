This repository is a comprehensive GitHub portfolio and resume generator that fetches repository data, filters for meaningful contributions, and generates professional documentation.

## Architecture & Core Components

**Data Flow**: GitHub API → Smart Filtering → Markdown Generation → Resume Integration
- `scripts/generate_docs.js` — Main automation engine (Node.js, dependency-free)
- `docs/projects/` — Auto-generated project summaries (18 files from 37 repos)
- Resume files — Multiple optimized versions for web/PDF viewing
- `README.md` — Documentation hub with usage examples and stats

**Smart Filtering System**: The core differentiator is intelligent repository filtering:
- Fetches ALL repos (public/private) using GitHub API pagination
- Excludes forks without user commits via `/repos/{owner}/{repo}/commits?author={user}`
- Filters out empty repos (size=0 or no primary language + size<100KB)
- Skips archived repos unless significant (stargazers_count >= 5)
- Results: 37 total repos → 18 with meaningful code contributions

## Key Workflows

**Generate Documentation** (primary workflow):
```bash
# Windows setup
set GITHUB_TOKEN=ghp_your_token_here
node scripts/generate_docs.js --user syed-reza98 --out docs/projects

# Output: Fetches 37 repos → Filters to 18 → Generates markdown files
```

**Authentication Strategy**: 
- Detects auth user via `/user` endpoint
- Uses `/user/repos?affiliation=owner,collaborator,organization_member` for authenticated requests
- Falls back to `/users/{username}/repos` for public-only access
- Handles rate limiting with token-based auth

## Project-Specific Patterns

**Markdown Structure** (follow exactly for consistency):
```markdown
# {repo-name}
## Overview
{description + README excerpt}
## Code & Repository
- **GitHub:** https://github.com/{owner}/{name}
- **Primary Language:** {detected language}
- **Languages:** {percentage breakdown}
- **Stats:** ⭐ X stars, 🍴 Y forks (if > 0)
## Architecture & Tech Stack
- **Technology Stack:** {auto-detected frameworks}
- **Architecture:** {Microservices|REST API|Monolithic Application}
## Project Status  
- **Status:** {✅ Active|🔒 Archived}
- **Visibility:** {🌐 Public|🔐 Private}
## Development Notes
```

**Tech Stack Detection Logic** (in generate_docs.js):
- JavaScript/TypeScript → infer React/Next.js, Vue.js/Nuxt.js from names/README
- PHP → detect Laravel from name/README content
- Python → detect Flask/Django from README content
- Architecture: detect "microservice" or "api" keywords for classification

**Resume Integration Patterns**:
- Web version: `SyedSalmanRezaResume_Professional.html` (responsive design)
- PDF version: `SyedSalmanRezaResume_PDF.html` (A4 optimization, print media queries)
- Project cards link to `docs/projects/{kebab-case-name}.md`
- Keep project counts in sync (currently: 18 documented projects)

## GitHub API Integration Points

**Rate Limiting**: Uses token for 5000 req/hr vs 60 req/hr unauthenticated
**Endpoints Used**:
- `/user` — detect authenticated user
- `/user/repos` — comprehensive repo list with private access
- `/users/{username}/repos` — fallback for public repos
- `/repos/{owner}/{repo}/readme` — extract project descriptions
- `/repos/{owner}/{repo}/languages` — language percentage breakdown
- `/repos/{owner}/{repo}/contributors` — contributor stats
- `/repos/{owner}/{repo}/commits?author={user}` — verify user contributions in forks

**Error Handling**: 404s are expected (private repos, missing READMEs) - script continues processing

## Development Conventions

**Filename Generation**: `name.toLowerCase().replace(/[^a-z0-9-]/g,'-') + '.md'`
**Non-invasive HTML edits**: Add project links, avoid CSS/layout changes in resume files
**Dependency-free approach**: Uses Node.js built-ins (https, fs, path) for portability

## Resume Content Update Guidelines

**Project Information to Highlight** (for HTML resume updates):
- **Business Impact Metrics**: User count, performance improvements, uptime statistics
- **Technical Achievements**: Architecture decisions, scalability solutions, optimization results  
- **Problem-Solving Examples**: Specific challenges overcome, innovative approaches used
- **Leadership & Collaboration**: Team size, cross-functional work, mentoring contributions
- **Technology Expertise**: Framework mastery, integration complexity, deployment sophistication

**Resume Project Card Structure** (maintain this format):
```html
<div class="project-card">
    <h3>{Descriptive Project Name}</h3>
    <span class="project-tech">{Key Technologies}</span>
    <p>{Business impact + technical achievement in 1-2 sentences}</p>
    <div class="project-links">
        <a href="{live-url}">Live Demo</a> <!-- if available -->
        <a href="docs/projects/{kebab-case-name}.md">Details</a>
    </div>
</div>
```

**Content Prioritization Rules**:
1. **Commercial/Professional Projects** → Emphasize business value, scale, reliability
2. **Technical Innovation** → Highlight novel approaches, performance gains, complexity handled
3. **Open Source Contributions** → Focus on community impact, adoption, technical depth
4. **Learning Projects** → Showcase technology mastery, architecture understanding

## Project Category Patterns

**🚀 Web Applications & APIs** (Laravel, React, Vue.js):
- **Markdown Focus**: User authentication, database design, API endpoints, deployment architecture
- **Resume Emphasis**: "Serves X users", "handles Y requests/day", "99.9% uptime", "integrated with Z services"
- **Tech Stack Details**: Framework version, database optimization, caching strategy, cloud deployment
- **Example**: `saas-ecom` → Multi-tenant architecture, payment integration, inventory management

**🤖 Machine Learning & AI** (Python, TensorFlow, Computer Vision):
- **Markdown Focus**: Dataset details, model architecture, accuracy metrics, inference pipeline
- **Resume Emphasis**: "Achieves X% accuracy", "processes Y images/second", "deployed at scale"
- **Tech Stack Details**: ML frameworks, data preprocessing, model optimization, deployment platform
- **Example**: `real-time-motorbike-helmet-detection` → YOLO implementation, Roboflow integration, real-time processing

**🔧 System Tools & Embedded** (C/C++, Embedded Systems):
- **Markdown Focus**: Hardware constraints, resource optimization, protocol implementation, performance characteristics
- **Resume Emphasis**: "Optimized for X memory usage", "handles Y concurrent operations", "real-time performance"
- **Tech Stack Details**: Hardware platform, communication protocols, optimization techniques, testing methodology
- **Example**: `SR600Mini` → Dual-screen POS firmware, embedded constraints, transaction processing

**🎨 Frontend & User Experience** (TypeScript, Next.js, Vue.js):
- **Markdown Focus**: User experience features, responsive design, performance optimization, accessibility
- **Resume Emphasis**: "Supports X languages", "mobile-first design", "accessible to Y user types"
- **Tech Stack Details**: Framework features, state management, build optimization, deployment strategy
- **Example**: `Sharothee-Wedding` → Bilingual support, event management, real-time features

**☁️ DevOps & Infrastructure** (Docker, AWS, CI/CD):
- **Markdown Focus**: Deployment automation, infrastructure as code, monitoring, scalability
- **Resume Emphasis**: "Reduced deployment time by X%", "automated Y processes", "scales to Z instances"
- **Tech Stack Details**: Cloud services, container orchestration, monitoring tools, security practices
- **Example**: `LAMP-APP-AWS` → Infrastructure automation, scalable deployment, cost optimization

## Resume Integration Best Practices

**Project Selection Criteria** (for HTML resume):
- **Recency**: Prioritize projects from last 2-3 years unless historically significant
- **Complexity**: Choose projects demonstrating advanced technical skills or business impact
- **Diversity**: Show range across different technologies and problem domains
- **Relevance**: Align with target job requirements and industry trends

**Content Refresh Triggers**:
- New repository reaches significant milestone (10+ commits, production deployment)
- Major feature addition or architecture change to existing project
- Project gains external recognition (stars, forks, mentions)
- Technology stack updates or modernization efforts

**Avoid These Resume Updates**:
- Projects without clear business value or technical merit
- Incomplete or experimental repositories without substantial code
- Outdated technology stacks unless showing historical progression
- Generic tutorials or copy-paste implementations without innovation
