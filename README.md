# WayGPT React - ChatGPT Smart Index (Chrome Extension)

A modern React + TypeScript Chrome extension that provides intelligent navigation for long ChatGPT conversations with a sidebar index.

## Features

### 🚀 Built with Modern Technologies
- **React 18** with TypeScript for type safety
- **Webpack 5** for efficient bundling
- **Chrome Extension Manifest V3** for latest Chrome compatibility

### 📱 Responsive Design
- **Desktop**: Docked right sidebar with collapse/expand functionality
- **Mobile/Tablet**: Full-screen overlay with floating launcher
- **Auto-detection** of device type for optimal UX

### 🧭 Smart Navigation
- **Live conversation index** that updates automatically
- **Click to jump** to any prompt or response instantly
- **Visual highlighting** of selected turns
- **Compact previews** for quick scanning

### ⌨️ Accessibility
- **Keyboard shortcuts**: `Ctrl+Shift+I` to toggle sidebar
- **Screen reader friendly** with proper ARIA labels
- **Tab navigation** support
- **Focus management** for better UX

### 🎨 Polished Interface
- **Dark theme** that matches ChatGPT's aesthetic
- **Smooth animations** and transitions
- **Green accent colors** for brand consistency
- **Mobile-optimized** touch interactions

## Installation

### Development Setup

1. **Clone and setup**:
   ```bash
   cd Extension
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

- ✅ Chrome 88+ (Manifest V3 support)
- ✅ Edge 88+ (Chromium-based)
- ✅ Opera 74+ (Chromium-based)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes and test locally
4. Submit a pull request

## License

MIT License - feel free to use this project as a starting point for your own extensions!

---

**Built with ❤️ using React + TypeScript for the modern web**
