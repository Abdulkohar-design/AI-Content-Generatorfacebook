class AIContentGenerator {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.selectedTopic = 'umum';
        this.generatedThreads = [];
        this.templates = this.loadTemplates();
        this.analytics = this.loadAnalytics();
        this.scheduledPosts = this.loadScheduledPosts();
        
        this.init();
    }

    init() {
        this.setupTheme();
        this.setupEventListeners();
        this.loadSavedData();
        this.setupAnalytics();
        this.setupScheduler();
        this.renderDashboard();
    }

    // Theme Management
    setupTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateThemeToggle();
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        this.updateThemeToggle();
    }

    updateThemeToggle() {
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.innerHTML = this.currentTheme === 'light' ? 
                '<i class="bi bi-moon-fill"></i>' : 
                '<i class="bi bi-sun-fill"></i>';
        }
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // API Key management
        const saveApiKeyBtn = document.getElementById('saveApiKey');
        if (saveApiKeyBtn) {
            saveApiKeyBtn.addEventListener('click', () => this.saveApiKey());
        }

        // Topic selector
        document.querySelectorAll('.topic-badge').forEach(badge => {
            badge.addEventListener('click', (e) => {
                this.selectTopic(e.target.getAttribute('data-topic'));
            });
        });

        // Generate button
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateContent());
        }

        // Template selection
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('template-card')) {
                this.selectTemplate(e.target.dataset.templateId);
            }
        });

        // Navigation
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link')) {
                e.preventDefault();
                this.navigateTo(e.target.getAttribute('data-page'));
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'g':
                        e.preventDefault();
                        this.generateContent();
                        break;
                    case 'd':
                        e.preventDefault();
                        this.toggleTheme();
                        break;
                    case 's':
                        e.preventDefault();
                        this.saveCurrentContent();
                        break;
                }
            }
        });
    }

    // Topic Selection
    selectTopic(topic) {
        this.selectedTopic = topic;
        document.querySelectorAll('.topic-badge').forEach(b => b.classList.remove('active'));
        document.querySelector(`[data-topic="${topic}"]`).classList.add('active');
        
        // Update analytics
        this.analytics.topicsUsed[topic] = (this.analytics.topicsUsed[topic] || 0) + 1;
        this.saveAnalytics();
    }

    // API Management
    saveApiKey() {
        const apiKey = document.getElementById('apiKey').value;
        if (apiKey.trim() !== '') {
            localStorage.setItem('geminiApiKey', apiKey);
            this.updateApiStatus(true);
            this.showToast('API Key berhasil disimpan', 'success');
        } else {
            this.showToast('API Key tidak boleh kosong', 'warning');
        }
    }

    updateApiStatus(isConnected) {
        const statusIndicator = document.getElementById('apiStatus');
        const statusText = document.getElementById('apiStatusText');
        
        if (statusIndicator && statusText) {
            if (isConnected) {
                statusIndicator.className = 'status-indicator status-active';
                statusText.textContent = 'Status API: Terhubung';
            } else {
                statusIndicator.className = 'status-indicator status-inactive';
                statusText.textContent = 'Status API: Tidak terhubung';
            }
        }
    }

    // Content Generation
    async generateContent() {
        const apiKey = localStorage.getItem('geminiApiKey');
        if (!apiKey) {
            this.showError('Silakan masukkan API Key terlebih dahulu');
            return;
        }

        this.showLoading(true);
        
        try {
            const threads = await this.generateThreadsWithAPI(apiKey, this.selectedTopic);
            this.generatedThreads = threads;
            this.renderThreads(threads);
            this.updateAnalytics();
            this.showToast('Konten berhasil dihasilkan!', 'success');
        } catch (error) {
            console.error('Error:', error);
            this.showError(`Gagal menghasilkan konten: ${error.message}`);
            this.generateSampleThreads();
        } finally {
            this.showLoading(false);
        }
    }

    async generateThreadsWithAPI(apiKey, topic) {
        const topicPrompt = this.getTopicPrompt(topic);
        const prompt = this.buildPrompt(topicPrompt);
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const responseText = data.candidates[0].content.parts[0].text;
        
        let jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Format respons tidak valid');
        }
        
        return JSON.parse(jsonMatch[0]).threads;
    }

    getTopicPrompt(topic) {
        const prompts = {
            'chatgpt': 'tentang strategi penggunaan ChatGPT',
            'gambar': 'tentang AI untuk pembuatan gambar seperti Midjourney, DALL-E, atau Stable Diffusion',
            'video': 'tentang AI untuk pembuatan dan editing video',
            'bisnis': 'tentang penerapan AI untuk bisnis dan produktivitas',
            'pendidikan': 'tentang pemanfaatan AI untuk pendidikan dan pembelajaran',
            'umum': 'tentang berbagai aspek AI secara umum'
        };
        return prompts[topic] || prompts['umum'];
    }

    buildPrompt(topicPrompt) {
        return `Buat 3 thread unik berupa teks saja (tanpa em-dash maupun emoji) ${topicPrompt} yang praktis dan bisa langsung dipakai.
        
        Format setiap thread:
        1. Diawali dengan kalimat hook yang menarik
        2. Berisi 5-10 tips, tutorial, atau cara praktis
        3. Setiap tips diawali dengan bullet point (•)
        
        Format respons JSON:
        {
            "threads": [
                {
                    "hook": "Kalimat hook yang menarik",
                    "prompts": ["Tips 1", "Tips 2", ...]
                },
                ...
            ]
        }
        
        Pastikan respons dalam format JSON yang valid.`;
    }

    // Template Management
    loadTemplates() {
        const saved = localStorage.getItem('templates');
        return saved ? JSON.parse(saved) : this.getDefaultTemplates();
    }

    getDefaultTemplates() {
        return [
            {
                id: 'facebook-business',
                name: 'Facebook Business',
                description: 'Template untuk konten bisnis di Facebook',
                platform: 'facebook',
                category: 'business',
                content: {
                    hook: 'Pemilik bisnis UKM wajib coba!',
                    prompts: ['Tips 1', 'Tips 2', 'Tips 3'],
                    cta: 'Langsung klik: https://lynk.id/vdmax'
                }
            },
            {
                id: 'instagram-education',
                name: 'Instagram Education',
                description: 'Template untuk konten edukasi di Instagram',
                platform: 'instagram',
                category: 'education',
                content: {
                    hook: 'Mahasiswa dan pelajar, manfaatkan AI untuk belajar!',
                    prompts: ['Cara 1', 'Cara 2', 'Cara 3'],
                    cta: 'Belajar lebih lanjut: https://lynk.id/vdmax'
                }
            },
            {
                id: 'twitter-tech',
                name: 'Twitter Tech',
                description: 'Template untuk konten teknologi di Twitter',
                platform: 'twitter',
                category: 'technology',
                content: {
                    hook: 'Tech enthusiasts, ini 10 tool AI yang wajib dicoba!',
                    prompts: ['Tool 1', 'Tool 2', 'Tool 3'],
                    cta: 'Update tech news: https://lynk.id/vdmax'
                }
            }
        ];
    }

    selectTemplate(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        if (template) {
            this.applyTemplate(template);
            this.showToast(`Template "${template.name}" diterapkan`, 'success');
        }
    }

    applyTemplate(template) {
        // Apply template content to current generation
        this.currentTemplate = template;
        // This would be implemented based on your UI structure
    }

    // Analytics
    loadAnalytics() {
        const saved = localStorage.getItem('analytics');
        return saved ? JSON.parse(saved) : {
            totalGenerations: 0,
            topicsUsed: {},
            templatesUsed: {},
            lastGenerated: null,
            averageGenerationTime: 0
        };
    }

    updateAnalytics() {
        this.analytics.totalGenerations++;
        this.analytics.topicsUsed[this.selectedTopic] = (this.analytics.topicsUsed[this.selectedTopic] || 0) + 1;
        this.analytics.lastGenerated = new Date().toISOString();
        this.saveAnalytics();
        this.renderAnalytics();
    }

    saveAnalytics() {
        localStorage.setItem('analytics', JSON.stringify(this.analytics));
    }

    renderAnalytics() {
        const statsContainer = document.getElementById('analyticsStats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="row">
                    <div class="col-md-3">
                        <div class="stats-card">
                            <div class="stats-number">${this.analytics.totalGenerations}</div>
                            <div class="stats-label">Total Generasi</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stats-card">
                            <div class="stats-number">${Object.keys(this.analytics.topicsUsed).length}</div>
                            <div class="stats-label">Topik Digunakan</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stats-card">
                            <div class="stats-number">${this.analytics.templatesUsed ? Object.keys(this.analytics.templatesUsed).length : 0}</div>
                            <div class="stats-label">Template Digunakan</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stats-card">
                            <div class="stats-number">${this.getMostUsedTopic()}</div>
                            <div class="stats-label">Topik Favorit</div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    getMostUsedTopic() {
        const topics = this.analytics.topicsUsed;
        if (Object.keys(topics).length === 0) return 'N/A';
        
        const maxTopic = Object.entries(topics).reduce((a, b) => topics[a] > topics[b] ? a : b);
        return maxTopic;
    }

    // Scheduling
    loadScheduledPosts() {
        const saved = localStorage.getItem('scheduledPosts');
        return saved ? JSON.parse(saved) : [];
    }

    schedulePost(post) {
        this.scheduledPosts.push({
            ...post,
            id: Date.now(),
            scheduledAt: new Date().toISOString(),
            status: 'scheduled'
        });
        localStorage.setItem('scheduledPosts', JSON.stringify(this.scheduledPosts));
        this.renderScheduledPosts();
    }

    renderScheduledPosts() {
        const container = document.getElementById('scheduledPosts');
        if (container && this.scheduledPosts.length > 0) {
            container.innerHTML = this.scheduledPosts.map(post => `
                <div class="card mb-3">
                    <div class="card-body">
                        <h6 class="card-title">${post.title}</h6>
                        <p class="card-text">${post.content.substring(0, 100)}...</p>
                        <small class="text-muted">Dijadwalkan: ${new Date(post.scheduledAt).toLocaleString('id-ID')}</small>
                        <div class="mt-2">
                            <button class="btn btn-sm btn-outline-primary" onclick="app.editScheduledPost(${post.id})">Edit</button>
                            <button class="btn btn-sm btn-outline-danger" onclick="app.deleteScheduledPost(${post.id})">Hapus</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    // Content Management
    saveCurrentContent() {
        if (this.generatedThreads.length > 0) {
            const content = {
                id: Date.now(),
                title: `Konten ${this.selectedTopic} - ${new Date().toLocaleDateString('id-ID')}`,
                threads: this.generatedThreads,
                topic: this.selectedTopic,
                createdAt: new Date().toISOString()
            };
            
            const savedContent = this.loadSavedContent();
            savedContent.push(content);
            localStorage.setItem('savedContent', JSON.stringify(savedContent));
            
            this.showToast('Konten berhasil disimpan', 'success');
        }
    }

    loadSavedContent() {
        const saved = localStorage.getItem('savedContent');
        return saved ? JSON.parse(saved) : [];
    }

    // UI Helpers
    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        const generateBtn = document.getElementById('generateBtn');
        
        if (spinner) {
            spinner.classList.toggle('active', show);
        }
        
        if (generateBtn) {
            generateBtn.disabled = show;
        }
    }

    showToast(message, type = 'success') {
        const toastElement = document.getElementById('copyToast');
        if (toastElement) {
            const toastBody = toastElement.querySelector('.toast-body');
            toastBody.textContent = message;
            
            const toast = new bootstrap.Toast(toastElement);
            toast.show();
        }
    }

    showError(message) {
        const toastElement = document.getElementById('errorToast');
        if (toastElement) {
            const errorMessage = document.getElementById('errorMessage');
            errorMessage.textContent = message;
            
            const toast = new bootstrap.Toast(toastElement);
            toast.show();
        }
    }

    // Copy to Clipboard
    copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                this.showToast('Teks berhasil disalin');
            } else {
                this.showToast('Gagal menyalin teks', 'danger');
            }
        } catch (err) {
            this.showToast('Gagal menyalin teks', 'danger');
            console.error('Gagal menyalin: ', err);
        }
        
        document.body.removeChild(textarea);
    }

    // Thread Rendering
    renderThreads(threads) {
        const container = document.getElementById('threadsContainer');
        if (container) {
            container.innerHTML = '';
            threads.forEach((thread, index) => {
                const threadElement = this.createThreadElement(thread, index);
                container.appendChild(threadElement);
            });
        }
    }

    createThreadElement(threadData, index) {
        const threadCard = document.createElement('div');
        threadCard.className = 'thread-card fade-in';
        
        threadCard.innerHTML = `
            <div class="thread-header">
                <span>Thread ${index + 1}</span>
                <div>
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="app.copyThread(${index})">
                        <i class="bi bi-clipboard"></i> Salin Semua
                    </button>
                    <button class="btn btn-sm btn-outline-success" onclick="app.scheduleThread(${index})">
                        <i class="bi bi-calendar-plus"></i> Jadwalkan
                    </button>
                </div>
            </div>
            <div class="thread-meta">
                <span class="badge badge-primary">${this.selectedTopic}</span>
                <span class="text-muted ms-2">${new Date().toLocaleString('id-ID')}</span>
            </div>
            <div class="prompt-item">
                <span>${threadData.hook}</span>
                <button class="copy-btn" onclick="app.copyToClipboard('${threadData.hook.replace(/'/g, "\\'")}')">
                    <i class="bi bi-clipboard"></i>
                </button>
            </div>
            ${threadData.prompts.map(prompt => `
                <div class="prompt-item">
                    <span>• ${prompt}</span>
                    <button class="copy-btn" onclick="app.copyToClipboard('• ${prompt.replace(/'/g, "\\'")}')">
                        <i class="bi bi-clipboard"></i>
                    </button>
                </div>
            `).join('')}
            <div class="cta-section">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        PS: Saya juga buka kelas AI untuk kamu yang benar-benar awam!<br>
                        Keunggulannya: setiap hari ada postingan tutorial terbaru, update terus.<br>
                        Belajar bisa kapan saja mulai jam 08.00 sampai 00.00 WIB.<br>
                        Bebas belajar sampai bisa, sistem bayar per 10 hari.<br>
                        Dan yang paling penting, harganya terjangkau dan disesuaikan.<br>
                        Langsung klik: https://lynk.id/vdmax
                    </div>
                    <button class="btn btn-sm btn-outline-primary" onclick="app.copyToClipboard('PS: Saya juga buka kelas AI untuk kamu yang benar-benar awam!\\nKeunggulannya: setiap hari ada postingan tutorial terbaru, update terus.\\nBelajar bisa kapan saja mulai jam 08.00 sampai 00.00 WIB.\\nBebas belajar sampai bisa, sistem bayar per 10 hari.\\nDan yang paling penting, harganya terjangkau dan disesuaikan.\\nLangsung klik: https://lynk.id/vdmax')">
                        <i class="bi bi-clipboard me-1"></i> Salin CTA
                    </button>
                </div>
            </div>
        `;
        
        return threadCard;
    }

    // Navigation
    navigateTo(page) {
        // Hide all sections
        document.querySelectorAll('.page-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Show selected section
        const targetSection = document.getElementById(page);
        if (targetSection) {
            targetSection.style.display = 'block';
        }
        
        // Update active nav
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');
    }

    // Dashboard
    renderDashboard() {
        this.renderAnalytics();
        this.renderTemplates();
        this.renderScheduledPosts();
        this.updateLastGenerated();
    }

    renderTemplates() {
        const container = document.getElementById('templateGallery');
        if (container) {
            container.innerHTML = this.templates.map(template => `
                <div class="template-card" data-template-id="${template.id}">
                    <div class="template-preview">
                        <i class="bi bi-file-earmark-text" style="font-size: 3rem;"></i>
                    </div>
                    <div class="template-info">
                        <div class="template-title">${template.name}</div>
                        <div class="template-desc">${template.description}</div>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge badge-primary">${template.platform}</span>
                            <span class="badge badge-success">${template.category}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    updateLastGenerated() {
        const element = document.getElementById('lastGenerated');
        if (element && this.analytics.lastGenerated) {
            element.textContent = new Date(this.analytics.lastGenerated).toLocaleString('id-ID');
        }
    }

    // Load saved data
    loadSavedData() {
        const savedApiKey = localStorage.getItem('geminiApiKey');
        if (savedApiKey) {
            document.getElementById('apiKey').value = savedApiKey;
            this.updateApiStatus(true);
        } else {
            this.updateApiStatus(false);
        }
    }

    // Setup scheduler
    setupScheduler() {
        // Check every minute for scheduled posts
        setInterval(() => {
            this.checkScheduledPosts();
        }, 60000);
    }

    checkScheduledPosts() {
        const now = new Date();
        this.scheduledPosts.forEach(post => {
            const scheduledTime = new Date(post.scheduledAt);
            if (scheduledTime <= now && post.status === 'scheduled') {
                this.executeScheduledPost(post);
            }
        });
    }

    executeScheduledPost(post) {
        // In a real implementation, this would post to social media
        console.log('Executing scheduled post:', post);
        post.status = 'executed';
        localStorage.setItem('scheduledPosts', JSON.stringify(this.scheduledPosts));
        this.renderScheduledPosts();
    }

    // Additional methods for thread management
    copyThread(index) {
        const thread = this.generatedThreads[index];
        const fullText = `${thread.hook}\n\n${thread.prompts.map(p => `• ${p}`).join('\n')}\n\nPS: Saya juga buka kelas AI untuk kamu yang benar-benar awam!\nKeunggulannya: setiap hari ada postingan tutorial terbaru, update terus.\nBelajar bisa kapan saja mulai jam 08.00 sampai 00.00 WIB.\nBebas belajar sampai bisa, sistem bayar per 10 hari.\nDan yang paling penting, harganya terjangkau dan disesuaikan.\nLangsung klik: https://lynk.id/vdmax`;
        this.copyToClipboard(fullText);
    }

    scheduleThread(index) {
        const thread = this.generatedThreads[index];
        const post = {
            title: `Thread ${index + 1} - ${this.selectedTopic}`,
            content: thread.hook + '\n\n' + thread.prompts.map(p => `• ${p}`).join('\n'),
            platform: 'facebook',
            scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
        };
        this.schedulePost(post);
    }

    // Sample threads for fallback
    generateSampleThreads() {
        const sampleThreads = this.getSampleThreads(this.selectedTopic);
        this.generatedThreads = sampleThreads;
        this.renderThreads(sampleThreads);
        this.updateAnalytics();
    }

    getSampleThreads(topic) {
        // This would contain the sample threads from your original code
        // For brevity, I'll include a simplified version
        return [
            {
                hook: "Pengen mulai pakai AI tapi bingung dari mana? Ini 10 langkah mudah untuk pemula di dunia AI.",
                prompts: [
                    "Pelajari konsep dasar AI seperti machine learning dan neural networks",
                    "Coba tool AI populer seperti ChatGPT untuk merasakan langsung kemampuannya",
                    "Ikuti komunitas AI di media sosial untuk update tren dan tutorial",
                    "Baca artikel atau nonton video pengantar AI dari sumber terpercaya",
                    "Coba fitur AI di aplikasi yang sudah kamu gunakan sehari-hari"
                ]
            }
        ];
    }
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', function() {
    app = new AIContentGenerator();
}); 
