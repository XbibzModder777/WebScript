document.addEventListener('DOMContentLoaded', function () {
    const auth = firebase.auth();
    const database = firebase.database();
    const toolsRef = database.ref('tools');

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

    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', () => {
        auth.signOut();
    });

    const form = {
        formEl: document.getElementById('tool-form'),
        title: document.getElementById('form-title'),
        idInput: document.getElementById('tool-id'),
        nameInput: document.getElementById('tool-name'),
        descInput: document.getElementById('tool-desc'),
        urlInput: document.getElementById('tool-url'),
        imageInput: document.getElementById('tool-image'),
        imagePreview: document.getElementById('image-preview'),
        imagePreviewContainer: document.getElementById('image-preview-container'),
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

    function showToast(message, type = 'success') {
        toast.textContent = message;
        toast.className = `toast show ${type}`;
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    function resetForm() {
        form.formEl.reset();
        form.idInput.value = '';
        form.title.textContent = 'Tambah Tool Baru';
        form.submitBtn.innerHTML = '<i class="fas fa-plus-circle mr-2"></i> Tambah Tool';
        form.cancelBtn.classList.add('hidden');
        form.imagePreviewContainer.classList.add('hidden');
    }

    // Image preview handler
    form.imageInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            if (file.size > 100 * 1024 * 1024) { // 100MB limit
                showToast('Ukuran gambar terlalu besar (max 100MB)', 'error');
                this.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                form.imagePreview.src = e.target.result;
                form.imagePreviewContainer.classList.remove('hidden');
            }
            reader.readAsDataURL(file);
        }
    });

    form.formEl.addEventListener('submit', (e) => {
        e.preventDefault();
        const toolData = {
            name: form.nameInput.value,
            description: form.descInput.value,
            url: form.urlInput.value,
        };
        const toolId = form.idInput.value;

        // Handle image upload if exists
        const file = form.imageInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                toolData.image = e.target.result;
                saveToolData(toolId, toolData);
            };
            reader.onerror = function() {
                showToast('Gagal membaca gambar', 'error');
            };
            reader.readAsDataURL(file);
        } else {
            saveToolData(toolId, toolData);
        }
    });

    function saveToolData(toolId, toolData) {
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
                    resetForm();
                    showToast('Tool baru berhasil ditambahkan!');
                })
                .catch(err => showToast(`Gagal menambahkan: ${err.message}`, 'error'));
        }
    }

    form.cancelBtn.addEventListener('click', resetForm);

    toolsRef.on('value', (snapshot) => {
        listEl.innerHTML = '';
        loadingIndicator.style.display = 'none';
        const data = snapshot.val();

        if (data) {
            Object.entries(data).forEach(([key, tool]) => {
                const item = document.createElement('div');
                item.className = 'bg-gray-800 p-4 rounded-lg flex items-center justify-between shadow transition-all hover:bg-gray-700/50 light-mode:bg-white light-mode:hover:bg-gray-100';
                
                let imagePreview = '';
                if (tool.image) {
                    imagePreview = `<img src="${tool.image}" alt="${tool.name}" class="w-16 h-16 object-cover rounded mr-4">`;
                }

                item.innerHTML = `
                    <div class="flex items-center flex-grow mr-4 overflow-hidden">
                        ${imagePreview}
                        <div class="overflow-hidden">
                            <p class="font-bold text-lg truncate light-mode:text-gray-800">${tool.name}</p>
                            <a href="${tool.url}" target="_blank" class="text-xs text-indigo-400 hover:underline break-all">${tool.url}</a>
                        </div>
                    </div>
                    <div class="flex-shrink-0 flex space-x-2">
                        <button data-key="${key}" class="edit-btn p-2 text-blue-400 hover:text-blue-300 transition-colors"><i class="fas fa-edit fa-fw"></i></button>
                        <button data-key="${key}" data-name="${tool.name}" class="delete-btn p-2 text-red-400 hover:text-red-300 transition-colors"><i class="fas fa-trash fa-fw"></i></button>
                    </div>
                `;
                listEl.appendChild(item);
            });
        } else {
            listEl.innerHTML = '<p class="text-center text-gray-500 light-mode:text-gray-600">Belum ada tool yang ditambahkan.</p>';
        }
    });

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
                
                if (tool.image) {
                    form.imagePreview.src = tool.image;
                    form.imagePreviewContainer.classList.remove('hidden');
                } else {
                    form.imagePreviewContainer.classList.add('hidden');
                }
                
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        if (deleteBtn) {
            modal.nameSpan.textContent = deleteBtn.dataset.name;
            modal.confirmBtn.dataset.key = deleteBtn.dataset.key;
            modal.el.classList.remove('hidden');
        }
    });

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