// Export functionality for AI Content Generator

class ExportManager {
    constructor() {
        this.supportedFormats = ['pdf', 'word', 'html', 'txt'];
    }

    // Export to PDF
    async exportToPDF(content, filename = 'ai-content') {
        try {
            const { jsPDF } = await import('https://cdn.skypack.dev/jspdf');
            const doc = new jsPDF();
            
            // Add title
            doc.setFontSize(20);
            doc.text('AI Generated Content', 20, 20);
            
            // Add content
            doc.setFontSize(12);
            let yPosition = 40;
            
            content.threads.forEach((thread, index) => {
                // Thread title
                doc.setFontSize(14);
                doc.text(`Thread ${index + 1}`, 20, yPosition);
                yPosition += 10;
                
                // Hook
                doc.setFontSize(12);
                const hookLines = doc.splitTextToSize(thread.hook, 170);
                doc.text(hookLines, 20, yPosition);
                yPosition += hookLines.length * 7;
                
                // Prompts
                thread.prompts.forEach(prompt => {
                    const promptLines = doc.splitTextToSize(`• ${prompt}`, 170);
                    doc.text(promptLines, 20, yPosition);
                    yPosition += promptLines.length * 7;
                });
                
                yPosition += 10;
                
                // Add new page if needed
                if (yPosition > 250) {
                    doc.addPage();
                    yPosition = 20;
                }
            });
            
            // Save PDF
            doc.save(`${filename}.pdf`);
            showToast('PDF berhasil di-export', 'success');
            
        } catch (error) {
            console.error('Error exporting to PDF:', error);
            showToast('Gagal export PDF', 'error');
        }
    }

    // Export to Word (DOCX)
    async exportToWord(content, filename = 'ai-content') {
        try {
            const { Document, Packer, Paragraph, TextRun } = await import('https://cdn.skypack.dev/docx');
            
            const doc = new Document({
                sections: [{
                    properties: {},
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: 'AI Generated Content',
                                    bold: true,
                                    size: 32
                                })
                            ],
                            spacing: { after: 400 }
                        }),
                        ...content.threads.map((thread, index) => [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: `Thread ${index + 1}`,
                                        bold: true,
                                        size: 24
                                    })
                                ],
                                spacing: { after: 200 }
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: thread.hook,
                                        size: 20
                                    })
                                ],
                                spacing: { after: 200 }
                            }),
                            ...thread.prompts.map(prompt => 
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: `• ${prompt}`,
                                            size: 18
                                        })
                                    ],
                                    spacing: { after: 100 }
                                })
                            )
                        ]).flat()
                    ]
                }]
            });
            
            const blob = await Packer.toBlob(doc);
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `${filename}.docx`;
            link.click();
            
            URL.revokeObjectURL(url);
            showToast('Word document berhasil di-export', 'success');
            
        } catch (error) {
            console.error('Error exporting to Word:', error);
            showToast('Gagal export Word document', 'error');
        }
    }

    // Export to HTML
    exportToHTML(content, filename = 'ai-content') {
        try {
            const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Generated Content</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        h1 {
            color: #6a11cb;
            text-align: center;
            margin-bottom: 30px;
        }
        .thread {
            margin-bottom: 30px;
            padding: 20px;
            border-left: 4px solid #6a11cb;
            background: #f8f9fa;
            border-radius: 8px;
        }
        .thread-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #343a40;
            margin-bottom: 15px;
        }
        .hook {
            font-size: 1.1rem;
            color: #495057;
            margin-bottom: 15px;
            font-style: italic;
        }
        .prompt {
            margin-bottom: 8px;
            color: #6c757d;
        }
        .cta {
            background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>AI Generated Content</h1>
        ${content.threads.map((thread, index) => `
            <div class="thread">
                <div class="thread-title">Thread ${index + 1}</div>
                <div class="hook">${thread.hook}</div>
                ${thread.prompts.map(prompt => `
                    <div class="prompt">• ${prompt}</div>
                `).join('')}
                <div class="cta">
                    PS: Saya juga buka kelas AI untuk kamu yang benar-benar awam!<br>
                    Keunggulannya: setiap hari ada postingan tutorial terbaru, update terus.<br>
                    Belajar bisa kapan saja mulai jam 08.00 sampai 00.00 WIB.<br>
                    Bebas belajar sampai bisa, sistem bayar per 10 hari.<br>
                    Dan yang paling penting, harganya terjangkau dan disesuaikan.<br>
                    Langsung klik: https://lynk.id/vdmax
                </div>
            </div>
        `).join('')}
    </div>
</body>
</html>`;

            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `${filename}.html`;
            link.click();
            
            URL.revokeObjectURL(url);
            showToast('HTML file berhasil di-export', 'success');
            
        } catch (error) {
            console.error('Error exporting to HTML:', error);
            showToast('Gagal export HTML file', 'error');
        }
    }

    // Export to TXT
    exportToTXT(content, filename = 'ai-content') {
        try {
            let txtContent = 'AI Generated Content\n';
            txtContent += '='.repeat(50) + '\n\n';
            
            content.threads.forEach((thread, index) => {
                txtContent += `Thread ${index + 1}\n`;
                txtContent += '-'.repeat(30) + '\n';
                txtContent += `${thread.hook}\n\n`;
                
                thread.prompts.forEach(prompt => {
                    txtContent += `• ${prompt}\n`;
                });
                
                txtContent += '\nPS: Saya juga buka kelas AI untuk kamu yang benar-benar awam!\n';
                txtContent += 'Keunggulannya: setiap hari ada postingan tutorial terbaru, update terus.\n';
                txtContent += 'Belajar bisa kapan saja mulai jam 08.00 sampai 00.00 WIB.\n';
                txtContent += 'Bebas belajar sampai bisa, sistem bayar per 10 hari.\n';
                txtContent += 'Dan yang paling penting, harganya terjangkau dan disesuaikan.\n';
                txtContent += 'Langsung klik: https://lynk.id/vdmax\n\n';
                txtContent += '='.repeat(50) + '\n\n';
            });
            
            const blob = new Blob([txtContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `${filename}.txt`;
            link.click();
            
            URL.revokeObjectURL(url);
            showToast('Text file berhasil di-export', 'success');
            
        } catch (error) {
            console.error('Error exporting to TXT:', error);
            showToast('Gagal export text file', 'error');
        }
    }

    // Main export function
    async exportContent(content, format = 'pdf', filename = 'ai-content') {
        switch (format.toLowerCase()) {
            case 'pdf':
                await this.exportToPDF(content, filename);
                break;
            case 'word':
            case 'docx':
                await this.exportToWord(content, filename);
                break;
            case 'html':
                this.exportToHTML(content, filename);
                break;
            case 'txt':
            case 'text':
                this.exportToTXT(content, filename);
                break;
            default:
                showToast('Format tidak didukung', 'error');
        }
    }

    // Get supported formats
    getSupportedFormats() {
        return this.supportedFormats;
    }
}

// Social Media Integration
class SocialMediaManager {
    constructor() {
        this.platforms = {
            facebook: {
                name: 'Facebook',
                maxLength: 63206,
                url: 'https://www.facebook.com/sharer/sharer.php'
            },
            twitter: {
                name: 'Twitter',
                maxLength: 280,
                url: 'https://twitter.com/intent/tweet'
            },
            linkedin: {
                name: 'LinkedIn',
                maxLength: 3000,
                url: 'https://www.linkedin.com/sharing/share-offsite'
            },
            instagram: {
                name: 'Instagram',
                maxLength: 2200,
                url: 'https://www.instagram.com'
            }
        };
    }

    // Share to social media
    shareToSocialMedia(content, platform) {
        const platformConfig = this.platforms[platform];
        if (!platformConfig) {
            showToast('Platform tidak didukung', 'error');
            return;
        }

        // Truncate content if needed
        let shareContent = content;
        if (content.length > platformConfig.maxLength) {
            shareContent = content.substring(0, platformConfig.maxLength - 3) + '...';
        }

        // Create share URL
        const shareUrl = this.createShareUrl(platform, shareContent);
        
        // Open in new window
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }

    // Create share URL for different platforms
    createShareUrl(platform, content) {
        const encodedContent = encodeURIComponent(content);
        
        switch (platform) {
            case 'facebook':
                return `${this.platforms.facebook.url}?u=${encodeURIComponent(window.location.href)}&quote=${encodedContent}`;
            
            case 'twitter':
                return `${this.platforms.twitter.url}?text=${encodedContent}`;
            
            case 'linkedin':
                return `${this.platforms.linkedin.url}?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent('AI Generated Content')}&summary=${encodedContent}`;
            
            default:
                return '#';
        }
    }

    // Copy to clipboard for Instagram (since it doesn't support direct sharing)
    copyForInstagram(content) {
        const instagramContent = this.formatForInstagram(content);
        copyToClipboard(instagramContent);
        showToast('Konten disalin untuk Instagram', 'success');
    }

    // Format content for Instagram
    formatForInstagram(content) {
        // Add hashtags and emojis for Instagram
        const hashtags = '\n\n#AI #ArtificialIntelligence #TechTips #DigitalMarketing #ContentCreator #Innovation #Technology #Future #Learning #Growth';
        return content + hashtags;
    }

    // Get platform info
    getPlatformInfo(platform) {
        return this.platforms[platform] || null;
    }

    // Get all platforms
    getAllPlatforms() {
        return Object.keys(this.platforms);
    }
}

// Initialize export and social media managers
let exportManager, socialMediaManager;

document.addEventListener('DOMContentLoaded', function() {
    exportManager = new ExportManager();
    socialMediaManager = new SocialMediaManager();
});

// Global functions for easy access
function exportContent(format = 'pdf') {
    if (window.generatedThreads && window.generatedThreads.length > 0) {
        const content = {
            threads: window.generatedThreads,
            topic: window.selectedTopic || 'umum',
            generatedAt: new Date().toISOString()
        };
        
        const filename = `ai-content-${new Date().toISOString().split('T')[0]}`;
        exportManager.exportContent(content, format, filename);
    } else {
        showToast('Tidak ada konten untuk di-export', 'warning');
    }
}

function shareToSocialMedia(platform) {
    if (window.generatedThreads && window.generatedThreads.length > 0) {
        const content = window.generatedThreads[0].hook + '\n\n' + 
                       window.generatedThreads[0].prompts.map(p => `• ${p}`).join('\n');
        
        if (platform === 'instagram') {
            socialMediaManager.copyForInstagram(content);
        } else {
            socialMediaManager.shareToSocialMedia(content, platform);
        }
    } else {
        showToast('Tidak ada konten untuk di-share', 'warning');
    }
} 