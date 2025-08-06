# AI Content Generator

Aplikasi web canggih untuk menghasilkan konten AI-powered dengan fitur lengkap untuk social media.

## 🚀 Fitur Utama

### 🎨 **Dark Mode & Modern UI**
- Toggle dark/light mode dengan animasi smooth
- UI modern dengan Bootstrap 5.3
- Responsive design untuk semua device

### 🤖 **AI Content Generation**
- Integrasi dengan Google Gemini 2.5 Flash API
- Support untuk OpenAI dan Claude (coming soon)
- Generate konten untuk berbagai platform social media

### 📊 **Analytics Dashboard**
- Tracking total generations
- Statistik topik favorit
- Average generation time
- Visualisasi data dengan Chart.js

### 📝 **Template System**
- Pre-built templates untuk berbagai kategori
- Custom template creation
- Template gallery dengan preview

### 💾 **Content Management**
- Save dan load generated content
- Organize content dengan tags
- Search dan filter content

### ⏰ **Scheduling & Automation**
- Schedule posts untuk masa depan
- Background sync untuk offline execution
- Auto-posting ke social media

### 📤 **Export & Share**
- Export ke PDF, Word, HTML, TXT
- Share langsung ke Facebook, Twitter, LinkedIn
- Copy untuk Instagram dengan formatting

### 🎤 **Advanced Features**
- Voice-to-text input
- AI image generation (DALL-E, Midjourney, Stable Diffusion)
- Multi-language support
- Keyboard shortcuts

### 📱 **Progressive Web App (PWA)**
- Install sebagai app di device
- Offline support
- Push notifications
- Background sync

## 🛠️ Teknologi

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **UI Framework**: Bootstrap 5.3, Bootstrap Icons
- **AI APIs**: Google Gemini, OpenAI, Claude
- **Charts**: Chart.js
- **Export**: jsPDF, docx.js
- **PWA**: Service Worker, Web App Manifest

## 📦 Instalasi

### Prerequisites
- Node.js (v14+)
- npm atau yarn
- Git

### Setup
```bash
# Clone repository
git clone https://github.com/yourusername/ai-content-generator.git
cd ai-content-generator

# Install dependencies
npm install

# Run development server
npm start

# Build for production
npm run build
```

## 🔧 Konfigurasi

### API Keys
1. Dapatkan API key dari [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Masukkan API key di aplikasi
3. Untuk fitur tambahan, setup API keys untuk OpenAI dan Claude

### Environment Variables
```env
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
CLAUDE_API_KEY=your_claude_api_key
```

## 🚀 Deployment

### GitHub Pages
```bash
npm run deploy
```

### Manual Deployment
1. Build project: `npm run build`
2. Upload file dari folder `dist/` ke hosting
3. Setup custom domain (optional)

## 📱 PWA Features

### Install as App
- Chrome/Edge: Klik icon install di address bar
- Mobile: Add to home screen dari browser menu

### Offline Support
- Cache semua assets penting
- Background sync untuk scheduled posts
- Offline content generation (basic)

## 🎯 Usage

### Generate Content
1. Pilih topik atau kategori
2. Masukkan prompt atau gunakan template
3. Klik "Generate Content"
4. Edit dan customize hasil
5. Save atau export

### Schedule Posts
1. Generate content
2. Klik "Schedule Post"
3. Pilih tanggal dan waktu
4. Pilih platform social media
5. Konfirmasi scheduling

### Export Content
1. Generate atau load content
2. Pilih format export (PDF, Word, HTML, TXT)
3. Download file

### Voice Input
1. Klik icon microphone
2. Bicara untuk input
3. Text akan muncul otomatis
4. Edit jika diperlukan

## 🔑 Keyboard Shortcuts

- `Ctrl + Enter`: Generate content
- `Ctrl + S`: Save content
- `Ctrl + E`: Export content
- `Ctrl + D`: Toggle dark mode
- `Ctrl + M`: Voice recording
- `Ctrl + Shift + S`: Share to social media

## 📊 Analytics

Dashboard analytics menampilkan:
- Total generations
- Top topics used
- Average generation time
- Platform usage statistics
- User engagement metrics

## 🎨 Customization

### Themes
- Light mode (default)
- Dark mode
- Custom color schemes (coming soon)

### Templates
- Create custom templates
- Share templates dengan komunitas
- Import/export template collections

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Support

- **Email**: support@aicontentgenerator.com
- **Issues**: [GitHub Issues](https://github.com/yourusername/ai-content-generator/issues)
- **Documentation**: [Wiki](https://github.com/yourusername/ai-content-generator/wiki)

## 🗺️ Roadmap

### v2.1.0 (Coming Soon)
- [ ] Multi-language support (ID, EN, ES, FR, DE)
- [ ] Advanced AI models integration
- [ ] Team collaboration features
- [ ] Advanced analytics dashboard

### v2.2.0 (Planned)
- [ ] Mobile app (React Native)
- [ ] Desktop app (Electron)
- [ ] API for third-party integrations
- [ ] Advanced scheduling features

## 🙏 Acknowledgments

- [Google Gemini](https://ai.google.dev/) untuk AI API
- [Bootstrap](https://getbootstrap.com/) untuk UI framework
- [Chart.js](https://www.chartjs.org/) untuk visualisasi data
- [jsPDF](https://github.com/parallax/jsPDF) untuk PDF export

---

**Made with ❤️ for content creators everywhere** 