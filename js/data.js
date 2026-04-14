// ===== Resume Data Store =====
const ResumeData = {
  personal: {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    portfolio: '',
    summary: ''
  },
  education: [],
  experience: [],
  skills: [],
  projects: [],
  certifications: [],
  template: 'modern',

  // Load from localStorage
  load() {
    const saved = localStorage.getItem('resumeData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.assign(this.personal, parsed.personal || {});
        this.education = parsed.education || [];
        this.experience = parsed.experience || [];
        this.skills = parsed.skills || [];
        this.projects = parsed.projects || [];
        this.certifications = parsed.certifications || [];
        this.template = parsed.template || 'modern';
      } catch (e) {
        console.warn('Failed to load saved data:', e);
      }
    }
  },

  // Save to localStorage
  save() {
    localStorage.setItem('resumeData', JSON.stringify({
      personal: this.personal,
      education: this.education,
      experience: this.experience,
      skills: this.skills,
      projects: this.projects,
      certifications: this.certifications,
      template: this.template
    }));
  },

  // Export as JSON
  exportJSON() {
    const blob = new Blob([JSON.stringify(this, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume_${this.personal.fullName || 'data'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Import from JSON
  importJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          Object.assign(this.personal, parsed.personal || {});
          this.education = parsed.education || [];
          this.experience = parsed.experience || [];
          this.skills = parsed.skills || [];
          this.projects = parsed.projects || [];
          this.certifications = parsed.certifications || [];
          this.template = parsed.template || 'modern';
          this.save();
          resolve();
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsText(file);
    });
  },

  // Calculate strength score
  getStrength() {
    let score = 0;
    let tips = [];
    const p = this.personal;

    if (p.fullName) score += 10; else tips.push('Add your full name');
    if (p.email) score += 5; else tips.push('Add your email address');
    if (p.phone) score += 5; else tips.push('Add your phone number');
    if (p.jobTitle) score += 5; else tips.push('Add a job title');
    if (p.summary && p.summary.length > 30) score += 10; else tips.push('Write a professional summary (30+ chars)');
    if (p.linkedin) score += 5; else tips.push('Add your LinkedIn profile');

    if (this.education.length > 0) score += 15; else tips.push('Add at least one education entry');
    if (this.experience.length > 0) score += 20; else tips.push('Add work experience');
    if (this.experience.length >= 2) score += 5;

    if (this.skills.length >= 3) score += 10; else tips.push('Add at least 3 skills');
    if (this.skills.length >= 5) score += 5; else if (this.skills.length < 5) tips.push('Add more skills (5+ recommended)');

    if (this.projects.length > 0) score += 5; else tips.push('Add a project to showcase your work');

    return { score: Math.min(score, 100), tips };
  }
};
