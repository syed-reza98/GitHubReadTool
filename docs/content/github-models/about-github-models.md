---
title: About GitHub Models
intro: 'GitHub Models is a suite of developer tools that take you from AI idea to ship, including a model catalog, prompt management, and quantitative evaluations.'
versions:
  feature: github-models
shortTitle: About GitHub Models
topics:
  - GitHub Models
  - Resume Builder
  - AI Integration
---

## Overview

GitHub Models is a workspace lowering the barrier to enterprise-grade AI adoption. It helps you move beyond isolated experimentation by embedding AI development directly into familiar GitHub workflows. GitHub Models provides tools to test large language models (LLMs), refine prompts, evaluate outputs, and make informed decisions based on structured metrics.

This resume builder leverages GitHub Models to create personalized, job-specific resumes through conversational AI interfaces.

## Capabilities

GitHub Models offers a set of features to support prompt iteration, evaluation, and integration for AI development.

* **Prompt development**: Start AI development directly in a structured editor that supports system instructions, test inputs, and variable configuration.
* **Model comparison**: Test multiple models side by side with identical prompts and inputs to experiment with different outputs.
* **Evaluators**: Use scoring metrics such as similarity, relevance, and groundedness to analyze outputs and track performance.
* **Prompt configurations**: Save prompt, model, and parameter settings as `.prompt.yml` files in your repository. This enables review, collaboration, and reproducibility.
* **Production integration**: Use your saved configuration to build AI features or connect through SDKs and the GitHub Models REST API.

## Resume Builder Integration

The GitHubReadTool Resume Builder integrates with GitHub Models to provide:

### **Intelligent Resume Generation**
- **Job Description Analysis**: Automatically extracts requirements, technologies, and keywords from job postings
- **Context-Aware Matching**: Matches user skills and projects against job requirements using semantic analysis
- **Dynamic Content Generation**: Creates tailored professional summaries, skill sections, and project descriptions

### **Conversational Editing Interface**
- **Natural Language Instructions**: Users can refine resumes using plain English commands
- **Real-time Updates**: Immediate preview of changes with professional formatting
- **Version History**: Track modifications and revert changes when needed

### **Evaluation and Optimization**
- **ATS Compatibility Scoring**: Ensures resumes pass Applicant Tracking Systems
- **Content Quality Metrics**: Measures clarity, relevance, and impact of resume content
- **Multi-model Comparison**: Test different AI models to optimize resume quality

## Supported Models

### **Primary Models**
- **GPT-4o**: Advanced reasoning and context understanding for complex resume optimization
- **GPT-4o-mini**: Fast processing for real-time conversational editing
- **Claude-3.5-sonnet**: Alternative model with strong analytical capabilities for job matching

### **Model Selection Strategy**
- **Resume Generation**: GPT-4o for comprehensive analysis and content creation
- **Conversational Editing**: GPT-4o-mini for responsive user interactions
- **Content Evaluation**: Claude-3.5-sonnet for objective quality assessment

## Prompt Engineering Best Practices

### **System Prompts**
```yaml
# resume-generation.prompt.yml
name: Resume Generator
description: Generates tailored resumes based on job descriptions
model: openai/gpt-4o
modelParameters:
  temperature: 0.7
  max_tokens: 2000
messages:
  - role: system
    content: |
      You are an expert resume writer and career counselor. Create professional resumes that:
      - Highlight relevant skills and experience for the target role
      - Use action verbs and quantifiable achievements
      - Follow ATS-friendly formatting guidelines
      - Maintain professional tone and industry standards
  - role: user
    content: |
      Job Description: {{job_description}}
      User Profile: {{user_profile}}
      Projects: {{projects_data}}
```

### **Evaluation Criteria**
- **Relevance**: How well the resume matches job requirements
- **Clarity**: Readability and professional presentation
- **Impact**: Strength of achievements and quantifiable results
- **ATS Compatibility**: Technical formatting compliance

## Rate Limits and Usage

### **API Limits**
- **Free Tier**: 1,000 requests per day, 10 requests per minute
- **Authenticated**: 5,000 requests per day, 50 requests per minute
- **Token Limits**: 4,096 tokens per request for GPT-4, 16,384 for GPT-4o

### **Optimization Strategies**
- **Caching**: Store generated content to reduce API calls
- **Batch Processing**: Combine multiple operations where possible
- **Fallback Models**: Use lighter models for simple operations

## Security and Privacy

### **Data Handling**
- **Minimal Data**: Only process necessary information for resume generation
- **No Storage**: Personal information is not retained by the AI models
- **Secure Transmission**: All API calls use encrypted HTTPS connections

### **Content Safety**
- **Built-in Filters**: GitHub Models includes content safety measures
- **Professional Standards**: Ensures generated content meets workplace appropriateness
- **Bias Prevention**: Regular monitoring for discriminatory language patterns

## Further Reading

* [GitHub Models Quickstart Guide](/docs/content/github-models/quickstart)
* [Responsible Use Guidelines](/docs/content/github-models/responsible-use-of-github-models)
* [Resume Builder API Reference](/api/docs)
* [Prompt Engineering Best Practices](https://github.com/marketplace/models)