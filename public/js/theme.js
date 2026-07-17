document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('app-theme') || 'dark';
    if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    }

    // If there is a toggle button on the page
    const toggleBtn = document.getElementById('btnToggleTheme');
    if (toggleBtn) {
        updateToggleBtn(toggleBtn, savedTheme);
        
        toggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            if (newTheme === 'light') {
                document.documentElement.setAttribute('data-theme', 'light');
            } else {
                document.documentElement.removeAttribute('data-theme');
            }
            
            localStorage.setItem('app-theme', newTheme);
            updateToggleBtn(toggleBtn, newTheme);
        });
    }

    function updateToggleBtn(btn, theme) {
        const iconOnly = btn.hasAttribute('data-icon-only');
        if (theme === 'light') {
            btn.innerHTML = iconOnly ? '<i class="ph ph-moon"></i>' : `<i class="ph ph-moon"></i> <span data-i18n="theme_dark">${typeof t === 'function' ? t('theme_dark') : 'Dark Theme'}</span>`;
        } else {
            btn.innerHTML = iconOnly ? '<i class="ph ph-sun"></i>' : `<i class="ph ph-sun"></i> <span data-i18n="theme_light">${typeof t === 'function' ? t('theme_light') : 'Light Theme'}</span>`;
        }
    }
});
