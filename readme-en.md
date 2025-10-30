# Tawakkul - One Page a Day - Quran Reading App

🌐 **Live Demo**: [https://mlibre.github.io/Tawakkul/](https://mlibre.github.io/Tawakkul/)

## Overview

A serene web application for daily Quran reading. The app embraces the "one page a day" philosophy, guiding users through one page of the Quran each day with multiple Persian translations while tracking their spiritual journey.

## Key Features

- 📖 One page a day reading experience (authentic Mushaf pages)
- 🇮🇷 Persian translations (Makarem, Arberry)
- ✅ Manual read/unread marking for verses and pages
- 📊 Progress visualization (pages read out of 604)
- 💾 localStorage persistence (survives browser sessions)
- 🔄 Automatic last-page restoration
- ⚡ Fast, responsive design with glass-morphism
- 🌙 Calm, fantasy-themed gradient UI (blue → purple → pink)
- 📚 Integrated external resources (Tafsir, Khamenei insights, revelation context)
- 🌙 Dark/Light theme toggle
- 📱 Mobile-optimized interface

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/tawakkul.git
   cd tawakkul
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `docs/` directory, ready for deployment.

## Architecture

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom Persian fonts (Vazirmatn, Amiri)
- **State Management**: React hooks with localStorage persistence
- **Build Tool**: Vite
- **Deployment**: GitHub Pages (configured for `/Tawakkul/` base path)

## Project Structure

```
tawakkul/
├── components/          # React components
│   ├── Header.tsx      # App header with theme toggle
│   ├── VerseList.tsx   # Quran verses display
│   ├── Pagination.tsx  # Page navigation
│   ├── ProgressBar.tsx # Reading progress
│   └── SourcesModal.tsx # Sources information modal
├── hooks/              # Custom React hooks
│   ├── useLocalStorage.ts
│   └── useTheme.ts
├── services/           # Data services
│   └── quranService.ts # Quran data management
├── public/             # Static assets
│   ├── quran.json      # Quran data
│   └── sources.txt     # Source attributions
├── types.ts            # TypeScript type definitions
└── App.tsx             # Main application component
```

## Data Sources

The application uses various sources for Quran text and translations:

- **Quran Text**: Arabic text with enhanced styling
- **Persian Translations**: [Makarem Shirazi translation](https://quran.makarem.ir)
- **English Translation**: [A.J. Arberry translation](https://api.globalquran.com/complete/en.arberry.json)
- **External Resources**:
  - [Tafsir Nemooneh](https://quran.makarem.ir/fa/interpretation)
  - [Khamenei insights](https://farsi.khamenei.ir)
  - [Revelation context](https://wiki.ahlolbait.com)

## License

This project is open source and available under the MIT License.

## Contact

For questions or feedback, please contact: <m.gh@linuxmail.org>
