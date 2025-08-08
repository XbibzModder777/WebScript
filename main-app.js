// Menjalankan kode setelah halaman dimuat
document.addEventListener('DOMContentLoaded', function () {

    // Konfigurasi Firebase (hanya untuk referensi, inisialisasi di HTML)
    const firebaseConfig = {
        apiKey: "AIzaSyAk-0bfLE8m00HMHGR4HFctW58KRWi_Psw",
        authDomain: "xbibz-tools.firebaseapp.com",
        databaseURL: "https://xbibz-tools-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "xbibz-tools",
        storageBucket: "xbibz-tools.appspot.com",
        messagingSenderId: "728866559765",
        appId: "1:728866559765:web:c44d19112638a86a377b1c"
    };

    // Inisialisasi Firebase jika belum ada
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const database = firebase.database();

    // Referensi Elemen
    const toolsListEl = document.getElementById('tools-list');
    const loadingIndicator = document.getElementById('loading-indicator');

    // Referensi ke node 'tools'
    const toolsRef = database.ref('tools/');

    // Mendengarkan perubahan data
    toolsRef.on('value', (snapshot) => {
        toolsListEl.innerHTML = ''; 
        loadingIndicator.style.display = 'none';

        const data = snapshot.val();

        if (data) {
            Object.values(data).forEach((tool, index) => {
                const card = document.createElement('div');
                card.className = 'tool-card bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg overflow-hidden backdrop-blur-sm';
                
                card.innerHTML = `
                    <div class="p-6">
                        <h3 class="text-2xl font-bold text-white mb-2">${tool.name}</h3>
                        <p class="text-gray-400 mb-6 h-16 text-ellipsis overflow-hidden">${tool.description}</p>
                        <a href="${tool.url}" target="_blank" rel="noopener noreferrer" class="inline-block w-full text-center bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transform hover:-translate-y-1">
                            <i class="fas fa-download mr-2"></i> Download
                        </a>
                    </div>
                `;
                toolsListEl.appendChild(card);

                // Memicu animasi masuk
                setTimeout(() => card.classList.add('visible'), index * 100);
            });
        } else {
            // Jika tidak ada tools
            toolsListEl.innerHTML = `
                <div class="col-span-full text-center py-16">
                    <i class="fas fa-box-open fa-4x text-gray-600 mb-4"></i>
                    <h3 class="text-2xl font-semibold text-gray-400">Belum Ada Tools</h3>
                    <p class="text-gray-500 mt-2">Silakan cek kembali nanti.</p>
                </div>
            `;
        }
    }, (error) => {
        console.error("Firebase read failed: ", error);
        loadingIndicator.style.display = 'none';
        toolsListEl.innerHTML = `
            <div class="col-span-full text-center py-16 bg-red-900/50 rounded-lg border border-red-700">
                <i class="fas fa-exclamation-triangle fa-3x text-red-400 mb-4"></i>
                <h3 class="text-2xl font-semibold text-red-300">Gagal Memuat Data</h3>
                <p class="text-red-400 mt-2">Tidak dapat terhubung ke database.</p>
            </div>
        `;
    });
});