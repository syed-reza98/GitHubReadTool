# GitHub Pages Deployment with Real AI

This directory contains the instructions and scripts for deploying the GitHubReadTool with real AI integration to GitHub Pages.

## Features

### Real AI Integration on GitHub Pages
- **GitHub Models API**: Direct integration with GitHub Models for real AI responses
- **Repository Secrets**: Securely uses `MODELS_API_TOKEN` and `GITHUB_TOKEN` from repository secrets
- **Project Data Integration**: Automatically includes all project data from `docs/projects/`
- **Serverless Architecture**: No backend server required - everything runs in the browser

### Build Process
The GitHub Actions workflow (`deploy-github-pages.yml`) automatically:

1. **Generates Project Documentation**: Updates project data using GitHub API
2. **Embeds AI Functionality**: Integrates GitHub Models API directly into the HTML
3. **Includes Project Data**: Embeds all projects from `docs/projects/` directory  
4. **Deploys to GitHub Pages**: Creates a fully functional AI-powered resume builder

### Configuration Required

#### Repository Secrets
Set these secrets in your GitHub repository settings:

- `MODELS_API_TOKEN`: Your GitHub Models API token
- `GITHUB_TOKEN`: GitHub Personal Access Token (automatically provided by GitHub Actions)

#### Workflow Triggers
The deployment is triggered by:
- Push to `main` branch
- Pull requests to `main` branch  
- Manual workflow dispatch

### Local Testing

To test the GitHub Pages build locally:

```bash
# Build with mock tokens
MODELS_API_TOKEN="your-token" GITHUB_TOKEN="your-github-token" node scripts/build-github-pages.js

# Serve locally
python3 -m http.server 8080 --directory dist

# Visit http://localhost:8080/interactive-resume-builder.html
```

### Features Available on GitHub Pages

With real AI integration enabled:
- ✅ **Real Resume Generation**: Uses GitHub Models API for genuine AI responses
- ✅ **Conversational Editing**: Interactive chat with real AI for resume refinement
- ✅ **Project Data Integration**: Automatically includes all your GitHub projects
- ✅ **Professional Output**: Complete, tailored resumes based on job descriptions
- ✅ **Export Functionality**: Browser preview and PDF export capabilities

### Fallback Behavior

If tokens are not available:
- Falls back to enhanced demo mode
- Uses realistic mock responses
- Maintains full UI/UX functionality
- Clearly indicates demo mode to users