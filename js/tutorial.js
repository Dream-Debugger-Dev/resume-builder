// ===== Interactive Tutorial / Guided Tour =====
const Tutorial = {
  currentStep: 0,
  overlay: null,
  tooltip: null,
  isActive: false,

  steps: [
    {
      target: '.logo',
      title: 'Welcome to ResumeForge! 👋',
      text: 'This is your free professional resume builder. Let\'s take a quick tour to help you create an amazing resume in minutes.',
      position: 'bottom'
    },
    {
      target: '.step-progress',
      title: 'Step-by-Step Form 📝',
      text: 'Your resume is built in 6 easy steps: Personal Info, Education, Experience, Skills, Projects, and Certifications. Click any step to jump directly to it.',
      position: 'bottom'
    },
    {
      target: '.form-step.active',
      title: 'Fill Your Details ✍️',
      text: 'Start by entering your personal information here. Fields marked with * are required. Everything else is optional but recommended for a stronger resume.',
      position: 'right'
    },
    {
      target: '#btn-next',
      title: 'Navigate Between Steps ➡️',
      text: 'Use Previous and Next buttons to move between sections. You can also click the step numbers at the top to jump to any section.',
      position: 'top'
    },
    {
      target: '.strength-bar-container',
      title: 'Resume Strength Score 💪',
      text: 'This bar shows how complete your resume is. Fill more sections to increase your score. Tips appear here to help you improve.',
      position: 'bottom'
    },
    {
      target: '.preview-panel .preview-header',
      title: 'Live Preview 👁️',
      text: 'See your resume update in real-time as you type. No need to refresh — changes appear instantly on the right side.',
      position: 'left',
      mobileNote: 'On mobile, tap the "Preview" button at the bottom-right to see your resume.'
    },
    {
      target: '.template-picker',
      title: 'Switch Templates 🎨',
      text: 'Choose from 3 professional templates: Modern (ATS-friendly), Creative (with sidebar), and Corporate (dark header). Hover on each icon to see a preview. Your data stays intact when switching!',
      position: 'top'
    },
    {
      target: '#btn-download-main',
      title: 'Download Your Resume 📄',
      text: 'Click here to download your resume. Choose PDF for print-ready quality, or Word (.docx) if you want to edit it later in Microsoft Word or Google Docs.',
      position: 'bottom'
    },
    {
      target: '#btn-export-json',
      title: 'Export / Save Your Data 💾',
      text: 'Export your resume data as a JSON file to save it on your computer. You can import it later to continue editing.',
      position: 'bottom'
    },
    {
      target: '#btn-import',
      title: 'Import Resume Data 📂',
      text: 'Have a previously saved JSON file? Import it here to load all your data back instantly.',
      position: 'bottom'
    },
    {
      target: '#btn-dark-mode',
      title: 'Dark Mode 🌙',
      text: 'Toggle between light and dark themes for comfortable editing. Your preference is saved automatically.',
      position: 'bottom'
    },
    {
      target: null,
      title: 'You\'re All Set! 🚀',
      text: 'Start filling in your details and watch your professional resume come to life. Use the "Suggestions" buttons for AI-powered bullet points. Happy building!',
      position: 'center'
    }
  ],

  start() {
    // Don't restart if already active
    if (this.isActive) return;
    this.isActive = true;
    this.currentStep = 0;
    this.createOverlay();
    this.createTooltip();
    this.showStep(0);
  },

  createOverlay() {
    // Spotlight overlay using 4 divs around the target
    this.overlay = document.createElement('div');
    this.overlay.className = 'tutorial-overlay';
    this.overlay.innerHTML = `
      <div class="tutorial-overlay-top"></div>
      <div class="tutorial-overlay-left"></div>
      <div class="tutorial-overlay-right"></div>
      <div class="tutorial-overlay-bottom"></div>
      <div class="tutorial-spotlight"></div>
    `;
    document.body.appendChild(this.overlay);
  },

  createTooltip() {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'tutorial-tooltip';
    this.tooltip.innerHTML = `
      <div class="tutorial-tooltip-arrow"></div>
      <div class="tutorial-tooltip-header">
        <span class="tutorial-step-counter"></span>
        <button class="tutorial-skip-btn" title="Skip tutorial">✕</button>
      </div>
      <h4 class="tutorial-tooltip-title"></h4>
      <p class="tutorial-tooltip-text"></p>
      <div class="tutorial-tooltip-footer">
        <button class="tutorial-btn tutorial-btn-prev">← Back</button>
        <button class="tutorial-btn tutorial-btn-next">Next →</button>
      </div>
    `;
    document.body.appendChild(this.tooltip);

    // Event listeners
    this.tooltip.querySelector('.tutorial-btn-next').addEventListener('click', () => this.next());
    this.tooltip.querySelector('.tutorial-btn-prev').addEventListener('click', () => this.prev());
    this.tooltip.querySelector('.tutorial-skip-btn').addEventListener('click', () => this.end());
  },

  showStep(index) {
    if (index < 0 || index >= this.steps.length) {
      this.end();
      return;
    }

    this.currentStep = index;
    const step = this.steps[index];
    const target = step.target ? document.querySelector(step.target) : null;

    // Update counter
    this.tooltip.querySelector('.tutorial-step-counter').textContent =
      `${index + 1} / ${this.steps.length}`;

    // Update content
    this.tooltip.querySelector('.tutorial-tooltip-title').textContent = step.title;

    let text = step.text;
    if (step.mobileNote && window.innerWidth <= 1024) {
      text += ' ' + step.mobileNote;
    }
    this.tooltip.querySelector('.tutorial-tooltip-text').textContent = text;

    // Update buttons
    const prevBtn = this.tooltip.querySelector('.tutorial-btn-prev');
    const nextBtn = this.tooltip.querySelector('.tutorial-btn-next');
    prevBtn.style.visibility = index === 0 ? 'hidden' : 'visible';
    nextBtn.textContent = index === this.steps.length - 1 ? 'Finish ✓' : 'Next →';

    // Position spotlight and tooltip
    if (target) {
      this.positionSpotlight(target);
      this.positionTooltip(target, step.position);
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      // Center mode (no target)
      this.hideSpotlight();
      this.centerTooltip();
    }

    // Animate in
    this.tooltip.classList.remove('tutorial-tooltip-animate');
    void this.tooltip.offsetHeight;
    this.tooltip.classList.add('tutorial-tooltip-animate');
  },

  positionSpotlight(target) {
    const rect = target.getBoundingClientRect();
    const pad = 8;
    const spotlight = this.overlay.querySelector('.tutorial-spotlight');
    const overlayTop = this.overlay.querySelector('.tutorial-overlay-top');
    const overlayLeft = this.overlay.querySelector('.tutorial-overlay-left');
    const overlayRight = this.overlay.querySelector('.tutorial-overlay-right');
    const overlayBottom = this.overlay.querySelector('.tutorial-overlay-bottom');

    const top = rect.top - pad;
    const left = rect.left - pad;
    const width = rect.width + pad * 2;
    const height = rect.height + pad * 2;

    spotlight.style.cssText = `
      top: ${top}px; left: ${left}px;
      width: ${width}px; height: ${height}px;
      display: block;
    `;

    overlayTop.style.cssText = `height: ${Math.max(0, top)}px; left: 0; right: 0; top: 0;`;
    overlayBottom.style.cssText = `top: ${top + height}px; left: 0; right: 0; bottom: 0;`;
    overlayLeft.style.cssText = `top: ${top}px; left: 0; width: ${Math.max(0, left)}px; height: ${height}px;`;
    overlayRight.style.cssText = `top: ${top}px; right: 0; left: ${left + width}px; height: ${height}px;`;

    [overlayTop, overlayLeft, overlayRight, overlayBottom].forEach(el => el.style.display = 'block');
  },

  hideSpotlight() {
    const spotlight = this.overlay.querySelector('.tutorial-spotlight');
    spotlight.style.display = 'none';
    this.overlay.querySelectorAll('.tutorial-overlay-top, .tutorial-overlay-left, .tutorial-overlay-right, .tutorial-overlay-bottom').forEach(el => {
      el.style.cssText = 'top:0;left:0;right:0;bottom:0;';
    });
  },

  positionTooltip(target, position) {
    const rect = target.getBoundingClientRect();
    const tt = this.tooltip;
    const pad = 16;

    // Reset
    tt.style.top = '';
    tt.style.left = '';
    tt.style.right = '';
    tt.style.bottom = '';
    tt.style.transform = '';
    tt.setAttribute('data-position', position);

    // Measure tooltip
    tt.style.visibility = 'hidden';
    tt.style.display = 'block';
    const ttRect = tt.getBoundingClientRect();
    tt.style.visibility = '';

    switch (position) {
      case 'bottom':
        tt.style.top = (rect.bottom + pad) + 'px';
        tt.style.left = (rect.left + rect.width / 2 - ttRect.width / 2) + 'px';
        break;
      case 'top':
        tt.style.top = (rect.top - ttRect.height - pad) + 'px';
        tt.style.left = (rect.left + rect.width / 2 - ttRect.width / 2) + 'px';
        break;
      case 'left':
        tt.style.top = (rect.top + rect.height / 2 - ttRect.height / 2) + 'px';
        tt.style.left = (rect.left - ttRect.width - pad) + 'px';
        break;
      case 'right':
        tt.style.top = (rect.top + rect.height / 2 - ttRect.height / 2) + 'px';
        tt.style.left = (rect.right + pad) + 'px';
        break;
    }

    // Clamp to viewport
    const finalRect = tt.getBoundingClientRect();
    if (finalRect.left < 10) tt.style.left = '10px';
    if (finalRect.right > window.innerWidth - 10) {
      tt.style.left = (window.innerWidth - ttRect.width - 10) + 'px';
    }
    if (finalRect.top < 10) tt.style.top = '10px';
    if (finalRect.bottom > window.innerHeight - 10) {
      tt.style.top = (window.innerHeight - ttRect.height - 10) + 'px';
    }
  },

  centerTooltip() {
    const tt = this.tooltip;
    tt.setAttribute('data-position', 'center');
    tt.style.top = '50%';
    tt.style.left = '50%';
    tt.style.transform = 'translate(-50%, -50%)';
  },

  next() {
    if (this.currentStep < this.steps.length - 1) {
      this.showStep(this.currentStep + 1);
    } else {
      this.end();
    }
  },

  prev() {
    if (this.currentStep > 0) {
      this.showStep(this.currentStep - 1);
    }
  },

  end() {
    this.isActive = false;
    if (this.overlay) { this.overlay.remove(); this.overlay = null; }
    if (this.tooltip) { this.tooltip.remove(); this.tooltip = null; }
    localStorage.setItem('tutorialCompleted', 'true');
  },

  // Check if should auto-start for first-time visitors
  shouldAutoStart() {
    return !localStorage.getItem('tutorialCompleted');
  }
};
