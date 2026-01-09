let translations = {};
let currentLang = localStorage.getItem('site_lang') || 'tr'; // Default to TR

async function loadTranslations() {
    try {
        const response = await fetch('/assets/data/translations.json');
        translations = await response.json();
        applyLanguage(currentLang);
        updateToggleButton();
    } catch (error) {
        console.error('Failed to load translations:', error);
    }
}

function applyLanguage(lang) {
    if (!translations[lang]) return;
    
    // Update simple text elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) {
            el.setAttribute('placeholder', translations[lang][key]);
        }
    });
    
    // Update Month Headers specially (if they exist and have a specific format)
    // This is a bit tricky for dynamic content, but we handled months in JSON.
    // For now, static labels are the priority.

    // Save preference
    localStorage.setItem('site_lang', lang);
    currentLang = lang;
    
    // Update HTML lang attribute
    document.documentElement.lang = lang;
}

function toggleLanguage() {
    const newLang = currentLang === 'tr' ? 'en' : 'tr';
    applyLanguage(newLang);
    updateToggleButton();
}

function updateToggleButton() {
    const btn = document.getElementById('lang-toggle-btn');
    if (btn && translations[currentLang]) {
        btn.innerText = translations[currentLang]['lang_toggle'];
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', loadTranslations);

// Export for button onclick if needed (though we'll attach event listener)
window.toggleLanguage = toggleLanguage;
