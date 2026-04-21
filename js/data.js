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
  languages: [],        // { id, name, proficiency }
  awards: [],           // { id, title, issuer, date, description }
  volunteer: [],        // { id, organization, role, startDate, endDate, description }
  publications: [],     // { id, title, publisher, date, link, description }
  custom: [],           // { id, title, items: [{ id, heading, description }] }
  template: 'modern',

  _allSectionKeys() {
    return ['education', 'experience', 'skills', 'projects', 'certifications',
            'languages', 'awards', 'volunteer', 'publications', 'custom'];
  },

  // Load from localStorage
  load() {
    const saved = localStorage.getItem('resumeData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.assign(this.personal, parsed.personal || {});
        this._allSectionKeys().forEach(k => { this[k] = parsed[k] || []; });
        this.template = parsed.template || 'modern';
      } catch (e) {
        console.warn('Failed to load saved data:', e);
      }
    }
  },

  // Save to localStorage
  save() {
    const out = { personal: this.personal, template: this.template };
    this._allSectionKeys().forEach(k => { out[k] = this[k]; });
    localStorage.setItem('resumeData', JSON.stringify(out));
  },

  // Export as JSON
  exportJSON() {
    const out = { personal: this.personal, template: this.template };
    this._allSectionKeys().forEach(k => { out[k] = this[k]; });
    const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume_${this.personal.fullName || 'data'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Replace current data with a normalized object
  applyImport(normalized) {
    Object.assign(this.personal, normalized.personal || {});
    this._allSectionKeys().forEach(k => { this[k] = normalized[k] || []; });
    if (normalized.template) this.template = normalized.template;
    this.save();
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

    if (this.education.length > 0) score += 12; else tips.push('Add at least one education entry');
    if (this.experience.length > 0) score += 18; else tips.push('Add work experience');
    if (this.experience.length >= 2) score += 4;

    if (this.skills.length >= 3) score += 8; else tips.push('Add at least 3 skills');
    if (this.skills.length >= 5) score += 4;

    if (this.projects.length > 0) score += 4; else tips.push('Add a project to showcase your work');
    if (this.languages.length > 0) score += 2;
    if (this.awards.length > 0) score += 2;
    if (this.volunteer.length > 0) score += 1;

    return { score: Math.min(score, 100), tips };
  }
};
