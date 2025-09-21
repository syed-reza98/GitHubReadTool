/**
 * GitHub Models Integration for Resume Tailoring
 * 
 * This module provides AI-powered resume generation and editing capabilities
 * using GitHub Models API.
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class GitHubModels {
  constructor(options = {}) {
    this.token = options.token || process.env.GITHUB_MODELS_TOKEN;
    this.model = options.model || process.env.DEFAULT_MODEL || 'gpt-4';
    this.endpoint = options.endpoint || process.env.MODEL_ENDPOINT || 'https://models.inference.ai.azure.com';
    this.temperature = options.temperature || 0.7;
    this.maxTokens = options.maxTokens || 2000;
    this.demoMode = !this.token || options.demoMode;
    
    if (this.demoMode) {
      console.log('⚠️  Running in demo mode - AI features will use mock responses');
      console.log('   Set GITHUB_MODELS_TOKEN to enable real AI integration');
    }
  }

  /**
   * Make API request to GitHub Models
   */
  async makeRequest(endpoint, data) {
    return new Promise((resolve, reject) => {
      const options = {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'GitHubReadTool-ResumeBuilder/1.0'
        }
      };

      const req = https.request(`${this.endpoint}${endpoint}`, options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              reject(new Error(`API Error: ${res.statusCode} - ${parsed.error || 'Unknown error'}`));
            }
          } catch (error) {
            reject(new Error(`JSON Parse Error: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Request Error: ${error.message}`));
      });

      req.write(JSON.stringify(data));
      req.end();
    });
  }

  /**
   * Generate tailored resume based on job description
   */
  async generateTailoredResume(jobDescription, userProfile, projects) {
    if (this.demoMode) {
      return this.generateMockResume(jobDescription, userProfile, projects);
    }

    // Determine the best prompt template based on job description
    const promptTemplate = this.selectPromptTemplate(jobDescription);
    const prompt = await this.loadPromptTemplate(promptTemplate);

    try {
      const response = await this.makeRequest('/v1/completions', {
        model: prompt.model || this.model,
        prompt: this.buildPromptFromTemplate(prompt, {
          job_description: jobDescription,
          user_profile: JSON.stringify(userProfile, null, 2),
          projects: JSON.stringify(projects, null, 2),
          experience: this.formatExperience(userProfile.experience || [])
        }),
        temperature: prompt.modelParameters?.temperature || this.temperature,
        max_tokens: prompt.modelParameters?.max_tokens || this.maxTokens
      });

      const result = this.parseResumeResponse(response);
      
      // Run evaluations if prompt includes them
      if (prompt.evaluators && prompt.evaluators.length > 0) {
        result.evaluations = await this.runPromptEvaluations(result, prompt.evaluators, { jobDescription, userProfile, projects });
      }

      return result;
    } catch (error) {
      console.error('Resume generation failed:', error.message);
      // Fallback to mock generation
      return this.generateMockResume(jobDescription, userProfile, projects);
    }
  }
    
    const prompt = `
Job Description:
${jobDescription}

User Profile:
${JSON.stringify(userProfile, null, 2)}

Available Projects:
${projects.map(p => `- ${p.name}: ${p.description} (${p.technologies})`).join('\n')}

Please generate a tailored resume that:
1. Emphasizes relevant skills and experience from the job description
2. Selects the most relevant projects (6-8 maximum)
3. Crafts a professional summary that aligns with the role
4. Organizes content for maximum impact and ATS compatibility
5. Uses measurable achievements where possible

Return the response as structured JSON with sections for summary, skills, projects, and experience.
`;

    try {
      const response = await this.makeRequest('/v1/completions', {
        model: this.model,
        prompt: prompt,
        system: systemPrompt,
        temperature: this.temperature,
        max_tokens: this.maxTokens
      });

      return this.parseResumeResponse(response);
    } catch (error) {
      console.error('Resume generation failed:', error.message);
      throw error;
    }
  }

  /**
   * Edit existing resume content based on user instructions
   */
  async editResumeContent(currentResume, instruction) {
    if (this.demoMode) {
      return this.generateMockEdit(currentResume, instruction);
    }

    const systemPrompt = this.getSystemPrompt('resume_editing');
    
    const prompt = `
Current Resume Content:
${JSON.stringify(currentResume, null, 2)}

User Instruction: ${instruction}

Please modify the resume according to the user's instruction while:
1. Maintaining professional tone and format
2. Ensuring accuracy of information
3. Preserving ATS compatibility
4. Following resume best practices

Return the updated resume as structured JSON.
`;

    try {
      const response = await this.makeRequest('/v1/completions', {
        model: this.model,
        prompt: prompt,
        system: systemPrompt,
        temperature: 0.3, // Lower temperature for editing tasks
        max_tokens: this.maxTokens
      });

      return this.parseResumeResponse(response);
    } catch (error) {
      console.error('Resume editing failed:', error.message);
      throw error;
    }
  }

  /**
   * Handle conversational chat for resume refinement
   */
  async processChatMessage(message, conversationHistory, currentResume) {
    if (this.demoMode) {
      return this.generateMockChatResponse(message, conversationHistory, currentResume);
    }

    const systemPrompt = this.getSystemPrompt('conversational_editing');
    
    const context = {
      currentResume,
      conversationHistory: conversationHistory.slice(-5), // Keep last 5 messages for context
      userMessage: message
    };

    const prompt = `
Current Resume:
${JSON.stringify(currentResume, null, 2)}

Conversation History:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

User Message: ${message}

Please respond helpfully and provide specific guidance on resume improvements. 
If the user wants changes, provide the updated content. If they need advice, 
provide actionable recommendations.
`;

    try {
      const response = await this.makeRequest('/v1/chat/completions', {
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: this.maxTokens
      });

      return {
        message: response.choices[0].message.content,
        updatedResume: this.extractResumeFromResponse(response.choices[0].message.content),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Chat processing failed:', error.message);
      throw error;
    }
  }

  /**
   * Get system prompts for different AI tasks
   */
  getSystemPrompt(task) {
    const prompts = {
      resume_generation: `You are an expert resume writer and career counselor. Your role is to create tailored, professional resumes that:
- Highlight relevant skills and experience for the target role
- Use action verbs and quantifiable achievements
- Follow ATS-friendly formatting guidelines
- Maintain professional tone and industry standards
- Ensure all information is accurate and verifiable
- Prioritize recent and relevant experience
Always provide structured JSON output with clear sections.`,

      resume_editing: `You are an expert resume editor. Your role is to refine and improve existing resume content by:
- Making precise edits based on user instructions
- Maintaining consistency in tone and format
- Ensuring all changes improve the resume's effectiveness
- Preserving factual accuracy
- Following resume best practices
- Keeping content concise and impactful
Always return the complete updated resume as structured JSON.`,

      conversational_editing: `You are a helpful resume writing assistant. You provide:
- Clear, actionable advice on resume improvements
- Specific suggestions for content and formatting
- Professional guidance on career presentation
- Support for iterative resume refinement
- Explanations for your recommendations
Be conversational but professional, and always focus on helping the user create the best possible resume.`
    };

    return prompts[task] || prompts.conversational_editing;
  }

  /**
   * Parse AI response and structure resume data
   */
  parseResumeResponse(response) {
    try {
      // Extract JSON from response if it's embedded in text
      const content = response.choices?.[0]?.text || response.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: try to parse the entire content
        return JSON.parse(content);
      }
    } catch (error) {
      console.error('Failed to parse resume response:', error.message);
      return {
        error: 'Failed to parse AI response',
        rawContent: response
      };
    }
  }

  /**
   * Extract resume data from conversational response
   */
  extractResumeFromResponse(content) {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Load user profile from repository data
   */
  async loadUserProfile() {
    try {
      const profilePath = path.join(__dirname, '../docs/user-profile.json');
      if (fs.existsSync(profilePath)) {
        return JSON.parse(fs.readFileSync(profilePath, 'utf8'));
      }
      
      // Generate profile from existing resume data
      return this.generateProfileFromResume();
    } catch (error) {
      console.error('Failed to load user profile:', error.message);
      return {};
    }
  }

  /**
   * Load projects from docs/projects directory
   */
  async loadProjects() {
    try {
      const projectsDir = path.join(__dirname, '../docs/projects');
      const projects = [];
      
      if (fs.existsSync(projectsDir)) {
        const files = fs.readdirSync(projectsDir).filter(f => f.endsWith('.md'));
        
        for (const file of files) {
          const content = fs.readFileSync(path.join(projectsDir, file), 'utf8');
          const project = this.parseProjectMarkdown(content, file);
          projects.push(project);
        }
      }
      
      return projects;
    } catch (error) {
      console.error('Failed to load projects:', error.message);
      return [];
    }
  }

  /**
   * Parse project markdown file
   */
  parseProjectMarkdown(content, filename) {
    const lines = content.split('\n');
    const project = {
      id: filename.replace('.md', ''),
      name: '',
      description: '',
      technologies: '',
      github: '',
      status: 'active'
    };

    let currentSection = '';
    
    for (const line of lines) {
      if (line.startsWith('# ')) {
        project.name = line.replace('# ', '').trim();
      } else if (line.startsWith('## Overview')) {
        currentSection = 'overview';
      } else if (line.startsWith('## Code & Repository')) {
        currentSection = 'repository';
      } else if (line.startsWith('## Architecture & Tech Stack')) {
        currentSection = 'tech';
      } else if (currentSection === 'overview' && line.trim() && !line.startsWith('#')) {
        project.description += line + ' ';
      } else if (line.includes('**GitHub:**')) {
        const match = line.match(/https:\/\/github\.com\/[^\s)]+/);
        if (match) project.github = match[0];
      } else if (line.includes('**Technology Stack:**')) {
        project.technologies = line.replace('**Technology Stack:**', '').trim();
      }
    }

    project.description = project.description.trim();
    return project;
  }

  /**
   * Generate basic profile from existing resume
   */
  generateProfileFromResume() {
    return {
      name: 'Syed Salman Reza',
      title: 'Software Engineer',
      location: 'Dhaka, Bangladesh',
      email: 'syedsalmanreza98@gmail.com',
      github: 'https://github.com/syed-reza98',
      phone: '+880 1755 607998',
      summary: 'Experienced software engineer with expertise in full-stack development and system architecture.'
    };
  }

  /**
   * Generate mock resume for demo mode
   */
  generateMockResume(jobDescription, userProfile, projects) {
    const keywords = this.extractKeywords(jobDescription);
    
    return {
      personalInfo: {
        name: userProfile?.name || 'Syed Salman Reza',
        title: this.extractJobTitle(jobDescription) || 'Software Engineer',
        email: userProfile?.email || 'syedsalmanreza98@gmail.com',
        phone: userProfile?.phone || '+880 1755 607998',
        location: userProfile?.location || 'Dhaka, Bangladesh',
        github: userProfile?.github || 'https://github.com/syed-reza98'
      },
      summary: this.generateMockSummary(keywords, jobDescription),
      skills: this.generateMockSkills(keywords),
      projects: this.selectMockProjects(projects, keywords),
      experience: this.generateMockExperience(keywords),
      metadata: {
        generatedAt: new Date().toISOString(),
        demoMode: true,
        keywords: keywords.slice(0, 10)
      }
    };
  }

  /**
   * Generate mock resume edit
   */
  generateMockEdit(currentResume, instruction) {
    const editedResume = JSON.parse(JSON.stringify(currentResume)); // Deep clone
    
    // Apply mock edits based on instruction
    if (instruction.toLowerCase().includes('concise') || instruction.toLowerCase().includes('shorter')) {
      if (editedResume.summary) {
        editedResume.summary = editedResume.summary.substring(0, 120) + '...';
      }
    } else if (instruction.toLowerCase().includes('skill')) {
      editedResume.skills = {
        ...editedResume.skills,
        'New Skills': ['Advanced Analytics', 'Cloud Architecture', 'DevOps']
      };
    } else if (instruction.toLowerCase().includes('leadership')) {
      editedResume.summary = editedResume.summary?.replace('engineer', 'engineering leader') || 
                             'Engineering leader with proven track record in team management and technical excellence.';
    }
    
    editedResume.metadata = {
      ...editedResume.metadata,
      lastEdited: new Date().toISOString(),
      editInstruction: instruction
    };
    
    return editedResume;
  }

  /**
   * Generate mock chat response
   */
  generateMockChatResponse(message, conversationHistory, currentResume) {
    const responses = {
      'concise': "I've made the summary more concise while keeping the key achievements. The updated version focuses on your most impactful experience.",
      'skills': "I've reorganized the skills section to better highlight your technical expertise and added relevant technologies mentioned in the job description.",
      'leadership': "I've emphasized your leadership experience and team management skills throughout the resume, particularly in the summary and experience sections.",
      'projects': "I've updated the projects section to better showcase your most relevant work and included specific technologies and achievements.",
      'technical': "I've made the content more technical by adding specific frameworks, tools, and methodologies you've used.",
      'default': "I've reviewed your request and made appropriate improvements to enhance your resume's impact and relevance."
    };

    let responseType = 'default';
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('concise') || lowerMessage.includes('shorter')) {
      responseType = 'concise';
    } else if (lowerMessage.includes('skill')) {
      responseType = 'skills';
    } else if (lowerMessage.includes('leadership') || lowerMessage.includes('lead')) {
      responseType = 'leadership';
    } else if (lowerMessage.includes('project')) {
      responseType = 'projects';
    } else if (lowerMessage.includes('technical') || lowerMessage.includes('tech')) {
      responseType = 'technical';
    }

    const updatedResume = responseType !== 'default' ? 
      this.generateMockEdit(currentResume, message) : null;

    return {
      message: responses[responseType],
      updatedResume: updatedResume,
      timestamp: new Date().toISOString(),
      demoMode: true
    };
  }

  /**
   * Extract keywords from job description
   */
  extractKeywords(jobDescription) {
    const commonTech = [
      'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js', 
      'Python', 'Java', 'C#', 'PHP', 'Laravel', 'Django', 'Flask',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD',
      'MySQL', 'PostgreSQL', 'MongoDB', 'Redis',
      'REST API', 'GraphQL', 'Microservices', 'Agile', 'Scrum'
    ];

    return commonTech.filter(tech => 
      jobDescription.toLowerCase().includes(tech.toLowerCase())
    );
  }

  /**
   * Extract job title from description
   */
  extractJobTitle(jobDescription) {
    const titles = [
      'Senior Full Stack Developer', 'Full Stack Developer', 'Senior Software Engineer',
      'Software Engineer', 'Backend Developer', 'Frontend Developer', 'DevOps Engineer'
    ];
    
    for (const title of titles) {
      if (jobDescription.toLowerCase().includes(title.toLowerCase())) {
        return title;
      }
    }
    
    return 'Software Engineer';
  }

  /**
   * Generate mock professional summary
   */
  generateMockSummary(keywords, jobDescription) {
    const experience = this.extractExperienceYears(jobDescription);
    const keyTechs = keywords.slice(0, 3).join(', ') || 'modern web technologies';
    
    return `Experienced software engineer with ${experience}+ years of expertise in ${keyTechs}. Proven track record of building scalable applications, leading development teams, and delivering high-impact solutions. Strong background in system architecture, database design, and agile development practices.`;
  }

  /**
   * Generate mock skills based on keywords
   */
  generateMockSkills(keywords) {
    const skillCategories = {
      'Programming Languages': ['JavaScript', 'TypeScript', 'Python', 'PHP', 'Java'],
      'Frontend Technologies': ['React', 'Vue.js', 'HTML5', 'CSS3', 'Tailwind CSS'],
      'Backend Technologies': ['Node.js', 'Laravel', 'Express.js', 'REST APIs', 'GraphQL'],
      'Databases': ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis'],
      'Cloud & DevOps': ['AWS', 'Docker', 'CI/CD', 'Git', 'Linux'],
      'Tools & Methodologies': ['Agile', 'Scrum', 'Test-Driven Development', 'Code Review']
    };

    // Prioritize skills mentioned in keywords
    Object.keys(skillCategories).forEach(category => {
      skillCategories[category] = skillCategories[category].sort((a, b) => {
        const aInKeywords = keywords.some(k => k.toLowerCase() === a.toLowerCase());
        const bInKeywords = keywords.some(k => k.toLowerCase() === b.toLowerCase());
        return (bInKeywords ? 1 : 0) - (aInKeywords ? 1 : 0);
      });
    });

    return skillCategories;
  }

  /**
   * Select mock projects based on relevance
   */
  selectMockProjects(projects, keywords) {
    const mockProjects = [
      {
        name: 'SaaS E-commerce Platform',
        description: 'Full-stack multi-tenant e-commerce solution with payment integration and inventory management',
        technologies: 'Laravel, MySQL, JavaScript, Stripe API',
        highlights: ['Multi-tenant architecture', 'Payment processing', 'Admin dashboard'],
        relevanceScore: 85
      },
      {
        name: 'Real-Time Helmet Detection System',
        description: 'Computer vision application for safety monitoring using YOLO and OpenCV',
        technologies: 'Python, YOLO, OpenCV, TensorFlow',
        highlights: ['Real-time processing', 'Machine learning', 'Safety compliance'],
        relevanceScore: 70
      },
      {
        name: 'Microservices Banking System',
        description: 'Scalable banking application with microservices architecture and automated testing',
        technologies: 'Python, Flask, Docker, PostgreSQL, Redis',
        highlights: ['Microservices design', '40% performance improvement', 'Automated testing'],
        relevanceScore: 90
      },
      {
        name: 'Event Management Platform',
        description: 'Full-stack platform for wedding planning with real-time features and responsive design',
        technologies: 'TypeScript, Next.js, MongoDB, WebSocket',
        highlights: ['Real-time updates', 'Responsive design', 'Event coordination'],
        relevanceScore: 75
      },
      {
        name: 'CI/CD Pipeline Automation',
        description: 'Automated deployment pipeline reducing deployment time by 60%',
        technologies: 'Docker, Jenkins, AWS, Terraform',
        highlights: ['60% faster deployments', 'Infrastructure as code', 'Automated testing'],
        relevanceScore: 80
      },
      {
        name: 'API Gateway Service',
        description: 'Centralized API gateway handling authentication, rate limiting, and request routing',
        technologies: 'Node.js, Express.js, JWT, Redis, nginx',
        highlights: ['API management', 'Authentication', 'Rate limiting'],
        relevanceScore: 85
      }
    ];

    // Boost relevance scores for projects matching keywords
    mockProjects.forEach(project => {
      keywords.forEach(keyword => {
        if (project.technologies.toLowerCase().includes(keyword.toLowerCase()) ||
            project.description.toLowerCase().includes(keyword.toLowerCase())) {
          project.relevanceScore += 10;
        }
      });
    });

    return mockProjects
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 6);
  }

  /**
   * Generate mock professional experience
   */
  generateMockExperience(keywords) {
    const hasCloud = keywords.some(k => ['AWS', 'Azure', 'GCP'].includes(k));
    const hasReact = keywords.some(k => ['React', 'JavaScript', 'TypeScript'].includes(k));
    const hasPython = keywords.some(k => ['Python', 'Django', 'Flask'].includes(k));

    const achievements = [
      'Designed and developed microservices-based Reconciliation System using Python (Flask) and Electron.js, achieving 40% improvement in transaction processing efficiency',
      'Maintained and optimized legacy .NET banking applications (IMS), reducing system downtime by 25% through proactive performance enhancements',
      'Led full-stack Laravel applications deployment on IIS servers with 99.9% uptime, managing complete project lifecycles',
      'Implemented robust CI/CD pipelines, reducing deployment time by 60% and ensuring automated testing protocols'
    ];

    if (hasReact) {
      achievements.push('Built responsive React applications with modern state management and TypeScript integration');
    }
    if (hasCloud) {
      achievements.push('Architected cloud-native solutions on AWS with auto-scaling and cost optimization');
    }
    if (hasPython) {
      achievements.push('Developed Python-based data processing pipelines handling 10M+ records daily');
    }

    return [
      {
        title: 'Software Engineer',
        company: 'Networld Technology Limited',
        location: 'Dhaka, Bangladesh',
        duration: 'October 2022 - Present (2+ years)',
        achievements: achievements.slice(0, 4)
      },
      {
        title: 'Full Stack Developer (Remote)',
        company: 'Walkinroom',
        location: 'London, UK',
        duration: 'April 2022 - September 2022 (6 months)',
        achievements: [
          'Developed hotel booking platform using Laravel and JavaScript with integrated payment systems',
          'Implemented responsive frontend with modern CSS frameworks and optimized user experience',
          'Collaborated with international team using agile methodologies and version control best practices'
        ]
      }
    ];
  }

  /**
   * Extract years of experience from job description
   */
  extractExperienceYears(jobDescription) {
    const yearMatch = jobDescription.match(/(\d+)\+?\s*years?/i);
    return yearMatch ? yearMatch[1] : '3';
  }

  /**
   * Select appropriate prompt template based on job description analysis
   */
  selectPromptTemplate(jobDescription) {
    const lowerDesc = jobDescription.toLowerCase();
    
    // Check for leadership/management keywords
    const leadershipKeywords = ['manager', 'lead', 'director', 'head of', 'vp', 'cto', 'architect', 'principal'];
    const hasLeadershipKeywords = leadershipKeywords.some(keyword => lowerDesc.includes(keyword));
    
    if (hasLeadershipKeywords) {
      return 'leadership-resume';
    }
    
    // Default to technical resume for most software engineering positions
    return 'technical-resume';
  }

  /**
   * Load prompt template from file system or cache
   */
  async loadPromptTemplate(templateName) {
    try {
      // In a full implementation, this would load from the prompts directory
      // For now, return built-in templates
      const templates = {
        'technical-resume': {
          name: 'Technical Resume Generator',
          model: 'openai/gpt-4o',
          modelParameters: {
            temperature: 0.7,
            max_tokens: 2000
          },
          messages: [
            {
              role: 'system',
              content: `You are an expert technical recruiter and resume writer specializing in software engineering positions. 

Create professional, ATS-optimized resumes that:
- Emphasize technical skills, programming languages, and frameworks
- Highlight software architecture and system design experience
- Include quantifiable performance improvements and metrics
- Showcase problem-solving abilities and technical leadership
- Use industry-standard terminology appropriately
- Follow clean, scannable formatting for both human readers and ATS systems

Focus on technical depth while maintaining professional clarity.`
            },
            {
              role: 'user',
              content: `Generate a tailored technical resume based on this information:

**Job Description:**
{{job_description}}

**User Profile:**
{{user_profile}}

**Technical Projects:**
{{projects}}

**Current Experience:**
{{experience}}

Create a resume that specifically matches the technical requirements in the job description,
emphasizing relevant programming languages, frameworks, and technical achievements.`
            }
          ],
          evaluators: [
            { name: 'Technical Keywords Match', type: 'keyword_match' },
            { name: 'Quantifiable Achievements', type: 'metrics_present' },
            { name: 'ATS Compatibility', type: 'ats_score' }
          ]
        },
        'leadership-resume': {
          name: 'Leadership Resume Generator',
          model: 'openai/gpt-4o',
          modelParameters: {
            temperature: 0.6,
            max_tokens: 2000
          },
          messages: [
            {
              role: 'system',
              content: `You are a senior executive recruiter specializing in technical leadership positions.

Create executive-level resumes that showcase:
- Strategic thinking and business impact
- Team management and organizational leadership
- Cross-functional collaboration and stakeholder management
- Process improvement and change management
- Technical vision and architecture decisions
- Budget management and resource allocation
- Mentoring and talent development

Emphasize leadership outcomes, business metrics, and transformational results.`
            },
            {
              role: 'user',
              content: `Generate a leadership-focused resume based on this information:

**Job Description:**
{{job_description}}

**Leadership Profile:**
{{user_profile}}

**Team Management Experience:**
{{experience}}

**Strategic Initiatives:**
{{projects}}

Create a resume that demonstrates executive presence and strategic leadership capabilities.`
            }
          ],
          evaluators: [
            { name: 'Leadership Keywords', type: 'leadership_indicators' },
            { name: 'Business Impact Metrics', type: 'business_metrics' },
            { name: 'Team Management Evidence', type: 'team_indicators' }
          ]
        }
      };
      
      return templates[templateName] || templates['technical-resume'];
    } catch (error) {
      console.error('Failed to load prompt template:', error);
      return this.getFallbackTemplate();
    }
  }

  /**
   * Build prompt from template with variable substitution
   */
  buildPromptFromTemplate(template, variables) {
    let prompt = template.messages.map(msg => msg.content).join('\n\n');
    
    // Replace template variables
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      prompt = prompt.replace(placeholder, value);
    });
    
    return prompt;
  }

  /**
   * Format experience data for prompt templates
   */
  formatExperience(experience) {
    if (!Array.isArray(experience)) return '[]';
    
    return JSON.stringify(experience.map(exp => ({
      title: exp.title,
      company: exp.company,
      duration: exp.duration,
      achievements: exp.achievements || []
    })), null, 2);
  }

  /**
   * Run evaluations based on prompt template evaluators
   */
  async runPromptEvaluations(resume, evaluators, context) {
    const results = {};
    
    for (const evaluator of evaluators) {
      try {
        switch (evaluator.type) {
          case 'keyword_match':
            results[evaluator.name] = await this.evaluateKeywordMatch(resume, context.jobDescription);
            break;
          case 'metrics_present':
            results[evaluator.name] = await this.evaluateMetricsPresent(resume);
            break;
          case 'ats_score':
            results[evaluator.name] = await this.evaluateATSScore(resume);
            break;
          case 'leadership_indicators':
            results[evaluator.name] = await this.evaluateLeadershipIndicators(resume);
            break;
          case 'business_metrics':
            results[evaluator.name] = await this.evaluateBusinessMetrics(resume);
            break;
          case 'team_indicators':
            results[evaluator.name] = await this.evaluateTeamIndicators(resume);
            break;
          default:
            results[evaluator.name] = { score: 0.5, note: 'Evaluator not implemented' };
        }
      } catch (error) {
        console.error(`Evaluation failed for ${evaluator.name}:`, error);
        results[evaluator.name] = { score: 0, error: error.message };
      }
    }
    
    return results;
  }

  /**
   * Evaluate keyword match between resume and job description
   */
  async evaluateKeywordMatch(resume, jobDescription) {
    const resumeText = this.extractTextFromResume(resume);
    const jobKeywords = this.extractTechnicalKeywords(jobDescription);
    const resumeKeywords = this.extractTechnicalKeywords(resumeText);
    
    const matchedKeywords = jobKeywords.filter(keyword => 
      resumeKeywords.some(rKeyword => rKeyword.toLowerCase() === keyword.toLowerCase())
    );
    
    const score = jobKeywords.length > 0 ? matchedKeywords.length / jobKeywords.length : 1;
    
    return {
      score,
      description: `Matched ${matchedKeywords.length}/${jobKeywords.length} key technical terms`,
      matchedKeywords,
      missedKeywords: jobKeywords.filter(k => !matchedKeywords.includes(k)),
      threshold: score > 0.6 ? 'PASS' : 'REVIEW'
    };
  }

  /**
   * Evaluate presence of quantifiable metrics
   */
  async evaluateMetricsPresent(resume) {
    const text = this.extractTextFromResume(resume);
    const metricsPatterns = [
      /\d+%/g,                    // Percentages
      /\d+[KM]?\+/g,             // Numbers with K/M suffix
      /\$\d+[KMB]?/g,            // Dollar amounts
      /\d+x/g,                   // Multipliers
      /\d+\s*(users?|customers?|projects?|team|developers?|engineers?)/gi
    ];
    
    const foundMetrics = [];
    metricsPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) foundMetrics.push(...matches);
    });
    
    const score = Math.min(foundMetrics.length / 5, 1); // Expect at least 5 metrics
    
    return {
      score,
      description: `Found ${foundMetrics.length} quantifiable metrics`,
      metrics: foundMetrics,
      threshold: score > 0.4 ? 'PASS' : 'REVIEW'
    };
  }

  /**
   * Evaluate ATS compatibility
   */
  async evaluateATSScore(resume) {
    const text = this.extractTextFromResume(resume);
    
    const checks = {
      hasStandardSections: this.hasStandardSections(resume),
      hasQuantifiableResults: /\d+%|\d+[KM]?\+|\$\d+/.test(text),
      avoidComplexFormatting: this.hasSimpleFormatting(text),
      hasRelevantKeywords: text.split(/\s+/).length > 200,
      usesActionVerbs: this.hasActionVerbs(text),
      properContactInfo: this.hasProperContactInfo(resume)
    };
    
    const passedChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;
    const score = passedChecks / totalChecks;
    
    return {
      score,
      description: `Passed ${passedChecks}/${totalChecks} ATS compatibility checks`,
      checks,
      threshold: score > 0.8 ? 'PASS' : 'REVIEW'
    };
  }

  /**
   * Extract technical keywords from text
   */
  extractTechnicalKeywords(text) {
    const technicalTerms = [
      // Programming Languages
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
      // Frontend Frameworks
      'React', 'Vue.js', 'Angular', 'Svelte', 'Next.js', 'Nuxt.js',
      // Backend Frameworks
      'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot', 'Laravel', 'Ruby on Rails',
      // Cloud Platforms
      'AWS', 'Azure', 'GCP', 'Google Cloud', 'Digital Ocean', 'Heroku',
      // Databases
      'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'DynamoDB',
      // DevOps Tools
      'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'GitHub Actions', 'Terraform',
      // Methodologies
      'Agile', 'Scrum', 'Kanban', 'TDD', 'BDD', 'CI/CD', 'microservices', 'REST API', 'GraphQL'
    ];
    
    return technicalTerms.filter(term => 
      new RegExp(`\\b${term}\\b`, 'i').test(text)
    );
  }

  /**
   * Extract text content from resume object
   */
  extractTextFromResume(resume) {
    if (typeof resume === 'string') return resume;
    
    let text = '';
    
    if (resume.summary) text += resume.summary + ' ';
    if (resume.personalInfo) {
      text += Object.values(resume.personalInfo).join(' ') + ' ';
    }
    if (resume.skills) {
      if (typeof resume.skills === 'object') {
        text += Object.values(resume.skills).flat().join(' ') + ' ';
      } else {
        text += resume.skills + ' ';
      }
    }
    if (resume.experience) {
      resume.experience.forEach(exp => {
        text += (exp.title || '') + ' ';
        text += (exp.company || '') + ' ';
        if (exp.achievements) {
          text += exp.achievements.join(' ') + ' ';
        }
      });
    }
    if (resume.projects) {
      resume.projects.forEach(proj => {
        text += (proj.name || '') + ' ';
        text += (proj.description || '') + ' ';
        text += (proj.technologies || '') + ' ';
      });
    }
    
    return text;
  }

  /**
   * Check if resume has standard sections
   */
  hasStandardSections(resume) {
    const requiredSections = ['personalInfo', 'summary', 'skills', 'experience'];
    return requiredSections.every(section => resume[section]);
  }

  /**
   * Check for simple formatting (ATS-friendly)
   */
  hasSimpleFormatting(text) {
    // Check for complex characters that ATS might struggle with
    const complexChars = /[│▌█▲▼◆●]/;
    return !complexChars.test(text);
  }

  /**
   * Check for action verbs
   */
  hasActionVerbs(text) {
    const actionVerbs = [
      'developed', 'implemented', 'designed', 'created', 'built', 'managed', 'led',
      'improved', 'optimized', 'reduced', 'increased', 'achieved', 'delivered',
      'architected', 'collaborated', 'mentored', 'coordinated'
    ];
    
    return actionVerbs.some(verb => 
      new RegExp(`\\b${verb}`, 'i').test(text)
    );
  }

  /**
   * Check for proper contact information
   */
  hasProperContactInfo(resume) {
    const info = resume.personalInfo || {};
    return info.name && (info.email || info.phone);
  }

  /**
   * Get fallback template for error cases
   */
  getFallbackTemplate() {
    return {
      name: 'Fallback Template',
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are a professional resume writer. Create a well-structured resume based on the provided information.'
        },
        {
          role: 'user',
          content: 'Create a professional resume for: {{job_description}}'
        }
      ]
    };
  }
}

export default GitHubModels;