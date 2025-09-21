/**
 * AI-powered Resume Editor
 * 
 * Enhanced editor following patterns from GitHub's ai-editors documentation
 * with support for multiple editing strategies and evaluation metrics.
 */

import { GitHubModels } from '../../models/github-models.js';

export class AIResumeEditor {
  constructor(options = {}) {
    this.githubModels = new GitHubModels(options);
    this.editorTypes = new Map();
    this.evaluators = new Map();
    
    // Initialize default editors
    this.initializeEditors();
    this.initializeEvaluators();
  }

  initializeEditors() {
    // Versioning editor for consistency and accuracy
    this.editorTypes.set('versioning', {
      name: 'Versioning',
      description: 'Ensures consistent terminology and version-appropriate content',
      prompt: this.getVersioningPrompt(),
      model: 'openai/gpt-4o-mini',
      temperature: 0.3
    });

    // Technical accuracy editor
    this.editorTypes.set('technical', {
      name: 'Technical Accuracy',
      description: 'Validates technical terms, frameworks, and implementation details',
      prompt: this.getTechnicalPrompt(),
      model: 'openai/gpt-4o',
      temperature: 0.2
    });

    // Readability editor
    this.editorTypes.set('readability', {
      name: 'Readability',
      description: 'Improves clarity, conciseness, and professional tone',
      prompt: this.getReadabilityPrompt(),
      model: 'openai/gpt-4o-mini',
      temperature: 0.4
    });

    // ATS optimization editor
    this.editorTypes.set('ats', {
      name: 'ATS Optimization',
      description: 'Optimizes content for Applicant Tracking Systems',
      prompt: this.getATSPrompt(),
      model: 'openai/gpt-4o',
      temperature: 0.1
    });

    // Impact amplification editor
    this.editorTypes.set('impact', {
      name: 'Impact Amplification',
      description: 'Enhances achievement statements with quantifiable metrics',
      prompt: this.getImpactPrompt(),
      model: 'openai/gpt-4o',
      temperature: 0.5
    });
  }

  initializeEvaluators() {
    // Similarity evaluator
    this.evaluators.set('similarity', {
      name: 'Content Similarity',
      evaluate: (original, edited) => this.evaluateSimilarity(original, edited)
    });

    // Technical accuracy evaluator
    this.evaluators.set('technical-accuracy', {
      name: 'Technical Accuracy',
      evaluate: (content, context) => this.evaluateTechnicalAccuracy(content, context)
    });

    // ATS compatibility evaluator
    this.evaluators.set('ats-score', {
      name: 'ATS Compatibility',
      evaluate: (content) => this.evaluateATSCompatibility(content)
    });

    // Readability evaluator
    this.evaluators.set('readability', {
      name: 'Readability Score',
      evaluate: (content) => this.evaluateReadability(content)
    });
  }

  async editContent(content, editorType = 'versioning', options = {}) {
    const editor = this.editorTypes.get(editorType);
    if (!editor) {
      throw new Error(`Editor type "${editorType}" not found`);
    }

    try {
      const editedContent = await this.githubModels.makeRequest('/v1/completions', {
        model: editor.model,
        prompt: this.buildEditPrompt(editor.prompt, content, options),
        temperature: editor.temperature,
        max_tokens: options.maxTokens || 1000
      });

      const result = {
        original: content,
        edited: this.parseEditedContent(editedContent),
        editor: editorType,
        timestamp: new Date().toISOString(),
        metadata: {
          model: editor.model,
          temperature: editor.temperature,
          tokensUsed: editedContent.usage?.total_tokens || 0
        }
      };

      // Run evaluations if requested
      if (options.evaluate) {
        result.evaluations = await this.runEvaluations(result, options.evaluators);
      }

      return result;
    } catch (error) {
      console.error(`Edit failed with ${editorType} editor:`, error);
      throw error;
    }
  }

  buildEditPrompt(basePrompt, content, options) {
    let prompt = basePrompt
      .replace('{{content}}', content)
      .replace('{{context}}', options.context || '')
      .replace('{{job_description}}', options.jobDescription || '')
      .replace('{{target_role}}', options.targetRole || '');

    if (options.specificInstructions) {
      prompt += `\n\nSpecific instructions: ${options.specificInstructions}`;
    }

    return prompt;
  }

  parseEditedContent(response) {
    const content = response.choices?.[0]?.text || response.choices?.[0]?.message?.content || '';
    
    // Try to extract structured response
    const structuredMatch = content.match(/```(?:json|yaml)?\n?([\s\S]*?)\n?```/);
    if (structuredMatch) {
      try {
        return JSON.parse(structuredMatch[1]);
      } catch (e) {
        // Fall back to plain text
      }
    }

    return {
      text: content,
      changes: this.extractChanges(content),
      reasoning: this.extractReasoning(content)
    };
  }

  extractChanges(content) {
    const changes = [];
    const changePatterns = [
      /Changed "([^"]+)" to "([^"]+)"/g,
      /Replaced "([^"]+)" with "([^"]+)"/g,
      /Updated "([^"]+)" → "([^"]+)"/g
    ];

    changePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        changes.push({
          type: 'replacement',
          from: match[1],
          to: match[2]
        });
      }
    });

    return changes;
  }

  extractReasoning(content) {
    const reasoningPatterns = [
      /Reasoning: (.+?)(?:\n|$)/i,
      /Explanation: (.+?)(?:\n|$)/i,
      /Why: (.+?)(?:\n|$)/i
    ];

    for (const pattern of reasoningPatterns) {
      const match = content.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return null;
  }

  async runEvaluations(editResult, evaluatorNames = ['similarity', 'readability']) {
    const evaluations = {};

    for (const name of evaluatorNames) {
      const evaluator = this.evaluators.get(name);
      if (evaluator) {
        try {
          evaluations[name] = await evaluator.evaluate(
            editResult.edited.text || editResult.edited,
            editResult.original
          );
        } catch (error) {
          console.error(`Evaluation failed for ${name}:`, error);
          evaluations[name] = { error: error.message };
        }
      }
    }

    return evaluations;
  }

  // Editor-specific prompts
  getVersioningPrompt() {
    return `You are a technical writing editor focused on versioning and consistency.

Review the following content for:
1. Consistent terminology throughout
2. Accurate version numbers and technology references
3. Contemporary language that reflects current industry standards
4. Removal of outdated terms or deprecated technologies

Content to review:
{{content}}

Context: {{context}}
Target role: {{target_role}}

Provide the improved version with explanations for major changes.`;
  }

  getTechnicalPrompt() {
    return `You are a senior software engineer reviewing technical content for accuracy.

Analyze the following content for:
1. Correct technical terminology
2. Accurate framework and tool references
3. Realistic project scope and implementation details
4. Industry-standard practices and methodologies
5. Proper technical skill categorization

Content to review:
{{content}}

Job description context: {{job_description}}

Ensure all technical claims are realistic and properly contextualized.`;
  }

  getReadabilityPrompt() {
    return `You are a professional writing editor focused on clarity and impact.

Improve the following content for:
1. Clear, concise language
2. Strong action verbs
3. Parallel structure in lists
4. Elimination of redundancy
5. Professional tone appropriate for resumes
6. Scannable formatting and structure

Content to improve:
{{content}}

Maintain all factual information while enhancing readability and impact.`;
  }

  getATSPrompt() {
    return `You are an ATS (Applicant Tracking System) optimization specialist.

Optimize the following content for:
1. Keyword density matching job requirements
2. Standard section headings and formatting
3. Proper use of industry terminology
4. Elimination of graphics, tables, or complex formatting
5. Semantic HTML structure for digital parsing
6. Consistent date formats and contact information

Content to optimize:
{{content}}

Job description: {{job_description}}

Ensure the content will successfully pass ATS screening while remaining human-readable.`;
  }

  getImpactPrompt() {
    return `You are a career coach specializing in quantifying professional achievements.

Enhance the following content by:
1. Adding specific metrics and numbers where possible
2. Quantifying business impact (revenue, efficiency, cost savings)
3. Including team size, project scope, and timeline details
4. Using stronger action verbs that convey leadership and initiative
5. Highlighting measurable outcomes and results

Content to enhance:
{{content}}

Transform vague accomplishments into specific, quantifiable achievements while maintaining truthfulness.`;
  }

  // Evaluation methods
  async evaluateSimilarity(content1, content2) {
    // Simple similarity metric based on common words
    const words1 = new Set(content1.toLowerCase().match(/\w+/g) || []);
    const words2 = new Set(content2.toLowerCase().match(/\w+/g) || []);
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    const similarity = intersection.size / union.size;
    
    return {
      score: similarity,
      description: `${(similarity * 100).toFixed(1)}% content similarity`,
      threshold: similarity > 0.7 ? 'PASS' : 'REVIEW'
    };
  }

  async evaluateTechnicalAccuracy(content, context) {
    // Evaluate based on known technical patterns and terminology
    const technicalTerms = [
      'JavaScript', 'Python', 'React', 'Node.js', 'Docker', 'Kubernetes',
      'AWS', 'Azure', 'microservices', 'API', 'database', 'frontend', 'backend'
    ];

    const mentionedTerms = technicalTerms.filter(term => 
      content.toLowerCase().includes(term.toLowerCase())
    );

    const score = mentionedTerms.length / technicalTerms.length;
    
    return {
      score,
      description: `Found ${mentionedTerms.length} relevant technical terms`,
      terms: mentionedTerms,
      threshold: score > 0.3 ? 'PASS' : 'REVIEW'
    };
  }

  async evaluateATSCompatibility(content) {
    const atsChecks = {
      hasStandardHeadings: /Experience|Skills|Education|Projects/i.test(content),
      hasQuantifiableResults: /\d+%|\d+[KM]?\+|\$\d+/.test(content),
      avoidComplexFormatting: !/[│▌█]/.test(content),
      hasRelevantKeywords: content.split(/\s+/).length > 50,
      usesProfessionalLanguage: !/\b(I|me|my)\b/i.test(content)
    };

    const passedChecks = Object.values(atsChecks).filter(Boolean).length;
    const totalChecks = Object.keys(atsChecks).length;
    const score = passedChecks / totalChecks;

    return {
      score,
      description: `Passed ${passedChecks}/${totalChecks} ATS compatibility checks`,
      checks: atsChecks,
      threshold: score > 0.8 ? 'PASS' : 'REVIEW'
    };
  }

  async evaluateReadability(content) {
    // Simple readability metrics
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = words.reduce((sum, word) => {
      return sum + this.countSyllables(word);
    }, 0) / words.length;

    // Simplified Flesch Reading Ease approximation
    const readingEase = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    const grade = Math.max(1, Math.round((0.39 * avgWordsPerSentence) + (11.8 * avgSyllablesPerWord) - 15.59));

    return {
      score: Math.max(0, Math.min(1, readingEase / 100)),
      description: `Reading ease: ${readingEase.toFixed(1)}, Grade level: ${grade}`,
      metrics: {
        readingEase: readingEase.toFixed(1),
        gradeLevel: grade,
        avgWordsPerSentence: avgWordsPerSentence.toFixed(1),
        totalWords: words.length,
        totalSentences: sentences.length
      },
      threshold: readingEase > 60 ? 'PASS' : 'REVIEW'
    };
  }

  countSyllables(word) {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }
}

export default AIResumeEditor;