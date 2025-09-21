/**
 * Enhanced Resume Builder - Core JavaScript Module
 * Provides improved error handling, validation, and user experience
 */

class ResumeBuilder {
    constructor() {
        this.currentResume = null;
        this.conversationHistory = [];
        this.userProfile = null;
        this.isGenerating = false;
        this.retryCount = 0;
        this.maxRetries = 3;
        
        this.elements = {
            jobTitle: document.getElementById('job-title'),
            companyName: document.getElementById('company-name'),
            jobDescription: document.getElementById('job-description'),
            generateBtn: document.getElementById('generate-resume'),
            loadingIndicator: document.getElementById('loading-indicator'),
            resumePreview: document.getElementById('resume-preview'),
            exportSection: document.getElementById('export-section'),
            chatInterface: document.getElementById('chat-interface'),
            chatMessages: document.getElementById('chat-messages'),
            chatInput: document.getElementById('chat-input'),
            sendMessageBtn: document.getElementById('send-message'),
            previewBtn: document.getElementById('preview-browser'),
            exportBtn: document.getElementById('export-pdf'),
            statusMessages: document.getElementById('status-messages')
        };
    }

    async initialize() {
        try {
            await this.loadUserData();
            this.setupEventListeners();
            this.setupFormValidation();
            this.showStatusMessage('🚀 Resume builder ready! Enter job details to get started.', 'success');
        } catch (error) {
            console.error('Initialization error:', error);
            this.showStatusMessage('⚠️ Error initializing resume builder. Please refresh the page.', 'error');
        }
    }

    async loadUserData() {
        try {
            // Load user profile from API or local storage
            const response = await fetch('/api/user-profile');
            if (response.ok) {
                this.userProfile = await response.json();
            } else {
                // Fallback to default profile
                this.userProfile = this.getDefaultProfile();
            }
        } catch (error) {
            console.warn('Could not load user profile, using defaults:', error);
            this.userProfile = this.getDefaultProfile();
        }
    }

    getDefaultProfile() {
        return {
            name: 'Syed Salman Reza',
            title: 'Software Engineer',
            email: 'syedreza.cse98@gmail.com',
            phone: '+8801521530832',
            location: 'Dhaka, Bangladesh',
            linkedin: 'https://www.linkedin.com/in/syedsalmanreza/',
            github: 'https://github.com/syed-reza98',
            portfolio: 'https://syed-reza98.github.io'
        };
    }

    setupEventListeners() {
        // Generate resume button
        this.elements.generateBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            this.generateResume();
        });

        // Chat functionality
        this.elements.sendMessageBtn?.addEventListener('click', () => this.sendChatMessage());
        this.elements.chatInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendChatMessage();
            }
        });

        // Export functionality
        this.elements.previewBtn?.addEventListener('click', () => this.openBrowserPreview());
        this.elements.exportBtn?.addEventListener('click', () => this.exportToPDF());

        // Form auto-save
        this.setupAutoSave();
    }

    setupFormValidation() {
        const requiredFields = [this.elements.jobTitle, this.elements.jobDescription];
        
        requiredFields.forEach(field => {
            if (field) {
                field.addEventListener('input', () => this.validateForm());
                field.addEventListener('blur', () => this.validateField(field));
            }
        });
    }

    setupAutoSave() {
        const saveableFields = [
            this.elements.jobTitle,
            this.elements.companyName,
            this.elements.jobDescription
        ];

        saveableFields.forEach(field => {
            if (field) {
                field.addEventListener('input', debounce(() => {
                    this.saveFormData();
                }, 1000));
            }
        });

        // Load saved data on page load
        this.loadFormData();
    }

    validateForm() {
        const jobTitle = this.elements.jobTitle?.value.trim();
        const jobDescription = this.elements.jobDescription?.value.trim();
        
        const isValid = jobTitle && jobDescription && jobDescription.length >= 50;
        
        if (this.elements.generateBtn) {
            this.elements.generateBtn.disabled = !isValid;
        }

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.getAttribute('name') || field.id;
        
        // Remove existing validation messages
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        // Validate specific fields
        let errorMessage = '';
        
        if (fieldName === 'job-title' && !value) {
            errorMessage = 'Job title is required';
        } else if (fieldName === 'job-description') {
            if (!value) {
                errorMessage = 'Job description is required';
            } else if (value.length < 50) {
                errorMessage = 'Job description should be at least 50 characters';
            }
        }

        // Show error if exists
        if (errorMessage) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.style.color = '#ef4444';
            errorDiv.style.fontSize = '0.875rem';
            errorDiv.style.marginTop = '0.25rem';
            errorDiv.textContent = errorMessage;
            field.parentNode.appendChild(errorDiv);
            
            field.style.borderColor = '#ef4444';
        } else {
            field.style.borderColor = '';
        }
    }

    async generateResume() {
        if (this.isGenerating) {
            this.showStatusMessage('⏳ Resume generation already in progress...', 'warning');
            return;
        }

        if (!this.validateForm()) {
            this.showStatusMessage('❌ Please fill in all required fields correctly.', 'error');
            return;
        }

        this.isGenerating = true;
        this.setLoading(true);
        
        try {
            this.showStatusMessage('🔄 Analyzing job requirements and generating tailored resume...', 'info');
            
            const resumeData = {
                jobTitle: this.elements.jobTitle?.value.trim(),
                companyName: this.elements.companyName?.value.trim(),
                jobDescription: this.elements.jobDescription?.value.trim(),
                userProfile: this.userProfile
            };

            // Generate resume with retry logic
            const resume = await this.generateResumeWithRetry(resumeData);
            
            this.currentResume = resume;
            this.displayResume(resume);
            
            this.elements.exportSection.style.display = 'block';
            this.elements.chatInterface.style.display = 'block';
            
            this.updateProgressStep('generate', 'completed');
            this.updateProgressStep('edit', 'current');
            
            this.showStatusMessage('✅ Resume generated successfully! You can now refine it using the chat interface.', 'success');
            
            // Add initial chat message
            this.addChatMessage('system', 'Resume generated successfully! How would you like to improve it?');
            
        } catch (error) {
            console.error('Resume generation failed:', error);
            this.showStatusMessage('❌ Failed to generate resume. Please check your connection and try again.', 'error');
        } finally {
            this.isGenerating = false;
            this.setLoading(false);
        }
    }

    async generateResumeWithRetry(data) {
        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            try {
                const response = await fetch('/api/generate-resume', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();
                
                if (result.success) {
                    return result.resume;
                } else {
                    throw new Error(result.error || 'Resume generation failed');
                }
                
            } catch (error) {
                console.warn(`Attempt ${attempt + 1} failed:`, error.message);
                
                if (attempt === this.maxRetries - 1) {
                    // Last attempt failed, return mock resume
                    this.showStatusMessage('⚠️ Using offline mode - generating basic resume...', 'warning');
                    return this.generateMockResume(data);
                }
                
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            }
        }
    }

    generateMockResume(data) {
        return {
            personalInfo: {
                name: this.userProfile.name,
                title: data.jobTitle,
                email: this.userProfile.email,
                phone: this.userProfile.phone,
                location: this.userProfile.location,
                linkedin: this.userProfile.linkedin,
                github: this.userProfile.github
            },
            summary: this.generateMockSummary(data),
            skills: this.generateMockSkills(data),
            experience: this.generateMockExperience(),
            projects: this.generateMockProjects(),
            education: this.generateMockEducation()
        };
    }

    generateMockSummary(data) {
        return `Experienced software engineer with expertise in full-stack development, seeking the ${data.jobTitle} position${data.companyName ? ` at ${data.companyName}` : ''}. Passionate about creating scalable solutions and leveraging modern technologies to drive business success.`;
    }

    generateMockSkills(data) {
        const jobDesc = data.jobDescription.toLowerCase();
        const skills = {
            'Programming Languages': ['JavaScript', 'Python', 'Java', 'TypeScript', 'PHP'],
            'Frontend Technologies': ['React', 'Vue.js', 'HTML5', 'CSS3', 'Tailwind CSS'],
            'Backend Technologies': ['Node.js', 'Express.js', 'Laravel', 'Django', 'FastAPI'],
            'Databases': ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis'],
            'Cloud & DevOps': ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux']
        };

        // Prioritize skills mentioned in job description
        Object.keys(skills).forEach(category => {
            skills[category] = skills[category].filter(skill => 
                jobDesc.includes(skill.toLowerCase()) || Math.random() > 0.3
            );
        });

        return skills;
    }

    generateMockExperience() {
        return [
            {
                title: 'Senior Software Engineer',
                company: 'Tech Company',
                location: 'Dhaka, Bangladesh',
                period: '2022 - Present',
                achievements: [
                    'Led development of microservices architecture serving 100K+ users',
                    'Implemented CI/CD pipelines reducing deployment time by 60%',
                    'Mentored junior developers and conducted code reviews'
                ]
            },
            {
                title: 'Software Engineer',
                company: 'Previous Company',
                location: 'Dhaka, Bangladesh',
                period: '2020 - 2022',
                achievements: [
                    'Developed and maintained RESTful APIs using Node.js and Express',
                    'Built responsive web applications with React and Vue.js',
                    'Optimized database queries improving performance by 40%'
                ]
            }
        ];
    }

    generateMockProjects() {
        return [
            {
                name: 'E-commerce Platform',
                description: 'Full-stack e-commerce solution with payment integration',
                technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
                link: 'https://github.com/syed-reza98/saas-ecom'
            },
            {
                name: 'Real-time Chat Application',
                description: 'Scalable chat application with WebSocket support',
                technologies: ['Vue.js', 'Socket.io', 'Express', 'Redis'],
                link: 'https://github.com/syed-reza98/chat-app'
            }
        ];
    }

    generateMockEducation() {
        return {
            degree: 'Bachelor of Science in Computer Science & Engineering',
            institution: 'North South University',
            location: 'Dhaka, Bangladesh',
            year: '2020',
            gpa: '3.85/4.00'
        };
    }

    displayResume(resume) {
        const preview = this.elements.resumePreview;
        if (!preview) return;

        const resumeHTML = this.generateResumeHTML(resume);
        preview.innerHTML = resumeHTML;
        preview.style.display = 'block';
    }

    generateResumeHTML(resume) {
        return `
            <div class="resume-container">
                <div class="resume-header">
                    <h1>${resume.personalInfo.name}</h1>
                    <h2>${resume.personalInfo.title}</h2>
                    <div class="contact-info">
                        <span>📧 ${resume.personalInfo.email}</span>
                        <span>📱 ${resume.personalInfo.phone}</span>
                        <span>📍 ${resume.personalInfo.location}</span>
                        <a href="${resume.personalInfo.linkedin}" target="_blank">💼 LinkedIn</a>
                        <a href="${resume.personalInfo.github}" target="_blank">🐙 GitHub</a>
                    </div>
                </div>
                
                <div class="resume-section">
                    <h3>Professional Summary</h3>
                    <p>${resume.summary}</p>
                </div>
                
                <div class="resume-section">
                    <h3>Technical Skills</h3>
                    ${Object.entries(resume.skills).map(([category, skills]) => `
                        <div class="skill-category">
                            <strong>${category}:</strong> ${skills.join(', ')}
                        </div>
                    `).join('')}
                </div>
                
                <div class="resume-section">
                    <h3>Professional Experience</h3>
                    ${resume.experience.map(exp => `
                        <div class="experience-item">
                            <div class="exp-header">
                                <strong>${exp.title}</strong> - ${exp.company}
                                <span class="exp-period">${exp.period}</span>
                            </div>
                            <div class="exp-location">${exp.location}</div>
                            <ul>
                                ${exp.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
                
                <div class="resume-section">
                    <h3>Selected Projects</h3>
                    ${resume.projects.map(project => `
                        <div class="project-item">
                            <div class="project-header">
                                <strong>${project.name}</strong>
                                ${project.link ? `<a href="${project.link}" target="_blank">View Project</a>` : ''}
                            </div>
                            <p>${project.description}</p>
                            <div class="project-tech">
                                <strong>Technologies:</strong> ${project.technologies.join(', ')}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="resume-section">
                    <h3>Education</h3>
                    <div class="education-item">
                        <strong>${resume.education.degree}</strong><br>
                        ${resume.education.institution}, ${resume.education.location}<br>
                        ${resume.education.year} | GPA: ${resume.education.gpa}
                    </div>
                </div>
            </div>
        `;
    }

    async sendChatMessage() {
        const message = this.elements.chatInput?.value.trim();
        if (!message || !this.currentResume) return;

        this.addChatMessage('user', message);
        this.elements.chatInput.value = '';

        try {
            this.addChatMessage('system', 'Processing your request...');
            
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message,
                    resume: this.currentResume,
                    history: this.conversationHistory
                })
            });

            if (response.ok) {
                const result = await response.json();
                this.addChatMessage('assistant', result.response);
                
                if (result.updatedResume) {
                    this.currentResume = result.updatedResume;
                    this.displayResume(this.currentResume);
                }
            } else {
                this.addChatMessage('system', 'Sorry, I could not process your request. Please try again.');
            }
        } catch (error) {
            console.error('Chat error:', error);
            this.addChatMessage('system', 'Connection error. Please check your internet connection.');
        }
    }

    addChatMessage(sender, content) {
        if (!this.elements.chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const senderLabel = {
            'user': '👤 You',
            'assistant': '🤖 Assistant',
            'system': '🔔 System'
        }[sender];

        messageDiv.innerHTML = `
            <div class="message-header">${senderLabel}</div>
            <div class="message-content">${content}</div>
        `;

        this.elements.chatMessages.appendChild(messageDiv);
        this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;

        // Add to conversation history
        this.conversationHistory.push({ sender, content, timestamp: Date.now() });
    }

    showStatusMessage(message, type = 'info') {
        if (!this.elements.statusMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `status-message status-${type}`;
        messageDiv.innerHTML = `
            <span class="status-icon">${this.getStatusIcon(type)}</span>
            <span class="status-text">${message}</span>
            <button class="status-close" onclick="this.parentElement.remove()">×</button>
        `;

        // Style the message
        messageDiv.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 8px;
            font-size: 14px;
            border-left: 4px solid;
            animation: slideIn 0.3s ease;
        `;

        const colors = {
            success: { bg: '#f0fdf4', border: '#22c55e', text: '#166534' },
            error: { bg: '#fef2f2', border: '#ef4444', text: '#dc2626' },
            warning: { bg: '#fffbeb', border: '#f59e0b', text: '#d97706' },
            info: { bg: '#f0f9ff', border: '#3b82f6', text: '#1e40af' }
        };

        const color = colors[type] || colors.info;
        messageDiv.style.backgroundColor = color.bg;
        messageDiv.style.borderLeftColor = color.border;
        messageDiv.style.color = color.text;

        this.elements.statusMessages.appendChild(messageDiv);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentElement) {
                messageDiv.style.opacity = '0';
                setTimeout(() => messageDiv.remove(), 300);
            }
        }, 5000);
    }

    getStatusIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    setLoading(isLoading) {
        if (this.elements.loadingIndicator) {
            this.elements.loadingIndicator.style.display = isLoading ? 'flex' : 'none';
        }
        
        if (this.elements.generateBtn) {
            this.elements.generateBtn.disabled = isLoading;
            this.elements.generateBtn.textContent = isLoading ? 'Generating...' : 'Generate Tailored Resume';
        }
    }

    updateProgressStep(stepId, status) {
        const step = this.elements.steps?.[stepId];
        if (!step) return;

        step.className = step.className.replace(/\b(pending|current|completed)\b/g, '').trim() + ' ' + status;
    }

    openBrowserPreview() {
        if (!this.currentResume) {
            this.showStatusMessage('❌ No resume generated yet. Please generate a resume first.', 'error');
            return;
        }

        const newWindow = window.open('', '_blank', 'width=800,height=600');
        newWindow.document.write(this.generateFullResumeHTML(this.currentResume));
        newWindow.document.close();
    }

    generateFullResumeHTML(resume) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${resume.personalInfo.name} - Resume</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; line-height: 1.6; }
                    .resume-header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 20px; }
                    .resume-header h1 { color: #1e40af; margin: 0; font-size: 2.5em; }
                    .resume-header h2 { color: #475569; margin: 5px 0; }
                    .contact-info { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; }
                    .resume-section { margin-bottom: 25px; }
                    .resume-section h3 { color: #1e40af; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
                    .skill-category { margin-bottom: 8px; }
                    .experience-item, .project-item { margin-bottom: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; }
                    .exp-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
                    .exp-period { color: #64748b; font-weight: normal; }
                    .project-header { display: flex; justify-content: space-between; align-items: center; }
                    ul { margin-left: 20px; }
                    a { color: #3b82f6; text-decoration: none; }
                    a:hover { text-decoration: underline; }
                    @media print {
                        body { margin: 0; }
                        .resume-section { break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                ${this.generateResumeHTML(resume)}
            </body>
            </html>
        `;
    }

    async exportToPDF() {
        if (!this.currentResume) {
            this.showStatusMessage('❌ No resume generated yet. Please generate a resume first.', 'error');
            return;
        }

        this.showStatusMessage('📄 Preparing PDF export...', 'info');
        
        // For now, open the print dialog
        this.openBrowserPreview();
        
        setTimeout(() => {
            this.showStatusMessage('💡 Use Ctrl+P (Cmd+P on Mac) to save as PDF, or use the browser preview and print to PDF.', 'info');
        }, 1000);
    }

    saveFormData() {
        const formData = {
            jobTitle: this.elements.jobTitle?.value || '',
            companyName: this.elements.companyName?.value || '',
            jobDescription: this.elements.jobDescription?.value || '',
            timestamp: Date.now()
        };

        localStorage.setItem('resumeBuilder_formData', JSON.stringify(formData));
    }

    loadFormData() {
        try {
            const saved = localStorage.getItem('resumeBuilder_formData');
            if (saved) {
                const formData = JSON.parse(saved);
                
                // Only restore if saved recently (within 24 hours)
                if (Date.now() - formData.timestamp < 24 * 60 * 60 * 1000) {
                    if (this.elements.jobTitle) this.elements.jobTitle.value = formData.jobTitle;
                    if (this.elements.companyName) this.elements.companyName.value = formData.companyName;
                    if (this.elements.jobDescription) this.elements.jobDescription.value = formData.jobDescription;
                    
                    this.showStatusMessage('📋 Restored your previous form data.', 'info');
                }
            }
        } catch (error) {
            console.warn('Could not load saved form data:', error);
        }
    }
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const app = new ResumeBuilder();
    app.initialize();
    
    // Make it globally accessible for debugging
    window.resumeBuilder = app;
});

// Add CSS animations
const styles = `
    @keyframes slideIn {
        from { transform: translateX(-100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .field-error {
        animation: fadeIn 0.3s ease;
    }
    
    .status-message {
        animation: slideIn 0.3s ease;
    }
    
    .resume-container {
        animation: fadeIn 0.5s ease;
    }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);