# ChatGPT, Claude & Gemini Navigator - Chrome Extension

## Project Overview
React + TypeScript Chrome extension that provides intelligent navigation for long conversations across **ChatGPT, Claude, and Gemini** with a universal sidebar index.

## Supported Platforms
- **OpenAI ChatGPT** (chat.openai.com, chatgpt.com)
- **Anthropic Claude** (claude.ai)
- **Google Gemini/Bard** (gemini.google.com, bard.google.com)

## Key Components

### Platform Detection (`src/content/platform-detector.ts`)
- Automatic platform detection for ChatGPT, Claude, and Gemini
- Enhanced Gemini selectors with improved DOM parsing
- Platform-specific configurations optimized for each supported platform
- Fallback system for unknown platforms

### Universal Navigator (`src/content/navigator.ts`)
- Cross-platform message parsing for the three supported platforms
- Role detection (user vs assistant) with platform-specific optimizations
- Enhanced Gemini support with improved text extraction
- Real-time conversation monitoring

### Main Extension (`src/content/index.ts`)
- Platform-aware UI adaptation for ChatGPT, Claude, and Gemini
- Responsive sidebar interface
- Platform-specific assistant naming
- Universal keyboard shortcuts and accessibility

## Architecture
- **Manifest V3** Chrome extension
- **TypeScript** for type safety
- **Focused design** for ChatGPT, Claude, and Gemini optimization
- **Enhanced Gemini support** with improved selectors and fallback detection
- **Real-time updates** via mutation observers

## Setup Checklist

- [x] Verify copilot-instructions.md file created
- [x] Project Requirements: React + TypeScript Chrome extension for universal chatbot navigation
- [x] Scaffold the Project
- [x] Customize the Project for multi-platform support
- [x] Install Required Extensions: None required
- [x] Compile the Project
- [x] Create and Run Task
- [x] Launch the Project
- [x] Ensure Documentation is Complete

## Project Complete! 🎉

The Universal Chatbot Navigator is now fully set up and ready to work across multiple AI chatbot platforms.
