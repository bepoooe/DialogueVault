# DialogueVault Extension Installation Guide

## Loading the Extension in Chrome

1. **Build the Extension** (if not already done):
   ```bash
   npm run build
   ```

2. **Open Chrome Extensions Page**:
   - Open Chrome browser
   - Go to `chrome://extensions/`
   - Or: Menu → More Tools → Extensions

3. **Enable Developer Mode**:
   - Toggle "Developer mode" in the top-right corner

4. **Load the Extension**:
   - Click "Load unpacked"
   - Select the `dist` folder from your project directory
   - The extension should now appear in your extensions list

5. **Verify the Logo**:
   - The DialogueVault logo should appear in the Chrome toolbar
   - The logo should also be visible in the extensions management page

## Testing the Extension

1. **Visit a Supported Platform**:
   - ChatGPT: https://chat.openai.com or https://chatgpt.com
   - Claude: https://claude.ai
   - Gemini: https://gemini.google.com

2. **Start a Conversation**:
   - Begin chatting with the AI assistant
   - The DialogueVault sidebar should automatically appear on the right

3. **Test Features**:
   - **Toggle sidebar**: Press `Ctrl+Shift+I`
   - **Close sidebar**: Click the X button in the top-right corner of the sidebar
   - **Refresh conversation**: Press `Ctrl+Shift+R`
   - **Navigate**: Click on any conversation turn in the sidebar to scroll to it
   - **New Header Design**: The sidebar now features a prominent logo2 (51x51px with enhanced shadow) alongside the DialogueVault title with improved typography

## Troubleshooting

- **Logo not showing**: Make sure the `logo.png` file exists in the `dist` folder
- **Sidebar not appearing**: Check the browser console for any error messages
- **Extension not working**: Ensure you're on a supported platform and refresh the page

## Updating the Extension

After making changes:
1. Run `npm run build`
2. Go to `chrome://extensions/`
3. Click the refresh icon on the DialogueVault extension card
