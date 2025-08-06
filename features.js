// Core Features for AI Content Generator

// Theme Management
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.setupTheme();
        this.setupToggle();
    }

    setupTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
    }

    setupToggle() {
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.addEventListener('click', () => this.toggle());
            this.updateToggleIcon();
        }
    }

    toggle() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        this.updateToggleIcon();
    }

    updateToggleIcon() {
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.innerHTML = this.currentTheme === 'light' ? 
                '<i class="bi bi-moon-fill"></i>' : 
                '<i class="bi bi-sun-fill"></i>';
        }
    }
}

// Analytics Management
class AnalyticsManager {
    constructor() {
        this.analytics = this.load();
    }

    load() {
        const saved = localStorage.getItem('analytics');
        return saved ? JSON.parse(saved) : {
            totalGenerations: 0,
            topicsUsed: {},
            templatesUsed: {},
            lastGenerated: null,
            averageGenerationTime: 0
        };
    }

    update(topic, generationTime = 0) {
        this.analytics.totalGenerations++;
        this.analytics.topicsUsed[topic] = (this.analytics.topicsUsed[topic] || 0) + 1;
        this.analytics.lastGenerated = new Date().toISOString();
        
        // Update average generation time
        const totalTime = this.analytics.averageGenerationTime * (this.analytics.totalGenerations - 1) + generationTime;
        this.analytics.averageGenerationTime = totalTime / this.analytics.totalGenerations;
        
        this.save();
        this.render();
    }

    save() {
        localStorage.setItem('analytics', JSON.stringify(this.analytics));
    }

    render() {
        const container = document.getElementById('analyticsStats');
        if (container) {
            container.innerHTML = `
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
                            <div class="stats-number">${this.getMostUsedTopic()}</div>
                            <div class="stats-label">Topik Favorit</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stats-card">
                            <div class="stats-number">${Math.round(this.analytics.averageGenerationTime / 1000)}s</div>
                            <div class="stats-label">Rata-rata Waktu</div>
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
}

// Template Management
class TemplateManager {
    constructor() {
        this.templates = this.load();
    }

    load() {
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

    render() {
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

    selectTemplate(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        if (template) {
            this.applyTemplate(template);
            showToast(`Template "${template.name}" diterapkan`, 'success');
        }
    }

    applyTemplate(template) {
        // Apply template content to current generation
        window.currentTemplate = template;
    }
}

// Content Management
class ContentManager {
    constructor() {
        this.savedContent = this.load();
    }

    load() {
        const saved = localStorage.getItem('savedContent');
        return saved ? JSON.parse(saved) : [];
    }

    save(content) {
        const contentItem = {
            id: Date.now(),
            title: content.title || `Konten ${content.topic} - ${new Date().toLocaleDateString('id-ID')}`,
            threads: content.threads,
            topic: content.topic,
            createdAt: new Date().toISOString()
        };
        
        this.savedContent.push(contentItem);
        localStorage.setItem('savedContent', JSON.stringify(this.savedContent));
        showToast('Konten berhasil disimpan', 'success');
    }

    render() {
        const container = document.getElementById('savedContent');
        if (container && this.savedContent.length > 0) {
            container.innerHTML = this.savedContent.map(content => `
                <div class="card mb-3">
                    <div class="card-body">
                        <h6 class="card-title">${content.title}</h6>
                        <p class="card-text">${content.threads[0]?.hook?.substring(0, 100) || 'Konten kosong'}...</p>
                        <small class="text-muted">Dibuat: ${new Date(content.createdAt).toLocaleString('id-ID')}</small>
                        <div class="mt-2">
                            <button class="btn btn-sm btn-outline-primary" onclick="contentManager.loadContent(${content.id})">Load</button>
                            <button class="btn btn-sm btn-outline-danger" onclick="contentManager.deleteContent(${content.id})">Hapus</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    loadContent(id) {
        const content = this.savedContent.find(c => c.id === id);
        if (content) {
            window.generatedThreads = content.threads;
            renderThreads(content.threads);
            showToast('Konten berhasil dimuat', 'success');
        }
    }

    deleteContent(id) {
        this.savedContent = this.savedContent.filter(c => c.id !== id);
        localStorage.setItem('savedContent', JSON.stringify(this.savedContent));
        this.render();
        showToast('Konten berhasil dihapus', 'success');
    }
}

// Scheduling Management
class SchedulingManager {
    constructor() {
        this.scheduledPosts = this.load();
        this.setupScheduler();
    }

    load() {
        const saved = localStorage.getItem('scheduledPosts');
        return saved ? JSON.parse(saved) : [];
    }

    schedule(post) {
        const scheduledPost = {
            ...post,
            id: Date.now(),
            scheduledAt: new Date().toISOString(),
            status: 'scheduled'
        };
        
        this.scheduledPosts.push(scheduledPost);
        localStorage.setItem('scheduledPosts', JSON.stringify(this.scheduledPosts));
        this.render();
        showToast('Post berhasil dijadwalkan', 'success');
    }

    render() {
        const container = document.getElementById('scheduledPosts');
        if (container && this.scheduledPosts.length > 0) {
            container.innerHTML = this.scheduledPosts.map(post => `
                <div class="card mb-3">
                    <div class="card-body">
                        <h6 class="card-title">${post.title}</h6>
                        <p class="card-text">${post.content.substring(0, 100)}...</p>
                        <small class="text-muted">Dijadwalkan: ${new Date(post.scheduledAt).toLocaleString('id-ID')}</small>
                        <div class="mt-2">
                            <button class="btn btn-sm btn-outline-primary" onclick="schedulingManager.editPost(${post.id})">Edit</button>
                            <button class="btn btn-sm btn-outline-danger" onclick="schedulingManager.deletePost(${post.id})">Hapus</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    deletePost(id) {
        this.scheduledPosts = this.scheduledPosts.filter(p => p.id !== id);
        localStorage.setItem('scheduledPosts', JSON.stringify(this.scheduledPosts));
        this.render();
        showToast('Post berhasil dihapus', 'success');
    }

    setupScheduler() {
        setInterval(() => {
            this.checkScheduledPosts();
        }, 60000); // Check every minute
    }

    checkScheduledPosts() {
        const now = new Date();
        this.scheduledPosts.forEach(post => {
            const scheduledTime = new Date(post.scheduledAt);
            if (scheduledTime <= now && post.status === 'scheduled') {
                this.executePost(post);
            }
        });
    }

    executePost(post) {
        console.log('Executing scheduled post:', post);
        post.status = 'executed';
        localStorage.setItem('scheduledPosts', JSON.stringify(this.scheduledPosts));
        this.render();
        showToast('Post terjadwal berhasil dieksekusi', 'success');
    }
}

// Utility Functions
function showToast(message, type = 'success') {
    const toastElement = document.getElementById('copyToast');
    if (toastElement) {
        const toastBody = toastElement.querySelector('.toast-body');
        toastBody.textContent = message;
        
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
    }
}

function showError(message) {
    const toastElement = document.getElementById('errorToast');
    if (toastElement) {
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = message;
        
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
    }
}

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showToast('Teks berhasil disalin');
        } else {
            showToast('Gagal menyalin teks', 'danger');
        }
    } catch (err) {
        showToast('Gagal menyalin teks', 'danger');
        console.error('Gagal menyalin: ', err);
    }
    
    document.body.removeChild(textarea);
}

// Initialize managers
let themeManager, analyticsManager, templateManager, contentManager, schedulingManager;

document.addEventListener('DOMContentLoaded', function() {
    themeManager = new ThemeManager();
    analyticsManager = new AnalyticsManager();
    templateManager = new TemplateManager();
    contentManager = new ContentManager();
    schedulingManager = new SchedulingManager();
    
    // Render initial data
    analyticsManager.render();
    templateManager.render();
    contentManager.render();
    schedulingManager.render();
}); 