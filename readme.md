# Tawakkul - One Page a Day - Quran Reading App

## Overview

A web application for daily Quran reading. The app follows the "one page a day" concept, allowing users to read one page of the Quran each day with multiple Persian translations and track their progress.

## Key Features

- 📖 One page a day reading experience (accurate Mushaf pages)
- 🇮🇷 4 Persian translations (Makarem, Ansarian, Fooladvand, Mojtabavi)
- ✅ Manual read/unread marking
- 📊 Progress visualization (pages read out of 604)
- 💾 localStorage persistence (survives browser sessions)
- 🔄 Automatic last-page restoration
- ⚡ Fast, responsive design with glass-morphism
- 🌙 Calm, fantasy-themed gradient UI (blue → purple → pink)

## Configuration

### Workflow

- **Name**: App
- **Command**: `bash -c "node server/index.js & cd client && npm run dev"`
- **Ports**:
  - Frontend: 5000 (webview)
  - Backend API: 3000 (localhost only)

### API Endpoints

- `GET /api/quran` - Full Quran data with all translations
- `GET /api/page/:pageNumber` - Get verses for specific page (1-604)
- `GET /api/search?q=query` - Search verses (basic implementation)

## Pending Features

- 📚 Tafsir Nemooneh integration (from official website via src/utils/interpretations.js)
- 💡 Khamenei فیش integration (leadership insights)
- 📝 Shan-e Nozul (revelation context)
- 🔍 Advanced fuzzy search with Fuse.js
- 📱 PWA manifest and service worker
- 🔔 Daily reading reminders

## Notes

- UI features calm gradient background with fantasy theme
- Glass-morphism cards for modern, elegant look
- RTL support for Arabic and Persian text
- Accurate page mapping using quran-meta library
- Browser storage for offline-capable progress tracking
- Reuses original Quran data (sources/quran.json)
- Legacy Telegram bot utilities available for future interpretation features
