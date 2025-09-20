# Quick Start Guide

This guide will help you get started with GitHub Models integration for resume tailoring and conversational editing.

## Prerequisites

- GitHub account with Models access
- Node.js 18+ installed
- API key or token for authentication

## Setup

### 1. Environment Configuration

Create a `.env` file with your credentials:

```bash
# GitHub Models API Configuration
GITHUB_MODELS_TOKEN=your_models_token_here
GITHUB_TOKEN=your_github_token_here
MODEL_ENDPOINT=https://models.inference.ai.azure.com
DEFAULT_MODEL=gpt-4
```

### 2. Install Dependencies

```bash
npm install
# Additional dependencies for AI integration
npm install openai axios dotenv
```

### 3. Basic Usage

```javascript
import { GitHubModels } from './models/github-models.js';

const models = new GitHubModels({
  token: process.env.GITHUB_MODELS_TOKEN,
  model: 'gpt-4'
});

// Generate resume content
const resumeContent = await models.generateResume({
  jobDescription: "Senior Full Stack Developer...",
  userProfile: profileData,
  projects: projectsData
});

// Interactive editing
const editedContent = await models.editResume({
  currentResume: resumeContent,
  instruction: "Make the skills section more concise"
});
```

## API Endpoints

### Resume Generation
- `POST /api/resume/generate` - Generate tailored resume
- `POST /api/resume/edit` - Edit existing resume
- `GET /api/resume/preview` - Get resume preview

### Chat Interface
- `POST /api/chat/message` - Send chat message
- `GET /api/chat/history` - Get conversation history
- `DELETE /api/chat/clear` - Clear conversation

## Configuration Options

```javascript
const config = {
  model: 'gpt-4',           // AI model to use
  temperature: 0.7,         // Response creativity (0-1)
  maxTokens: 2000,         // Maximum response length
  systemPrompt: 'custom',   // Custom system instructions
  rateLimitRpm: 100        // Requests per minute limit
};
```

## Best Practices

1. **Prompt Engineering**: Use clear, specific instructions
2. **Rate Limiting**: Respect API rate limits
3. **Error Handling**: Implement robust error handling
4. **Content Validation**: Validate AI-generated content
5. **User Privacy**: Don't log sensitive information

## Troubleshooting

### Common Issues

**Authentication Errors**
- Verify your token is valid and has correct permissions
- Check token hasn't expired

**Rate Limiting**
- Implement exponential backoff
- Monitor usage against limits

**Model Availability**
- Have fallback models configured
- Check model status before requests

### Support

For additional help:
- Check the GitHub Models documentation
- Review error logs for specific issues
- Contact support for persistent problems