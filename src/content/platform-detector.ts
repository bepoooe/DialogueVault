export type ChatbotPlatform = 'chatgpt' | 'claude' | 'gemini' | 'unknown';

export interface PlatformConfig {
  name: string;
  platform: ChatbotPlatform;
  messageSelectors: string[];
  userIndicators: string[];
  assistantIndicators: string[];
  textSelectors: string[];
  containerSelector?: string;
}

export class PlatformDetector {
  private static configs: Record<ChatbotPlatform, PlatformConfig> = {
    chatgpt: {
      name: 'ChatGPT',
      platform: 'chatgpt',
      messageSelectors: [
        '[data-message-author-role]',
        '[data-message-id]',
        'div[class*="group"][class*="text-token-text-primary"]',
        'div[class*="flex"][class*="gap-4"]',
        'div[class*="w-full"][class*="text-token-text-primary"]',
        '.group.w-full',
        '.group.text-token-text-primary',
        '[data-testid*="conversation-turn"]'
      ],
      userIndicators: [
        '[data-message-author-role="user"]',
        'div[class*="text-token-text-primary"]:has(> div)',
        '.max-w-2xl'
      ],
      assistantIndicators: [
        '[data-message-author-role="assistant"]',
        'div[class*="group"][class*="text-token-text-primary"]'
      ],
      textSelectors: [
        'div[class*="markdown"]',
        '.prose',
        'div[data-message-text="true"]',
        'div[class*="whitespace-pre-wrap"]',
        'div[class*="text-message"]',
        'p',
        'div'
      ]
    },
    
    claude: {
      name: 'Claude',
      platform: 'claude',
      messageSelectors: [
        '[data-testid="message"]',
        '[data-is-streaming]',
        'div[class*="font-claude"]',
        '.flex.flex-col.gap-3',
        '.group.relative'
      ],
      userIndicators: [
        '[data-is-streaming="false"][class*="border"]',
        '.bg-bg-300',
        'div[class*="user"]'
      ],
      assistantIndicators: [
        '[data-is-streaming]',
        '.font-claude',
        'div[class*="assistant"]',
        'svg[class*="claude"]'
      ],
      textSelectors: [
        '.font-claude-message',
        '.prose',
        'p',
        'div[class*="text"]',
        'span'
      ]
    },
    
    gemini: {
      name: 'Gemini',
      platform: 'gemini',
      messageSelectors: [
        'message-content',
        '.conversation-container .conversation-turn',
        '[data-test-id*="conversation-turn"]',
        'div[class*="conversation-turn"]',
        '.model-response-text-wrapper',
        '.user-input-text-wrapper',
        '[jsname]'
      ],
      userIndicators: [
        '.user-input-text-wrapper',
        '[data-test-id="user-turn"]',
        'div[class*="user"]',
        '[aria-label*="user" i]'
      ],
      assistantIndicators: [
        '.model-response-text-wrapper',
        '[data-test-id="model-turn"]',
        'div[class*="model"]',
        'div[class*="response"]',
        '[aria-label*="model" i]'
      ],
      textSelectors: [
        '.response-container-content',
        '.markdown-content',
        '.message-content',
        'div[data-message-text="true"]',
        '.text-container',
        'p',
        'div'
      ]
    },
    
    unknown: {
      name: 'Unknown Platform',
      platform: 'unknown',
      messageSelectors: [
        '.message',
        '[data-testid*="message"]',
        '[class*="message"]',
        '[class*="chat"]',
        'div[role="log"]'
      ],
      userIndicators: [
        '[class*="user"]',
        '[data-role="user"]',
        '[data-author="user"]'
      ],
      assistantIndicators: [
        '[class*="assistant"]',
        '[class*="bot"]',
        '[data-role="assistant"]',
        '[data-author*="assistant"]'
      ],
      textSelectors: [
        '.text',
        '.content',
        '.markdown',
        'p',
        'div',
        'span'
      ]
    }
  };

  static detectPlatform(): PlatformConfig {
    const hostname = window.location.hostname.toLowerCase();
    const url = window.location.href.toLowerCase();
    
    console.log('[DialogueVault] Detecting platform for:', hostname);
    
    // ChatGPT
    if (hostname.includes('chat.openai.com') || hostname.includes('chatgpt.com')) {
      console.log('[DialogueVault] Detected ChatGPT');
      return this.configs.chatgpt;
    }
    
    // Claude
    if (hostname.includes('claude.ai')) {
      console.log('[DialogueVault] Detected Claude');
      return this.configs.claude;
    }
    
    // Gemini/Bard
    if (hostname.includes('gemini.google.com') || hostname.includes('bard.google.com')) {
      console.log('[DialogueVault] Detected Gemini');
      return this.configs.gemini;
    }
    
    console.log('[DialogueVault] Unsupported platform:', hostname);
    return this.configs.unknown;
  }
  
  static getConfig(platform: ChatbotPlatform): PlatformConfig {
    return this.configs[platform];
  }
}
