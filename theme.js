(function () {
    var KEY = 'hadeel-theme';

    function setTheme(theme) {
        if (theme !== 'light' && theme !== 'dark') return;
        document.documentElement.setAttribute('data-theme', theme);
        try {
            localStorage.setItem(KEY, theme);
        } catch (e) {}
        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
            meta.setAttribute('content', theme === 'dark' ? '#0f141c' : '#1a2f4a');
        }
        var btn = document.getElementById('themeToggle');
        if (btn) {
            btn.setAttribute('aria-label', theme === 'dark' ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن');
        }
    }

    function toggleTheme() {
        var cur = document.documentElement.getAttribute('data-theme') || 'light';
        setTheme(cur === 'dark' ? 'light' : 'dark');
    }

    function init() {
        var saved = localStorage.getItem(KEY);
        if (saved === 'dark' || saved === 'light') {
            setTheme(saved);
        } else {
            setTheme('light');
        }
        var btn = document.getElementById('themeToggle');
        if (btn) btn.addEventListener('click', toggleTheme);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
