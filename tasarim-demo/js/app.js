document.addEventListener('DOMContentLoaded', () => {
  // 1. Production Theme Switcher Integration (site_theme & data-theme)
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeStorageKey = 'site_theme';
  
  // Load preferred theme
  const initialTheme = localStorage.getItem(themeStorageKey) || 'light';
  applyTheme(initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      applyTheme(newTheme);
    });
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(themeStorageKey, theme);
    if (themeToggleBtn) {
      themeToggleBtn.innerText = theme === 'light' ? '☾' : '☀';
      themeToggleBtn.title = theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
    }
  }

  // 2. Production Local Translation Engine (i18n Offline Mock)
  const langToggleBtn = document.getElementById('lang-toggle-btn');
  let currentLang = localStorage.getItem('site_lang') || 'tr';

  // Embed translations locally so the demo runs perfectly offline (No CORS fetch errors in Chrome!)
  const localTranslations = {
    "tr": {
      "site_title": "Ahmet Arvas",
      "home": "ANA SAYFA",
      "monthly": "AYLIK",
      "projects": "PROJELER",
      "archive": "ARŞİV",
      "about": "HAKKIMDA",
      "profile_header": ":: PROFİL ::",
      "lvl_engineer": "MÜHENDİS ADAYI",
      "nav_header": ":: MENÜ ::",
      "shoutbox_header": ":: SHOUTBOX ::",
      "now_playing": "ŞU AN ÇALIYOR:",
      "projects_header": "PROJELER",
      "projects_desc": "Geliştirdiğim bazı oyunlar ve web projeleri:",
      "examine_btn": "İNCELE",
      "all_records": "ARŞİV",
      "empty_directory": "[!] BOŞ DİZİN",
      "id_card": "KİMLİK BİLGİSİ",
      "bio_title": "Elektrik & Elektronik Mühendisliği öğrencisi.",
      "bio_desc": "",
      "welcome_message": "",
      "welcome_sub": "kişisel blog",
      "diary_entries": "GÜNLÜK GİRDİLERİ",
      "read_more": "DEVAMINI OKU",
      "lang_toggle": "EN",
      "shoutbox_name_ph": "İsim",
      "shoutbox_msg_ph": "Mesaj...",
      "shoutbox_send": "GÖNDER!",
      "footer_text": "C10H16N5O13P3 ile tasarlandı",
      "time_header": ":: ZAMAN ::",
      "visitor_header": ":: ZİYARETÇİ ::",
      "visitor_desc": "Site yeniden yüklenince bile artıyor :("
    },
    "en": {
      "site_title": "Ahmet Arvas",
      "home": "HOME",
      "monthly": "MONTHLY",
      "projects": "PROJECTS",
      "archive": "ARCHIVE",
      "about": "ABOUT",
      "profile_header": ":: PROFILE ::",
      "lvl_engineer": "ENGINEER STUDENT",
      "nav_header": ":: MENU ::",
      "shoutbox_header": ":: SHOUTBOX ::",
      "now_playing": "NOW PLAYING:",
      "projects_header": "PROJECTS",
      "projects_desc": "Some games and web projects I developed:",
      "examine_btn": "EXAMINE",
      "all_records": "ARCHIVE",
      "empty_directory": "[!] EMPTY DIRECTORY",
      "id_card": "ID CARD",
      "bio_title": "Electrical & Electronics Engineering Student.",
      "bio_desc": "",
      "welcome_message": "",
      "welcome_sub": "personal blog",
      "diary_entries": "DIARY ENTRIES",
      "read_more": "READ MORE",
      "lang_toggle": "TR",
      "shoutbox_name_ph": "Name",
      "shoutbox_msg_ph": "Message...",
      "shoutbox_send": "SEND!",
      "footer_text": "Designed with C10H16N5O13P3",
      "time_header": ":: TIME ::",
      "visitor_header": ":: VISITOR ::",
      "visitor_desc": "Increases even when site reloads :("
    }
  };

  function applyLanguage(lang) {
    if (!localTranslations[lang]) return;
    
    // Update plain text attributes
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (localTranslations[lang][key]) {
        el.innerText = localTranslations[lang][key];
      }
    });

    // Update input placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (localTranslations[lang][key]) {
        el.setAttribute('placeholder', localTranslations[lang][key]);
      }
    });

    localStorage.setItem('site_lang', lang);
    currentLang = lang;
    document.documentElement.lang = lang;

    if (langToggleBtn) {
      langToggleBtn.innerText = localTranslations[lang]['lang_toggle'];
    }

    if (typeof updateClock === 'function') {
      updateClock();
    }
  }

  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      const newLang = currentLang === 'tr' ? 'en' : 'tr';
      applyLanguage(newLang);
    });
  }

  // Set default language on load
  applyLanguage(currentLang);

  // 3. Simple Local Storage Shoutbox
  const shoutForm = document.getElementById('shoutForm');
  const shoutNameInput = document.getElementById('shoutNameInput');
  const shoutMsgInput = document.getElementById('shoutMsgInput');
  const shoutboxPosts = document.getElementById('shoutboxPosts');

  let shouts = JSON.parse(localStorage.getItem('shouts')) || [
    { name: 'Tülin', message: 'Anahtarlık fikri çok tatlı oldu, lise öğrencileri çok sevindi.', date: '28.05.2026 01:45' },
    { name: 'Ali', message: 'Sallama testi kararlılık için çok kritikti, uçuşlar harikaydı!', date: '28.05.2026 02:10' },
    { name: 'Leon', message: 'Pin filmi üzerine şizofreni ve yapay zeka analiziniz düşündürücüydü.', date: '27.05.2026 23:30' }
  ];

  function renderShouts() {
    if (!shoutboxPosts) return;
    shoutboxPosts.innerHTML = '';
    shouts.forEach(shout => {
      const msgDiv = document.createElement('div');
      msgDiv.className = 'shout-msg';
      msgDiv.innerHTML = `
        <span class="shout-time">${shout.date}</span>
        <span class="shout-author">${shout.name}:</span>
        <span class="shout-text">${shout.message}</span>
      `;
      shoutboxPosts.appendChild(msgDiv);
    });
    // Scroll to the top of the ledger (where newest messages are)
    shoutboxPosts.scrollTop = 0;
  }

  if (shoutForm && shoutNameInput && shoutMsgInput) {
    shoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const author = shoutNameInput.value.trim();
      const text = shoutMsgInput.value.trim();
      if (!author || !text) return;

      const now = new Date();
      const formattedDate = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      shouts.unshift({
        name: author,
        message: text,
        date: formattedDate
      });

      localStorage.setItem('shouts', JSON.stringify(shouts));
      shoutMsgInput.value = '';
      renderShouts();
    });
  }

  // 4. Clock & Date Dynamic Updater (With i18n support)
  const clockEl = document.getElementById('clock');
  const dateEl = document.getElementById('date');

  function updateClock() {
    if (!clockEl || !dateEl) return;
    const now = new Date();
    
    // Smooth ticking format: HH:MM:SS
    clockEl.innerText = now.toLocaleTimeString(currentLang === 'tr' ? 'tr-TR' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    // Elegant long date format (e.g. "28 MAYIS 2026")
    const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const dateStr = now.toLocaleDateString(currentLang === 'tr' ? 'tr-TR' : 'en-US', dateOptions);
    dateEl.innerText = dateStr.toUpperCase();
  }

  // Bind updateClock to global scope so applyLanguage can access it immediately
  window.updateClock = updateClock;

  setInterval(updateClock, 1000);
  updateClock();

  renderShouts();
});
