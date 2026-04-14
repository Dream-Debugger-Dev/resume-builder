// ===== Template Renderers =====
const Templates = {
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  },

  renderContact(data, template) {
    const p = data.personal;
    const items = [];
    if (p.email) items.push(`<span><i class="fas fa-envelope"></i> ${this.escapeHtml(p.email)}</span>`);
    if (p.phone) items.push(`<span><i class="fas fa-phone"></i> ${this.escapeHtml(p.phone)}</span>`);
    if (p.location) items.push(`<span><i class="fas fa-map-marker-alt"></i> ${this.escapeHtml(p.location)}</span>`);
    if (p.linkedin) items.push(`<span><i class="fab fa-linkedin"></i> ${this.escapeHtml(p.linkedin.replace('https://', ''))}</span>`);
    if (p.portfolio) items.push(`<span><i class="fas fa-globe"></i> ${this.escapeHtml(p.portfolio.replace('https://', ''))}</span>`);
    return items.join('');
  },

  skillLevelText(level) {
    const num = parseInt(level) || 50;
    if (num >= 90) return 'Expert';
    if (num >= 70) return 'Advanced';
    if (num >= 50) return 'Intermediate';
    if (num >= 30) return 'Beginner';
    return 'Novice';
  },

  // Modern Minimal Template
  modern(data) {
    const p = data.personal;
    let html = `<div class="template-modern">`;

    // Header
    html += `<div class="resume-header">`;
    html += `<div class="resume-name">${this.escapeHtml(p.fullName) || 'Your Name'}</div>`;
    if (p.jobTitle) html += `<div class="resume-title">${this.escapeHtml(p.jobTitle)}</div>`;
    html += `<div class="resume-contact">${this.renderContact(data)}</div>`;
    html += `</div>`;

    // Summary
    if (p.summary) {
      html += `<div class="resume-summary">${this.escapeHtml(p.summary)}</div>`;
    }

    // Experience
    if (data.experience.length > 0) {
      html += `<div class="resume-section"><div class="section-title">Work Experience</div>`;
      data.experience.forEach(exp => {
        html += `<div class="entry">
          <div class="entry-top">
            <span class="entry-name">${this.escapeHtml(exp.company)}</span>
            <span class="entry-date">${this.escapeHtml(exp.startDate)} - ${this.escapeHtml(exp.endDate) || 'Present'}</span>
          </div>
          <div class="entry-sub">${this.escapeHtml(exp.position)}</div>
          <div class="entry-desc">${this.escapeHtml(exp.description).replace(/\n/g, '<br>')}</div>
        </div>`;
      });
      html += `</div>`;
    }

    // Education
    if (data.education.length > 0) {
      html += `<div class="resume-section"><div class="section-title">Education</div>`;
      data.education.forEach(edu => {
        html += `<div class="entry">
          <div class="entry-top">
            <span class="entry-name">${this.escapeHtml(edu.institution)}</span>
            <span class="entry-date">${this.escapeHtml(edu.startDate)} - ${this.escapeHtml(edu.endDate) || 'Present'}</span>
          </div>
          <div class="entry-sub">${this.escapeHtml(edu.degree)}${edu.field ? ' in ' + this.escapeHtml(edu.field) : ''}</div>
          ${edu.gpa ? `<div class="entry-desc">GPA: ${this.escapeHtml(edu.gpa)}</div>` : ''}
        </div>`;
      });
      html += `</div>`;
    }

    // Skills
    if (data.skills.length > 0) {
      html += `<div class="resume-section"><div class="section-title">Skills</div>`;
      html += `<div class="skills-grid">`;
      data.skills.forEach(skill => {
        html += `<span class="skill-tag">${this.escapeHtml(skill.name)}</span>`;
      });
      html += `</div></div>`;
    }

    // Projects
    if (data.projects.length > 0) {
      html += `<div class="resume-section"><div class="section-title">Projects</div>`;
      data.projects.forEach(proj => {
        html += `<div class="entry">
          <div class="entry-top">
            <span class="entry-name">${this.escapeHtml(proj.name)}</span>
          </div>
          ${proj.tech ? `<div class="entry-sub">${this.escapeHtml(proj.tech)}</div>` : ''}
          <div class="entry-desc">${this.escapeHtml(proj.description).replace(/\n/g, '<br>')}</div>
        </div>`;
      });
      html += `</div>`;
    }

    // Certifications
    if (data.certifications.length > 0) {
      html += `<div class="resume-section"><div class="section-title">Certifications</div>`;
      data.certifications.forEach(cert => {
        html += `<div class="entry">
          <div class="entry-top">
            <span class="entry-name">${this.escapeHtml(cert.name)}</span>
            <span class="entry-date">${this.escapeHtml(cert.date)}</span>
          </div>
          <div class="entry-sub">${this.escapeHtml(cert.issuer)}</div>
        </div>`;
      });
      html += `</div>`;
    }

    html += `</div>`;
    return html;
  },

  // Creative Template
  creative(data) {
    const p = data.personal;
    let html = `<div class="template-creative">`;

    // Sidebar
    html += `<div class="sidebar">`;
    html += `<div class="resume-name">${this.escapeHtml(p.fullName) || 'Your Name'}</div>`;
    if (p.jobTitle) html += `<div class="resume-title">${this.escapeHtml(p.jobTitle)}</div>`;

    html += `<div class="section-title">Contact</div>`;
    if (p.email) html += `<div class="contact-item"><i class="fas fa-envelope"></i> ${this.escapeHtml(p.email)}</div>`;
    if (p.phone) html += `<div class="contact-item"><i class="fas fa-phone"></i> ${this.escapeHtml(p.phone)}</div>`;
    if (p.location) html += `<div class="contact-item"><i class="fas fa-map-marker-alt"></i> ${this.escapeHtml(p.location)}</div>`;
    if (p.linkedin) html += `<div class="contact-item"><i class="fab fa-linkedin"></i> ${this.escapeHtml(p.linkedin.replace('https://', ''))}</div>`;
    if (p.portfolio) html += `<div class="contact-item"><i class="fas fa-globe"></i> ${this.escapeHtml(p.portfolio.replace('https://', ''))}</div>`;

    // Skills in sidebar
    if (data.skills.length > 0) {
      html += `<div class="section-title">Skills</div>`;
      data.skills.forEach(skill => {
        const level = parseInt(skill.level) || 50;
        const dots = Math.round(level / 20);
        html += `<div class="skill-item">
          <div class="skill-name">${this.escapeHtml(skill.name)}</div>
          <div class="skill-dots">
            ${[1,2,3,4,5].map(i => `<div class="skill-dot${i <= dots ? ' filled' : ''}"></div>`).join('')}
          </div>
        </div>`;
      });
    }

    // Certifications in sidebar
    if (data.certifications.length > 0) {
      html += `<div class="section-title">Certifications</div>`;
      data.certifications.forEach(cert => {
        html += `<div class="contact-item" style="flex-direction:column;align-items:flex-start;gap:2px;">
          <strong style="font-size:10px;">${this.escapeHtml(cert.name)}</strong>
          <span style="opacity:0.7;font-size:9px;">${this.escapeHtml(cert.issuer)} ${cert.date ? '• ' + this.escapeHtml(cert.date) : ''}</span>
        </div>`;
      });
    }

    html += `</div>`;

    // Main Content
    html += `<div class="main-content">`;

    if (p.summary) {
      html += `<div class="resume-summary">${this.escapeHtml(p.summary)}</div>`;
    }

    // Experience
    if (data.experience.length > 0) {
      html += `<div class="resume-section"><div class="section-title">Experience</div>`;
      data.experience.forEach(exp => {
        html += `<div class="entry">
          <div class="entry-top">
            <span class="entry-name">${this.escapeHtml(exp.company)}</span>
            <span class="entry-date">${this.escapeHtml(exp.startDate)} - ${this.escapeHtml(exp.endDate) || 'Present'}</span>
          </div>
          <div class="entry-sub">${this.escapeHtml(exp.position)}</div>
          <div class="entry-desc">${this.escapeHtml(exp.description).replace(/\n/g, '<br>')}</div>
        </div>`;
      });
      html += `</div>`;
    }

    // Education
    if (data.education.length > 0) {
      html += `<div class="resume-section"><div class="section-title">Education</div>`;
      data.education.forEach(edu => {
        html += `<div class="entry">
          <div class="entry-top">
            <span class="entry-name">${this.escapeHtml(edu.institution)}</span>
            <span class="entry-date">${this.escapeHtml(edu.startDate)} - ${this.escapeHtml(edu.endDate) || 'Present'}</span>
          </div>
          <div class="entry-sub">${this.escapeHtml(edu.degree)}${edu.field ? ' in ' + this.escapeHtml(edu.field) : ''}</div>
        </div>`;
      });
      html += `</div>`;
    }

    // Projects
    if (data.projects.length > 0) {
      html += `<div class="resume-section"><div class="section-title">Projects</div>`;
      data.projects.forEach(proj => {
        html += `<div class="entry">
          <div class="entry-name">${this.escapeHtml(proj.name)}</div>
          ${proj.tech ? `<div class="entry-sub">${this.escapeHtml(proj.tech)}</div>` : ''}
          <div class="entry-desc">${this.escapeHtml(proj.description).replace(/\n/g, '<br>')}</div>
        </div>`;
      });
      html += `</div>`;
    }

    html += `</div></div>`;
    return html;
  },

  // Corporate Template
  corporate(data) {
    const p = data.personal;
    let html = `<div class="template-corporate">`;

    // Header
    html += `<div class="resume-header">`;
    html += `<div class="resume-name">${this.escapeHtml(p.fullName) || 'Your Name'}</div>`;
    if (p.jobTitle) html += `<div class="resume-title">${this.escapeHtml(p.jobTitle)}</div>`;
    html += `<div class="resume-contact">${this.renderContact(data)}</div>`;
    html += `</div>`;

    // Body wrapper
    html += `<div class="resume-body">`;

    // Summary
    if (p.summary) {
      html += `<div class="resume-summary">${this.escapeHtml(p.summary)}</div>`;
    }

    // Experience
    if (data.experience.length > 0) {
      html += `<div class="resume-section"><div class="section-title">Professional Experience</div>`;
      data.experience.forEach(exp => {
        html += `<div class="entry">
          <div class="entry-top">
            <span class="entry-name">${this.escapeHtml(exp.position)} — ${this.escapeHtml(exp.company)}</span>
            <span class="entry-date">${this.escapeHtml(exp.startDate)} - ${this.escapeHtml(exp.endDate) || 'Present'}</span>
          </div>
          <div class="entry-desc">${this.escapeHtml(exp.description).replace(/\n/g, '<br>')}</div>
        </div>`;
      });
      html += `</div>`;
    }

    // Education
    if (data.education.length > 0) {
      html += `<div class="resume-section"><div class="section-title">Education</div>`;
      data.education.forEach(edu => {
        html += `<div class="entry">
          <div class="entry-top">
            <span class="entry-name">${this.escapeHtml(edu.degree)}${edu.field ? ' in ' + this.escapeHtml(edu.field) : ''}</span>
            <span class="entry-date">${this.escapeHtml(edu.startDate)} - ${this.escapeHtml(edu.endDate) || 'Present'}</span>
          </div>
          <div class="entry-sub">${this.escapeHtml(edu.institution)}</div>
          ${edu.gpa ? `<div class="entry-desc">GPA: ${this.escapeHtml(edu.gpa)}</div>` : ''}
        </div>`;
      });
      html += `</div>`;
    }

    // Skills
    if (data.skills.length > 0) {
      html += `<div class="resume-section"><div class="section-title">Skills</div>`;
      html += `<div class="skills-grid">`;
      data.skills.forEach(skill => {
        html += `<div class="skill-item">
          <span class="skill-name">${this.escapeHtml(skill.name)}</span>
          <span class="skill-level">${this.skillLevelText(skill.level)}</span>
        </div>`;
      });
      html += `</div></div>`;
    }

    // Projects
    if (data.projects.length > 0) {
      html += `<div class="resume-section"><div class="section-title">Projects</div>`;
      data.projects.forEach(proj => {
        html += `<div class="entry">
          <div class="entry-name">${this.escapeHtml(proj.name)}</div>
          ${proj.tech ? `<div class="entry-sub">${this.escapeHtml(proj.tech)}</div>` : ''}
          <div class="entry-desc">${this.escapeHtml(proj.description).replace(/\n/g, '<br>')}</div>
        </div>`;
      });
      html += `</div>`;
    }

    // Certifications
    if (data.certifications.length > 0) {
      html += `<div class="resume-section"><div class="section-title">Certifications</div>`;
      data.certifications.forEach(cert => {
        html += `<div class="entry">
          <div class="entry-top">
            <span class="entry-name">${this.escapeHtml(cert.name)}</span>
            <span class="entry-date">${this.escapeHtml(cert.date)}</span>
          </div>
          <div class="entry-sub">${this.escapeHtml(cert.issuer)}</div>
        </div>`;
      });
      html += `</div>`;
    }

    html += `</div>`; // close resume-body
    html += `</div>`;
    return html;
  },

  render(data) {
    const template = data.template || 'modern';
    if (this[template]) {
      return this[template](data);
    }
    return this.modern(data);
  }
};
