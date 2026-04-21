// ===== Resume Builder App — Production v2 =====
(function () {
  'use strict';

  let currentStep = 0;
  const totalSteps = 11;
  let autoSaveTimer = null;
  let pendingImport = null; // staged import awaiting user confirmation

  // ===== Initialize =====
  function init() {
    ResumeData.load();
    restoreFormData();
    setupEventListeners();
    updatePreview();
    updateStrength();
    updateStepProgress();
    restoreTheme();
    initTutorial();
  }

  // ===== Event Listeners =====
  function setupEventListeners() {
    // Step navigation
    document.getElementById('btn-next').addEventListener('click', nextStep);
    document.getElementById('btn-prev').addEventListener('click', prevStep);

    // Step clicks
    document.querySelectorAll('.step').forEach(step => {
      step.addEventListener('click', () => goToStep(parseInt(step.dataset.step)));
    });

    // Personal info inputs
    document.querySelectorAll('[data-field]').forEach(input => {
      input.addEventListener('input', (e) => {
        ResumeData.personal[e.target.dataset.field] = e.target.value;
        scheduleAutoSave();
        updatePreview();
        updateStrength();
      });
    });

    // Summary suggestions
    const summaryBtn = document.getElementById('btn-suggest-summary');
    if (summaryBtn) {
      summaryBtn.addEventListener('click', () => {
        Suggestions.show('summary', document.getElementById('summary'));
      });
    }

    // Add entry buttons
    document.getElementById('add-education').addEventListener('click', () => addEntry('education'));
    document.getElementById('add-experience').addEventListener('click', () => addEntry('experience'));
    document.getElementById('add-skill').addEventListener('click', () => addEntry('skills'));
    document.getElementById('add-project').addEventListener('click', () => addEntry('projects'));
    document.getElementById('add-certification').addEventListener('click', () => addEntry('certifications'));
    document.getElementById('add-language').addEventListener('click', () => addEntry('languages'));
    document.getElementById('add-award').addEventListener('click', () => addEntry('awards'));
    document.getElementById('add-volunteer').addEventListener('click', () => addEntry('volunteer'));
    document.getElementById('add-publication').addEventListener('click', () => addEntry('publications'));
    document.getElementById('add-custom').addEventListener('click', () => addEntry('custom'));

    // Template switching
    document.querySelectorAll('.template-card:not(.locked)').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        ResumeData.template = card.dataset.template;
        ResumeData.save();
        updatePreview();
      });
    });

    // Premium template click
    document.querySelector('.template-card.locked').addEventListener('click', () => {
      alert('Premium templates coming soon! Stay tuned.');
    });

    // Download dropdown
    const downloadMain = document.getElementById('btn-download-main');
    const downloadMenu = document.getElementById('download-menu');
    downloadMain.addEventListener('click', (e) => {
      e.stopPropagation();
      downloadMenu.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.download-dropdown')) {
        downloadMenu.classList.remove('open');
      }
    });
    document.getElementById('btn-download-pdf').addEventListener('click', () => {
      downloadMenu.classList.remove('open');
      downloadPDF();
    });
    document.getElementById('btn-download-docx').addEventListener('click', () => {
      downloadMenu.classList.remove('open');
      downloadDOCX();
    });

    // Export/Import
    document.getElementById('btn-export-json').addEventListener('click', () => ResumeData.exportJSON());

    // Import dropdown
    const importMain = document.getElementById('btn-import-main');
    const importMenu = document.getElementById('import-menu');
    if (importMain && importMenu) {
      importMain.addEventListener('click', (e) => {
        e.stopPropagation();
        importMenu.classList.toggle('open');
      });
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.import-dropdown')) importMenu.classList.remove('open');
      });
    }
    const fileInput = document.getElementById('file-import');
    document.getElementById('btn-import-json').addEventListener('click', () => {
      importMenu.classList.remove('open');
      fileInput.accept = '.json,application/json';
      fileInput.click();
    });
    document.getElementById('btn-import-pdf').addEventListener('click', () => {
      importMenu.classList.remove('open');
      fileInput.accept = '.pdf,application/pdf';
      fileInput.click();
    });
    fileInput.addEventListener('change', handleImport);

    // Import confirmation modal
    document.getElementById('close-import').addEventListener('click', () => {
      document.getElementById('import-modal').classList.remove('active');
      pendingImport = null;
    });
    document.getElementById('import-modal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        e.currentTarget.classList.remove('active');
        pendingImport = null;
      }
    });
    document.getElementById('btn-import-confirm').addEventListener('click', () => {
      if (pendingImport) {
        ResumeData.applyImport(pendingImport);
        restoreFormData();
        updatePreview();
        updateStrength();
        pendingImport = null;
      }
      document.getElementById('import-modal').classList.remove('active');
    });

    // Dark mode
    document.getElementById('btn-dark-mode').addEventListener('click', toggleDarkMode);

    // Close suggestions modal
    document.getElementById('close-suggestions').addEventListener('click', () => {
      document.getElementById('suggestions-modal').classList.remove('active');
    });
    document.getElementById('suggestions-modal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) e.currentTarget.classList.remove('active');
    });

    // Mobile preview toggle
    document.getElementById('btn-preview-toggle').addEventListener('click', toggleMobilePreview);

    // Close preview button (mobile)
    const closeBtn = document.getElementById('btn-close-preview');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        document.getElementById('preview-panel').classList.remove('mobile-visible');
        closeBtn.style.display = 'none';
      });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'ArrowRight') nextStep();
      if (e.ctrlKey && e.key === 'ArrowLeft') prevStep();
      if (e.key === 'Escape') {
        const panel = document.getElementById('preview-panel');
        if (panel.classList.contains('fullscreen')) toggleFullscreenPreview();
      }
    });

    // Fullscreen preview
    document.getElementById('btn-fullscreen-preview').addEventListener('click', toggleFullscreenPreview);
  }

  // ===== Step Navigation =====
  function goToStep(step) {
    if (step < 0 || step >= totalSteps) return;

    // Animate out current step
    const currentEl = document.querySelector('.form-step.active');
    if (currentEl) {
      currentEl.style.animation = 'none';
      currentEl.offsetHeight; // trigger reflow
      currentEl.classList.remove('active');
    }

    // Update step indicators
    document.querySelectorAll('.step').forEach(s => {
      const sStep = parseInt(s.dataset.step);
      s.classList.remove('active', 'completed');
      if (sStep < step) s.classList.add('completed');
      if (sStep === step) s.classList.add('active');
    });

    // Animate in new step
    const newEl = document.querySelector(`.form-step[data-step="${step}"]`);
    if (newEl) {
      newEl.style.animation = 'none';
      newEl.offsetHeight;
      newEl.style.animation = '';
      newEl.classList.add('active');
    }

    currentStep = step;

    // Update nav buttons
    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');
    prevBtn.disabled = step === 0;
    prevBtn.style.opacity = step === 0 ? '0.4' : '1';

    nextBtn.innerHTML = step === totalSteps - 1
      ? '<i class="fas fa-check"></i> Finish'
      : 'Next <i class="fas fa-arrow-right"></i>';

    // Update progress line
    updateStepProgress();

    // Scroll form to top
    const formPanel = document.getElementById('form-panel');
    if (formPanel) formPanel.scrollTop = 0;
  }

  function updateStepProgress() {
    const track = document.getElementById('step-track');
    if (!track) return;
    const pct = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0;
    track.style.setProperty('--progress-width', pct + '%');
  }

  function nextStep() {
    if (currentStep < totalSteps - 1) goToStep(currentStep + 1);
  }

  function prevStep() {
    if (currentStep > 0) goToStep(currentStep - 1);
  }

  // ===== Entry Management =====
  function addEntry(type) {
    const templates = {
      education: { institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' },
      experience: { company: '', position: '', startDate: '', endDate: '', description: '' },
      skills: { name: '', level: 50 },
      projects: { name: '', tech: '', description: '', link: '' },
      certifications: { name: '', issuer: '', date: '' },
      languages: { name: '', proficiency: 'Fluent' },
      awards: { title: '', issuer: '', date: '', description: '' },
      volunteer: { organization: '', role: '', startDate: '', endDate: '', description: '' },
      publications: { title: '', publisher: '', date: '', link: '', description: '' },
      custom: { title: 'Custom Section', items: [] }
    };

    const entry = { ...templates[type], id: Date.now() + Math.floor(Math.random() * 1000) };
    ResumeData[type].push(entry);
    renderEntries(type);
    scheduleAutoSave();
    updatePreview();
    updateStrength();
  }

  function removeEntry(type, id) {
    const card = document.querySelector(`.entry-card[data-id="${id}"]`);
    if (card) {
      card.style.animation = 'cardSlideOut 0.3s ease forwards';
      setTimeout(() => {
        ResumeData[type] = ResumeData[type].filter(e => e.id !== id);
        renderEntries(type);
        scheduleAutoSave();
        updatePreview();
        updateStrength();
      }, 280);
    } else {
      ResumeData[type] = ResumeData[type].filter(e => e.id !== id);
      renderEntries(type);
      scheduleAutoSave();
      updatePreview();
      updateStrength();
    }
  }

  function duplicateEntry(type, id) {
    const original = ResumeData[type].find(e => e.id === id);
    if (original) {
      const copy = { ...original, id: Date.now() };
      ResumeData[type].push(copy);
      renderEntries(type);
      scheduleAutoSave();
      updatePreview();
    }
  }

  function renderEntries(type) {
    const container = document.getElementById(`${type}-entries`);
    if (!container) return;

    const renderers = {
      education: renderEducationEntry,
      experience: renderExperienceEntry,
      skills: renderSkillEntry,
      projects: renderProjectEntry,
      certifications: renderCertificationEntry,
      languages: renderLanguageEntry,
      awards: renderAwardEntry,
      volunteer: renderVolunteerEntry,
      publications: renderPublicationEntry,
      custom: renderCustomEntry
    };

    container.innerHTML = '';
    ResumeData[type].forEach((entry, index) => {
      const card = renderers[type](entry, index);
      container.appendChild(card);
    });
  }

  function createEntryCard(entry, type, title) {
    const card = document.createElement('div');
    card.className = 'entry-card';
    card.dataset.id = entry.id;

    const header = document.createElement('div');
    header.className = 'entry-header';
    header.innerHTML = `
      <h4>${title}</h4>
      <div class="entry-actions">
        <button class="btn btn-ghost btn-duplicate" title="Duplicate"><i class="fas fa-copy"></i></button>
        <button class="btn btn-danger btn-remove" title="Remove"><i class="fas fa-trash"></i></button>
      </div>
    `;

    header.querySelector('.btn-remove').addEventListener('click', () => removeEntry(type, entry.id));
    header.querySelector('.btn-duplicate').addEventListener('click', () => duplicateEntry(type, entry.id));

    card.appendChild(header);
    return card;
  }

  function createInput(label, value, placeholder, onChange, type = 'text') {
    const group = document.createElement('div');
    group.className = 'form-group';
    group.innerHTML = `<label>${label}</label>`;

    const input = document.createElement(type === 'textarea' ? 'textarea' : 'input');
    if (type !== 'textarea') input.type = type;
    input.value = value || '';
    input.placeholder = placeholder;
    if (type === 'textarea') input.rows = 3;
    input.addEventListener('input', (e) => {
      onChange(e.target.value);
      scheduleAutoSave();
      updatePreview();
      updateStrength();
    });

    group.appendChild(input);
    return { group, input };
  }

  function renderEducationEntry(entry, index) {
    const card = createEntryCard(entry, 'education', `Education #${index + 1}`);
    const grid = document.createElement('div');
    grid.className = 'form-grid';

    grid.appendChild(createInput('Institution', entry.institution, 'University name', v => entry.institution = v).group);
    grid.appendChild(createInput('Degree', entry.degree, 'B.Tech, MBA...', v => entry.degree = v).group);
    grid.appendChild(createInput('Field of Study', entry.field, 'Computer Science', v => entry.field = v).group);
    grid.appendChild(createInput('GPA', entry.gpa, '8.5/10', v => entry.gpa = v).group);
    grid.appendChild(createInput('Start Date', entry.startDate, '2020', v => entry.startDate = v).group);
    grid.appendChild(createInput('End Date', entry.endDate, '2024 or Present', v => entry.endDate = v).group);

    card.appendChild(grid);
    return card;
  }

  function renderExperienceEntry(entry, index) {
    const card = createEntryCard(entry, 'experience', `Experience #${index + 1}`);
    const grid = document.createElement('div');
    grid.className = 'form-grid';

    grid.appendChild(createInput('Company', entry.company, 'Company name', v => entry.company = v).group);
    grid.appendChild(createInput('Position', entry.position, 'Software Engineer', v => entry.position = v).group);
    grid.appendChild(createInput('Start Date', entry.startDate, 'Jan 2023', v => entry.startDate = v).group);
    grid.appendChild(createInput('End Date', entry.endDate, 'Present', v => entry.endDate = v).group);

    const descGroup = createInput('Description', entry.description, 'Describe your responsibilities...', v => entry.description = v, 'textarea');
    descGroup.group.classList.add('full-width');

    const suggestBtn = document.createElement('button');
    suggestBtn.className = 'btn btn-suggest';
    suggestBtn.innerHTML = '<i class="fas fa-lightbulb"></i> Suggestions';
    suggestBtn.addEventListener('click', () => Suggestions.show('experience', descGroup.input));
    descGroup.group.appendChild(suggestBtn);

    grid.appendChild(descGroup.group);
    card.appendChild(grid);
    return card;
  }

  function renderSkillEntry(entry, index) {
    const card = createEntryCard(entry, 'skills', `Skill #${index + 1}`);
    const grid = document.createElement('div');
    grid.className = 'form-grid';

    grid.appendChild(createInput('Skill Name', entry.name, 'JavaScript, Python...', v => entry.name = v).group);

    const levelGroup = document.createElement('div');
    levelGroup.className = 'form-group';
    levelGroup.innerHTML = `<label>Proficiency Level</label>`;

    const sliderWrap = document.createElement('div');
    sliderWrap.className = 'skill-level-group';

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = 10;
    slider.max = 100;
    slider.value = entry.level || 50;

    const levelLabel = document.createElement('span');
    levelLabel.className = 'skill-level-label';
    levelLabel.textContent = Templates.skillLevelText(entry.level);

    slider.addEventListener('input', (e) => {
      entry.level = parseInt(e.target.value);
      levelLabel.textContent = Templates.skillLevelText(entry.level);
      scheduleAutoSave();
      updatePreview();
    });

    sliderWrap.appendChild(slider);
    sliderWrap.appendChild(levelLabel);
    levelGroup.appendChild(sliderWrap);
    grid.appendChild(levelGroup);

    card.appendChild(grid);
    return card;
  }

  function renderProjectEntry(entry, index) {
    const card = createEntryCard(entry, 'projects', `Project #${index + 1}`);
    const grid = document.createElement('div');
    grid.className = 'form-grid';

    grid.appendChild(createInput('Project Name', entry.name, 'My Awesome Project', v => entry.name = v).group);
    grid.appendChild(createInput('Technologies', entry.tech, 'React, Node.js, MongoDB', v => entry.tech = v).group);

    const descGroup = createInput('Description', entry.description, 'What did you build?', v => entry.description = v, 'textarea');
    descGroup.group.classList.add('full-width');

    const suggestBtn = document.createElement('button');
    suggestBtn.className = 'btn btn-suggest';
    suggestBtn.innerHTML = '<i class="fas fa-lightbulb"></i> Suggestions';
    suggestBtn.addEventListener('click', () => Suggestions.show('projects', descGroup.input));
    descGroup.group.appendChild(suggestBtn);

    grid.appendChild(descGroup.group);
    grid.appendChild(createInput('Link', entry.link, 'https://github.com/...', v => entry.link = v, 'url').group);

    card.appendChild(grid);
    return card;
  }

  function renderCertificationEntry(entry, index) {
    const card = createEntryCard(entry, 'certifications', `Certification #${index + 1}`);
    const grid = document.createElement('div');
    grid.className = 'form-grid';

    grid.appendChild(createInput('Certification Name', entry.name, 'AWS Solutions Architect', v => entry.name = v).group);
    grid.appendChild(createInput('Issuing Organization', entry.issuer, 'Amazon Web Services', v => entry.issuer = v).group);
    grid.appendChild(createInput('Date', entry.date, '2024', v => entry.date = v).group);

    card.appendChild(grid);
    return card;
  }

  function renderLanguageEntry(entry, index) {
    const card = createEntryCard(entry, 'languages', `Language #${index + 1}`);
    const grid = document.createElement('div');
    grid.className = 'form-grid';

    grid.appendChild(createInput('Language', entry.name, 'English, Spanish, Hindi...', v => entry.name = v).group);

    const profGroup = document.createElement('div');
    profGroup.className = 'form-group';
    profGroup.innerHTML = `<label>Proficiency</label>`;
    const select = document.createElement('select');
    ['Native', 'Fluent', 'Professional', 'Conversational', 'Basic'].forEach(opt => {
      const o = document.createElement('option');
      o.value = o.textContent = opt;
      if ((entry.proficiency || 'Fluent') === opt) o.selected = true;
      select.appendChild(o);
    });
    select.addEventListener('change', (e) => {
      entry.proficiency = e.target.value;
      scheduleAutoSave();
      updatePreview();
    });
    profGroup.appendChild(select);
    grid.appendChild(profGroup);

    card.appendChild(grid);
    return card;
  }

  function renderAwardEntry(entry, index) {
    const card = createEntryCard(entry, 'awards', `Award #${index + 1}`);
    const grid = document.createElement('div');
    grid.className = 'form-grid';

    grid.appendChild(createInput('Award Title', entry.title, 'Employee of the Year', v => entry.title = v).group);
    grid.appendChild(createInput('Issuer', entry.issuer, 'Organization name', v => entry.issuer = v).group);
    grid.appendChild(createInput('Date', entry.date, '2024', v => entry.date = v).group);
    const descGroup = createInput('Description (optional)', entry.description, 'What was this award for?', v => entry.description = v, 'textarea');
    descGroup.group.classList.add('full-width');
    grid.appendChild(descGroup.group);

    card.appendChild(grid);
    return card;
  }

  function renderVolunteerEntry(entry, index) {
    const card = createEntryCard(entry, 'volunteer', `Volunteer #${index + 1}`);
    const grid = document.createElement('div');
    grid.className = 'form-grid';

    grid.appendChild(createInput('Organization', entry.organization, 'Red Cross, Goonj...', v => entry.organization = v).group);
    grid.appendChild(createInput('Role', entry.role, 'Volunteer Coordinator', v => entry.role = v).group);
    grid.appendChild(createInput('Start Date', entry.startDate, 'Jan 2022', v => entry.startDate = v).group);
    grid.appendChild(createInput('End Date', entry.endDate, 'Present', v => entry.endDate = v).group);
    const descGroup = createInput('Description', entry.description, 'What did you do? Impact created?', v => entry.description = v, 'textarea');
    descGroup.group.classList.add('full-width');
    grid.appendChild(descGroup.group);

    card.appendChild(grid);
    return card;
  }

  function renderPublicationEntry(entry, index) {
    const card = createEntryCard(entry, 'publications', `Publication #${index + 1}`);
    const grid = document.createElement('div');
    grid.className = 'form-grid';

    grid.appendChild(createInput('Title', entry.title, 'Publication title', v => entry.title = v).group);
    grid.appendChild(createInput('Publisher / Journal', entry.publisher, 'IEEE, Nature, Medium...', v => entry.publisher = v).group);
    grid.appendChild(createInput('Date', entry.date, '2024', v => entry.date = v).group);
    grid.appendChild(createInput('Link', entry.link, 'https://...', v => entry.link = v, 'url').group);
    const descGroup = createInput('Summary (optional)', entry.description, 'Short description...', v => entry.description = v, 'textarea');
    descGroup.group.classList.add('full-width');
    grid.appendChild(descGroup.group);

    card.appendChild(grid);
    return card;
  }

  function renderCustomEntry(entry, index) {
    const card = createEntryCard(entry, 'custom', `Section #${index + 1}`);
    const titleInput = createInput('Section Title', entry.title, 'e.g., Hobbies, References, Interests', v => entry.title = v);
    titleInput.group.classList.add('full-width');
    card.appendChild(titleInput.group);

    const itemsWrap = document.createElement('div');
    itemsWrap.className = 'custom-items-wrap';
    card.appendChild(itemsWrap);

    const renderItems = () => {
      itemsWrap.innerHTML = '';
      (entry.items || []).forEach((item, idx) => {
        const row = document.createElement('div');
        row.className = 'custom-item-row';

        const grid = document.createElement('div');
        grid.className = 'form-grid';
        grid.appendChild(createInput(`Item ${idx + 1} Heading`, item.heading, 'Short label (optional)', v => item.heading = v).group);
        const descG = createInput('Details', item.description, 'Your content...', v => item.description = v, 'textarea');
        descG.group.classList.add('full-width');
        grid.appendChild(descG.group);
        row.appendChild(grid);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn btn-danger btn-sm';
        removeBtn.innerHTML = '<i class="fas fa-trash"></i> Remove Item';
        removeBtn.addEventListener('click', () => {
          entry.items = entry.items.filter(i => i.id !== item.id);
          renderItems();
          scheduleAutoSave();
          updatePreview();
        });
        row.appendChild(removeBtn);
        itemsWrap.appendChild(row);
      });
    };

    const addItemBtn = document.createElement('button');
    addItemBtn.className = 'btn btn-add btn-sm';
    addItemBtn.innerHTML = '<i class="fas fa-plus"></i> Add Item';
    addItemBtn.addEventListener('click', () => {
      entry.items = entry.items || [];
      entry.items.push({ id: Date.now() + Math.floor(Math.random() * 1000), heading: '', description: '' });
      renderItems();
      scheduleAutoSave();
      updatePreview();
    });

    renderItems();
    card.appendChild(addItemBtn);
    return card;
  }

  // ===== Restore Form Data =====
  function restoreFormData() {
    Object.keys(ResumeData.personal).forEach(key => {
      const input = document.querySelector(`[data-field="${key}"]`);
      if (input) input.value = ResumeData.personal[key] || '';
    });

    ['education', 'experience', 'skills', 'projects', 'certifications',
     'languages', 'awards', 'volunteer', 'publications', 'custom'].forEach(type => {
      renderEntries(type);
    });

    document.querySelectorAll('.template-card').forEach(card => {
      card.classList.toggle('active', card.dataset.template === ResumeData.template);
    });
  }

  // ===== Preview =====
  function updatePreview() {
    const preview = document.getElementById('resume-preview');
    preview.innerHTML = Templates.render(ResumeData);
  }

  // ===== Strength Score =====
  function updateStrength() {
    const { score, tips } = ResumeData.getStrength();
    const scoreEl = document.getElementById('strength-score');
    const fillEl = document.getElementById('strength-fill');
    const tipEl = document.getElementById('strength-tip');

    // Animate score number
    const currentScore = parseInt(scoreEl.textContent) || 0;
    if (currentScore !== score) {
      animateNumber(scoreEl, currentScore, score, 600);
    }

    fillEl.style.width = score + '%';

    // Color the fill based on score
    if (score < 30) {
      fillEl.style.background = 'linear-gradient(90deg, #EF4444, #F97316)';
    } else if (score < 60) {
      fillEl.style.background = 'linear-gradient(90deg, #F97316, #F59E0B)';
    } else if (score < 85) {
      fillEl.style.background = 'linear-gradient(90deg, #F59E0B, #10B981)';
    } else {
      fillEl.style.background = 'linear-gradient(90deg, #10B981, #059669)';
    }

    tipEl.textContent = tips.length > 0 ? tips[0] : 'Your resume looks strong!';
  }

  function animateNumber(el, from, to, duration) {
    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.round(from + (to - from) * eased);
      el.textContent = current + '%';
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ===== Auto Save =====
  function scheduleAutoSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      ResumeData.save();
      showAutoSaveToast();
    }, 800);
  }

  function showAutoSaveToast() {
    // Remove existing toast
    const existing = document.querySelector('.autosave-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'autosave-toast';
    toast.innerHTML = '<i class="fas fa-check-circle"></i> Auto-saved';
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 2200);
  }

  // ===== PDF Download =====
  function downloadPDF() {
    const btn = document.getElementById('btn-download-pdf');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    btn.disabled = true;
    btn.style.opacity = '0.7';

    // Create a hidden print container with exact A4 dimensions
    const printContainer = document.createElement('div');
    printContainer.id = 'print-container';
    printContainer.innerHTML = Templates.render(ResumeData);
    document.body.appendChild(printContainer);

    // Small delay to let fonts/styles render, then print
    setTimeout(() => {
      window.print();

      // Cleanup
      printContainer.remove();
      btn.innerHTML = '<i class="fas fa-check"></i> Done!';
      btn.style.opacity = '1';
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }, 1500);
    }, 300);
  }

  // ===== Word (.docx) Download =====
  function downloadDOCX() {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
            BorderStyle, TabStopPosition, TabStopType, ShadingType } = docx;

    const p = ResumeData.personal;
    const sections = [];

    // --- Helper functions ---
    function heading(text, level) {
      return new Paragraph({
        text: text,
        heading: level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
        spacing: { before: level === 1 ? 0 : 240, after: 120 },
        border: level === 2 ? { bottom: { style: BorderStyle.SINGLE, size: 1, color: '6C63FF' } } : {},
      });
    }

    function textRun(text, opts = {}) {
      return new TextRun({
        text: text || '',
        bold: opts.bold || false,
        italics: opts.italic || false,
        size: opts.size || 22,
        color: opts.color || '333333',
        font: 'Calibri',
      });
    }

    function bulletParagraph(text) {
      return new Paragraph({
        children: [textRun(text, { size: 20 })],
        spacing: { after: 60 },
        indent: { left: 360 },
        bullet: { level: 0 },
      });
    }

    // --- Name & Title ---
    sections.push(new Paragraph({
      children: [textRun(p.fullName || 'Your Name', { bold: true, size: 36, color: '1A1A2E' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
    }));

    if (p.jobTitle) {
      sections.push(new Paragraph({
        children: [textRun(p.jobTitle, { size: 24, color: '6C63FF' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
      }));
    }

    // --- Contact line ---
    const contactParts = [];
    if (p.email) contactParts.push(p.email);
    if (p.phone) contactParts.push(p.phone);
    if (p.location) contactParts.push(p.location);
    if (p.linkedin) contactParts.push(p.linkedin);
    if (p.portfolio) contactParts.push(p.portfolio);

    if (contactParts.length > 0) {
      sections.push(new Paragraph({
        children: [textRun(contactParts.join('  |  '), { size: 18, color: '6B7280' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 160 },
      }));
    }

    // --- Summary ---
    if (p.summary) {
      sections.push(heading('PROFESSIONAL SUMMARY', 2));
      sections.push(new Paragraph({
        children: [textRun(p.summary, { size: 20, color: '4B5563' })],
        spacing: { after: 160 },
      }));
    }

    // --- Experience ---
    if (ResumeData.experience.length > 0) {
      sections.push(heading('WORK EXPERIENCE', 2));
      ResumeData.experience.forEach(exp => {
        sections.push(new Paragraph({
          children: [
            textRun(exp.company || '', { bold: true, size: 22, color: '1A1A2E' }),
            textRun('    '),
            textRun(`${exp.startDate || ''} - ${exp.endDate || 'Present'}`, { size: 18, color: '9CA3AF', italic: true }),
          ],
          spacing: { before: 120, after: 40 },
        }));
        if (exp.position) {
          sections.push(new Paragraph({
            children: [textRun(exp.position, { size: 20, color: '6C63FF', italic: true })],
            spacing: { after: 60 },
          }));
        }
        if (exp.description) {
          exp.description.split('\n').forEach(line => {
            const clean = line.replace(/^[•\-\s]+/, '').trim();
            if (clean) sections.push(bulletParagraph(clean));
          });
        }
      });
    }

    // --- Education ---
    if (ResumeData.education.length > 0) {
      sections.push(heading('EDUCATION', 2));
      ResumeData.education.forEach(edu => {
        sections.push(new Paragraph({
          children: [
            textRun(edu.institution || '', { bold: true, size: 22, color: '1A1A2E' }),
            textRun('    '),
            textRun(`${edu.startDate || ''} - ${edu.endDate || 'Present'}`, { size: 18, color: '9CA3AF', italic: true }),
          ],
          spacing: { before: 120, after: 40 },
        }));
        const degreeLine = [edu.degree, edu.field].filter(Boolean).join(' in ');
        if (degreeLine) {
          sections.push(new Paragraph({
            children: [textRun(degreeLine, { size: 20, color: '6C63FF', italic: true })],
            spacing: { after: 40 },
          }));
        }
        if (edu.gpa) {
          sections.push(new Paragraph({
            children: [textRun('GPA: ' + edu.gpa, { size: 18, color: '6B7280' })],
            spacing: { after: 80 },
          }));
        }
      });
    }

    // --- Skills ---
    if (ResumeData.skills.length > 0) {
      sections.push(heading('SKILLS', 2));
      const skillNames = ResumeData.skills.map(s => s.name).filter(Boolean);
      sections.push(new Paragraph({
        children: [textRun(skillNames.join('  •  '), { size: 20, color: '374151' })],
        spacing: { after: 160 },
      }));
    }

    // --- Projects ---
    if (ResumeData.projects.length > 0) {
      sections.push(heading('PROJECTS', 2));
      ResumeData.projects.forEach(proj => {
        sections.push(new Paragraph({
          children: [textRun(proj.name || '', { bold: true, size: 22, color: '1A1A2E' })],
          spacing: { before: 120, after: 40 },
        }));
        if (proj.tech) {
          sections.push(new Paragraph({
            children: [textRun(proj.tech, { size: 18, color: '6C63FF', italic: true })],
            spacing: { after: 60 },
          }));
        }
        if (proj.description) {
          proj.description.split('\n').forEach(line => {
            const clean = line.replace(/^[•\-\s]+/, '').trim();
            if (clean) sections.push(bulletParagraph(clean));
          });
        }
      });
    }

    // --- Certifications ---
    if (ResumeData.certifications.length > 0) {
      sections.push(heading('CERTIFICATIONS', 2));
      ResumeData.certifications.forEach(cert => {
        sections.push(new Paragraph({
          children: [
            textRun(cert.name || '', { bold: true, size: 20, color: '1A1A2E' }),
            textRun('  —  '),
            textRun(cert.issuer || '', { size: 18, color: '6B7280' }),
            cert.date ? textRun('  (' + cert.date + ')', { size: 18, color: '9CA3AF', italic: true }) : textRun(''),
          ],
          spacing: { before: 80, after: 60 },
        }));
      });
    }

    // --- Languages ---
    if (ResumeData.languages.length > 0) {
      sections.push(heading('LANGUAGES', 2));
      const langLine = ResumeData.languages
        .filter(l => l.name)
        .map(l => `${l.name}${l.proficiency ? ' (' + l.proficiency + ')' : ''}`)
        .join('  •  ');
      sections.push(new Paragraph({
        children: [textRun(langLine, { size: 20, color: '374151' })],
        spacing: { after: 160 },
      }));
    }

    // --- Awards ---
    if (ResumeData.awards.length > 0) {
      sections.push(heading('AWARDS & HONORS', 2));
      ResumeData.awards.forEach(a => {
        sections.push(new Paragraph({
          children: [
            textRun(a.title || '', { bold: true, size: 20, color: '1A1A2E' }),
            a.issuer ? textRun('  —  ', { size: 18 }) : textRun(''),
            a.issuer ? textRun(a.issuer, { size: 18, color: '6B7280' }) : textRun(''),
            a.date ? textRun('  (' + a.date + ')', { size: 18, color: '9CA3AF', italic: true }) : textRun(''),
          ],
          spacing: { before: 80, after: 40 },
        }));
        if (a.description) {
          sections.push(new Paragraph({
            children: [textRun(a.description, { size: 20, color: '4B5563' })],
            spacing: { after: 60 },
          }));
        }
      });
    }

    // --- Volunteer ---
    if (ResumeData.volunteer.length > 0) {
      sections.push(heading('VOLUNTEER EXPERIENCE', 2));
      ResumeData.volunteer.forEach(v => {
        sections.push(new Paragraph({
          children: [
            textRun(v.organization || '', { bold: true, size: 22, color: '1A1A2E' }),
            textRun('    '),
            textRun(`${v.startDate || ''} - ${v.endDate || 'Present'}`, { size: 18, color: '9CA3AF', italic: true }),
          ],
          spacing: { before: 120, after: 40 },
        }));
        if (v.role) {
          sections.push(new Paragraph({
            children: [textRun(v.role, { size: 20, color: '6C63FF', italic: true })],
            spacing: { after: 60 },
          }));
        }
        if (v.description) {
          v.description.split('\n').forEach(line => {
            const clean = line.replace(/^[•\-\s]+/, '').trim();
            if (clean) sections.push(bulletParagraph(clean));
          });
        }
      });
    }

    // --- Publications ---
    if (ResumeData.publications.length > 0) {
      sections.push(heading('PUBLICATIONS', 2));
      ResumeData.publications.forEach(pub => {
        sections.push(new Paragraph({
          children: [textRun(pub.title || '', { bold: true, size: 20, color: '1A1A2E' })],
          spacing: { before: 80, after: 40 },
        }));
        const meta = [pub.publisher, pub.date].filter(Boolean).join(' • ');
        if (meta) {
          sections.push(new Paragraph({
            children: [textRun(meta, { size: 18, color: '6B7280', italic: true })],
            spacing: { after: 40 },
          }));
        }
        if (pub.description) {
          sections.push(new Paragraph({
            children: [textRun(pub.description, { size: 20, color: '4B5563' })],
            spacing: { after: 60 },
          }));
        }
      });
    }

    // --- Custom Sections ---
    if (ResumeData.custom.length > 0) {
      ResumeData.custom.forEach(sec => {
        if (!sec.title) return;
        sections.push(heading((sec.title || 'Additional').toUpperCase(), 2));
        (sec.items || []).forEach(item => {
          if (item.heading) {
            sections.push(new Paragraph({
              children: [textRun(item.heading, { bold: true, size: 20, color: '1A1A2E' })],
              spacing: { before: 60, after: 30 },
            }));
          }
          if (item.description) {
            item.description.split('\n').forEach(line => {
              const clean = line.replace(/^[•\-\s]+/, '').trim();
              if (clean) sections.push(bulletParagraph(clean));
            });
          }
        });
      });
    }

    // --- Build & Save ---
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 720, right: 720 },
          },
        },
        children: sections,
      }],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, `${p.fullName || 'resume'}.docx`);
    });
  }

  // ===== Import =====
  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const btn = document.getElementById('btn-import-main');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Parsing...';
    btn.disabled = true;

    Importer.importFile(file).then(({ data, report }) => {
      pendingImport = data;
      showImportReport(report, file.name);
    }).catch((err) => {
      alert('Import failed: ' + (err.message || 'Could not parse this file.'));
    }).finally(() => {
      btn.innerHTML = originalText;
      btn.disabled = false;
      e.target.value = '';
    });
  }

  function showImportReport(report, filename) {
    const body = document.getElementById('import-report');
    const isPdf = report.source === 'pdf';
    let html = `<div class="import-summary">`;
    html += `<p><strong>Source:</strong> ${filename} <span class="import-badge">${isPdf ? 'PDF' : 'JSON'}</span></p>`;

    if (isPdf) {
      html += `<div class="import-warning"><i class="fas fa-exclamation-triangle"></i> PDF extraction is best-effort. Please review the imported data carefully before saving — some fields may need manual correction.</div>`;
    }

    if (report.imported && report.imported.length) {
      html += `<h4 style="margin-top:16px;">✅ Detected & imported:</h4><ul>`;
      report.imported.forEach(item => html += `<li>${item}</li>`);
      html += `</ul>`;
    } else {
      html += `<p style="color:var(--warning);">⚠️ No recognizable sections were found. You may need to check the file format.</p>`;
    }

    if (report.skipped && report.skipped.length) {
      html += `<h4 style="margin-top:12px;">⏭️ Skipped (unrecognized):</h4><ul>`;
      report.skipped.forEach(item => html += `<li>${item}</li>`);
      html += `</ul>`;
    }

    html += `<p style="margin-top:16px;color:var(--text-secondary);font-size:14px;">Click <strong>Looks Good</strong> to apply these changes. This will replace your current resume data.</p>`;
    html += `</div>`;
    body.innerHTML = html;

    document.getElementById('import-modal').classList.add('active');
  }

  // ===== Dark Mode =====
  function toggleDarkMode() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');

    const icon = document.querySelector('#btn-dark-mode i');
    icon.className = isDark ? 'fas fa-moon' : 'fas fa-sun';
  }

  function restoreTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.querySelector('#btn-dark-mode i').className = 'fas fa-sun';
    }
  }

  // ===== Fullscreen Preview =====
  function toggleFullscreenPreview() {
    const panel = document.getElementById('preview-panel');
    const btn = document.getElementById('btn-fullscreen-preview');
    const icon = btn.querySelector('i');

    panel.classList.toggle('fullscreen');
    document.body.classList.toggle('preview-fullscreen');

    if (panel.classList.contains('fullscreen')) {
      icon.className = 'fas fa-compress';
      btn.title = 'Exit Full Screen';
    } else {
      icon.className = 'fas fa-expand';
      btn.title = 'Full Screen Preview';
    }

    updatePreview();
  }

  // ===== Mobile Preview =====
  function toggleMobilePreview() {
    const panel = document.getElementById('preview-panel');
    const closeBtn = document.getElementById('btn-close-preview');
    panel.classList.toggle('mobile-visible');
    if (closeBtn) {
      closeBtn.style.display = panel.classList.contains('mobile-visible') ? 'flex' : 'none';
    }
    updatePreview();
  }

  // ===== Tutorial =====
  function initTutorial() {
    const helpBtn = document.getElementById('btn-tutorial');
    if (helpBtn) {
      helpBtn.addEventListener('click', () => Tutorial.start());

      // Pulse animation for first-time visitors
      if (Tutorial.shouldAutoStart()) {
        helpBtn.classList.add('pulse');
        // Auto-start after a short delay for first-time visitors
        setTimeout(() => {
          Tutorial.start();
          helpBtn.classList.remove('pulse');
        }, 1500);
      }
    }
  }

  // ===== Inject card-out animation =====
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes cardSlideOut {
      from { opacity: 1; transform: translateX(0) scale(1); }
      to { opacity: 0; transform: translateX(-20px) scale(0.95); max-height: 0; padding: 0; margin: 0; overflow: hidden; }
    }
  `;
  document.head.appendChild(styleSheet);

  // ===== Start =====
  document.addEventListener('DOMContentLoaded', init);
})();
