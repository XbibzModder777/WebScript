(function() {
    'use strict';

    // --- Fungsi untuk Redirect ---
    // Menggunakan replace() agar halaman yang diblokir tidak tersimpan di riwayat browser.
    function blockAccess() {
        window.location.replace('404.html');
    }

    // --- 1. Pencegahan Klik Kanan ---
    // Mencegah menu konteks (klik kanan) muncul di seluruh halaman.
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    }, false);


    // --- 2. Pencegahan Bot Sederhana (Client-Side) ---
    // Mendeteksi user-agent yang umum digunakan oleh bot atau command-line tools.
    // PENTING: Ini adalah lapisan keamanan dasar dan bisa dilewati oleh bot canggih.
    const userAgent = navigator.userAgent.toLowerCase();
    const forbiddenAgents = [
        'curl',      // Command-line tool untuk transfer data
        'wget',      // Command-line tool untuk download
        'postman',   // API testing tool
        'python-requests', // Library Python
        'bot',       // Kata kunci umum untuk bot
        'spider',    // Kata kunci umum untuk web crawler
        'headless'   // Browser yang berjalan tanpa UI, sering dipakai untuk scraping
    ];

    // Cek jika userAgent mengandung salah satu dari string yang dilarang
    const isForbidden = forbiddenAgents.some(agent => userAgent.includes(agent));

    if (isForbidden) {
        // Jika terdeteksi sebagai bot, langsung alihkan ke halaman 404.
        blockAccess();
    }

})();