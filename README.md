# TextToSpeechH AI — Free AI Voice Generator

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Status](https://img.shields.io/badge/production-live-brightgreen.svg)
![Platform](https://img.shields.io/badge/platform-Vercel%20Serverless-black.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![AI--Native](https://img.shields.io/badge/AI--Native-Project%20Intelligence%20v2.1-purple.svg)

> **TextToSpeechH AI** (`https://www.texttospeechh.com`) is an AI Voice Generator and Text-to-Speech SaaS application. Powered by a multi-provider failover load balancer (Kokoro, CosyVoice, Edge TTS) and built on a zero-dependency serverless architecture, it converts text, TXT, PDF, and DOCX files into MP3 voiceovers with low registration friction.

---

## 🤖 For AI Assistants & Agents

If you are an AI coding assistant (ChatGPT, Claude, Gemini, DeepSeek, Cursor, Windsurf, Aider, etc.), **STOP HERE** and read [AGENTS.md](AGENTS.md) first. It contains your mandatory startup flow, production safety rules, decision tree, and workflow sequence.

---

## 🏛️ System Architecture

TextToSpeechH AI uses a modular monolith design optimized for low-latency serverless execution on Vercel:

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│                    public/index.html + app.js                   │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP Request
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ROUTING LAYER                                │
│  Local: dev-server.js (Node.js HTTP)                            │
│  Prod:  api/index.js (Vercel Serverless) + vercel.json routes   │
├─────────┬──────────┬──────────┬──────────┬─────────────────────┤
│ /api/*  │ /sitemap │ /faq,    │ /text-to │ /*  (static)        │
│         │          │ /guide/* │ -speech, │                     │
│         │          │          │ /blog,   │                     │
│         │          │          │ /about.. │                     │
├─────────┼──────────┼──────────┼──────────┼─────────────────────┤
│ API     │ Sitemap  │ Content  │ SEO      │ Static File         │
│ Handlers│ Handler  │ Handler  │ Handler  │ Server (public/)    │
└────┬────┴──────────┴──────────┴──────────┴─────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                              │
│  ┌────────────┐ ┌──────────────┐ ┌─────────────┐               │
│  │ Queue      │ │ Script       │ │ File        │               │
│  │ Service    │ │ Engine       │ │ Parser      │               │
│  │ (jobs,     │ │ (chunk text  │ │ (PDF, DOCX, │               │
│  │  /tmp disk)│ │  at sentence │ │  TXT)       │               │
│  │            │ │  boundaries) │ │             │               │
│  └─────┬──────┘ └──────────────┘ └─────────────┘               │
│        │                                                        │
│        ▼                                                        │
│  ┌──────────────────────────────────────────────┐               │
│  │           LOAD BALANCER (Failover)           │               │
│  │  Kokoro → CosyVoice → Edge (always fallback) │               │
│  └─────┬────────────┬────────────┬──────────────┘               │
│        ▼            ▼            ▼                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                        │
│  │ Kokoro   │ │ CosyVoice│ │ Edge     │                        │
│  │ Provider │ │ Provider │ │ Provider │                        │
│  └──────────┘ └──────────┘ └──────────┘                        │
│        │            │            │                               │
│        └────────────┴────────────┘                               │
│                     │                                            │
│                     ▼                                            │
│  ┌──────────────────────────────────────────────┐               │
│  │         AUDIO PIPELINE (merge chunks)         │               │
│  └──────────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
                      MP3 Audio Response
```

---

## 📁 Repository Structure Map

```
texttospeechh/
├── AGENTS.md                    ← Universal AI Agent Entry Point & Safety Rules
├── README.md                    ← Human Overview & System Architecture (this file)
├── CONTEXT.md                   ← Business Identity, Mission, Vision & Strategy
├── SESSION.md                   ← Ephemeral AI Session Working Memory & State
├── PROJECT_STATE.md             ← Permanent Memory: Status, SEO, Debt, Roadmap
├── TASKS.md                     ← Task Backlog (TODO / IN PROGRESS / BLOCKED / DONE)
├── CHANGELOG.md                 ← Version & Release History (Keep a Changelog)
├── DECISIONS.md                 ← Architectural Decision Records (ADRs) & Lessons Learned
│
├── docs/                        ← Technical Documentation Hub
│   ├── architecture.md          ← Architecture & System Design
│   ├── seo-system.md            ← Hub-and-Spoke SEO System & IndexNow Guide
│   ├── api-reference.md         ← Serverless API Endpoint Documentation
│   └── deployment.md            ← Vercel Build & Failure Recovery Workflow
│
├── api/                         ← Vercel Serverless Function Bridge Handlers
│   ├── index.js                 ← Global Request Router & Error Handler
│   ├── generate.js              ← Voice Synthesis Route
│   ├── status.js                ← Async Job Status Route
│   ├── upload.js                ← Document File Upload Route
│   └── index-now.js             ← IndexNow Ping Bridge Route
│
├── src/                         ← Core Business & System Logic
│   ├── api/                     ← Source API Handlers (content, SEO, sitemaps)
│   ├── services/                ← Services (LoadBalancer, Queue, Security, Audio)
│   ├── providers/               ← TTS Providers (Kokoro, CosyVoice, Edge)
│   ├── seo/                     ← SEO Engine (Sitemaps, Schemas, Programmatic Pages)
│   ├── content/                 ← FAQ Engine & E-E-A-T Brand Guidelines
│   └── pages/                   ← HTML Page Renderers & Layout Components
│
├── public/                      ← Static Frontend & Public Webmaster Assets
│   ├── index.html               ← Core Single-Page Web App Interface
│   ├── app.js                   ← Client-side Voice Generator Logic
│   ├── style.css                ← CSS Design System
│   ├── robots.txt               ← Crawler Rules (GPTBot, ClaudeBot, Bingbot)
│   ├── llms.txt                 ← AI-readable Product Summary
│   └── sitemap.xml              ← Root Sitemap Index
│
├── scripts/                     ← Build & Maintenance Automation
│   └── notify-indexnow.js       ← Best-effort postbuild IndexNow notification
│
├── dev-server.js                ← Local Development Server (port 3000)
├── vercel.json                  ← Vercel v2 Route Configuration & Headers
└── package.json                 ← Dependency Manifest & Build Scripts
```

---

## ⚡ Quick Start & Development Setup

### Prerequisites
- Node.js 18.0.0 or higher
- npm 9.0.0 or higher

### Local Installation

```bash
# Clone the repository
git clone https://github.com/monisayshs/texttospeechh.git
cd texttospeechh

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🚀 Deployment

The project deploys to Vercel:

```bash
# Trigger local build verification
npm run build

# Postbuild IndexNow notification (optional manual trigger)
npm run indexnow
```

For deployment workflows, environment variable configurations, and failure recovery protocols, refer to [docs/deployment.md](docs/deployment.md).

---

## 🤝 Contributing Guidelines

We welcome contributions from humans and AI assistants:
1. Follow the **Project Philosophy** in [CONTEXT.md](CONTEXT.md).
2. Adhere to **Production Safety Rules** in [AGENTS.md](AGENTS.md).
3. Update relevant documentation in `docs/` and log changes in `CHANGELOG.md`.

---

## 📄 License

This repository is maintained by the TextToSpeechH AI team. All rights reserved.
