# GitHubReadTool

**🤖 Interactive AI-Powered Resume Builder & GitHub Portfolio Generator**

Advanced toolkit that combines automated GitHub repository analysis with AI-powered resume tailoring. Features include job description-based resume customization, conversational editing with GitHub Models, and professional PDF export.

## Features

### 🤖 **AI-Powered Resume Tailoring**
✅ **Interactive Resume Builder**: Web-based interface for creating job-specific resumes  
✅ **GitHub Models Integration**: AI-powered content generation and conversational editing  
✅ **Job Description Analysis**: Automatic skill matching and content optimization  
✅ **Chat-Based Editing**: Refine resumes through natural language instructions  
✅ **Live Preview**: Real-time resume preview with professional formatting  

### 📊 **Automated Portfolio Generation**  
✅ **Smart Repository Analysis**: Fetches all GitHub repositories with intelligent filtering  
✅ **Meaningful Contribution Detection**: Excludes forks without your commits  
✅ **Comprehensive Documentation**: Generates detailed project summaries in `docs/projects/`  
✅ **Tech Stack Detection**: Automatically identifies frameworks and technologies used  

### 📄 **Professional Resume Export**
✅ **Multiple Resume Formats**: Web-optimized and A4 print-ready versions  
✅ **PDF Export**: High-quality PDF generation with ATS-friendly formatting  
✅ **Responsive Design**: Modern, recruiter-friendly UI with optimal typography  
✅ **Print Optimization**: Specialized CSS for perfect A4 layout and page breaks  

### 🔗 **Seamless Integration**
✅ **Portfolio Linking**: Direct links between resume projects and detailed documentation  
✅ **GitHub API Integration**: Full access to public and private repositories  
✅ **Responsible AI**: Built-in guidelines for ethical AI use and content accuracy  

## Quick Start

### 🚀 **Interactive Resume Builder**

1. **Setup and Installation**:
   ```bash
   # Clone the repository
   git clone https://github.com/syed-reza98/GitHubReadTool.git
   cd GitHubReadTool
   
   # Run setup wizard
   node scripts/setup.js
   
   # Start the interactive server
   npm start
   ```

2. **Open Resume Builder**:
   - Navigate to `http://localhost:3000`
   - Click "Open Resume Builder"
   - Paste a job description and generate your tailored resume
   - Use the chat interface to refine and improve content
   - Export as A4 PDF when ready

### 📊 **Portfolio Documentation Generation**

### Prerequisites
- Node.js 18+ 
- GitHub Personal Access Token with repo permissions
- GitHub Models API Token (for AI features)

### Environment Setup
The setup script will create a `.env` file. Update it with your tokens:
```bash
# Required for AI-powered features
GITHUB_MODELS_TOKEN=your_github_models_token_here

# Required for repository analysis  
GITHUB_TOKEN=your_github_token_here
```

### Generate Project Documentation
```bash
# Generate comprehensive project summaries
npm run generate-docs

# Start the interactive resume builder
npm start
```

### What it does:
- **Resume Builder**: Creates tailored resumes based on job descriptions using AI
- **Project Analysis**: Fetches all repositories from your GitHub account
- **Smart Filtering**: Filters out repositories where you haven't contributed code
- **Documentation Generation**: Creates structured summaries in `docs/projects/` folder
- **AI Integration**: Uses GitHub Models for conversational resume editing
- **PDF Export**: Generates professional A4 PDFs ready for job applications

## Interactive Resume Builder Interface

### 🎯 **Job-Specific Resume Tailoring**
The interactive builder analyzes job descriptions to:
- Extract relevant keywords and requirements
- Select most appropriate projects from your portfolio  
- Generate targeted professional summaries
- Optimize skill sections for ATS compatibility
- Create measurable achievement statements

### 💬 **Conversational AI Editing**
Chat with AI to refine your resume:
- **Content Refinement**: "Make the summary more concise"
- **Section Enhancement**: "Add more technical skills"
- **Experience Highlighting**: "Emphasize my leadership experience"  
- **Project Selection**: "Include more recent projects"
- **Formatting Adjustments**: "Reorganize the skills section"

### 🖥️ **Live Preview & Export**
- **Real-time Preview**: See changes instantly as you edit
- **Browser Preview**: Full-page preview with print-optimized CSS
- **A4 PDF Export**: Generate recruiter-ready PDF files
- **ATS-Friendly Format**: Semantic HTML ensuring compatibility with applicant tracking systems

## API Integration

The system provides RESTful APIs for programmatic access:

```javascript
// Generate tailored resume
POST /api/resume/generate
{
  "jobTitle": "Senior Full Stack Developer",
  "jobDescription": "Job requirements and description...",
  "companyName": "Target Company"
}

// Edit resume with AI assistance  
POST /api/resume/edit
{
  "currentResume": { /* resume object */ },
  "instruction": "Make the summary more technical"
}

// Conversational editing
POST /api/chat/message
{
  "message": "Add more leadership examples",
  "conversationHistory": [...],
  "currentResume": { /* current state */ }
}
```

## Generated Output

### Project Documentation Structure
Each project in `docs/projects/` includes:
- **Overview**: Project description and purpose
- **Tech Stack**: Languages, frameworks, and tools used  
- **Architecture**: System design and structure
- **Code & Features**: Key functionality and implementation details
- **Status**: Current development status
- **Repository**: Direct link to GitHub repository

### Resume Versions
- **Professional Version**: Modern responsive design for web viewing
- **PDF Version**: A4-optimized with print-specific CSS, proper margins, and page break controls

## Repository Stats
- **Total Repositories Analyzed**: 37
- **Projects with Code Contributions**: 18
- **Documentation Files Generated**: 18

## Project Categories

### 🚀 **Web Applications & APIs**
- **SaaS E-commerce Platform** (PHP, Laravel, MySQL)
- **Walkinroom Hotel Booking** (Laravel, JavaScript)
- **NSU eKYC System** (Laravel, MySQL, APIs)
- **Digital Product E-commerce** (PHP, MySQL)

### 🔧 **System Tools & Utilities**
- **SR600Mini POS Terminal** (C, Embedded Systems)
- **Netcon Connection Manager** (Python, Vue.js)
- **CBRMS Records Management** (PHP, MySQL)

### 🎨 **Frontend & Mobile**
- **Sharothee Wedding Platform** (TypeScript, Next.js)
- **Personal Portfolio Site** (HTML, CSS, JavaScript)

### 🤖 **Machine Learning & AI**
- **Real-Time Helmet Detection** (Python, YOLO, Computer Vision)
- **Quantum Communication Security** (Python, Qiskit)

### ☁️ **Cloud & DevOps**
- **AWS LAMP Deployment** (PHP, MySQL, AWS)
- **Docker Containerization** (Docker, Nginx)

## File Structure

```
├── docs/
│   ├── content/github-models/          # GitHub Models integration documentation
│   │   ├── about-github-models.md      # API overview and features
│   │   ├── quickstart.md              # Setup and usage guide
│   │   └── responsible-use-of-github-models.md  # AI ethics and guidelines
│   ├── projects/                      # Auto-generated project summaries (38 files)
│   └── user-profile.json             # User profile and preferences
├── models/
│   └── github-models.js               # GitHub Models API integration
├── scripts/
│   ├── generate_docs.js               # Repository analysis and documentation generator
│   └── setup.js                      # Interactive setup wizard
├── interactive-resume-builder.html   # Main web interface
├── resume-server.js                  # Backend API server
├── SyedSalmanRezaResume_Professional.html  # Web-optimized resume template
├── SyedSalmanRezaResume_PDF.html     # A4 PDF-optimized resume template
└── README.md                         # This documentation
```

## Usage Examples

### 🎯 **Resume Tailoring Workflow**

1. **Start the Interactive Builder**:
   ```bash
   npm start
   # Visit http://localhost:3000/builder
   ```

2. **Input Job Description**:
   - Paste the complete job posting
   - Specify job title and company
   - Click "Generate Tailored Resume"

3. **AI-Powered Customization**:
   - System analyzes job requirements
   - Matches your skills and projects
   - Generates targeted professional summary
   - Selects most relevant experience

4. **Conversational Refinement**:
   ```
   User: "Make the summary more technical"
   AI: "I've enhanced the summary with specific frameworks and methodologies..."
   
   User: "Add more leadership examples"  
   AI: "I've emphasized your team leadership and mentoring experience..."
   
   User: "Focus on cloud experience"
   AI: "I've highlighted your AWS and cloud architecture work..."
   ```

5. **Professional Export**:
   - Browser preview with print-optimized CSS
   - A4 PDF generation: `SyedSalmanRezaResume_Tailored.pdf`
   - ATS-friendly formatting for job applications

### 🔄 **Portfolio Documentation Update**

```bash
# Regenerate project documentation
npm run generate-docs

# Update user profile
# Edit docs/user-profile.json with latest information

# Restart server to reflect changes
npm start
```

### ⚙️ **Development and Customization**

```bash
# Development mode with auto-restart
npm run dev

# Run setup wizard
npm run setup

# Generate static documentation only
npm run generate-docs
```

## Technical Architecture

### 🤖 **AI Integration Layer**

- **GitHub Models API**: Handles resume generation and conversational editing
- **Intelligent Prompt Engineering**: Context-aware prompts for different resume sections
- **Demo Mode**: Fallback with realistic mock responses when API tokens unavailable
- **Responsible AI**: Built-in guidelines for ethical content generation

### 🖥️ **Frontend Architecture**

- **Vanilla JavaScript**: No framework dependencies, fast loading
- **Progressive Enhancement**: Works without JavaScript for basic functionality  
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Real-time Updates**: Live preview with smooth animations

### 🔧 **Backend Services**

- **Node.js Server**: Lightweight HTTP server with API endpoints
- **RESTful APIs**: Clean endpoint design for resume operations
- **File System Integration**: Direct access to repository data and templates
- **Error Handling**: Graceful degradation and user-friendly error messages

## Advanced Configuration

### 🔐 **Environment Variables**

```bash
# GitHub Models Configuration
GITHUB_MODELS_TOKEN=your_models_token      # Required for AI features
MODEL_ENDPOINT=https://models.inference.ai.azure.com
DEFAULT_MODEL=gpt-4
MAX_TOKENS=2000
DEFAULT_TEMPERATURE=0.7

# GitHub API Configuration  
GITHUB_TOKEN=your_github_token            # Required for repository data
GITHUB_USERNAME=your_username

# Server Configuration
PORT=3000
NODE_ENV=development

# Resume Customization
MAX_PROJECTS=8                           # Maximum projects to include
YEARS_EXPERIENCE_OVERRIDE=5              # Override extracted experience years
ENABLE_ANALYTICS=false                   # Disable usage analytics
```

### 📊 **Project Selection Algorithms**

The system uses intelligent algorithms to select the most relevant projects:

1. **Keyword Matching**: Projects mentioning job description technologies get priority
2. **Recency Scoring**: More recent projects receive higher relevance scores  
3. **Complexity Assessment**: Projects with more detailed descriptions rank higher
4. **Diversity Balancing**: Ensures variety across different technology stacks
5. **Impact Weighting**: Projects with measurable outcomes are prioritized

## Contributing & Extensibility

### 🔌 **Adding New AI Models**

```javascript
// models/custom-model.js
export class CustomAIModel extends GitHubModels {
  constructor(options) {
    super(options);
    this.customEndpoint = 'https://api.custom-ai.com/v1';
  }
  
  async generateTailoredResume(jobDescription, userProfile, projects) {
    // Custom implementation
  }
}
```

### 🎨 **Custom Resume Templates**

1. Create new HTML template in repository root
2. Add corresponding CSS with print optimization
3. Update server.js to reference new template
4. Modify user-profile.json for template selection

### 📈 **Analytics Integration**

```javascript
// Add to resume-server.js
app.post('/api/analytics/track', (req, res) => {
  const { event, data } = req.body;
  // Track resume generations, exports, chat interactions
});
```

## Troubleshooting

### ❗ **Common Issues**

**"GitHub Models token is required"**
- Solution: Set `GITHUB_MODELS_TOKEN` in `.env` file
- Alternative: System will run in demo mode with mock AI responses

**"Failed to load projects"**  
- Solution: Ensure `GITHUB_TOKEN` is set and has repository permissions
- Check: Run `npm run generate-docs` to refresh project data

**"Server failed to start"**
- Check: Port 3000 is available or set custom `PORT` in `.env`
- Verify: Node.js version 18+ is installed

**"Resume generation timeout"**
- Increase: `MAX_TOKENS` in environment configuration  
- Check: GitHub Models API service status
- Fallback: Demo mode provides mock responses

### 🐛 **Debug Mode**

```bash
DEBUG=resume-builder:* npm start
# Enables detailed logging for troubleshooting
```

## 🚀 **GitHub Pages Deployment**

The Interactive Resume Builder is now deployed and accessible via GitHub Pages!

### **🌐 Live Demo**
Visit: **[https://syed-reza98.github.io/GitHubReadTool/](https://syed-reza98.github.io/GitHubReadTool/)**

### **📱 Features Available in GitHub Pages**
- ✅ **Complete UI/UX**: Full interactive interface with professional design
- ✅ **Theme System**: Professional, Dark, and Auto themes with accessibility support  
- ✅ **Demo Mode**: Realistic AI responses and resume generation without API tokens
- ✅ **Conversational Interface**: Chat-based editing with mock AI interactions
- ✅ **Export Functionality**: Browser preview and PDF download capabilities
- ✅ **Responsive Design**: Perfect experience on desktop, tablet, and mobile devices

### **⚙️ How to Deploy Your Own**

1. **Fork the Repository**
   ```bash
   # Fork this repo on GitHub, then clone your fork
   git clone https://github.com/YOUR-USERNAME/GitHubReadTool.git
   cd GitHubReadTool
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Set Source to "Deploy from a branch"
   - Select branch: `main` or your working branch
   - Set folder: `/ (root)`
   - Click Save

3. **Access Your Deployment**
   - Your site will be available at: `https://YOUR-USERNAME.github.io/GitHubReadTool/`
   - The resume builder will be at: `https://YOUR-USERNAME.github.io/GitHubReadTool/interactive-resume-builder.html`

### **🔧 Customization for GitHub Pages**

#### **Update User Profile**
Edit `docs/user-profile.json` with your information:
```json
{
  "name": "Your Name",
  "email": "your.email@example.com",
  "phone": "+1-234-567-8900",
  "location": "Your City, Country",
  "github": "your-github-username",
  "title": "Your Professional Title",
  "summary": "Your professional summary...",
  "yearsExperience": 5,
  "experience": [...],
  "education": [...],
  "skills": {...}
}
```

#### **Generate Your Project Documentation**
```bash
# Run locally to update project documentation
npm install
GITHUB_TOKEN=your_token node scripts/generate_docs.js --user YOUR-USERNAME --out docs/projects
git add docs/projects/
git commit -m "Update project documentation"
git push
```

### **🎯 Differences Between Local and GitHub Pages**

| Feature | Local Development | GitHub Pages |
|---------|------------------|--------------|
| AI Integration | ✅ Full GitHub Models API | ⚠️ Demo mode with mock responses |
| Resume Generation | ✅ Real AI-powered content | ✅ Realistic mock content |
| Conversational Chat | ✅ Actual AI responses | ✅ Predefined helpful responses |
| Export Features | ✅ Full PDF generation | ✅ Browser preview (print to PDF) |
| Theme System | ✅ Complete functionality | ✅ Complete functionality |
| User Experience | ✅ Full features | ✅ Full UI/UX experience |

### **🛠️ Technical Implementation**

The GitHub Pages deployment uses:
- **Static HTML/CSS/JavaScript**: No server required
- **Demo Mode**: Fallback responses when API tokens unavailable  
- **Jekyll Configuration**: Optimized `_config.yml` for GitHub Pages
- **Professional Landing Page**: `index.html` with feature overview
- **Standalone Resume Builder**: `interactive-resume-builder.html` works independently

## License & Acknowledgments

MIT License - See LICENSE file for details.

**Built with:**
- GitHub Models API for AI-powered content generation
- Node.js for lightweight backend services  
- Modern web standards for frontend implementation
- Responsible AI principles for ethical automation

**Special Thanks:**
- GitHub Models team for AI integration capabilities
- Open source community for inspiration and feedback
- Professional resume writing best practices from industry experts

---

**🚀 Ready to create AI-tailored resumes?** Run `npm run setup` to get started!
