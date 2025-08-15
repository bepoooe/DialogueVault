export type ChatbotPlatform = 'chatgpt' | 'claude' | 'gemini' | 'deepseek' | 'poe' | 'you' | 'character' | 'mistral' | 'huggingface' | 'lmsys' | 'unknown';

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
        '.group\\/conversation-turn',
        '.group.w-full',
        '[data-testid*="conversation-turn"]'
      ],
      userIndicators: [
        '[data-message-author-role="user"]',
        'img[alt*="User"]',
        '.relative.p-1.rounded-sm'
      ],
      assistantIndicators: [
        '[data-message-author-role="assistant"]',
        'svg[class*="icon"]',
        '[data-testid*="turn"]',
        '.markdown'
      ],
      textSelectors: [
        'div[class*="markdown"]',
        '.prose',
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
        '[data-test-id*="conversation"]',
        'message-content',
        '.conversation-container > div',
        'div[class*="message"]',
        '.model-response-container'
      ],
      userIndicators: [
        '[data-test-id="user-message"]',
        '.user-input-container',
        'div[class*="user"]'
      ],
      assistantIndicators: [
        '[data-test-id*="model-response"]',
        '.model-response-container',
        'div[class*="response"]',
        'div[class*="assistant"]'
      ],
      textSelectors: [
        '.response-container-content',
        '.markdown-content',
        '.message-content',
        'p',
        'div'
      ]
    },
    
    deepseek: {
      name: 'DeepSeek',
      platform: 'deepseek',
      messageSelectors: [
        '.message-item',
        '[data-role]',
        '.chat-message',
        '.conversation-message'
      ],
      userIndicators: [
        '[data-role="user"]',
        '.message-user',
        '.user-message'
      ],
      assistantIndicators: [
        '[data-role="assistant"]',
        '.message-assistant',
        '.assistant-message',
        '.ai-message'
      ],
      textSelectors: [
        '.message-content',
        '.text-content',
        '.markdown',
        'p',
        'div'
      ]
    },
    
    poe: {
      name: 'Poe',
      platform: 'poe',
      messageSelectors: [
        '[class*="Message_messageRow"]',
        '[class*="message"]',
        '.ChatMessageInputContainer',
        'div[class*="Message"]'
      ],
      userIndicators: [
        '[class*="Message_humanMessageBubble"]',
        '[class*="human"]',
        '[class*="user"]'
      ],
      assistantIndicators: [
        '[class*="Message_botMessageBubble"]',
        '[class*="bot"]',
        '[class*="assistant"]'
      ],
      textSelectors: [
        '[class*="Markdown"]',
        '[class*="message"] p',
        'div[class*="text"]',
        'span'
      ]
    },
    
    you: {
      name: 'You.com',
      platform: 'you',
      messageSelectors: [
        '[data-testid*="message"]',
        '.chat-message',
        '.message-container'
      ],
      userIndicators: [
        '[data-testid="user-message"]',
        '.user-message',
        '[class*="user"]'
      ],
      assistantIndicators: [
        '[data-testid*="ai-message"]',
        '.ai-message',
        '[class*="assistant"]',
        '[class*="bot"]'
      ],
      textSelectors: [
        '.message-text',
        '.markdown',
        'p',
        'div'
      ]
    },
    
    character: {
      name: 'Character.AI',
      platform: 'character',
      messageSelectors: [
        '[data-testid="message"]',
        '.message',
        '[class*="Message"]'
      ],
      userIndicators: [
        '[data-author="user"]',
        '.user-message',
        '[class*="user"]'
      ],
      assistantIndicators: [
        '[data-author*="char"]',
        '.character-message',
        '[class*="character"]',
        '[class*="bot"]'
      ],
      textSelectors: [
        '.message-text',
        '.text',
        'p',
        'span'
      ]
    },
    
    mistral: {
      name: 'Mistral',
      platform: 'mistral',
      messageSelectors: [
        '.message',
        '[data-testid*="message"]',
        '.chat-message'
      ],
      userIndicators: [
        '.user-message',
        '[data-role="user"]',
        '[class*="user"]'
      ],
      assistantIndicators: [
        '.assistant-message',
        '[data-role="assistant"]',
        '[class*="assistant"]'
      ],
      textSelectors: [
        '.message-content',
        '.markdown',
        'p',
        'div'
      ]
    },
    
    huggingface: {
      name: 'Hugging Face',
      platform: 'huggingface',
      messageSelectors: [
        '[data-testid="message"]',
        '.message',
        '.chat-message'
      ],
      userIndicators: [
        '[data-from="user"]',
        '.from-user',
        '[class*="user"]'
      ],
      assistantIndicators: [
        '[data-from="assistant"]',
        '.from-assistant',
        '[class*="assistant"]'
      ],
      textSelectors: [
        '.prose',
        '.message-content',
        'p',
        'div'
      ]
    },
    
    lmsys: {
      name: 'LMSYS Chatbot Arena',
      platform: 'lmsys',
      messageSelectors: [
        '.message',
        '[role="log"]',
        '.chatbot'
      ],
      userIndicators: [
        '.user',
        '[class*="user"]'
      ],
      assistantIndicators: [
        '.bot',
        '.assistant',
        '[class*="bot"]'
      ],
      textSelectors: [
        '.message',
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
    
    // DeepSeek
    if (hostname.includes('chat.deepseek.com') || hostname.includes('deepseek.com')) {
      console.log('[DialogueVault] Detected DeepSeek');
      return this.configs.deepseek;
    }
    
    // Poe
    if (hostname.includes('poe.com')) {
      console.log('[DialogueVault] Detected Poe');
      return this.configs.poe;
    }
    
    // You.com
    if (hostname.includes('you.com')) {
      console.log('[DialogueVault] Detected You.com');
      return this.configs.you;
    }
    
    // Character.AI
    if (hostname.includes('character.ai')) {
      console.log('[DialogueVault] Detected Character.AI');
      return this.configs.character;
    }
    
    // Mistral
    if (hostname.includes('chat.mistral.ai') || hostname.includes('mistral.ai')) {
      console.log('[DialogueVault] Detected Mistral');
      return this.configs.mistral;
    }
    
    // Hugging Face
    if (hostname.includes('huggingface.co')) {
      console.log('[DialogueVault] Detected Hugging Face');
      return this.configs.huggingface;
    }
    
    // LMSYS
    if (hostname.includes('chat.lmsys.org')) {
      console.log('[DialogueVault] Detected LMSYS');
      return this.configs.lmsys;
    }
    
    console.log('[DialogueVault] Unknown platform, using generic config');
    return this.configs.unknown;
  }
  
  static getConfig(platform: ChatbotPlatform): PlatformConfig {
    return this.configs[platform];
  }
}
