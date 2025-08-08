// Menjalankan kode setelah semua elemen halaman dimuat
document.addEventListener('DOMContentLoaded', function () {
    // Inisialisasi Firebase sudah dilakukan di <head> control.html, jadi kita bisa langsung pakai
    const auth = firebase.auth();
    const database = firebase.database();
    const toolsRef = database.ref('tools');

    // --- Event Listener untuk Tombol Logout ---
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', () => {
        auth.signOut(); // Ini akan memicu onAuthStateChanged dan redirect ke login.html
    });

    // --- Referensi Elemen DOM ---
    const form = {
        formEl: document.getElementById('tool-form'),
        title: document.getElementById('form-title'),
        idInput: document.getElementById('tool-id'),
        nameInput: document.getElementById('tool-name'),
        descInput: document.getElementById('tool-desc'),
        urlInput: document.getElementById('tool-url'),
        submitBtn: document.getElementById('submit-btn'),
        cancelBtn: document.getElementById('cancel-edit-btn')
    };
    const listEl = document.getElementById('admin-tools-list');
    const loadingIndicator = document.getElementById('admin-loading-indicator');
    const modal = {
        el: document.getElementById('delete-modal'),
        nameSpan: document.getElementById('tool-name-to-delete'),
        cancelBtn: document.getElementById('cancel-delete-btn'),
        confirmBtn: document.getElementById('confirm-delete-btn')
    };
    const toast = document.getElementById('toast-notification');

    // --- Logika Notifikasi Toast ---
    function showToast(message, type = 'success') {
        toast.textContent = message;
        toast.className = `toast show ${type}`;
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // --- Logika Form (Create & Update) ---
    function resetForm() {
        form.formEl.reset();
        form.idInput.value = '';
        form.title.textContent = 'Tambah Tool Baru';
        form.submitBtn.innerHTML = '<i class="fas fa-plus-circle mr-2"></i> Tambah Tool';
        form.cancelBtn.classList.add('hidden');
    }

    form.formEl.addEventListener('submit', (e) => {
        e.preventDefault();
        const toolData = {
            name: form.nameInput.value,
            description: form.descInput.value,
            url: form.urlInput.value,
        };
        const toolId = form.idInput.value;

        if (toolId) { // Mode Update
            database.ref(`tools/${toolId}`).update(toolData)
                .then(() => {
                    resetForm();
                    showToast('Tool berhasil diperbarui!');
                })
                .catch(err => showToast(`Update gagal: ${err.message}`, 'error'));
        } else { // Mode Create
            toolsRef.push(toolData)
                .then(() => {
                    form.formEl.reset();
                    showToast('Tool baru berhasil ditambahkan!');
                })
                .catch(err => showToast(`Gagal menambahkan: ${err.message}`, 'error'));
        }
    });

    form.cancelBtn.addEventListener('click', resetForm);

    // --- Logika Menampilkan Data (Read) ---
    toolsRef.on('value', (snapshot) => {
        listEl.innerHTML = '';
        loadingIndicator.style.display = 'none';
        const data = snapshot.val();

        if (data) {
            Object.entries(data).forEach(([key, tool]) => {
                const item = document.createElement('div');
                item.className = 'bg-gray-800 p-4 rounded-lg flex items-center justify-between shadow transition-all hover:bg-gray-700/50';
                item.innerHTML = `
                    <div class="flex-grow mr-4 overflow-hidden">
                        <p class="font-bold text-lg truncate">${tool.name}</p>
                        <a href="${tool.url}" target="_blank" class="text-xs text-indigo-400 hover:underline break-all">${tool.url}</a>
                    </div>
                    <div class="flex-shrink-0 flex space-x-2">
                        <button data-key="${key}" class="edit-btn p-2 text-blue-400 hover:text-blue-300 transition-colors"><i class="fas fa-edit fa-fw"></i></button>
                        <button data-key="${key}" data-name="${tool.name}" class="delete-btn p-2 text-red-400 hover:text-red-300 transition-colors"><i class="fas fa-trash fa-fw"></i></button>
                    </div>
                `;
                listEl.appendChild(item);
            });
        } else {
            listEl.innerHTML = '<p class="text-center text-gray-500">Belum ada tool yang ditambahkan.</p>';
        }
    });

    // --- Event Delegation untuk Tombol Edit & Delete ---
    listEl.addEventListener('click', (e) => {
        const target = e.target;
        const editBtn = target.closest('.edit-btn');
        const deleteBtn = target.closest('.delete-btn');

        if (editBtn) {
            const key = editBtn.dataset.key;
            database.ref(`tools/${key}`).once('value', (snapshot) => {
                const tool = snapshot.val();
                form.idInput.value = key;
                form.nameInput.value = tool.name;
                form.descInput.value = tool.description;
                form.urlInput.value = tool.url;
                form.title.textContent = 'Edit Tool';
                form.submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i> Simpan Perubahan';
                form.cancelBtn.classList.remove('hidden');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        if (deleteBtn) {
            modal.nameSpan.textContent = deleteBtn.dataset.name;
            modal.confirmBtn.dataset.key = deleteBtn.dataset.key;
            modal.el.classList.remove('hidden');
        }
    });

    // --- Logika Modal Konfirmasi Hapus ---
    modal.cancelBtn.addEventListener('click', () => modal.el.classList.add('hidden'));
    modal.confirmBtn.addEventListener('click', (e) => {
        const key = e.currentTarget.dataset.key;
        database.ref(`tools/${key}`).remove()
            .then(() => {
                showToast('Tool berhasil dihapus.');
                modal.el.classList.add('hidden');
            })
            .catch(err => showToast(`Gagal menghapus: ${err.message}`, 'error'));
    });
});
