/**
 * Resume Builder API Server
 * 
 * Provides backend services for the interactive resume builder including:
 * - Resume generation using GitHub Models
 * - Conversational editing interface
 * - PDF export functionality
 * - User data management
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GitHubModels } from './models/github-models.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ResumeBuilderServer {
  constructor(port = 3000) {
    this.port = port;
    this.githubModels = new GitHubModels();
    this.server = null;
  }

  start() {
    this.server = http.createServer(this.handleRequest.bind(this));
    this.server.listen(this.port, () => {
      console.log(`🚀 Resume Builder Server running at http://localhost:${this.port}`);
      console.log(`📱 Interactive interface: http://localhost:${this.port}/builder`);
      console.log(`📚 API documentation: http://localhost:${this.port}/api/docs`);
    });
  }

  async handleRequest(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const method = req.method;

    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    try {
      if (url.pathname === '/builder') {
        await this.serveBuilder(res);
      } else if (url.pathname.startsWith('/api/')) {
        await this.handleApiRequest(req, res, url, method);
      } else if (url.pathname === '/') {
        await this.serveHome(res);
      } else {
        await this.serveStatic(req, res, url.pathname);
      }
    } catch (error) {
      console.error('Request handler error:', error);
      this.sendError(res, 500, 'Internal Server Error');
    }
  }

  async serveHome(res) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>GitHubReadTool - Resume Builder</title>
    <style>
        body { font-family: system-ui; max-width: 800px; margin: 50px auto; padding: 20px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 40px; }
        .feature { margin: 20px 0; padding: 20px; background: #f5f5f5; border-radius: 8px; }
        .btn { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px; }
        .btn:hover { background: #0056b3; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🤖 Interactive Resume Builder</h1>
        <p>AI-powered resume tailoring with GitHub Models integration</p>
        <a href="/builder" class="btn">🚀 Open Resume Builder</a>
        <a href="/api/docs" class="btn">📚 API Documentation</a>
    </div>

    <div class="feature">
        <h3>✨ Features</h3>
        <ul>
            <li>AI-powered resume generation based on job descriptions</li>
            <li>Interactive chat-based editing with GitHub Models</li>
            <li>Real-time preview with professional design</li>
            <li>A4 PDF export for job applications</li>
            <li>Integration with GitHub project portfolio</li>
        </ul>
    </div>

    <div class="feature">
        <h3>🛠️ Technical Stack</h3>
        <ul>
            <li>Backend: Node.js with GitHub Models API</li>
            <li>Frontend: Vanilla JavaScript with modern UI</li>
            <li>AI: GPT-4 for resume generation and conversational editing</li>
            <li>Export: HTML to PDF with print-optimized CSS</li>
        </ul>
    </div>

    <div class="feature">
        <h3>📖 Quick Start</h3>
        <ol>
            <li>Set your <code>GITHUB_MODELS_TOKEN</code> environment variable</li>
            <li>Click "Open Resume Builder" above</li>
            <li>Paste in a job description and generate your tailored resume</li>
            <li>Use the chat interface to refine and improve the content</li>
            <li>Export as PDF when ready to apply</li>
        </ol>
    </div>
</body>
</html>
    `;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  async serveBuilder(res) {
    try {
      const builderPath = path.join(__dirname, 'interactive-resume-builder.html');
      const content = fs.readFileSync(builderPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    } catch (error) {
      this.sendError(res, 404, 'Builder interface not found');
    }
  }

  async serveStatic(req, res, pathname) {
    try {
      const filePath = path.join(__dirname, pathname.startsWith('/') ? pathname.slice(1) : pathname);
      
      if (!fs.existsSync(filePath) || !this.isSafeFile(filePath)) {
        this.sendError(res, 404, 'File not found');
        return;
      }

      const content = fs.readFileSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const contentTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml'
      };

      res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
      res.end(content);
    } catch (error) {
      this.sendError(res, 500, 'Error serving file');
    }
  }

  isSafeFile(filePath) {
    const resolvedPath = path.resolve(filePath);
    const projectRoot = path.resolve(__dirname);
    return resolvedPath.startsWith(projectRoot);
  }

  async handleApiRequest(req, res, url, method) {
    const pathname = url.pathname;

    if (pathname === '/api/docs') {
      await this.serveApiDocs(res);
      return;
    }

    if (pathname === '/api/resume/generate' && method === 'POST') {
      await this.handleResumeGeneration(req, res);
    } else if (pathname === '/api/resume/edit' && method === 'POST') {
      await this.handleResumeEdit(req, res);
    } else if (pathname === '/api/chat/message' && method === 'POST') {
      await this.handleChatMessage(req, res);
    } else if (pathname === '/api/user/profile' && method === 'GET') {
      await this.handleGetProfile(req, res);
    } else if (pathname === '/api/user/projects' && method === 'GET') {
      await this.handleGetProjects(req, res);
    } else if (pathname === '/api/export/pdf' && method === 'POST') {
      await this.handlePdfExport(req, res);
    } else if (pathname === '/api/health' && method === 'GET') {
      this.sendJson(res, { status: 'healthy', timestamp: new Date().toISOString() });
    } else {
      this.sendError(res, 404, 'API endpoint not found');
    }
  }

  async serveApiDocs(res) {
    const docs = `
<!DOCTYPE html>
<html>
<head>
    <title>Resume Builder API Documentation</title>
    <style>
        body { font-family: system-ui; max-width: 1000px; margin: 40px auto; padding: 20px; line-height: 1.6; }
        .endpoint { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #007bff; }
        .method { background: #28a745; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .method.POST { background: #ffc107; color: black; }
        .method.GET { background: #17a2b8; }
        code { background: #e9ecef; padding: 2px 6px; border-radius: 3px; }
        pre { background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>📚 Resume Builder API Documentation</h1>

    <div class="endpoint">
        <h3><span class="method POST">POST</span> /api/resume/generate</h3>
        <p>Generate a tailored resume based on job description.</p>
        <pre>
{
  "jobTitle": "Senior Full Stack Developer",
  "jobDescription": "Job description text...",
  "companyName": "Microsoft"
}
        </pre>
    </div>

    <div class="endpoint">
        <h3><span class="method POST">POST</span> /api/resume/edit</h3>
        <p>Edit existing resume content with AI assistance.</p>
        <pre>
{
  "currentResume": { /* resume object */ },
  "instruction": "Make the summary more concise"
}
        </pre>
    </div>

    <div class="endpoint">
        <h3><span class="method POST">POST</span> /api/chat/message</h3>
        <p>Process conversational resume editing requests.</p>
        <pre>
{
  "message": "Add more technical skills",
  "conversationHistory": [ /* previous messages */ ],
  "currentResume": { /* current resume state */ }
}
        </pre>
    </div>

    <div class="endpoint">
        <h3><span class="method GET">GET</span> /api/user/profile</h3>
        <p>Get user profile information.</p>
        <p><strong>Response:</strong> User profile data including contact info and basic details.</p>
    </div>

    <div class="endpoint">
        <h3><span class="method GET">GET</span> /api/user/projects</h3>
        <p>Get user's project portfolio data.</p>
        <p><strong>Response:</strong> Array of projects with descriptions and technologies.</p>
    </div>

    <div class="endpoint">
        <h3><span class="method POST">POST</span> /api/export/pdf</h3>
        <p>Export resume as PDF file.</p>
        <pre>
{
  "resume": { /* complete resume object */ },
  "format": "a4",
  "filename": "SyedSalmanRezaResume_Tailored.pdf"
}
        </pre>
    </div>

    <div class="endpoint">
        <h3><span class="method GET">GET</span> /api/health</h3>
        <p>Check API health status.</p>
        <p><strong>Response:</strong> <code>{ "status": "healthy", "timestamp": "..." }</code></p>
    </div>

    <p><a href="/builder">← Back to Resume Builder</a></p>
</body>
</html>
    `;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(docs);
  }

  async handleResumeGeneration(req, res) {
    try {
      const data = await this.parseRequestBody(req);
      const { jobTitle, jobDescription, companyName } = data;

      if (!jobTitle || !jobDescription) {
        this.sendError(res, 400, 'Job title and description are required');
        return;
      }

      const userProfile = await this.githubModels.loadUserProfile();
      const projects = await this.githubModels.loadProjects();

      const tailoredResume = await this.githubModels.generateTailoredResume(
        `Job Title: ${jobTitle}\nCompany: ${companyName || 'Not specified'}\n\n${jobDescription}`,
        userProfile,
        projects
      );

      this.sendJson(res, {
        success: true,
        resume: tailoredResume,
        metadata: {
          jobTitle,
          companyName,
          generatedAt: new Date().toISOString(),
          projectsConsidered: projects.length
        }
      });

    } catch (error) {
      console.error('Resume generation error:', error);
      this.sendError(res, 500, 'Failed to generate resume: ' + error.message);
    }
  }

  async handleResumeEdit(req, res) {
    try {
      const data = await this.parseRequestBody(req);
      const { currentResume, instruction } = data;

      if (!currentResume || !instruction) {
        this.sendError(res, 400, 'Current resume and instruction are required');
        return;
      }

      const editedResume = await this.githubModels.editResumeContent(currentResume, instruction);

      this.sendJson(res, {
        success: true,
        resume: editedResume,
        instruction: instruction,
        editedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('Resume edit error:', error);
      this.sendError(res, 500, 'Failed to edit resume: ' + error.message);
    }
  }

  async handleChatMessage(req, res) {
    try {
      const data = await this.parseRequestBody(req);
      const { message, conversationHistory = [], currentResume } = data;

      if (!message) {
        this.sendError(res, 400, 'Message is required');
        return;
      }

      const chatResponse = await this.githubModels.processChatMessage(
        message,
        conversationHistory,
        currentResume
      );

      this.sendJson(res, {
        success: true,
        response: chatResponse.message,
        updatedResume: chatResponse.updatedResume,
        timestamp: chatResponse.timestamp
      });

    } catch (error) {
      console.error('Chat processing error:', error);
      this.sendError(res, 500, 'Failed to process message: ' + error.message);
    }
  }

  async handleGetProfile(req, res) {
    try {
      const profile = await this.githubModels.loadUserProfile();
      this.sendJson(res, { success: true, profile });
    } catch (error) {
      console.error('Profile loading error:', error);
      this.sendError(res, 500, 'Failed to load profile');
    }
  }

  async handleGetProjects(req, res) {
    try {
      const projects = await this.githubModels.loadProjects();
      this.sendJson(res, { success: true, projects, count: projects.length });
    } catch (error) {
      console.error('Projects loading error:', error);
      this.sendError(res, 500, 'Failed to load projects');
    }
  }

  async handlePdfExport(req, res) {
    try {
      const data = await this.parseRequestBody(req);
      const { resume, filename = 'SyedSalmanRezaResume_Tailored.pdf' } = data;

      if (!resume) {
        this.sendError(res, 400, 'Resume data is required');
        return;
      }

      // In a real implementation, this would generate a PDF using puppeteer or similar
      // For now, we'll return HTML that can be printed as PDF
      const htmlContent = this.generatePrintableHtml(resume);

      res.writeHead(200, {
        'Content-Type': 'application/json'
      });

      res.end(JSON.stringify({
        success: true,
        message: 'PDF generation initiated. Use browser print function for best results.',
        printableHtml: htmlContent,
        filename: filename,
        instructions: 'Open the printableHtml in a browser and use Ctrl+P to save as PDF'
      }));

    } catch (error) {
      console.error('PDF export error:', error);
      this.sendError(res, 500, 'Failed to export PDF: ' + error.message);
    }
  }

  generatePrintableHtml(resume) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Resume - ${resume.personalInfo?.name || 'Professional Resume'}</title>
    <style>
        @page { size: A4; margin: 18mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', system-ui, sans-serif; 
            line-height: 1.4; 
            color: #2c3e50; 
            font-size: 11pt; 
        }
        .container { max-width: none; padding: 0; }
        header { text-align: center; margin-bottom: 25px; }
        h1 { font-size: 24pt; color: #2c3e50; margin-bottom: 5px; }
        h2 { font-size: 16pt; color: #667eea; margin-bottom: 15px; }
        .contact-info { font-size: 10pt; color: #666; }
        section { margin-bottom: 20px; }
        h3 { 
            color: #2c3e50; 
            font-size: 12pt; 
            margin-bottom: 8px; 
            border-left: 3px solid #667eea; 
            padding-left: 8px; 
        }
        .skills-grid { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 15px; }
        .skill-category { margin-bottom: 8px; }
        .skill-category strong { color: #333; }
        .project { margin-bottom: 12px; padding: 10px; background: #f8f9fa; border-radius: 5px; }
        .project h4 { color: #2c3e50; margin-bottom: 3px; }
        .project .tech { color: #667eea; font-size: 9pt; margin-bottom: 5px; }
        .experience-item { margin-bottom: 15px; }
        .experience-header { display: flex; justify-content: space-between; margin-bottom: 5px; }
        ul { margin-left: 15px; }
        li { margin-bottom: 3px; }
        @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .container { margin: 0; padding: 0; }
            section { break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>${resume.personalInfo?.name || 'Professional Resume'}</h1>
            <h2>${resume.personalInfo?.title || 'Software Engineer'}</h2>
            <div class="contact-info">
                ${resume.personalInfo?.email || ''} | ${resume.personalInfo?.phone || ''}<br>
                ${resume.personalInfo?.location || ''} | ${resume.personalInfo?.github || ''}
            </div>
        </header>

        ${resume.summary ? `
        <section>
            <h3>Professional Summary</h3>
            <p>${resume.summary}</p>
        </section>
        ` : ''}

        ${resume.skills ? `
        <section>
            <h3>Technical Skills</h3>
            ${Object.entries(resume.skills).map(([category, skills]) => `
                <div class="skill-category">
                    <strong>${category}:</strong> ${Array.isArray(skills) ? skills.join(', ') : skills}
                </div>
            `).join('')}
        </section>
        ` : ''}

        ${resume.projects && resume.projects.length > 0 ? `
        <section>
            <h3>Selected Projects</h3>
            ${resume.projects.map(project => `
                <div class="project">
                    <h4>${project.name || 'Project'}</h4>
                    <div class="tech">${project.technologies || ''}</div>
                    <p>${project.description || ''}</p>
                </div>
            `).join('')}
        </section>
        ` : ''}

        ${resume.experience && resume.experience.length > 0 ? `
        <section>
            <h3>Professional Experience</h3>
            ${resume.experience.map(exp => `
                <div class="experience-item">
                    <div class="experience-header">
                        <h4>${exp.title || 'Position'}</h4>
                        <span>${exp.duration || ''}</span>
                    </div>
                    <div style="color: #667eea; margin-bottom: 5px;">${exp.company || ''}</div>
                    ${exp.achievements && exp.achievements.length > 0 ? `
                        <ul>
                            ${exp.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
            `).join('')}
        </section>
        ` : ''}
    </div>
</body>
</html>
    `;
  }

  async parseRequestBody(req) {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(new Error('Invalid JSON'));
        }
      });
      req.on('error', reject);
    });
  }

  sendJson(res, data) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data, null, 2));
  }

  sendError(res, code, message) {
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: message, code }));
  }

  stop() {
    if (this.server) {
      this.server.close();
      console.log('Resume Builder Server stopped');
    }
  }
}

// Start server if this file is run directly
if (process.argv[1] === __filename) {
  const port = process.env.PORT || 3000;
  const server = new ResumeBuilderServer(port);
  server.start();

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    server.stop();
    process.exit(0);
  });
}

export default ResumeBuilderServer;