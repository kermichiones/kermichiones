// Theme handling
const themeStorageKey = 'site_theme';
const defaultTheme = 'light';

function getPreferredTheme() {
    const storedTheme = localStorage.getItem(themeStorageKey);
    if (storedTheme) {
        return storedTheme;
    }
    return 'light';
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(themeStorageKey, theme);
    updateThemeButton(theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

function updateThemeButton(theme) {
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) {
        // Simple text or icon toggle
        btn.innerText = theme === 'light' ? '☾' : '☀';
        btn.title = theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
    }
}

// Initialize immediately
const initialTheme = getPreferredTheme();
setTheme(initialTheme);

// Expose to window for button onclick
window.toggleTheme = toggleTheme;

// Wait for DOM to update button text if script runs before button exists
document.addEventListener('DOMContentLoaded', () => {
    updateThemeButton(initialTheme);
});
