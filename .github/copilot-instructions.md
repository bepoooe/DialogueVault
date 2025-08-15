# Universal Chatbot Navigator - Multi-Platform Chrome Extension

## Project Overview
React + TypeScript Chrome extension that provides intelligent navigation for long conversations across **multiple AI chatbot platforms** with a universal sidebar index.

## Supported Platforms
- **OpenAI ChatGPT** (chat.openai.com, chatgpt.com)
- **Anthropic Claude** (claude.ai)
- **Google Gemini/Bard** (gemini.google.com, bard.google.com)
- **DeepSeek** (chat.deepseek.com)
- **Poe** (poe.com)
- **You.com** (you.com)
- **Character.AI** (character.ai)
- **Mistral** (chat.mistral.ai)
- **Hugging Face** (huggingface.co/chat)
- **LMSYS Chatbot Arena** (chat.lmsys.org)
- **Universal fallback** for new/unknown platforms

## Key Components

### Platform Detection (`src/content/platform-detector.ts`)
- Automatic platform detection based on hostname
- Platform-specific selectors and configurations
- Intelligent fallback for unknown platforms
- Extensible architecture for adding new platforms

### Universal Navigator (`src/content/navigator.ts`)
- Cross-platform message parsing
- Role detection (user vs assistant) across different platforms
- Adaptive text extraction strategies
- Real-time conversation monitoring

### Main Extension (`src/content/index.ts`)
- Platform-aware UI adaptation
- Responsive sidebar interface
- Platform-specific assistant naming
- Universal keyboard shortcuts and accessibility

## Architecture
- **Manifest V3** Chrome extension
- **TypeScript** for type safety
- **Modular design** for easy platform additions
- **Intelligent selectors** with graceful fallbacks
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
