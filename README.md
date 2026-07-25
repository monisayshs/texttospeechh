# TextToSpeechH AI — Free AI Voice Generator & Text to Speech Online

> **Official Website:** [https://texttospeechh.com](https://texttospeechh.com)  
> **Official Instagram:** [@webxpert.ai](https://www.instagram.com/webxpert.ai/)  
> **Contact:** [hello@texttospeechh.com](mailto:hello@texttospeechh.com) | Support: [support@texttospeechh.com](mailto:support@texttospeechh.com)

---

## 🎙️ About TextToSpeechH AI

**TextToSpeechH AI** is a free neural Text-to-Speech (TTS) SaaS application engineered for content creators, audiobook narrators, educators, and global businesses.

### ✨ Key Features

- ⚡ **10,000 Word Queue**: Paragraph & sentence boundary chunking with zero mid-sentence cuts.
- 📄 **PDF & DOCX Document Import**: Drag and drop PDF, Microsoft Word, or TXT files directly.
- 💾 **High Bitrate MP3 Export**: Instant download with clean semantic filenames.
- 🌐 **12+ Global Languages**: English (US & UK), Hindi, Urdu, Spanish, French, German, Japanese, Arabic, and more.
- 🛡️ **Zero Registration**: Instant browser access without subscription fees or forced logins.

---

## 🛠️ Local Development Setup

```bash
# Clone the repository
git clone https://github.com/monisayshs/texttospeechh.git
cd texttospeechh

# Install dependencies
npm install

# Start local dev server (Runs at http://localhost:3000)
npm run dev
```

---

## 🚀 Deploying to Vercel

1. **Push Repository to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: TextToSpeechH AI Production Build"
   git remote add origin https://github.com/monisayshs/texttospeechh.git
   git push -u origin main
   ```

2. **Import into Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/new) -> **Import Git Repository**.
   - Select **texttospeechh**.
   - **Framework Preset**: `Other`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `public`
   - Click **Deploy**.

3. **Custom Domain Setup**:
   - In Vercel Project Settings -> **Domains** -> Add `texttospeechh.com`.
