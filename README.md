# ResumeForge — Free Online Resume Builder

Build professional, ATS-friendly resumes for free. No sign-up, no fees, no limits.

**Live Demo:** [https://dream-debugger-dev.github.io/resume-builder/](https://dream-debugger-dev.github.io/resume-builder/)

## Features

- 3 professional templates (Modern, Creative, Corporate)
- Live side-by-side preview
- Download as PDF or Word (.docx)
- Smart suggestions for 9+ industries
- Resume strength score with tips
- Auto-save to browser storage
- Export/import resume data as JSON
- Dark mode
- Fully responsive (mobile, tablet, desktop)
- Interactive guided tutorial for first-time users
- 100% client-side — your data never leaves your browser

## Tech Stack

- HTML, CSS, JavaScript (vanilla — no frameworks)
- [docx.js](https://docx.js.org/) for Word export
- [FileSaver.js](https://github.com/nicholasnet/FileSaver.js) for file downloads
- [Font Awesome](https://fontawesome.com/) for icons
- Google Fonts (Inter, Poppins)

## Getting Started

No build tools required. Just open `index.html` in a browser.

```bash
git clone https://github.com/Dream-Debugger-Dev/resume-builder.git
cd resume-builder
# Open index.html in your browser
```

## Project Structure

```
resume-builder/
├── index.html          # Landing page
├── builder.html        # Resume builder app
├── robots.txt          # SEO
├── sitemap.xml         # SEO
├── css/
│   ├── style.css       # Core app styles
│   ├── landing.css     # Landing page styles
│   ├── templates.css   # Resume template styles
│   ├── responsive.css  # Responsive + print styles
│   └── tutorial.css    # Guided tour styles
├── js/
│   ├── app.js          # Main app logic
│   ├── data.js         # Data store + localStorage
│   ├── suggestions.js  # Industry-specific suggestions
│   ├── templates.js    # Resume template renderers
│   └── tutorial.js     # Interactive tutorial
└── image/
    ├── Template-1.png  # Modern template preview
    ├── Template-2.png  # Creative template preview
    └── Template-3.png  # Corporate template preview
```

## License

MIT
