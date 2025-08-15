# DialogueVault - Prompt Navigator 

A React + TypeScript Chrome extension for navigating conversations in **ChatGPT, Claude, and Gemini**.

---

## Extension Preview

![DialogueVault Preview](public/Screenshot%202025-08-15%20184916.png)

---


## Supported Platforms

- **OpenAI ChatGPT** (chat.openai.com, chatgpt.com)
- **Anthropic Claude** (claude.ai)
- **Google Gemini/Bard** (gemini.google.com, bard.google.com)

## Features

- **Auto-detection** of chatbot platforms with adaptive UI
- **Live conversation index** that updates automatically
- **One-click navigation** to any prompt or response
- **Responsive design** with desktop sidebar and mobile overlay
- **Keyboard shortcuts** (`Ctrl+Shift+I` to toggle)
- **Modern interface** with smooth animations

## Installation

### Development Setup

1. **Clone and setup**:
   ```bash
   cd DialogueVault
   npm install
   npm run build
   ```

2. **Load in Chrome**:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

### Production Build

```bash
npm run build
```

This creates optimized files in the `dist` directory ready for Chrome Web Store submission.

## Development

### Available Scripts

- `npm run dev` - Development build with watch mode
- `npm run build` - Production build
- `npm run clean` - Clean dist folder

### Project Structure

```
Extension/
├── src/
│   ├── content/
│   │   ├── index.ts          # Main content script
│   │   └── navigator.ts      # ChatGPT DOM navigation logic
│   └── sidebar/
│       ├── index.tsx         # React entry point
│       ├── components/
│       │   └── Sidebar.tsx   # Main sidebar component
│       └── styles/
│           └── sidebar.css   # Component styles
├── public/
│   ├── manifest.json         # Chrome extension manifest
│   └── sidebar.html          # HTML template for React
├── dist/                     # Build output
├── webpack.config.js         # Webpack configuration
└── package.json
```

## How It Works

1. **Content Script Injection**: The extension injects a content script into ChatGPT pages
2. **DOM Analysis**: Uses MutationObserver to detect conversation changes
3. **React Sidebar**: Renders a React-based sidebar in an iframe for isolation
4. **Message Passing**: Uses postMessage for communication between content script and sidebar
5. **Smart Scrolling**: Automatically scrolls to selected conversation turns

## Browser Compatibility

- Chrome 88+ (Manifest V3 support)
- Edge 88+ (Chromium-based)
- Opera 74+ (Chromium-based)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes and test locally
4. Submit a pull request

## License

MIT License - feel free to use this project as a starting point for your own extensions!

---

**Built with React + TypeScript for the modern web**
