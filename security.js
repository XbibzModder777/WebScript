(function() {
    'use strict';

    // --- Konfigurasi ---
    const REDIRECT_URL = '404.html';
    const ENABLE_DEVTOOLS_DETECTION = true;

    // --- Fungsi Blokir ---
    function blockAccess() {
        window.location.replace(REDIRECT_URL);
    }

    // --- Perlindungan Akses Langsung & iFrame ---
    if (window.location.pathname.endsWith('.js') || window.top !== window.self) {
        blockAccess();
        return; 
    }
    
    // --- Perlindungan Konten ---
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('keydown', e => {
        // Blokir Ctrl+S, Ctrl+P, Ctrl+U
        if (e.ctrlKey && ('spu'.indexOf(e.key) !== -1)) {
            e.preventDefault();
        }
    });

    const style = document.createElement('style');
    style.textContent = `body { -webkit-user-select: none; -ms-user-select: none; user-select: none; } img, a { -webkit-user-drag: none; user-drag: none; }`;
    document.head.appendChild(style);

    // --- Deteksi Bot ---
    function detectBot() {
        if (navigator.webdriver) return true;
        const userAgent = navigator.userAgent.toLowerCase();
        const forbiddenAgents = ['curl', 'wget', 'postman', 'python', 'bot', 'spider', 'headless'];
        return forbiddenAgents.some(agent => userAgent.includes(agent));
    }

    // --- Deteksi Developer Tools ---
    function detectDevTools() {
        const threshold = 160;
        const check = () => {
            if ((window.outerWidth - window.innerWidth > threshold) || (window.outerHeight - window.innerHeight > threshold)) {
                try {
                    // Mengganggu debugger
                    (function() { return false; }['constructor']('debugger')['call']());
                } catch (e) {}
                setTimeout(blockAccess, 500);
            }
        };
        setInterval(check, 1000);
    }

    // --- Eksekusi Keamanan ---
    if (detectBot()) {
        blockAccess();
    }
    if (ENABLE_DEVTOOLS_DETECTION) {
        detectDevTools();
    }
})();