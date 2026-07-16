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
        if (theme === 'light') {
            btn.innerHTML = '<i class="ph ph-moon"></i> Giao diện Tối';
        } else {
            btn.innerHTML = '<i class="ph ph-sun"></i> Giao diện Sáng';
        }
    }
});
