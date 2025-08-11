# Research and Innovation Portfolio

## Overview
This repository contains implementations and examples for research and innovation projects, focusing on cutting-edge software engineering solutions and emerging technologies.

## Featured Project: Health Feedback Form Application

### 🏥 Health Feedback Form - Web-based Health Data Collection Platform

A comprehensive web application for collecting and visualizing health-related data with demographic trend analysis.

**🌐 Live Demo:** [Health Feedback Form](https://sneharkoli.github.io/research-and-innovation/health-feedback-form/)

#### Key Features
- **Interactive Health Survey**: Comprehensive form with demographic, lifestyle, and medical condition fields
- **Real-time Data Visualization**: Dashboard with Chart.js integration showing health trends and statistics
- **Privacy-Compliant**: Anonymous data collection with automatic PII removal
- **Responsive Design**: Mobile-first approach with WCAG 2.1 AA accessibility compliance
- **Local Data Storage**: Client-side data persistence with export capabilities
- **Health Classification**: Automated analysis to classify responses as healthy/moderate/abnormal

#### Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Visualization**: Chart.js for interactive charts and graphs
- **Storage**: localStorage for client-side data persistence
- **Hosting**: GitHub Pages with automated deployment
- **Accessibility**: WCAG 2.1 AA compliant design

#### Quick Start
1. Visit the [live application](https://sneharkoli.github.io/research-and-innovation/health-feedback-form/)
2. Fill out the health feedback form
3. View aggregated results on the dashboard
4. Export data for further analysis

## GitHub Pages Deployment

### Automatic Deployment
This repository is configured for automatic GitHub Pages deployment:

1. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"

2. **Access the Application**:
   - Main site: `https://sneharkoli.github.io/research-and-innovation/`
   - Health Form: `https://sneharkoli.github.io/research-and-innovation/health-feedback-form/`

### Manual Deployment Setup
If you need to set up deployment manually:

```bash
# 1. Ensure your repository has the health-feedback-form directory
# 2. Create .nojekyll file (already included)
# 3. Push changes to main branch
git add .
git commit -m "Deploy health feedback form to GitHub Pages"
git push origin main

# 4. Enable GitHub Pages in repository settings
# 5. Access at: https://[username].github.io/[repository-name]/health-feedback-form/
```

### GitHub Actions Workflow (Optional)
For automated deployment with additional processing:

1. Copy the workflow file from `tmp-workflows/deploy-health-form.yml`
2. Move it to `.github/workflows/deploy-health-form.yml`
3. Commit and push to trigger automated deployment

## All Projects

### Current Projects
- **[Health Feedback Form](./health-feedback-form/)** - Web-based health data collection and visualization platform
- **[Blockchain Integration Studies](./blockchain-integration-studies/)** - Research on blockchain technology integration
- **[Compiler Optimizations](./compiler-optimizations/)** - Advanced compiler optimization techniques
- **[Edge Computing Optimizations](./edge-computing-optimizations/)** - Edge computing performance improvements
- **[Efficiency Improvements](./efficiency-improvements/)** - System efficiency enhancement research
- **[Emerging AI Frameworks](./emerging-ai-frameworks/)** - Next-generation AI framework exploration
- **[Green Computing Initiatives](./green-computing-initiatives/)** - Sustainable computing solutions
- **[Hardware-Software Codesign](./hardware-software-codesign/)** - Integrated hardware-software development
- **[Multimodal Experiments](./multimodal-experiments/)** - Multi-modal system research
- **[Novel Architectures](./novel-architectures/)** - Innovative system architecture designs
- **[Privacy-Preserving ML](./privacy-preserving-ml/)** - Privacy-focused machine learning techniques
- **[Quantum Computing Experiments](./quantum-computing-experiments/)** - Quantum computing research and applications
- **[Real-time System Innovations](./real-time-system-innovations/)** - Real-time system optimization

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Git for version control
- Text editor or IDE for development

### Local Development
```bash
# Clone the repository
git clone https://github.com/sneharkoli/research-and-innovation.git
cd research-and-innovation

# Navigate to a specific project
cd health-feedback-form

# Open in browser (for web projects)
# Simply open index.html in your browser or use a local server
python -m http.server 8000  # Python 3
# or
python -m SimpleHTTPServer 8000  # Python 2
# or use any other local server solution
```

### Project Structure
```
research-and-innovation/
├── health-feedback-form/           # Health data collection application
│   ├── index.html                 # Main form page
│   ├── dashboard.html             # Data visualization dashboard
│   ├── assets/
│   │   ├── css/styles.css         # Responsive styling
│   │   ├── js/app.js              # Main application logic
│   │   ├── js/dashboard.js        # Dashboard functionality
│   │   └── js/data-manager.js     # Data management utilities
│   └── .nojekyll                  # GitHub Pages configuration
├── [other-project-directories]/   # Additional research projects
└── README.md                      # This file
```

## Contributing

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Ensure accessibility compliance (WCAG 2.1 AA)
- Test across multiple browsers and devices
- Include documentation for new features
- Maintain privacy and security standards

### Reporting Issues
- Use GitHub Issues for bug reports and feature requests
- Provide detailed descriptions and reproduction steps
- Include browser/environment information for web projects

## License
This project is part of an academic portfolio. Please respect intellectual property rights and cite appropriately if using for research or educational purposes.

## Contact
For questions about this research portfolio or collaboration opportunities, please open an issue or contact through GitHub.

## Portfolio Structure
This is part of a comprehensive L5-L6 software engineering portfolio demonstrating:
- Full-stack web development capabilities
- Data visualization and analysis skills
- Accessibility and privacy compliance
- Modern development practices and tools
- Research and innovation in emerging technologies

---

**Last Updated**: December 2024  
**Portfolio Version**: 1.0  
**Featured Project**: Health Feedback Form Application

