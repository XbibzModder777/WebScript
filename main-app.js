document.addEventListener('DOMContentLoaded', function () {
    const firebaseConfig = {
        apiKey: "AIzaSyAk-0bfLE8m00HMHGR4HFctW58KRWi_Psw",
        authDomain: "xbibz-tools.firebaseapp.com",
        databaseURL: "https://xbibz-tools-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "xbibz-tools",
        storageBucket: "xbibz-tools.appspot.com",
        messagingSenderId: "728866559765",
        appId: "1:728866559765:web:c44d19112638a86a377b1c"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const database = firebase.database();

    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const icon = themeToggle.querySelector('i');
        if (document.body.classList.contains('light-mode')) {
            icon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'light');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'dark');
        }
    });

    // Check for saved theme preference
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
        themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
    }

    const toolsListEl = document.getElementById('tools-list');
    const loadingIndicator = document.getElementById('loading-indicator');
    const toolsRef = database.ref('tools/');

    toolsRef.on('value', (snapshot) => {
        toolsListEl.innerHTML = ''; 
        loadingIndicator.style.display = 'none';

        const data = snapshot.val();

        if (data) {
            Object.values(data).forEach((tool, index) => {
                const card = document.createElement('div');
                card.className = 'tool-card bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg overflow-hidden backdrop-blur-sm light-mode:bg-white/80 light-mode:border-gray-300';
                
                let imageHtml = '';
                if (tool.image) {
                    imageHtml = `<img src="${tool.image}" alt="${tool.name}" class="w-full h-48 object-cover">`;
                }

                card.innerHTML = `
                    ${imageHtml}
                    <div class="p-6">
                        <h3 class="text-2xl font-bold text-white mb-2 light-mode:text-gray-800">${tool.name}</h3>
                        <p class="text-gray-400 mb-6 tool-description light-mode:text-gray-600">${tool.description}</p>
                        <a href="${tool.url}" target="_blank" rel="noopener noreferrer" class="inline-block w-full text-center bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transform hover:-translate-y-1">
                            <i class="fas fa-download mr-2"></i> Download
                        </a>
                    </div>
                `;
                toolsListEl.appendChild(card);

                setTimeout(() => card.classList.add('visible'), index * 100);
            });
        } else {
            toolsListEl.innerHTML = `
                <div class="col-span-full text-center py-16">
                    <i class="fas fa-box-open fa-4x text-gray-600 mb-4"></i>
                    <h3 class="text-2xl font-semibold text-gray-400 light-mode:text-gray-600">Belum Ada Tools</h3>
                    <p class="text-gray-500 mt-2 light-mode:text-gray-500">Silakan cek kembali nanti.</p>
                </div>
            `;
        }
    }, (error) => {
        console.error("Firebase read failed: ", error);
        loadingIndicator.style.display = 'none';
        toolsListEl.innerHTML = `
            <div class="col-span-full text-center py-16 bg-red-900/50 rounded-lg border border-red-700 light-mode:bg-red-200/50 light-mode:border-red-300">
                <i class="fas fa-exclamation-triangle fa-3x text-red-400 mb-4"></i>
                <h3 class="text-2xl font-semibold text-red-300 light-mode:text-red-600">Gagal Memuat Data</h3>
                <p class="text-red-400 mt-2 light-mode:text-red-500">Tidak dapat terhubung ke database.</p>
            </div>
        `;
    });
});