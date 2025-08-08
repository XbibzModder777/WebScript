(function() {
    'use strict';

    // --- Konfigurasi Keamanan ---
    const REDIRECT_URL = '404.html';
    const ENABLE_DEVTOOLS_DETECTION = true;

    function blockAccess() {
        window.location.replace(REDIRECT_URL);
    }

    // --- BLOK BARU: Pencegahan Akses Langsung ke File JS ---
    // Logika ini memeriksa apakah path URL berakhir dengan ".js".
    // Ini efektif untuk mencegah orang membuka file skrip Anda secara langsung di browser.
    if (window.location.pathname.endsWith('.js')) {
        blockAccess();
        return; // Hentikan eksekusi skrip lebih lanjut
    }

    // --- BLOK BARU: Pencegahan iFrame (Clickjacking) ---
    // Jika situs dimuat di dalam frame, alihkan frame teratas.
    if (window.top !== window.self) {
        window.top.location.replace(window.self.location.href);
    }
    
    // --- Kode Keamanan Sebelumnya (Tetap Ada) ---
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('keydown', e => {
        if (e.ctrlKey && ('spu'.indexOf(e.key) !== -1)) { // Menambahkan 'u' untuk blokir View Source
            e.preventDefault();
        }
    });

    const style = document.createElement('style');
    style.textContent = `body { -webkit-user-select: none; -ms-user-select: none; user-select: none; } img, a { -webkit-user-drag: none; user-drag: none; }`;
    document.head.appendChild(style);

    function detectBot() {
        if (navigator.webdriver) return true;
        const userAgent = navigator.userAgent.toLowerCase();
        const forbiddenAgents = ['curl', 'wget', 'postman', 'python', 'bot', 'spider', 'headless'];
        return forbiddenAgents.some(agent => userAgent.includes(agent));
    }

    function detectDevTools() {
        const threshold = 160;
        const check = () => {
            if ((window.outerWidth - window.innerWidth > threshold) || (window.outerHeight - window.innerHeight > threshold)) {
                try {
                    (function() { return false; }['constructor']('debugger')['call']());
                } catch (e) {}
                setTimeout(blockAccess, 500);
            }
        };
        setInterval(check, 1000);
    }

    if (detectBot()) {
        blockAccess();
    }
    if (ENABLE_DEVTOOLS_DETECTION) {
        detectDevTools();
    }
})();
