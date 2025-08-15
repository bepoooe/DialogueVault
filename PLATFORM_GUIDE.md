# Platform Configuration Guide

## How the Universal Chatbot Navigator Works

This extension uses intelligent platform detection and adaptive selectors to work across multiple AI chatbot platforms. Here's how it identifies and works with each platform:

## Platform Detection

The extension automatically detects which chatbot platform you're using based on:
- **URL hostname matching** (e.g., chat.openai.com for ChatGPT)
- **DOM structure analysis** for unknown platforms
- **Fallback patterns** for new or updated platforms

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
- **Message Detection**: `[data-test-id*="conversation"]`, `.model-response-container`
- **Role Detection**: Test ID attributes for user/model responses
- **Special Features**: Model response containers

### DeepSeek
- **URLs**: `chat.deepseek.com`
- **Message Detection**: `.message-item`, `[data-role]`
- **Role Detection**: Direct role attributes
- **Special Features**: Simple message structure

### Poe
- **URLs**: `poe.com`
- **Message Detection**: `[class*="Message_messageRow"]`
- **Role Detection**: Human vs bot message bubble classes
- **Special Features**: CSS module-based styling

### You.com
- **URLs**: `you.com`
- **Message Detection**: `[data-testid*="message"]`
- **Role Detection**: User vs AI message test IDs
- **Special Features**: Markdown content support

### Character.AI
- **URLs**: `character.ai`, `beta.character.ai`
- **Message Detection**: `[data-testid="message"]`
- **Role Detection**: Author attributes (user vs character)
- **Special Features**: Character-based conversations

### Mistral
- **URLs**: `chat.mistral.ai`
- **Message Detection**: `.message`, `.chat-message`
- **Role Detection**: Role-based classes and attributes
- **Special Features**: Standard chat interface

### Hugging Face
- **URLs**: `huggingface.co/chat`
- **Message Detection**: `[data-testid="message"]`
- **Role Detection**: From-user vs from-assistant attributes
- **Special Features**: Prose content formatting

### LMSYS Chatbot Arena
- **URLs**: `chat.lmsys.org`
- **Message Detection**: `.message`, `[role="log"]`
- **Role Detection**: User vs bot class indicators
- **Special Features**: Arena-style interface

## Fallback Detection

For unknown or new platforms, the extension uses:

1. **Generic selectors**: Common patterns like `.message`, `[class*="chat"]`
2. **Content analysis**: Text length and structure heuristics
3. **Role inference**: Pattern matching and alternating message detection
4. **Adaptive parsing**: Multiple text extraction strategies

## Adding New Platforms

To add support for a new platform:

1. **Identify selectors**: Use browser dev tools to find message containers
2. **Analyze structure**: Determine how to distinguish user vs assistant messages
3. **Update configuration**: Add new platform config in `platform-detector.ts`
4. **Test thoroughly**: Verify message detection and navigation work correctly

## Troubleshooting

### Messages Not Detected
- Check browser console for debug logs
- Verify the platform is supported or uses common patterns
- Try refreshing the page after the extension loads

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
