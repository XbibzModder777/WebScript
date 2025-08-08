(function() {
    'use strict';

    // --- Konfigurasi Keamanan ---
    const REDIRECT_URL = '404.html';
    const ENABLE_DEVTOOLS_DETECTION = true; // Set ke false untuk menonaktifkan deteksi dev tools

    // --- Fungsi Utama untuk Memblokir Akses ---
    function blockAccess() {
        // Menggunakan replace agar halaman yang diblokir tidak tersimpan di riwayat browser.
        window.location.replace(REDIRECT_URL);
    }

    // --- 1. Perlindungan Konten Dasar ---
    // Mencegah menu konteks (klik kanan)
    document.addEventListener('contextmenu', e => e.preventDefault());

    // Mencegah shortcut keyboard untuk menyimpan dan mencetak
    document.addEventListener('keydown', e => {
        if (e.ctrlKey && ('sp'.indexOf(e.key) !== -1)) {
            e.preventDefault();
        }
    });

    // Menerapkan gaya untuk mencegah pemilihan teks dan drag gambar
    const style = document.createElement('style');
    style.textContent = `
        body {
            -webkit-user-select: none; /* Safari */
            -ms-user-select: none; /* IE 10+ */
            user-select: none; /* Standard syntax */
        }
        img, a {
            -webkit-user-drag: none;
            user-drag: none;
        }
    `;
    document.head.appendChild(style);


    // --- 2. Deteksi Bot dan Lingkungan Otomatis ---
    function detectBot() {
        // Cek properti 'webdriver' yang sering ada di browser otomatis
        if (navigator.webdriver) {
            return true;
        }

        // Cek user agent untuk kata kunci bot umum
        const userAgent = navigator.userAgent.toLowerCase();
        const forbiddenAgents = ['curl', 'wget', 'postman', 'python', 'bot', 'spider', 'headless'];
        if (forbiddenAgents.some(agent => userAgent.includes(agent))) {
            return true;
        }

        return false;
    }

    // --- 3. Deteksi Developer Tools (Lebih Agresif) ---
    function detectDevTools() {
        const threshold = 160; // Perbedaan ukuran yang dianggap sebagai pembukaan dev tools
        let devtoolsOpen = false;

        const check = () => {
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;

            if (widthThreshold || heightThreshold) {
                devtoolsOpen = true;
            }

            if (devtoolsOpen) {
                // Membuat debugger berjalan berulang kali untuk mengganggu
                // dan kemudian mengalihkan pengguna.
                try {
                    (function() {
                        return false;
                    }
                    ['constructor']('debugger')
                    ['call']());
                } catch (e) {
                    // Penanganan jika browser memblokir debugger
                }
                
                // Setelah beberapa saat, alihkan pengguna
                setTimeout(blockAccess, 500);
            }
        };

        // Memeriksa secara berkala
        setInterval(check, 1000);
    }

    // --- Eksekusi Modul Keamanan ---
    if (detectBot()) {
        blockAccess();
    }

    if (ENABLE_DEVTOOLS_DETECTION) {
        detectDevTools();
    }

})();
