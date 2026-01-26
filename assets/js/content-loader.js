(function () {
  const MONTHS = [
    'Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.',
    'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'
  ];

  function parseDate(dateStr) {
    if (!dateStr) return null;
    if (dateStr.length === 7) {
      return new Date(dateStr + '-01');
    }
    return new Date(dateStr);
  }

  function formatMonthYear(dateStr) {
    const date = parseDate(dateStr);
    if (!date || Number.isNaN(date.getTime())) return '';
    return MONTHS[date.getMonth()] + ' ' + date.getFullYear();
  }

  function sortByDateDesc(items) {
    return items.slice().sort((a, b) => {
      const da = parseDate(a.date);
      const db = parseDate(b.date);
      const ta = da && !Number.isNaN(da.getTime()) ? da.getTime() : 0;
      const tb = db && !Number.isNaN(db.getTime()) ? db.getTime() : 0;
      return tb - ta;
    });
  }

  function renderLinks(links) {
    if (!links || links.length === 0) return '';
    return links
      .map(link => `<a href="${link.url}" class="text-href">${link.label}</a>`)
      .join(' / ');
  }

  function safeHtml(value) {
    return value == null ? '' : String(value);
  }

  function highlightName(html, name) {
    if (!html || !name) return html;
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const boldPattern = new RegExp(`<b>\\s*${escaped}\\s*<\\/b>`, 'gi');
    const plainPattern = new RegExp(`\\b${escaped}\\b`, 'gi');
    const highlight = `<span class="text-blue-700 font-semibold underline decoration-1 decoration-gray-400/60 underline-offset-2">${name}</span>`;
    return html
      .replace(boldPattern, highlight)
      .replace(plainPattern, highlight);
  }

  async function fetchJson(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error('Failed to load ' + path);
    return res.json();
  }

  async function fetchYaml(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error('Failed to load ' + path);
    const text = await res.text();
    return window.jsyaml.load(text);
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || '';
  }

  function setHtml(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = value || '';
  }

  function setAttr(id, attr, value) {
    const el = document.getElementById(id);
    if (el && value != null) el.setAttribute(attr, value);
  }

  function renderProfile(profile) {
    if (!profile) return;
    setText('profile-name', profile.name);
    setText('profile-title', profile.title);
    setText('profile-affiliation', profile.affiliation);
    setText('profile-email', profile.email);
    setAttr('profile-avatar', 'src', profile.avatar);
    const linksEl = document.getElementById('profile-links');
    if (linksEl && Array.isArray(profile.links)) {
      linksEl.innerHTML = profile.links
        .filter(link => link.url)
        .map(link => {
          const icon = link.icon ? `<i class="${link.icon} mr-1"></i>` : '';
          return `<a href="${link.url}" target="_blank" rel="noopener" class="text-primary hover:text-primary/80 transition-colors flex items-center" style="font-size: 11pt;">${icon}${link.label}</a>`;
        })
        .join('\n');
    }
  }

  function renderNav(nav) {
    const navEl = document.getElementById('nav-links');
    if (!navEl || !Array.isArray(nav)) return;
    navEl.innerHTML = nav
      .map((item, idx) => {
        const separator = idx === nav.length - 1 ? '' : ' /\n';
        return `<a href="#${item.id}" class="text-primary hover:text-primary/80 transition-colors flex items-center" style="font-size: 11pt;">${item.label}</a>${separator}`;
      })
      .join('');
  }

  function renderPreprints(items) {
    const container = document.getElementById('preprints-list');
    if (!container) return;
    const html = items.map(item => {
      const links = renderLinks(item.links);
      const authors = highlightName(safeHtml(item.authors), 'Zihao Cheng');
      return `
        <div class="bg-white pt-1 pb-1 pl-2 rounded-lg sidebar-shadow">
          <p class="text-gray-900 text-sm mb-0" style="font-size: 14px;">
            <b>${safeHtml(item.title)}</b> <br>
            ${authors} <br>
            <b>${safeHtml(item.venue)}</b> <br>
            ${links}
          </p>
        </div>
      `;
    }).join('\n');
    container.innerHTML = html;
    container.querySelectorAll('a').forEach(anchor => {
      anchor.classList.add('text-primary', 'hover:text-primary/80', 'transition-colors');
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener');
    });
  }

  function renderPublications(items) {
    const container = document.getElementById('publications-list');
    if (!container) return;
    const html = items.map(item => {
      const links = renderLinks(item.links);
      const authors = highlightName(safeHtml(item.authors), 'Zihao Cheng');
      return `
        <div class="bg-white pt-1 pb-1 pl-2 rounded-lg sidebar-shadow">
          <p class="text-gray-900 text-sm mb-0" style="font-size: 14px;">
            <b>${safeHtml(item.title)}</b> <br>
            ${authors} <br>
            <b>${safeHtml(item.venue)}</b> <br>
            ${links}
          </p>
        </div>
      `;
    }).join('\n');
    container.innerHTML = html;
    container.querySelectorAll('a').forEach(anchor => {
      anchor.classList.add('text-primary', 'hover:text-primary/80', 'transition-colors');
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener');
    });
  }

  function renderProjects(items) {
    const container = document.getElementById('projects-list');
    if (!container) return;
    const html = sortByDateDesc(items).map(item => {
      const links = renderLinks(item.links);
      const description = item.description ? window.marked.parseInline(item.description) : '';
      const title = item.title ? safeHtml(item.title) : `${safeHtml(item.company)}${item.role ? `, ${safeHtml(item.role)}` : ''}`;
      const time = item.time ? safeHtml(item.time) : '';
      const linksLine = links ? `${links}` : '';
      return `
        <div class="bg-white pt-1 pb-1 pl-2 rounded-lg sidebar-shadow">
          <p class="text-gray-900 text-sm mb-0" style="font-size: 14px;">
            <span class="flex items-baseline gap-4">
              <b>${title}</b>
              <b class="whitespace-nowrap ml-auto pr-3">${time}</b>
            </span>
            ${description} <br>
            ${linksLine}
          </p>
        </div>
      `;
    }).join('\n');
    container.innerHTML = html;
    container.querySelectorAll('a').forEach(anchor => {
      anchor.classList.add('text-primary', 'hover:text-primary/80', 'transition-colors');
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener');
    });
  }

  function renderHonors(items) {
    const container = document.getElementById('honors-list');
    if (!container) return;
    const html = items.map(item => (
      `<div class="flex items-start gap-2 pb-1 mb-1">
        <span class="mt-2 h-1.5 w-1.5 rounded-full bg-primary/40 flex-shrink-0"></span>
        <p class="text-gray-900 text-sm" style="font-size: 11pt;">${safeHtml(item)}</p>
      </div>`
    )).join('\n');
    container.innerHTML = html;
  }

  function renderActivities(items) {
    const container = document.getElementById('activities-list');
    if (!container) return;
    const html = items.map(group => {
      const itemsHtml = (group.items || []).map(item => (
        `<p class="text-gray-900 text-sm" style="font-size: 11pt;">${safeHtml(item)}</p>`
      )).join('\n');
      return `
        <div>
          <p class="text-gray-900 text-sm mb-1" style="font-size: 11pt;">
            <b>${safeHtml(group.title)}</b> <br>
            ${itemsHtml}
          </p>
        </div>
      `;
    }).join('\n');
    container.innerHTML = html;
  }

  function renderNews(items) {
    const container = document.getElementById('news-list');
    if (!container) return;
    const html = sortByDateDesc(items).map((item, idx) => {
      const dateLabel = item.date_label || formatMonthYear(item.date);
      const borderClass = idx === 0 ? 'border-primary' : 'border-gray-300';
      const content = item.content ? window.marked.parseInline(item.content) : '';
      return `
        <div class="flex border-l-3 ${borderClass} pl-2 py-0.5">
          <div>
            <p class="font-medium text-sm" style="font-size: 14px;"><b>${safeHtml(dateLabel)}</b></p>
            <p class="text-gray-900 text-sm" style="font-size: 14px;">${content}</p>
          </div>
        </div>
      `;
    }).join('\n');
    container.innerHTML = html;
    container.querySelectorAll('a').forEach(anchor => {
      anchor.classList.add('text-primary', 'hover:text-primary/80', 'transition-colors');
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener');
    });
  }

  async function main() {
    try {
      const site = await fetchYaml('data/site.yaml');
      renderProfile(site.profile);
      renderNav(site.nav);
      if (site.about) {
        setHtml('about-content', window.marked.parse(site.about));
        const aboutEl = document.getElementById('about-content');
        if (aboutEl) {
          aboutEl.querySelectorAll('a').forEach(anchor => {
            anchor.classList.add('text-primary', 'hover:text-primary/80', 'transition-colors');
            anchor.setAttribute('target', '_blank');
            anchor.setAttribute('rel', 'noopener');
          });
        }
      }
      if (site.publications_url) {
        setAttr('publications-link', 'href', site.publications_url);
      }
      if (site.news_url) {
        setAttr('news-link', 'href', site.news_url);
      }
    } catch (err) {
      console.error(err);
    }

    try {
      const [preprints, publications, projects, news, honors, activities] = await Promise.all([
        fetchJson('data/preprints.json'),
        fetchJson('data/publications.json'),
        fetchJson('data/projects.json'),
        fetchJson('data/news.json'),
        fetchJson('data/honors.json'),
        fetchJson('data/activities.json')
      ]);

      renderPreprints(preprints);
      renderPublications(publications);
      renderProjects(projects);
      renderNews(news);
      renderHonors(honors);
      renderActivities(activities);
    } catch (err) {
      console.error(err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }
})();
