// Advanced Features for AI Content Generator

// Voice-to-Text Manager
class VoiceToTextManager {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.supportedLanguages = {
            'id': 'Indonesian',
            'en': 'English',
            'ja': 'Japanese',
            'ko': 'Korean',
            'zh': 'Chinese',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German'
        };
        this.init();
    }

    init() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.setupRecognition();
        } else {
            console.warn('Speech recognition not supported');
        }
    }

    setupRecognition() {
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'id-ID';

        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateUI();
        };

        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            this.updateTranscript(finalTranscript, interimTranscript);
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.stopListening();
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.updateUI();
        };
    }

    startListening() {
        if (this.recognition) {
            this.recognition.start();
        } else {
            showToast('Voice recognition tidak didukung di browser ini', 'error');
        }
    }

    stopListening() {
        if (this.recognition) {
            this.recognition.stop();
        }
    }

    updateTranscript(final, interim) {
        const transcriptElement = document.getElementById('voiceTranscript');
        if (transcriptElement) {
            transcriptElement.value = final + interim;
        }
    }

    updateUI() {
        const button = document.getElementById('voiceButton');
        const status = document.getElementById('voiceStatus');
        
        if (button) {
            button.innerHTML = this.isListening ? 
                '<i class="bi bi-mic-mute-fill"></i> Stop Recording' : 
                '<i class="bi bi-mic-fill"></i> Start Recording';
            button.className = this.isListening ? 'btn btn-danger' : 'btn btn-primary';
        }
        
        if (status) {
            status.textContent = this.isListening ? 'Recording...' : 'Ready';
            status.className = this.isListening ? 'text-danger' : 'text-success';
        }
    }

    setLanguage(lang) {
        if (this.recognition) {
            this.recognition.lang = lang;
        }
    }

    getSupportedLanguages() {
        return this.supportedLanguages;
    }
}

// AI Image Generation Manager
class AIImageManager {
    constructor() {
        this.providers = {
            'dalle': {
                name: 'DALL-E',
                endpoint: 'https://api.openai.com/v1/images/generations',
                maxTokens: 1000
            },
            'midjourney': {
                name: 'Midjourney',
                endpoint: 'https://api.midjourney.com/v1/imagine',
                maxTokens: 1000
            },
            'stable-diffusion': {
                name: 'Stable Diffusion',
                endpoint: 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
                maxTokens: 1000
            }
        };
    }

    async generateImage(prompt, provider = 'dalle', style = 'realistic') {
        try {
            const apiKey = this.getApiKey(provider);
            if (!apiKey) {
                throw new Error(`API Key untuk ${provider} tidak ditemukan`);
            }

            const enhancedPrompt = this.enhancePrompt(prompt, style);
            const response = await this.callImageAPI(provider, enhancedPrompt, apiKey);
            
            return response;
        } catch (error) {
            console.error('Error generating image:', error);
            showToast(`Gagal generate image: ${error.message}`, 'error');
            return null;
        }
    }

    enhancePrompt(prompt, style) {
        const styleEnhancers = {
            'realistic': 'photorealistic, high quality, detailed',
            'artistic': 'artistic style, creative, vibrant colors',
            'minimalist': 'minimalist design, clean, simple',
            'vintage': 'vintage style, retro, classic',
            'futuristic': 'futuristic, sci-fi, modern technology'
        };

        const enhancer = styleEnhancers[style] || styleEnhancers['realistic'];
        return `${prompt}, ${enhancer}`;
    }

    async callImageAPI(provider, prompt, apiKey) {
        const providerConfig = this.providers[provider];
        
        const requestBody = {
            prompt: prompt,
            n: 1,
            size: '1024x1024'
        };

        const response = await fetch(providerConfig.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.data[0].url;
    }

    getApiKey(provider) {
        return localStorage.getItem(`${provider}ApiKey`);
    }

    setApiKey(provider, key) {
        localStorage.setItem(`${provider}ApiKey`, key);
    }

    getProviders() {
        return this.providers;
    }

    // Generate thumbnail for content
    async generateThumbnail(content, style = 'realistic') {
        const prompt = this.createThumbnailPrompt(content);
        return await this.generateImage(prompt, 'dalle', style);
    }

    createThumbnailPrompt(content) {
        const hook = content.threads[0]?.hook || '';
        const topic = content.topic || 'AI';
        
        return `Create a professional thumbnail for a social media post about ${topic}. The post is about: ${hook.substring(0, 100)}. Include modern design elements, gradient background, and professional typography.`;
    }
}

// Multi-Language Support Manager
class LanguageManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'id';
        this.translations = {
            'id': {
                'dashboard': 'Dashboard',
                'generator': 'Generator',
                'templates': 'Template',
                'saved': 'Tersimpan',
                'scheduled': 'Terjadwal',
                'analytics': 'Analitik',
                'generate_content': 'Generate Konten',
                'save_content': 'Simpan Konten',
                'export_content': 'Export Konten',
                'share_content': 'Bagikan Konten',
                'dark_mode': 'Mode Gelap',
                'light_mode': 'Mode Terang',
                'loading': 'Memuat...',
                'success': 'Berhasil',
                'error': 'Error',
                'warning': 'Peringatan',
                'info': 'Informasi'
            },
            'en': {
                'dashboard': 'Dashboard',
                'generator': 'Generator',
                'templates': 'Templates',
                'saved': 'Saved',
                'scheduled': 'Scheduled',
                'analytics': 'Analytics',
                'generate_content': 'Generate Content',
                'save_content': 'Save Content',
                'export_content': 'Export Content',
                'share_content': 'Share Content',
                'dark_mode': 'Dark Mode',
                'light_mode': 'Light Mode',
                'loading': 'Loading...',
                'success': 'Success',
                'error': 'Error',
                'warning': 'Warning',
                'info': 'Info'
            },
            'ja': {
                'dashboard': 'ダッシュボード',
                'generator': 'ジェネレーター',
                'templates': 'テンプレート',
                'saved': '保存済み',
                'scheduled': 'スケジュール済み',
                'analytics': '分析',
                'generate_content': 'コンテンツ生成',
                'save_content': 'コンテンツ保存',
                'export_content': 'コンテンツエクスポート',
                'share_content': 'コンテンツ共有',
                'dark_mode': 'ダークモード',
                'light_mode': 'ライトモード',
                'loading': '読み込み中...',
                'success': '成功',
                'error': 'エラー',
                'warning': '警告',
                'info': '情報'
            }
        };
        this.init();
    }

    init() {
        this.updateLanguage(this.currentLanguage);
        this.setupLanguageSelector();
    }

    updateLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('language', lang);
        
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.translations[lang]?.[key] || key;
            element.textContent = translation;
        });

        // Update document title
        document.title = this.translations[lang]?.['ai_content_generator'] || 'AI Content Generator';
    }

    setupLanguageSelector() {
        const selector = document.getElementById('languageSelector');
        if (selector) {
            selector.value = this.currentLanguage;
            selector.addEventListener('change', (e) => {
                this.updateLanguage(e.target.value);
            });
        }
    }

    translate(key) {
        return this.translations[this.currentLanguage]?.[key] || key;
    }

    getSupportedLanguages() {
        return Object.keys(this.translations);
    }
}

// Keyboard Shortcuts Manager
class KeyboardShortcutsManager {
    constructor() {
        this.shortcuts = {
            'ctrl+g': () => this.generateContent(),
            'ctrl+d': () => this.toggleDarkMode(),
            'ctrl+s': () => this.saveContent(),
            'ctrl+e': () => this.exportContent(),
            'ctrl+shift+s': () => this.shareContent(),
            'ctrl+shift+v': () => this.startVoiceRecording(),
            'escape': () => this.closeModals()
        };
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
    }

    handleKeyPress(e) {
        const key = this.getKeyCombination(e);
        const action = this.shortcuts[key];
        
        if (action) {
            e.preventDefault();
            action();
        }
    }

    getKeyCombination(e) {
        const modifiers = [];
        if (e.ctrlKey || e.metaKey) modifiers.push('ctrl');
        if (e.shiftKey) modifiers.push('shift');
        if (e.altKey) modifiers.push('alt');
        
        const key = e.key.toLowerCase();
        return [...modifiers, key].join('+');
    }

    generateContent() {
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn && !generateBtn.disabled) {
            generateBtn.click();
        }
    }

    toggleDarkMode() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.click();
        }
    }

    saveContent() {
        if (window.generatedThreads && window.generatedThreads.length > 0) {
            contentManager.save({
                threads: window.generatedThreads,
                topic: window.selectedTopic || 'umum'
            });
        }
    }

    exportContent() {
        exportContent('pdf');
    }

    shareContent() {
        shareToSocialMedia('facebook');
    }

    startVoiceRecording() {
        if (window.voiceManager) {
            if (window.voiceManager.isListening) {
                window.voiceManager.stopListening();
            } else {
                window.voiceManager.startListening();
            }
        }
    }

    closeModals() {
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            const modalInstance = bootstrap.Modal.getInstance(modal);
            if (modalInstance) {
                modalInstance.hide();
            }
        });
    }
}

// Progressive Web App Features
class PWAManager {
    constructor() {
        this.init();
    }

    init() {
        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupOfflineSupport();
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered');
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    setupInstallPrompt() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Show install button
            const installBtn = document.getElementById('installApp');
            if (installBtn) {
                installBtn.style.display = 'block';
                installBtn.addEventListener('click', () => {
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then((choiceResult) => {
                        if (choiceResult.outcome === 'accepted') {
                            console.log('User accepted the install prompt');
                        }
                        deferredPrompt = null;
                        installBtn.style.display = 'none';
                    });
                });
            }
        });
    }

    setupOfflineSupport() {
        // Cache important resources
        if ('caches' in window) {
            caches.open('ai-content-cache-v1').then(cache => {
                cache.addAll([
                    '/',
                    '/index.html',
                    '/styles.css',
                    '/features.js',
                    '/export.js',
                    '/advanced-features.js'
                ]);
            });
        }
    }
}

// Initialize all advanced features
let voiceManager, imageManager, languageManager, shortcutsManager, pwaManager;

document.addEventListener('DOMContentLoaded', function() {
    voiceManager = new VoiceToTextManager();
    imageManager = new AIImageManager();
    languageManager = new LanguageManager();
    shortcutsManager = new KeyboardShortcutsManager();
    pwaManager = new PWAManager();

    // Make managers globally available
    window.voiceManager = voiceManager;
    window.imageManager = imageManager;
    window.languageManager = languageManager;
});

// Global functions for easy access
function startVoiceRecording() {
    if (voiceManager) {
        voiceManager.startListening();
    }
}

function stopVoiceRecording() {
    if (voiceManager) {
        voiceManager.stopListening();
    }
}

function generateImage(prompt, provider = 'dalle', style = 'realistic') {
    if (imageManager) {
        return imageManager.generateImage(prompt, provider, style);
    }
}

function changeLanguage(lang) {
    if (languageManager) {
        languageManager.updateLanguage(lang);
    }
}

function generateThumbnail(content) {
    if (imageManager) {
        return imageManager.generateThumbnail(content);
    }
} 