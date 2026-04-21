// ===== Flexible Resume Importer =====
// Supports:
//   1. Our native JSON format
//   2. JSON Resume standard (jsonresume.org)
//   3. Fuzzy-matched custom JSON (common field aliases)
//   4. PDF files via PDF.js (text extraction + heuristic parsing)

const Importer = {

  // ---------------- Public API ----------------
  async importFile(file) {
    const name = (file.name || '').toLowerCase();
    const isPdf = name.endsWith('.pdf') || file.type === 'application/pdf';
    const isJson = name.endsWith('.json') || file.type === 'application/json';

    if (isPdf) return this._importPdf(file);
    if (isJson) return this._importJson(file);

    // Try JSON anyway as a fallback
    try { return await this._importJson(file); }
    catch { throw new Error('Unsupported file type. Please upload a .json or .pdf file.'); }
  },

  // ---------------- JSON Import ----------------
  _importJson(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          const result = this._normalizeJson(parsed);
          resolve(result);
        } catch (err) {
          reject(new Error('Invalid JSON file: ' + err.message));
        }
      };
      reader.onerror = () => reject(new Error('Could not read file'));
      reader.readAsText(file);
    });
  },

  _normalizeJson(raw) {
    const imported = { skipped: [], imported: [], source: 'json' };
    const out = this._emptyShape();

    // Detect JSON Resume schema
    if (raw.basics && typeof raw.basics === 'object') {
      this._mapJsonResume(raw, out, imported);
    }
    // Detect our native shape
    else if (raw.personal && typeof raw.personal === 'object') {
      this._mapNative(raw, out, imported);
    }
    // Fall back to fuzzy mapping on flat object
    else {
      this._mapFuzzy(raw, out, imported);
    }

    return { data: out, report: imported };
  },

  _emptyShape() {
    return {
      personal: { fullName: '', jobTitle: '', email: '', phone: '', location: '',
                  linkedin: '', portfolio: '', summary: '' },
      education: [], experience: [], skills: [], projects: [], certifications: [],
      languages: [], awards: [], volunteer: [], publications: [], custom: [],
      template: null
    };
  },

  // Our native JSON shape
  _mapNative(raw, out, report) {
    Object.assign(out.personal, raw.personal || {});
    ['education','experience','skills','projects','certifications',
     'languages','awards','volunteer','publications','custom'].forEach(k => {
      if (Array.isArray(raw[k])) {
        out[k] = raw[k].map(e => ({ ...e, id: e.id || this._genId() }));
        if (out[k].length) report.imported.push(`${k} (${out[k].length})`);
      }
    });
    if (raw.template) out.template = raw.template;
  },

  // JSON Resume standard: https://jsonresume.org/schema/
  _mapJsonResume(raw, out, report) {
    const b = raw.basics || {};
    out.personal.fullName = b.name || '';
    out.personal.jobTitle = b.label || '';
    out.personal.email = b.email || '';
    out.personal.phone = b.phone || '';
    out.personal.summary = b.summary || '';
    out.personal.portfolio = b.url || b.website || '';
    if (b.location) {
      const loc = b.location;
      out.personal.location = [loc.city, loc.region, loc.countryCode || loc.country]
        .filter(Boolean).join(', ');
    }
    if (Array.isArray(b.profiles)) {
      const li = b.profiles.find(p => (p.network || '').toLowerCase().includes('linkedin'));
      if (li) out.personal.linkedin = li.url || '';
      if (!out.personal.portfolio) {
        const web = b.profiles.find(p => !(p.network || '').toLowerCase().includes('linkedin'));
        if (web) out.personal.portfolio = web.url || '';
      }
    }
    report.imported.push('personal info');

    if (Array.isArray(raw.work)) {
      out.experience = raw.work.map(w => ({
        id: this._genId(),
        company: w.name || w.company || '',
        position: w.position || w.title || '',
        startDate: w.startDate || '',
        endDate: w.endDate || (w.endDate === null ? 'Present' : ''),
        description: this._combineDescription(w.summary, w.highlights)
      }));
      if (out.experience.length) report.imported.push(`experience (${out.experience.length})`);
    }

    if (Array.isArray(raw.education)) {
      out.education = raw.education.map(e => ({
        id: this._genId(),
        institution: e.institution || e.school || '',
        degree: e.studyType || e.degree || '',
        field: e.area || e.field || '',
        startDate: e.startDate || '',
        endDate: e.endDate || '',
        gpa: e.score || e.gpa || ''
      }));
      if (out.education.length) report.imported.push(`education (${out.education.length})`);
    }

    if (Array.isArray(raw.skills)) {
      out.skills = raw.skills.map(s => ({
        id: this._genId(),
        name: s.name || '',
        level: this._skillLevelFromString(s.level)
      }));
      if (out.skills.length) report.imported.push(`skills (${out.skills.length})`);
    }

    if (Array.isArray(raw.projects)) {
      out.projects = raw.projects.map(p => ({
        id: this._genId(),
        name: p.name || '',
        tech: Array.isArray(p.keywords) ? p.keywords.join(', ') : (p.keywords || ''),
        description: this._combineDescription(p.description, p.highlights),
        link: p.url || ''
      }));
      if (out.projects.length) report.imported.push(`projects (${out.projects.length})`);
    }

    if (Array.isArray(raw.certificates)) {
      out.certifications = raw.certificates.map(c => ({
        id: this._genId(),
        name: c.name || '',
        issuer: c.issuer || '',
        date: c.date || ''
      }));
      if (out.certifications.length) report.imported.push(`certifications (${out.certifications.length})`);
    }

    if (Array.isArray(raw.languages)) {
      out.languages = raw.languages.map(l => ({
        id: this._genId(),
        name: l.language || l.name || '',
        proficiency: l.fluency || l.proficiency || 'Fluent'
      }));
      if (out.languages.length) report.imported.push(`languages (${out.languages.length})`);
    }

    if (Array.isArray(raw.awards)) {
      out.awards = raw.awards.map(a => ({
        id: this._genId(),
        title: a.title || '',
        issuer: a.awarder || a.issuer || '',
        date: a.date || '',
        description: a.summary || a.description || ''
      }));
      if (out.awards.length) report.imported.push(`awards (${out.awards.length})`);
    }

    if (Array.isArray(raw.volunteer)) {
      out.volunteer = raw.volunteer.map(v => ({
        id: this._genId(),
        organization: v.organization || '',
        role: v.position || v.role || '',
        startDate: v.startDate || '',
        endDate: v.endDate || '',
        description: this._combineDescription(v.summary, v.highlights)
      }));
      if (out.volunteer.length) report.imported.push(`volunteer (${out.volunteer.length})`);
    }

    if (Array.isArray(raw.publications)) {
      out.publications = raw.publications.map(p => ({
        id: this._genId(),
        title: p.name || p.title || '',
        publisher: p.publisher || '',
        date: p.releaseDate || p.date || '',
        link: p.url || p.link || '',
        description: p.summary || p.description || ''
      }));
      if (out.publications.length) report.imported.push(`publications (${out.publications.length})`);
    }

    if (Array.isArray(raw.interests) && raw.interests.length) {
      out.custom.push({
        id: this._genId(),
        title: 'Interests',
        items: raw.interests.map(i => ({
          id: this._genId(),
          heading: i.name || '',
          description: Array.isArray(i.keywords) ? i.keywords.join(', ') : ''
        }))
      });
      report.imported.push('interests (as custom section)');
    }
  },

  // Fuzzy match from flat/unknown JSON
  _mapFuzzy(raw, out, report) {
    const lower = {};
    for (const k in raw) lower[k.toLowerCase().replace(/[_\s-]/g, '')] = raw[k];

    const find = (...aliases) => {
      for (const a of aliases) {
        const key = a.toLowerCase().replace(/[_\s-]/g, '');
        if (lower[key] !== undefined && lower[key] !== null && lower[key] !== '') return lower[key];
      }
      return '';
    };

    out.personal.fullName = find('fullname', 'name', 'fullName') || '';
    out.personal.jobTitle = find('jobtitle', 'title', 'position', 'role', 'headline', 'label');
    out.personal.email = find('email', 'emailaddress', 'mail');
    out.personal.phone = find('phone', 'phonenumber', 'mobile', 'tel');
    out.personal.location = find('location', 'address', 'city');
    out.personal.linkedin = find('linkedin', 'linkedinurl', 'linkedinprofile');
    out.personal.portfolio = find('portfolio', 'website', 'url', 'homepage');
    out.personal.summary = find('summary', 'about', 'bio', 'objective', 'profile');
    report.imported.push('personal info (fuzzy)');

    const tryArray = (key, aliases, mapper) => {
      for (const a of aliases) {
        const val = lower[a.toLowerCase().replace(/[_\s-]/g, '')];
        if (Array.isArray(val) && val.length) {
          out[key] = val.map(mapper);
          report.imported.push(`${key} (${out[key].length}, fuzzy)`);
          return;
        }
      }
    };

    tryArray('experience', ['experience', 'workExperience', 'work', 'jobs', 'employment'],
      (w) => ({
        id: this._genId(),
        company: w.company || w.employer || w.name || w.organization || '',
        position: w.position || w.title || w.role || w.jobTitle || '',
        startDate: w.startDate || w.start || w.from || '',
        endDate: w.endDate || w.end || w.to || '',
        description: w.description || w.summary || w.details || this._arrayToText(w.highlights) || ''
      })
    );

    tryArray('education', ['education', 'schools', 'academics'],
      (e) => ({
        id: this._genId(),
        institution: e.institution || e.school || e.university || e.college || e.name || '',
        degree: e.degree || e.studyType || e.qualification || '',
        field: e.field || e.area || e.major || e.fieldOfStudy || '',
        startDate: e.startDate || e.start || e.from || '',
        endDate: e.endDate || e.end || e.to || '',
        gpa: e.gpa || e.score || e.grade || ''
      })
    );

    tryArray('skills', ['skills', 'technicalSkills', 'expertise'],
      (s) => typeof s === 'string'
        ? { id: this._genId(), name: s, level: 70 }
        : { id: this._genId(), name: s.name || s.skill || '', level: this._skillLevelFromString(s.level) }
    );

    tryArray('projects', ['projects', 'portfolio', 'sideProjects'],
      (p) => ({
        id: this._genId(),
        name: p.name || p.title || '',
        tech: Array.isArray(p.tech) ? p.tech.join(', ') : (p.tech || p.technologies || p.stack || ''),
        description: p.description || p.summary || '',
        link: p.link || p.url || ''
      })
    );

    tryArray('certifications', ['certifications', 'certificates', 'certs'],
      (c) => ({
        id: this._genId(),
        name: c.name || c.title || '',
        issuer: c.issuer || c.authority || c.awarder || '',
        date: c.date || c.issueDate || ''
      })
    );

    tryArray('languages', ['languages'],
      (l) => typeof l === 'string'
        ? { id: this._genId(), name: l, proficiency: 'Fluent' }
        : { id: this._genId(), name: l.name || l.language || '', proficiency: l.proficiency || l.fluency || 'Fluent' }
    );
  },

  _combineDescription(summary, highlights) {
    const parts = [];
    if (summary) parts.push(summary);
    if (Array.isArray(highlights)) highlights.forEach(h => parts.push('• ' + h));
    return parts.join('\n');
  },

  _arrayToText(arr) {
    return Array.isArray(arr) ? arr.map(x => '• ' + x).join('\n') : '';
  },

  _skillLevelFromString(level) {
    if (typeof level === 'number') return Math.min(100, Math.max(10, level));
    const s = String(level || '').toLowerCase();
    if (s.includes('expert') || s.includes('master')) return 95;
    if (s.includes('advanced') || s.includes('senior')) return 80;
    if (s.includes('intermediate') || s.includes('mid')) return 60;
    if (s.includes('beginner') || s.includes('basic') || s.includes('junior')) return 35;
    if (s.includes('novice')) return 20;
    return 70;
  },

  _genId() { return Date.now() + Math.floor(Math.random() * 10000); },

  // ---------------- PDF Import ----------------
  async _importPdf(file) {
    if (typeof pdfjsLib === 'undefined') {
      throw new Error('PDF library failed to load. Please check your internet connection and try again.');
    }
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    // Extract text line by line across all pages
    const lines = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      // Group items by their vertical position to form lines
      const lineMap = new Map();
      content.items.forEach(item => {
        if (!item.str || !item.transform) return;
        const y = Math.round(item.transform[5]);
        if (!lineMap.has(y)) lineMap.set(y, []);
        lineMap.get(y).push({ x: item.transform[4], text: item.str });
      });
      // Sort top-to-bottom (higher y = higher on page in PDF coords)
      const sortedYs = Array.from(lineMap.keys()).sort((a, b) => b - a);
      sortedYs.forEach(y => {
        const parts = lineMap.get(y).sort((a, b) => a.x - b.x);
        const line = parts.map(p => p.text).join(' ').replace(/\s+/g, ' ').trim();
        if (line) lines.push(line);
      });
    }

    const out = this._parsePdfLines(lines);
    return { data: out, report: { source: 'pdf', imported: out._imported || [], skipped: [], rawLines: lines.length } };
  },

  _parsePdfLines(lines) {
    const out = this._emptyShape();
    const imported = [];
    const text = lines.join('\n');

    // --- Contact info via regex across entire text ---
    const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
    if (emailMatch) { out.personal.email = emailMatch[0]; }

    const phoneMatch = text.match(/(\+?\d{1,3}[\s-]?)?\(?\d{2,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,5}/);
    if (phoneMatch) { out.personal.phone = phoneMatch[0].trim(); }

    const linkedinMatch = text.match(/(https?:\/\/)?(www\.)?linkedin\.com\/[\w\-/?=&]+/i);
    if (linkedinMatch) { out.personal.linkedin = linkedinMatch[0]; }

    const urlMatch = text.match(/https?:\/\/(?!.*linkedin)[^\s]+/i);
    if (urlMatch) { out.personal.portfolio = urlMatch[0]; }

    // --- Name + Job Title from first few lines ---
    // Heuristic: first non-empty line that isn't an email/phone/URL is likely the name
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      const line = lines[i].trim();
      if (!line) continue;
      if (/@|https?:\/\/|^\+?\d/.test(line)) continue;
      if (line.length > 80) continue;
      if (!out.personal.fullName) {
        out.personal.fullName = line;
      } else if (!out.personal.jobTitle && line.length < 60) {
        out.personal.jobTitle = line;
        break;
      }
    }

    // --- Section splitting ---
    const sectionHeaders = {
      summary:        /^(summary|professional\s+summary|profile|objective|about)\s*:?$/i,
      experience:     /^(experience|work\s+experience|professional\s+experience|employment|work\s+history)\s*:?$/i,
      education:      /^(education|academic|qualifications)\s*:?$/i,
      skills:         /^(skills|technical\s+skills|core\s+competencies|expertise)\s*:?$/i,
      projects:       /^(projects|personal\s+projects|selected\s+projects|portfolio)\s*:?$/i,
      certifications: /^(certifications?|certificates?|licenses?)\s*:?$/i,
      languages:      /^languages?\s*:?$/i,
      awards:         /^(awards?|honors?|achievements?)\s*:?$/i,
      volunteer:      /^(volunteer(ing)?|community\s+service)\s*:?$/i,
      publications:   /^(publications?|papers?|research)\s*:?$/i
    };

    const buckets = {};
    let current = null;
    lines.forEach(line => {
      const trimmed = line.trim();
      let matched = false;
      for (const [name, regex] of Object.entries(sectionHeaders)) {
        if (regex.test(trimmed)) {
          current = name;
          buckets[name] = buckets[name] || [];
          matched = true;
          break;
        }
      }
      if (!matched && current) {
        buckets[current].push(trimmed);
      }
    });

    // --- Summary ---
    if (buckets.summary && buckets.summary.length) {
      out.personal.summary = buckets.summary.join(' ').trim();
      imported.push('summary');
    }

    // --- Location from summary/top lines if not found ---
    const locMatch = text.match(/\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)?),\s*(?:[A-Z][a-z]+|[A-Z]{2,3})\b/);
    if (locMatch) { out.personal.location = locMatch[0]; }

    // --- Experience (group by bullets / date patterns) ---
    if (buckets.experience) {
      out.experience = this._chunkExperience(buckets.experience);
      if (out.experience.length) imported.push(`experience (${out.experience.length})`);
    }

    // --- Education ---
    if (buckets.education) {
      out.education = this._chunkEducation(buckets.education);
      if (out.education.length) imported.push(`education (${out.education.length})`);
    }

    // --- Skills ---
    if (buckets.skills) {
      const raw = buckets.skills.join(' ').replace(/[•·●○▪]/g, ',');
      const items = raw.split(/[,;|]|\s-\s/).map(s => s.trim()).filter(s => s.length > 1 && s.length < 40);
      out.skills = items.slice(0, 30).map(name => ({ id: this._genId(), name, level: 70 }));
      if (out.skills.length) imported.push(`skills (${out.skills.length})`);
    }

    // --- Projects ---
    if (buckets.projects) {
      out.projects = this._chunkSimple(buckets.projects).map(chunk => ({
        id: this._genId(),
        name: chunk.title || '',
        tech: '',
        description: chunk.body || '',
        link: ''
      }));
      if (out.projects.length) imported.push(`projects (${out.projects.length})`);
    }

    // --- Certifications ---
    if (buckets.certifications) {
      out.certifications = buckets.certifications
        .filter(l => l.length > 3)
        .map(l => {
          const dateMatch = l.match(/\b(19|20)\d{2}\b/);
          const date = dateMatch ? dateMatch[0] : '';
          const clean = l.replace(/\b(19|20)\d{2}\b/, '').trim();
          const parts = clean.split(/\s[-–—]\s|\s*\|\s*/);
          return {
            id: this._genId(),
            name: parts[0] || clean,
            issuer: parts[1] || '',
            date
          };
        });
      if (out.certifications.length) imported.push(`certifications (${out.certifications.length})`);
    }

    // --- Languages ---
    if (buckets.languages) {
      const raw = buckets.languages.join(' ').replace(/[•·●○▪]/g, ',');
      const items = raw.split(/[,;|]/).map(s => s.trim()).filter(Boolean);
      out.languages = items.map(item => {
        const parts = item.split(/\s*[-–:(]\s*/);
        return {
          id: this._genId(),
          name: parts[0] || item,
          proficiency: (parts[1] || 'Fluent').replace(/\)$/, '').trim()
        };
      });
      if (out.languages.length) imported.push(`languages (${out.languages.length})`);
    }

    // --- Awards ---
    if (buckets.awards) {
      out.awards = this._chunkSimple(buckets.awards).map(c => ({
        id: this._genId(),
        title: c.title, issuer: '', date: c.date || '', description: c.body || ''
      }));
      if (out.awards.length) imported.push(`awards (${out.awards.length})`);
    }

    // --- Volunteer ---
    if (buckets.volunteer) {
      out.volunteer = this._chunkExperience(buckets.volunteer).map(e => ({
        id: this._genId(),
        organization: e.company, role: e.position,
        startDate: e.startDate, endDate: e.endDate, description: e.description
      }));
      if (out.volunteer.length) imported.push(`volunteer (${out.volunteer.length})`);
    }

    // --- Publications ---
    if (buckets.publications) {
      out.publications = this._chunkSimple(buckets.publications).map(c => ({
        id: this._genId(),
        title: c.title, publisher: '', date: c.date || '', link: '', description: c.body || ''
      }));
      if (out.publications.length) imported.push(`publications (${out.publications.length})`);
    }

    out._imported = imported;
    return out;
  },

  // Groups lines into experience blocks based on date patterns at line boundaries
  _chunkExperience(lines) {
    const blocks = [];
    let current = null;
    const datePattern = /((Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{2}\/\d{4}|\d{4})\s*[-–—to]+\s*((Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{2}\/\d{4}|\d{4}|Present|Current)/i;

    lines.forEach(line => {
      if (!line) return;
      const dateMatch = line.match(datePattern);
      const looksLikeHeader = dateMatch || (line.length < 100 && /^[A-Z]/.test(line) && !line.startsWith('•') && !line.startsWith('-'));

      if (dateMatch && current) {
        // Date on its own line — attach to current
        current.startDate = dateMatch[1] || '';
        current.endDate = dateMatch[3] || '';
      } else if (looksLikeHeader && !current) {
        current = { id: this._genId(), company: line, position: '', startDate: '', endDate: '', description: '' };
        if (dateMatch) {
          current.company = line.replace(datePattern, '').replace(/\s*[|,]\s*$/, '').trim();
          current.startDate = dateMatch[1] || '';
          current.endDate = dateMatch[3] || '';
        }
      } else if (/^[•\-\*]/.test(line) && current) {
        current.description += (current.description ? '\n' : '') + '• ' + line.replace(/^[•\-\*]\s*/, '');
      } else if (current) {
        if (!current.position && line.length < 80 && !/^[•\-\*]/.test(line)) {
          current.position = line;
        } else {
          current.description += (current.description ? '\n' : '') + line;
        }
      } else if (looksLikeHeader) {
        current = { id: this._genId(), company: line, position: '', startDate: '', endDate: '', description: '' };
      }

      // Start new block when we see a date-ending line after we've got description
      if (current && current.description && dateMatch && current.startDate) {
        blocks.push(current);
        current = null;
      }
    });
    if (current) blocks.push(current);
    return blocks;
  },

  _chunkEducation(lines) {
    const blocks = [];
    let current = null;
    lines.forEach(line => {
      if (!line) return;
      const dateMatch = line.match(/\b(19|20)\d{2}\b.*?\b(19|20)\d{2}\b|\b(19|20)\d{2}\s*[-–—to]+\s*(Present|Current|(19|20)\d{2})/i);
      const isInstitutionLine = /university|college|institute|school/i.test(line);

      if (isInstitutionLine) {
        if (current) blocks.push(current);
        current = { id: this._genId(), institution: line.replace(/\b(19|20)\d{2}\b[-–—\s]*(Present|Current|(19|20)\d{2})?/gi, '').trim(),
                    degree: '', field: '', startDate: '', endDate: '', gpa: '' };
        if (dateMatch) {
          const yrs = line.match(/\b(19|20)\d{2}\b/g) || [];
          current.startDate = yrs[0] || '';
          current.endDate = yrs[1] || '';
        }
      } else if (current) {
        if (!current.degree && /bachelor|master|phd|b\.?[as]\.?|m\.?[as]\.?|b\.?tech|m\.?tech|mba|diploma/i.test(line)) {
          current.degree = line.replace(/\b(19|20)\d{2}\b.*/gi, '').trim();
          const yrs = line.match(/\b(19|20)\d{2}\b/g) || [];
          if (yrs[0] && !current.startDate) current.startDate = yrs[0];
          if (yrs[1] && !current.endDate) current.endDate = yrs[1];
        } else if (/gpa|cgpa|grade/i.test(line)) {
          const g = line.match(/[\d.]+\s*\/\s*[\d.]+|[\d.]+/);
          if (g) current.gpa = g[0];
        } else if (!current.field && line.length < 60) {
          current.field = line;
        }
      }
    });
    if (current) blocks.push(current);
    return blocks;
  },

  _chunkSimple(lines) {
    const chunks = [];
    let current = null;
    lines.forEach(line => {
      if (!line) return;
      const dateMatch = line.match(/\b(19|20)\d{2}\b/);
      const isTitle = line.length < 80 && !/^[•\-\*]/.test(line) && /^[A-Z]/.test(line);
      if (isTitle && (!current || current.body)) {
        if (current) chunks.push(current);
        current = { title: line.replace(/\b(19|20)\d{2}\b.*/g, '').trim(), body: '', date: dateMatch ? dateMatch[0] : '' };
      } else if (current) {
        current.body += (current.body ? '\n' : '') + line.replace(/^[•\-\*]\s*/, '• ');
      } else {
        current = { title: line, body: '', date: '' };
      }
    });
    if (current) chunks.push(current);
    return chunks;
  }
};
