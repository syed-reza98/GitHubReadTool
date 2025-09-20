# GitHubReadTool

**Automated GitHub Portfolio & Resume Generator**

Professional toolkit that fetches GitHub repository data, filters for meaningful contributions, and generates comprehensive project documentation with PDF-ready resume integration.

## Features

✅ **Automated Repository Analysis**: Fetches all your GitHub repositories (public & private) and filters for those with actual code contributions  
✅ **Smart Filtering**: Automatically excludes forks without your commits and repositories where you haven't contributed code  
✅ **Professional Documentation**: Generates comprehensive project summaries in `docs/projects/` with consistent structure  
✅ **PDF-Ready Resume**: Two optimized HTML resume versions for different use cases:  
  - `SyedSalmanRezaResume_Professional.html` - Web viewing with modern responsive design  
  - `SyedSalmanRezaResume_PDF.html` - A4 print-optimized with specialized CSS for PDF generation  
✅ **Tech Stack Detection**: Automatically identifies frameworks, languages, and tools used in each project  
✅ **Portfolio Integration**: Seamlessly links project documentation to resume for comprehensive presentation  

## Quick Start

### Prerequisites
- Node.js 18+ 
- GitHub Personal Access Token with repo permissions

### Setup
1. Create a `.env` file with your GitHub token:
   ```
   GITHUB_TOKEN=your_github_token_here
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Generate project documentation:
   ```bash
   node scripts/generate_docs.js
   ```

### What it does:
- Fetches all repositories from your GitHub account
- Filters out repositories where you haven't contributed code
- Skips forks unless you have commits in them
- Generates detailed markdown documentation for each qualifying project
- Creates structured summaries in `docs/projects/` folder
- Updates project count and links in resume files

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
├── docs/projects/          # Auto-generated project summaries (18 files)
├── scripts/
│   └── generate_docs.js    # Main automation script
├── images/                 # Profile images and assets
├── SyedSalmanRezaResume_Professional.html  # Web-optimized resume
├── SyedSalmanRezaResume_PDF.html          # A4 PDF-optimized resume
└── README.md              # This documentation
```

## Development Notes

### GitHub API Features Used
- Repository listing with pagination
- Commit history analysis for contribution filtering
- Language detection and repository metadata
- Private repository access with proper authentication

### Smart Filtering Logic
- Excludes repositories with 0 commits from user
- Skips forks unless user has meaningful contributions
- Filters out empty or template repositories
- Prioritizes repositories with substantial code content

### Resume Optimization
- **Web Version**: Responsive grid layout, interactive elements, modern typography
- **PDF Version**: A4 margins, print-safe colors, page break optimization, URL footnotes

## Usage Examples

### Generate Documentation for Specific User
```bash
# Set your token
set GITHUB_TOKEN=ghp_your_token_here

# Run the generator
node scripts/generate_docs.js
```

### Output Sample
```
✅ Fetched 37 repositories from GitHub
✅ Filtered to 18 repositories with code contributions
✅ Generated docs/projects/saas-ecom.md
✅ Generated docs/projects/sharothee-wedding.md
...
✅ Documentation generation complete!
```

## Contributing

This tool is designed for personal portfolio management but can be adapted for other users. Key customization points:
- Update GitHub username in `generate_docs.js`
- Modify resume template structure in HTML files
- Adjust filtering criteria for different contribution patterns
- Customize project categorization logic

## License

MIT License - See LICENSE file for details

---

**Ready to use**: Just set your GitHub token and run the script to generate professional project documentation and PDF-ready resume! 🚀
