---
title: Quickstart for GitHub Models in Resume Builder
intro: 'Run your first AI-powered resume generation with GitHub Models in minutes.'
allowTitleToDifferFromFilename: true
redirect_from:
  - /models/quickstart
versions:
  fpt: '*'
  ghec: '*'
type: quick_start
topics:
  - GitHub Models
  - Resume Builder
shortTitle: Quickstart
---

## Introduction

The GitHubReadTool Resume Builder uses GitHub Models to create intelligent, job-specific resumes. This guide helps you set up the system and create your first AI-tailored resume.

## Prerequisites

- Node.js 18+ installed
- GitHub account with Models access
- Personal Access Token with `models` scope

## Step 1: Environment Setup

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone https://github.com/syed-reza98/GitHubReadTool.git
   cd GitHubReadTool
   ```

2. Run the interactive setup wizard:
   ```bash
   npm run setup
   ```

3. Configure your environment variables in `.env`:
   ```bash
   # GitHub Models Configuration
   GITHUB_MODELS_TOKEN=ghp_your_models_token_here
   MODEL_ENDPOINT=https://models.github.ai
   DEFAULT_MODEL=openai/gpt-4o-mini
   
   # GitHub API Configuration
   GITHUB_TOKEN=ghp_your_github_token_here
   
   # Server Configuration
   PORT=3000
   ```

## Step 2: Launch the Resume Builder

1. Start the development server:
   ```bash
   npm start
   ```

2. Open your browser to [http://localhost:3000](http://localhost:3000)

3. Click **"Open Resume Builder"** to access the interactive interface

## Step 3: Generate Your First Tailored Resume

### Input Job Description
1. **Job Title**: Enter the target position (e.g., "Senior Full Stack Developer")
2. **Company**: Optional company name for context
3. **Job Description**: Paste the complete job posting text

### Example Job Description
```text
We are seeking a Senior Full Stack Developer to join our Azure team. 
The ideal candidate will have:

• 5+ years of experience with JavaScript, TypeScript, React, and Node.js
• Strong experience with cloud platforms, particularly Azure and AWS
• Expertise in database design with SQL Server and MongoDB
• Experience with microservices architecture and containerization
• Proficiency in CI/CD pipelines and DevOps practices

Responsibilities:
• Design and develop scalable web applications
• Lead technical architecture decisions
• Mentor junior developers and contribute to team growth
```

### Generate Resume
1. Click **"Generate Tailored Resume"**
2. The AI will analyze the job description and create a customized resume
3. Review the generated content in the preview panel

## Step 4: Refine with Conversational Editing

Use the chat interface to improve your resume with natural language:

```text
User: "Make the summary more technical and add specific frameworks"
AI: "I've enhanced the summary with specific technologies like React, Node.js, and cloud platforms..."

User: "Emphasize my leadership experience"
AI: "I've highlighted your team leadership and mentoring experience throughout..."

User: "Add more quantifiable achievements"
AI: "I've included specific metrics like '40% performance improvement' and '99.9% uptime'..."
```

## Step 5: Export Your Resume

### Browser Preview
1. Click **"Browser Preview"** to open a full-page view
2. Use the print function (Ctrl+P/Cmd+P) to save as PDF
3. The resume includes print-optimized CSS for perfect A4 layout

### Direct PDF Export
1. Click **"Export PDF"** for automated PDF generation
2. File will be saved as `SyedSalmanRezaResume_Tailored.pdf`
3. Ready for job applications with ATS-friendly formatting

## Step 6: Save Prompt Configurations

Create reusable prompt templates for different types of positions:

### Technical Roles Prompt
```yaml
# prompts/tech-resume.prompt.yml
name: Technical Resume Generator
description: Generates resumes for software engineering positions
model: openai/gpt-4o
modelParameters:
  temperature: 0.7
  max_tokens: 2000
messages:
  - role: system
    content: |
      You are a technical recruiting expert. Generate resumes that emphasize:
      - Technical skills and programming languages
      - Software architecture and system design
      - Quantifiable performance improvements
      - Open source contributions and technical leadership
  - role: user
    content: |
      Job Description: {{job_description}}
      Technical Projects: {{projects}}
      User Profile: {{profile}}
testData:
  - job_description: "Senior Software Engineer position requiring Python, AWS, and microservices experience"
    expected: "Resume emphasizes Python expertise, cloud architecture, and distributed systems"
evaluators:
  - name: Technical Keywords Present
    string:
      contains: ['Python', 'AWS', 'microservices']
  - name: Quantifiable Achievements
    uses: github/achievement-scorer
```

### Leadership Roles Prompt
```yaml
# prompts/leadership-resume.prompt.yml
name: Leadership Resume Generator
description: Generates resumes for management and senior technical positions
model: openai/gpt-4o
modelParameters:
  temperature: 0.6
  max_tokens: 2000
messages:
  - role: system
    content: |
      You are a leadership development specialist. Generate resumes that showcase:
      - Team management and mentoring experience
      - Strategic thinking and business impact
      - Cross-functional collaboration
      - Process improvement and organizational change
  - role: user
    content: |
      Job Description: {{job_description}}
      Leadership Experience: {{leadership_projects}}
      Team Size: {{team_metrics}}
```

## Step 7: Set Up Evaluations

Create evaluation criteria to measure resume quality:

```yaml
# evaluations/resume-quality.prompt.yml
name: Resume Quality Evaluator
description: Evaluates resume effectiveness and ATS compatibility
model: openai/gpt-4o-mini
messages:
  - role: system
    content: |
      Evaluate this resume against the job description on these criteria:
      1. Relevance (1-10): How well skills match requirements
      2. Impact (1-10): Strength of quantifiable achievements
      3. ATS Score (1-10): Compatibility with tracking systems
      4. Clarity (1-10): Professional presentation and readability
  - role: user
    content: |
      Job Description: {{job_description}}
      Resume Content: {{resume_text}}
testData:
  - job_description: "Python developer with 3+ years experience"
    resume_text: "Software Engineer with 5 years Python experience, built systems processing 1M+ requests/day"
    expected: "Relevance: 9/10, Impact: 8/10, ATS: 9/10, Clarity: 8/10"
evaluators:
  - name: Scoring Format
    string:
      matches: "Relevance: [0-9]/10.*Impact: [0-9]/10.*ATS: [0-9]/10.*Clarity: [0-9]/10"
  - name: High Relevance Score
    threshold:
      field: relevance
      min: 7
```

## API Integration

### Direct API Usage
```javascript
// Generate resume via API
const response = await fetch('http://localhost:3000/api/resume/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    jobTitle: 'Senior Developer',
    jobDescription: 'Job posting text...',
    companyName: 'Target Company'
  })
});

const { resume } = await response.json();
```

### Conversational Editing
```javascript
// Edit resume with natural language
const editResponse = await fetch('http://localhost:3000/api/chat/message', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'Make the summary more concise',
    currentResume: resumeData,
    conversationHistory: []
  })
});

const { updatedResume } = await editResponse.json();
```

## Advanced Configuration

### Custom Model Parameters
```bash
# Environment variables for fine-tuning
DEFAULT_MODEL=openai/gpt-4o                    # Primary model
FALLBACK_MODEL=openai/gpt-4o-mini             # Faster fallback
DEFAULT_TEMPERATURE=0.7                        # Creativity vs consistency
MAX_TOKENS=2000                               # Response length limit
ENABLE_EVALUATIONS=true                       # Quality scoring
```

### Multi-Model Comparison
```javascript
// Compare outputs from different models
const models = ['openai/gpt-4o', 'anthropic/claude-3-5-sonnet'];
const comparisons = await Promise.all(
  models.map(model => generateResume({ model, ...params }))
);
```

## Troubleshooting

### Common Issues

**"GitHub Models token is required"**
- Ensure `GITHUB_MODELS_TOKEN` is set in `.env`
- Verify token has `models` scope permissions
- Check token hasn't expired

**"Rate limit exceeded"**
- GitHub Models free tier: 1,000 requests/day
- Reduce API calls by caching results
- Consider upgrading to paid tier for higher limits

**"Resume generation failed"**
- Check model availability at [GitHub Models status](https://github.com/status)
- Verify job description isn't too long (4,096 token limit)
- Try fallback model if primary model is unavailable

### Debug Mode
```bash
DEBUG=resume-builder:* npm start
# Enables detailed logging for troubleshooting
```

## Next Steps

- **Explore Advanced Features**: Set up custom prompt templates and evaluations
- **Integrate with CI/CD**: Automate resume generation in GitHub Actions workflows  
- **Customize UI/UX**: Modify themes and layouts to match your preferences
- **Contribute**: Help improve the project by submitting issues and pull requests

## Community Resources

- **GitHub Discussions**: [Community forum](https://github.com/orgs/community/discussions/categories/models) for GitHub Models
- **Project Issues**: [Report bugs and request features](https://github.com/syed-reza98/GitHubReadTool/issues)
- **Examples Repository**: [Sample prompts and configurations](https://github.com/syed-reza98/GitHubReadTool/tree/main/examples)