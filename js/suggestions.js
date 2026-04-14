// ===== Smart Suggestions Engine — Multi-Industry =====
const Suggestions = {

  // ===== Offline suggestions by category =====
  categories: {
    general: {
      label: '🌐 General',
      experience: [
        "Managed daily operations and ensured smooth workflow across departments",
        "Trained and mentored new team members, reducing onboarding time by 30%",
        "Collaborated with cross-functional teams to achieve quarterly targets",
        "Prepared detailed reports and presentations for senior management",
        "Identified process inefficiencies and implemented improvements saving 15+ hours/week",
        "Maintained accurate records and documentation per company standards",
        "Handled customer inquiries and resolved issues with 95%+ satisfaction rate",
        "Coordinated with vendors and suppliers to ensure timely delivery of materials",
        "Organized team meetings and tracked action items to completion",
        "Achieved consistent performance ratings above expectations in annual reviews"
      ],
      projects: [
        "Led a team initiative to streamline internal communication processes",
        "Organized a company-wide event with 200+ attendees within budget",
        "Created a training manual that reduced new hire ramp-up time by 40%",
        "Developed a tracking system to monitor project milestones and deadlines",
        "Implemented a feedback system that improved team satisfaction scores by 25%"
      ],
      summary: [
        "Dedicated professional with strong organizational and communication skills. Proven ability to manage multiple priorities and deliver results in fast-paced environments.",
        "Results-oriented team player with excellent problem-solving abilities. Committed to continuous improvement and delivering high-quality work.",
        "Experienced professional with a track record of meeting targets and exceeding expectations. Strong interpersonal skills and attention to detail."
      ]
    },
    tech: {
      label: '💻 IT / Tech',
      experience: [
        "Developed and maintained web applications serving 10,000+ daily active users",
        "Implemented RESTful APIs that reduced server response time by 40%",
        "Designed and deployed CI/CD pipelines, reducing deployment time by 50%",
        "Conducted code reviews and mentored junior developers on best practices",
        "Optimized database queries resulting in 60% improvement in page load times",
        "Built responsive, mobile-first UI components following accessibility guidelines",
        "Migrated legacy systems to modern cloud-based architecture",
        "Wrote comprehensive unit and integration tests achieving 90%+ code coverage",
        "Automated manual processes saving the team approximately 20 hours per week",
        "Integrated third-party APIs including payment gateways and authentication services"
      ],
      projects: [
        "Built a full-stack e-commerce platform supporting 1000+ products",
        "Developed a real-time chat application with message encryption",
        "Created an automated testing framework reducing QA time by 60%",
        "Designed a mobile-responsive admin dashboard with role-based access control",
        "Built a task management app with drag-and-drop and team collaboration features"
      ],
      summary: [
        "Results-driven software developer with experience building scalable web applications. Proficient in modern frameworks and cloud technologies.",
        "Full-stack developer with expertise in agile methodologies and delivering high-quality software solutions on time.",
        "Detail-oriented engineer passionate about creating intuitive user experiences and writing clean, maintainable code."
      ]
    },
    marketing: {
      label: '📢 Marketing / Sales',
      experience: [
        "Developed and executed marketing campaigns that increased brand awareness by 45%",
        "Managed social media accounts growing follower base from 5K to 50K in 12 months",
        "Conducted market research and competitor analysis to identify growth opportunities",
        "Created content strategy that increased organic website traffic by 60%",
        "Negotiated contracts with clients resulting in 20% increase in annual revenue",
        "Managed a sales pipeline of $2M+ and consistently exceeded quarterly targets",
        "Organized product launches and promotional events with measurable ROI",
        "Built and maintained relationships with key clients and stakeholders",
        "Analyzed campaign performance data and optimized strategies for better conversion",
        "Collaborated with design team to create compelling marketing collateral"
      ],
      projects: [
        "Launched a digital marketing campaign that generated 500+ qualified leads in 3 months",
        "Created a brand identity guide adopted across all company communications",
        "Developed an email marketing automation workflow increasing open rates by 35%",
        "Organized a trade show booth that attracted 1000+ visitors",
        "Built a customer referral program that contributed 15% of new business"
      ],
      summary: [
        "Dynamic marketing professional with proven expertise in digital campaigns, brand management, and data-driven strategy.",
        "Results-oriented sales professional with strong negotiation skills and a history of exceeding revenue targets.",
        "Creative marketing specialist skilled in content strategy, social media management, and campaign analytics."
      ]
    },
    finance: {
      label: '💰 Finance',
      experience: [
        "Prepared monthly financial statements and reports for senior management",
        "Managed accounts payable and receivable processing $500K+ monthly",
        "Conducted financial analysis and forecasting to support business decisions",
        "Ensured compliance with tax regulations and filing deadlines",
        "Reconciled bank statements and resolved discrepancies within 24 hours",
        "Implemented cost-saving measures that reduced operational expenses by 15%",
        "Assisted in annual audit preparation and liaised with external auditors",
        "Processed payroll for 200+ employees with 100% accuracy",
        "Created financial models and dashboards for executive reporting",
        "Managed budgets across multiple departments totaling $5M+"
      ],
      projects: [
        "Automated invoice processing system reducing manual work by 70%",
        "Developed a financial dashboard for real-time budget tracking",
        "Led the transition to a new accounting software with zero data loss",
        "Created a cost analysis report that identified $200K in annual savings",
        "Implemented a new expense approval workflow reducing processing time by 50%"
      ],
      summary: [
        "Detail-oriented finance professional with strong analytical skills and expertise in financial reporting, budgeting, and compliance.",
        "Experienced accountant with a proven track record in managing complex financial operations and delivering accurate, timely reports.",
        "Results-driven financial analyst skilled in forecasting, data modeling, and strategic planning."
      ]
    },
    healthcare: {
      label: '🏥 Healthcare',
      experience: [
        "Provided compassionate patient care to 20+ patients daily in a fast-paced clinical setting",
        "Maintained accurate patient records and documentation per HIPAA regulations",
        "Assisted physicians with examinations, procedures, and treatment plans",
        "Administered medications and monitored patient vital signs",
        "Educated patients and families on treatment plans and preventive care",
        "Coordinated with multidisciplinary teams to ensure comprehensive patient care",
        "Managed appointment scheduling and patient flow optimization",
        "Conducted health screenings and assessments for community outreach programs",
        "Maintained inventory of medical supplies and equipment",
        "Achieved 98% patient satisfaction scores through attentive care"
      ],
      projects: [
        "Implemented a patient tracking system that reduced wait times by 25%",
        "Organized a health awareness camp serving 500+ community members",
        "Developed training materials for new nursing staff",
        "Led a quality improvement initiative that reduced medication errors by 40%",
        "Created a patient education resource library for common conditions"
      ],
      summary: [
        "Compassionate healthcare professional with hands-on clinical experience and strong patient care skills.",
        "Dedicated medical professional with expertise in patient assessment, treatment coordination, and health education.",
        "Experienced healthcare worker with excellent communication skills and a patient-first approach to care delivery."
      ]
    },
    education: {
      label: '📚 Education',
      experience: [
        "Developed and delivered engaging lesson plans for classes of 30+ students",
        "Improved student test scores by 20% through personalized teaching strategies",
        "Created interactive learning materials and digital resources",
        "Mentored and guided students in academic and career planning",
        "Organized extracurricular activities and school events",
        "Collaborated with parents and staff to support student development",
        "Implemented differentiated instruction to accommodate diverse learning needs",
        "Maintained classroom discipline while fostering a positive learning environment",
        "Assessed student progress through regular evaluations and feedback",
        "Participated in curriculum development and professional development workshops"
      ],
      projects: [
        "Launched an after-school tutoring program that improved pass rates by 30%",
        "Created a digital learning platform for remote student engagement",
        "Organized a science fair with 100+ student participants",
        "Developed a reading program that increased student literacy levels",
        "Led a teacher training workshop on modern pedagogical techniques"
      ],
      summary: [
        "Passionate educator with experience in curriculum development and student mentorship.",
        "Dedicated teacher with strong classroom management skills and a commitment to student success.",
        "Enthusiastic education professional with expertise in interactive teaching methods and student development."
      ]
    },
    design: {
      label: '🎨 Design',
      experience: [
        "Designed user interfaces for web and mobile applications with 50K+ users",
        "Created brand identities including logos, color systems, and typography guidelines",
        "Produced marketing materials including brochures, banners, and social media graphics",
        "Conducted user research and usability testing to inform design decisions",
        "Collaborated with developers to ensure pixel-perfect implementation of designs",
        "Managed multiple design projects simultaneously meeting all deadlines",
        "Created wireframes and prototypes using Figma and Adobe Creative Suite",
        "Developed motion graphics and video content for marketing campaigns",
        "Maintained design consistency across all brand touchpoints",
        "Presented design concepts to stakeholders and incorporated feedback iteratively"
      ],
      projects: [
        "Redesigned a company website resulting in 40% increase in user engagement",
        "Created a comprehensive brand style guide adopted company-wide",
        "Designed a mobile app interface that received 4.8-star user ratings",
        "Produced a promotional video that garnered 100K+ views",
        "Built a design system with reusable components reducing design time by 50%"
      ],
      summary: [
        "Creative designer with a strong portfolio in UI/UX, branding, and visual communication.",
        "Versatile graphic designer skilled in both digital and print media with brand development experience.",
        "Detail-oriented creative professional with expertise in user interface design and visual storytelling."
      ]
    },
    operations: {
      label: '🏭 Operations',
      experience: [
        "Managed warehouse operations handling 1000+ shipments daily",
        "Implemented inventory management system reducing stock discrepancies by 35%",
        "Supervised a team of 15+ workers ensuring safety compliance and productivity targets",
        "Optimized supply chain processes reducing delivery times by 20%",
        "Conducted quality inspections maintaining 99%+ product compliance rate",
        "Coordinated with vendors and logistics partners for timely material procurement",
        "Prepared production schedules and monitored workflow efficiency",
        "Reduced operational costs by 12% through process optimization",
        "Maintained equipment and machinery ensuring minimal downtime",
        "Ensured compliance with health, safety, and environmental regulations"
      ],
      projects: [
        "Led a lean manufacturing initiative that improved production efficiency by 25%",
        "Implemented a barcode tracking system for real-time inventory management",
        "Organized a safety training program achieving zero workplace incidents for 12 months",
        "Redesigned warehouse layout increasing storage capacity by 30%",
        "Developed a vendor evaluation system improving supplier quality by 20%"
      ],
      summary: [
        "Experienced operations professional with expertise in supply chain management, process optimization, and team leadership.",
        "Results-driven logistics coordinator with a track record of improving efficiency and reducing costs.",
        "Detail-oriented manufacturing professional skilled in quality control, production planning, and safety compliance."
      ]
    },
    hr: {
      label: '👥 HR / Admin',
      experience: [
        "Managed end-to-end recruitment process hiring 50+ candidates annually",
        "Conducted employee onboarding and orientation programs",
        "Administered payroll and benefits for 300+ employees",
        "Developed and implemented HR policies and procedures",
        "Handled employee relations issues and conflict resolution",
        "Organized training and development programs improving employee skills",
        "Maintained employee records and HR databases with 100% accuracy",
        "Coordinated performance review cycles and feedback processes",
        "Managed office administration including facilities and vendor relationships",
        "Ensured compliance with labor laws and company regulations"
      ],
      projects: [
        "Implemented an applicant tracking system reducing time-to-hire by 40%",
        "Launched an employee wellness program with 80% participation rate",
        "Created an employee handbook adopted across all company locations",
        "Organized a company retreat for 150+ employees within budget",
        "Developed a performance management framework improving review quality"
      ],
      summary: [
        "Experienced HR professional with expertise in recruitment, employee relations, and organizational development.",
        "Detail-oriented administrative professional with excellent organizational skills and office management experience.",
        "Dedicated human resources specialist skilled in talent acquisition, policy development, and employee engagement."
      ]
    }
  },

  // ===== Show modal with category tabs =====
  show(type, targetTextarea) {
    const modal = document.getElementById('suggestions-modal');
    const list = document.getElementById('suggestions-list');

    let html = '';

    // Category tabs
    html += `<div class="suggestion-tabs" id="suggestion-tabs">`;
    const catKeys = Object.keys(this.categories);
    catKeys.forEach((key, i) => {
      const cat = this.categories[key];
      html += `<button class="suggestion-tab${i === 0 ? ' active' : ''}" data-cat="${key}">${cat.label}</button>`;
    });
    html += `</div>`;

    // Category content
    html += `<div id="suggestion-cat-content" class="suggestion-cat-content">`;
    const firstCat = this.categories[catKeys[0]];
    const items = firstCat[type] || firstCat.experience || [];
    items.forEach(item => {
      html += `<div class="suggestion-item" data-suggestion="${this._esc(item)}">${item}</div>`;
    });
    html += `</div>`;

    list.innerHTML = html;

    // Wire up tab clicks
    list.querySelectorAll('.suggestion-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        list.querySelectorAll('.suggestion-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const cat = this.categories[tab.dataset.cat];
        const catItems = cat[type] || cat.experience || [];
        const content = document.getElementById('suggestion-cat-content');
        content.innerHTML = catItems.map(item =>
          `<div class="suggestion-item" data-suggestion="${this._esc(item)}">${item}</div>`
        ).join('');
        this._wireItemClicks(content, targetTextarea, modal);
      });
    });

    // Wire up item clicks
    this._wireItemClicks(document.getElementById('suggestion-cat-content'), targetTextarea, modal);

    modal.classList.add('active');
  },

  _esc(text) {
    return (text || '').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  },

  _wireItemClicks(container, targetTextarea, modal) {
    container.querySelectorAll('.suggestion-item').forEach(el => {
      el.addEventListener('click', () => {
        if (targetTextarea) {
          const current = targetTextarea.value;
          targetTextarea.value = current
            ? current + '\n• ' + el.dataset.suggestion
            : '• ' + el.dataset.suggestion;
          targetTextarea.dispatchEvent(new Event('input', { bubbles: true }));
        }
        modal.classList.remove('active');
      });
    });
  }
};
