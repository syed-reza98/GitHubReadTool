#!/usr/bin/env node
/**
 * Build Script for GitHub Pages with Real AI Integration
 * 
 * This script creates a version of the interactive resume builder
 * that works on GitHub Pages with real AI capabilities by:
 * 1. Embedding repository secrets as environment variables
 * 2. Loading project data from docs/projects directory
 * 3. Creating a serverless AI service using GitHub Models API
 * 4. Generating static files optimized for GitHub Pages
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.dirname(__dirname);

console.log('🚀 Building GitHub Pages version with Real AI integration...');

// Create dist directory
const distDir = path.join(projectRoot, 'dist');
if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Copy static files
console.log('📁 Copying static files...');
const staticFiles = [
    'index.html',
    'README.md',
    '_config.yml',
    'images',
    '*.pdf'
];

// Copy main files
fs.copyFileSync(path.join(projectRoot, 'index.html'), path.join(distDir, 'index.html'));
fs.copyFileSync(path.join(projectRoot, 'README.md'), path.join(distDir, 'README.md'));
fs.copyFileSync(path.join(projectRoot, '_config.yml'), path.join(distDir, '_config.yml'));

// Copy images directory if it exists
const imagesDir = path.join(projectRoot, 'images');
if (fs.existsSync(imagesDir)) {
    const distImagesDir = path.join(distDir, 'images');
    fs.mkdirSync(distImagesDir, { recursive: true });
    
    const imageFiles = fs.readdirSync(imagesDir);
    imageFiles.forEach(file => {
        fs.copyFileSync(path.join(imagesDir, file), path.join(distImagesDir, file));
    });
}

// Copy PDF files
const pdfFiles = fs.readdirSync(projectRoot).filter(file => file.endsWith('.pdf'));
pdfFiles.forEach(file => {
    fs.copyFileSync(path.join(projectRoot, file), path.join(distDir, file));
});

// Copy docs directory
console.log('📊 Copying documentation and project data...');
const docsDir = path.join(projectRoot, 'docs');
const distDocsDir = path.join(distDir, 'docs');
fs.cpSync(docsDir, distDocsDir, { recursive: true });

// Load project data
console.log('🔍 Loading project data...');
const projectsDir = path.join(projectRoot, 'docs', 'projects');
const projectFiles = fs.readdirSync(projectsDir).filter(file => file.endsWith('.md'));
const projectData = [];

projectFiles.forEach(file => {
    const content = fs.readFileSync(path.join(projectsDir, file), 'utf8');
    const projectName = path.basename(file, '.md');
    
    // Extract project information from markdown
    const lines = content.split('\n');
    let title = projectName;
    let description = '';
    let technologies = '';
    let githubUrl = '';
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('# ')) {
            title = line.substring(2).trim();
        } else if (line.includes('**GitHub:**')) {
            const match = line.match(/\[.*?\]\((.*?)\)/);
            if (match) githubUrl = match[1];
        } else if (line.includes('**Primary Language:**')) {
            technologies = line.split('**Primary Language:**')[1]?.trim() || '';
        } else if (line.startsWith('## Overview') && i + 1 < lines.length) {
            description = lines[i + 1].trim();
        }
    }
    
    projectData.push({
        name: title,
        description: description || `${title} - Advanced project with modern technologies`,
        technologies: technologies || 'Full Stack',
        githubUrl: githubUrl,
        filename: file
    });
});

console.log(`📋 Loaded ${projectData.length} projects`);

// Create GitHub Pages optimized resume builder
console.log('🤖 Creating AI-powered resume builder for GitHub Pages...');

const originalHtml = fs.readFileSync(path.join(projectRoot, 'interactive-resume-builder.html'), 'utf8');

// Extract environment variables
const modelsApiToken = process.env.GITHUB_TOKEN || '';
const githubRepoToken = process.env.GITHUB_REPO_TOKEN || process.env.GITHUB_TOKEN || '';

if (!modelsApiToken) {
    console.warn('⚠️  GITHUB_TOKEN not found in environment variables');
}

if (!githubRepoToken) {
    console.warn('⚠️  GITHUB_REPO_TOKEN not found in environment variables');
}

// Create modified HTML with embedded AI service and project data
const modifiedHtml = originalHtml.replace(
    '// Configuration: Detect if we\'re running locally with API access',
    `// Embedded project data for GitHub Pages
        const EMBEDDED_PROJECTS = ${JSON.stringify(projectData, null, 8)};
        
        // GitHub Models API service for direct browser integration
        const GITHUB_MODELS_CONFIG = {
            token: '${modelsApiToken}',
            endpoint: 'https://models.github.ai',
            model: 'openai/gpt-4o-mini',
            enabled: ${!!modelsApiToken}
        };
        
        // Direct API integration for GitHub Pages
        async function callGitHubModelsAPI(messages, temperature = 0.7) {
            if (!GITHUB_MODELS_CONFIG.enabled) {
                throw new Error('GitHub Models API not configured');
            }
            
            try {
                const response = await fetch(GITHUB_MODELS_CONFIG.endpoint + '/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': \`Bearer \${GITHUB_MODELS_CONFIG.token}\`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: GITHUB_MODELS_CONFIG.model,
                        messages: messages,
                        temperature: temperature,
                        max_tokens: 2000
                    })
                });
                
                if (!response.ok) {
                    throw new Error(\`API request failed: \${response.status}\`);
                }
                
                const data = await response.json();
                return data.choices[0].message.content;
            } catch (error) {
                console.error('GitHub Models API error:', error);
                throw error;
            }
        }
        
        // Configuration: Enhanced for GitHub Pages with real AI`
).replace(
    'const API_CONFIG = {',
    `const API_CONFIG = {
            isLocal: false, // Force GitHub Pages mode but with real AI
            useRealAI: ${!!modelsApiToken}, // Enable real AI if token available
            githubPagesMode: true,`
).replace(
    'async function checkApiAvailability() {',
    `// Load embedded project data
        function loadEmbeddedProjects() {
            return EMBEDDED_PROJECTS.map(project => ({
                name: project.name,
                description: project.description,
                technologies: project.technologies,
                highlights: [
                    'Advanced implementation',
                    'Modern architecture', 
                    'Production-ready solution'
                ],
                relevanceScore: 85
            }));
        }
        
        async function checkApiAvailability() {`
).replace(
    'if (!API_CONFIG.isLocal) return false;',
    `// Always available in GitHub Pages mode with real AI
            return API_CONFIG.useRealAI;`
).replace(
    'showStatusMessage(\'Generating resume using demo mode...\', \'info\');',
    `showStatusMessage(API_CONFIG.useRealAI ? 'Generating resume using GitHub Models AI...' : 'Generating resume using demo mode...', 'info');`
).replace(
    'currentResume = generateMockResume(jobTitle, jobDescription);',
    `if (API_CONFIG.useRealAI) {
                        try {
                            // Use real GitHub Models API
                            const prompt = \`Generate a professional resume for this job:
Job Title: \${jobTitle}
Company: \${elements.companyName?.value?.trim() || 'Target Company'}
Job Description: \${jobDescription}

Use this professional profile:
Name: Syed Salman Reza
Email: syedsalmanreza98@gmail.com
Phone: +880 1755 607998
Location: Dhaka, Bangladesh
GitHub: https://github.com/syed-reza98

Available projects: \${EMBEDDED_PROJECTS.map(p => p.name + ' - ' + p.description).join(', ')}

Generate a JSON resume with sections: personalInfo, summary, skills, projects, experience.\`;
                            
                            const messages = [{
                                role: 'user',
                                content: prompt
                            }];
                            
                            const aiResponse = await callGitHubModelsAPI(messages);
                            
                            // Try to parse AI response as JSON
                            try {
                                const jsonMatch = aiResponse.match(/\\{[\\s\\S]*\\}/);
                                if (jsonMatch) {
                                    currentResume = JSON.parse(jsonMatch[0]);
                                } else {
                                    throw new Error('No JSON found in response');
                                }
                            } catch (parseError) {
                                console.warn('Failed to parse AI response, using enhanced mock');
                                currentResume = generateEnhancedMockResume(jobTitle, jobDescription);
                            }
                            
                            showStatusMessage('Resume generated using GitHub Models AI!', 'success');
                        } catch (aiError) {
                            console.warn('AI generation failed, using enhanced mock:', aiError);
                            currentResume = generateEnhancedMockResume(jobTitle, jobDescription);
                            showStatusMessage('Resume generated using enhanced templates!', 'success');
                        }
                    } else {
                        currentResume = generateEnhancedMockResume(jobTitle, jobDescription);
                        showStatusMessage('Resume generated using demo mode!', 'success');
                    }`
).replace(
    'function generateMockResume(jobTitle, jobDescription) {',
    `function generateEnhancedMockResume(jobTitle, jobDescription) {
            const projects = loadEmbeddedProjects();
            const relevantProjects = selectRelevantProjects(jobDescription, projects);`
).replace(
    'projects: selectRelevantProjects(jobDescription),',
    `projects: relevantProjects,`
).replace(
    'function selectRelevantProjects(jobDescription) {',
    `function selectRelevantProjects(jobDescription, availableProjects = null) {
            const projects = availableProjects || loadEmbeddedProjects();`
).replace(
    'if (apiAvailable) {',
    `if (apiAvailable && API_CONFIG.useRealAI) {
                    try {
                        // Use real GitHub Models API for chat
                        const aiPrompt = \`Current resume: \${JSON.stringify(currentResume, null, 2)}
                        
User instruction: \${message}

Provide a helpful response and suggest specific improvements. If the instruction requires resume changes, explain what would be modified.\`;

                        const messages = [{
                            role: 'user', 
                            content: aiPrompt
                        }];
                        
                        const aiResponse = await callGitHubModelsAPI(messages, 0.8);
                        
                        // Remove "processing" message
                        const chatMessages = elements.chatMessages.querySelectorAll('.message');
                        if (chatMessages[chatMessages.length - 1].classList.contains('system')) {
                            chatMessages[chatMessages.length - 1].remove();
                        }
                        
                        addChatMessage('assistant', aiResponse);
                        showStatusMessage('Response generated using GitHub Models AI!', 'success');
                        
                    } catch (aiError) {
                        console.warn('AI chat failed, using demo response:', aiError);
                        // Remove "processing" message and fallback to demo
                        const chatMessages2 = elements.chatMessages.querySelectorAll('.message');
                        if (chatMessages2[chatMessages2.length - 1].classList.contains('system')) {
                            chatMessages2[chatMessages2.length - 1].remove();
                        }
                        
                        const response = generateMockChatResponse(message);
                        addChatMessage('assistant', response.message + ' (Enhanced demo)');
                        showStatusMessage('Using enhanced demo response!', 'warning');
                    }
                } else if (apiAvailable) {`
);

// Write the modified HTML
fs.writeFileSync(path.join(distDir, 'interactive-resume-builder.html'), modifiedHtml);

console.log('✅ Build completed successfully!');
console.log('📦 Files generated in ./dist directory:');
console.log('  - index.html (landing page)');
console.log('  - interactive-resume-builder.html (AI-powered resume builder)');
console.log('  - docs/ (project documentation)');
console.log('  - images/ (static assets)');
console.log('  - *.pdf (resume templates)');

if (modelsApiToken) {
    console.log('🤖 Real AI integration: ENABLED');
} else {
    console.log('⚠️  Real AI integration: DISABLED (GITHUB_TOKEN not found)');
}

if (githubRepoToken) {
    console.log('📊 Project data integration: ENABLED');
} else {
    console.log('⚠️  Project data integration: LIMITED (GITHUB_REPO_TOKEN not found)');
}

console.log('\n🌐 Ready for GitHub Pages deployment!');