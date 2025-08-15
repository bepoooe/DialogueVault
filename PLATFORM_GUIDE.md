# Platform Configuration Guide

## How the Universal Chatbot Navigator Works

This extension uses intelligent platform detection and adaptive selectors to work across ChatGPT, Claude, and Gemini with a universal sidebar index.

## Platform Detection

The extension automatically detects which chatbot platform you're using based on:
- **URL hostname matching** (e.g., chat.openai.com for ChatGPT)
- **Platform-specific optimizations** for each supported platform
- **Enhanced Gemini support** with improved selector detection

## Platform-Specific Configurations

### ChatGPT (OpenAI)
- **URLs**: `chat.openai.com`, `chatgpt.com`
- **Message Detection**: `[data-message-author-role]`, `.group\/conversation-turn`
- **Role Detection**: `data-message-author-role` attribute
- **Special Features**: Markdown rendering support

### Claude (Anthropic)
- **URLs**: `claude.ai`
- **Message Detection**: `[data-testid="message"]`, `[data-is-streaming]`
- **Role Detection**: Streaming indicators and border styling
- **Special Features**: Real-time streaming message detection

### Gemini (Google)
- **URLs**: `gemini.google.com`, `bard.google.com`
- **Message Detection**: `message-content`, `.conversation-turn`, `[jsname]`
- **Role Detection**: User vs model response wrapper detection
- **Text Extraction**: Enhanced selectors for `.text-container`, `[data-message-text="true"]`
- **Special Features**: Improved support for Gemini's dynamic UI structure

## Fallback Detection

For unknown platforms or if there are issues, the extension uses:

1. **Generic selectors**: Common patterns like `.message`, `[class*="chat"]`
2. **Content analysis**: Text length and structure heuristics
3. **Role inference**: Pattern matching and alternating message detection
4. **Adaptive parsing**: Multiple text extraction strategies

## Troubleshooting

### Messages Not Detected
- Check browser console for debug logs
- Verify you're on a supported platform (ChatGPT, Claude, or Gemini)
- Try refreshing the page after the extension loads
- Check that the conversation has loaded completely

### Gemini-Specific Troubleshooting
- The extension now includes enhanced selectors for Gemini's dynamic interface
- If messages aren't detected, try scrolling through the conversation to trigger updates
- The extension will use fallback detection for new Gemini UI changes

### Wrong Role Assignment
- Platform may have changed their DOM structure
- Check if role detection selectors need updating
- Fallback alternating pattern may be in use

### Performance Issues
- Large conversations may take time to parse
- Extension uses debounced updates to prevent excessive processing
- Consider closing and reopening very long conversations

## Contributing

To contribute new platform support:

1. Fork the repository
2. Add platform configuration in `src/content/platform-detector.ts`
3. Test with real conversations on the new platform
4. Submit a pull request with your changes

## Debug Mode

Enable debug logging by opening browser console and looking for:
- `[Universal Navigator]` messages for general operation
- Platform-specific detection and parsing information
- Error messages for troubleshooting issues
