import { PlatformDetector, type PlatformConfig, type ChatbotPlatform } from './platform-detector';

export interface ConversationTurn {
  index: number;
  type: 'user' | 'assistant';
  preview: string;
  element: HTMLElement;
}

export class UniversalChatbotNavigator {
  private observer: MutationObserver | null = null;
  private updateCallback: (() => void) | null = null;
  private platformConfig: PlatformConfig;
  private platform: ChatbotPlatform;

  constructor() {
    this.platformConfig = PlatformDetector.detectPlatform();
    this.platform = this.platformConfig.platform;
    console.log(`[DialogueVault] Initialized for ${this.platformConfig.name}`);
  }

  // Debug function to analyze page structure
  private debugPageStructure(): void {
    console.log('[DialogueVault] === DEBUG PAGE STRUCTURE ===');
    console.log('[DialogueVault] Platform:', this.platformConfig.name);
    console.log('[DialogueVault] URL:', window.location.href);
    console.log('[DialogueVault] Title:', document.title);
    
    const main = document.querySelector('main') || document.body;
    console.log('[DialogueVault] Main element:', main ? 'found' : 'not found');
    
    if (main) {
      console.log('[DialogueVault] Main children count:', main.children.length);
      const divs = main.querySelectorAll('div');
      console.log('[DialogueVault] Divs in main:', divs.length);
      
      // Show first few divs with substantial text
      const textDivs = Array.from(divs).filter(div => {
        const text = div.textContent?.trim() || '';
        return text.length > 30;
      }).slice(0, 5);
      
      textDivs.forEach((div, i) => {
        const text = div.textContent?.trim().substring(0, 100) + '...';
        console.log(`[DialogueVault] Text div ${i}:`, text);
        console.log(`[DialogueVault] Classes:`, div.className);
        console.log(`[DialogueVault] Data attrs:`, Array.from(div.attributes).filter(attr => attr.name.startsWith('data-')));
      });
    }
    
    // Check platform-specific selectors
    this.platformConfig.messageSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      console.log(`[DialogueVault] Selector "${selector}": ${elements.length} elements`);
    });
  }

  startObserving(callback: () => void): void {
    this.updateCallback = callback;
    
    // Create mutation observer to detect changes
    this.observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          const addedNodes = Array.from(mutation.addedNodes);
          const hasRelevantChanges = addedNodes.some(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              // Check if any added node matches our platform's message selectors
              return this.platformConfig.messageSelectors.some(selector => 
                element.matches(selector) || element.querySelector(selector)
              );
            }
            return false;
          });
          
          if (hasRelevantChanges) {
            shouldUpdate = true;
            break;
          }
        }
      }
      
      if (shouldUpdate) {
        // Debounce updates
        setTimeout(() => {
          if (this.updateCallback) {
            this.updateCallback();
          }
        }, 500);
      }
    });

    // Start observing
    const targetNode = this.platformConfig.containerSelector 
      ? document.querySelector(this.platformConfig.containerSelector) || document.body
      : document.body;
      
    this.observer.observe(targetNode, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'data-message-author-role', 'data-testid', 'data-role', 'data-author', 'data-from']
    });
  }

  stopObserving(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  getConversationTurns(): ConversationTurn[] {
    const turns: ConversationTurn[] = [];
    
    console.log(`[DialogueVault] Starting conversation detection for ${this.platformConfig.name}...`);
    console.log('[DialogueVault] Current URL:', window.location.href);
    
    let foundElements: Element[] = [];
    
    // Try platform-specific selectors first
    for (const selector of this.platformConfig.messageSelectors) {
      const elements = document.querySelectorAll(selector);
      console.log(`[DialogueVault] Selector "${selector}" found ${elements.length} elements`);
      
      if (elements.length > 0) {
        // Filter for elements that actually contain text content
        let validElements = Array.from(elements).filter(el => {
          const text = el.textContent?.trim() || '';
          const hasEnoughText = text.length > 20; // Must have substantial content
          
          // For ChatGPT, be VERY specific about what constitutes a valid message
          if (this.platform === 'chatgpt') {
            // Must have a role attribute
            const hasRole = el.hasAttribute('data-message-author-role');
            if (!hasRole) return false;
            
            // Skip if it's just placeholder/system text
            const isPlaceholderText = text.match(/^(What's on your mind today\?|ChatGPT|User|Assistant|Temporary Chat|This chat won't appear|Ask anything|window\._oai_|oai_)$/i);
            if (isPlaceholderText) return false;
            
            // Must have actual markdown content or be substantial user input
            const hasMarkdown = el.querySelector('div[class*="markdown"]') || el.querySelector('.prose');
            const isSubstantialContent = text.length > 50 && !text.includes('Temporary Chat');
            
            // Skip system messages and UI elements
            const isSystemMessage = text.includes("This chat won't appear in history") || 
                                  text.includes("safety purposes") ||
                                  text.includes("window._oai_") ||
                                  text.length < 30;
            
            return hasRole && (hasMarkdown || isSubstantialContent) && !isSystemMessage;
          }
          
          return hasEnoughText;
        });

        // Additional filtering for ChatGPT to avoid nested elements and ensure unique messages
        if (this.platform === 'chatgpt' && validElements.length > 0) {
          validElements = validElements.filter((el, index) => {
            // Check if this element is contained within another element in our list
            const isNested = validElements.some((otherEl, otherIndex) => {
              return index !== otherIndex && otherEl.contains(el);
            });
            
            // Also filter out elements that don't have meaningful conversational content
            const text = el.textContent?.trim() || '';
            const hasConversationalContent = text.length > 30 && 
              !text.includes('What\'s on your mind') &&
              !text.includes('window._oai_') &&
              !text.match(/^(ChatGPT|User|Assistant)$/);
            
            return !isNested && hasConversationalContent;
          });
        }
        
        if (validElements.length > 0) {
          foundElements = validElements;
          console.log(`[DialogueVault] Using ${validElements.length} valid elements from selector: ${selector}`);
          break;
        }
      }
    }

    // If no specific selectors work, try a more general approach
    if (foundElements.length === 0) {
      console.log('[DialogueVault] No elements found with specific selectors, trying general approach...');
      
      // Look for any elements that might be messages
      const container = document.querySelector('main') || 
                       document.querySelector('[role="main"]') || 
                       document.querySelector('.chat') ||
                       document.querySelector('[class*="chat"]') ||
                       document.querySelector('[class*="conversation"]') ||
                       document.body;
      
      if (container) {
        const allDivs = container.querySelectorAll('div');
        console.log(`[DialogueVault] Found ${allDivs.length} divs in container`);
        
        // Filter divs that look like messages
        foundElements = Array.from(allDivs).filter(div => {
          const text = div.textContent?.trim() || '';
          const hasEnoughText = text.length > 50;
          const hasChildren = div.children.length > 0;
          const notTooDeep = div.querySelectorAll('div').length < 50; // Avoid container divs
          const hasRelevantClasses = div.className.toLowerCase().match(/message|chat|conversation|turn|response|prompt/);
          
          return hasEnoughText && hasChildren && notTooDeep && (hasRelevantClasses || text.length > 100);
        });
        
        console.log(`[DialogueVault] Filtered to ${foundElements.length} potential message elements`);
      }
    }

    if (foundElements.length === 0) {
      console.log('[DialogueVault] No conversation elements found at all');
      return turns;
    }

    // Process found elements and deduplicate aggressively
    const seenPreviews = new Set<string>();
    const processedElements = new Set<HTMLElement>();
    const seenTexts = new Set<string>(); // Additional deduplication by exact text
    
    foundElements.forEach((element, index) => {
      const htmlElement = element as HTMLElement;
      
      // Skip if we've already processed this exact element
      if (processedElements.has(htmlElement)) {
        return;
      }
      
      const role = this.determineRole(htmlElement);
      
      if (role) {
        const preview = this.extractPreview(htmlElement);
        if (preview && preview.length > 3) {
          
          // Skip common placeholder texts for ChatGPT
          if (this.platform === 'chatgpt') {
            const isPlaceholder = preview.match(/^(What's on your mind|ChatGPT|User|Assistant|Temporary|This chat won't|window\._oai|Ask anything)/i);
            if (isPlaceholder) {
              return;
            }
          }
          
          // Create a normalized version for deduplication
          const normalizedPreview = preview.toLowerCase().trim().substring(0, 50);
          const fullText = preview.toLowerCase().trim();
          
          // Skip if we've seen this preview or similar text before
          if (seenPreviews.has(normalizedPreview) || seenTexts.has(fullText)) {
            console.log(`[DialogueVault] Skipping duplicate: "${preview.substring(0, 30)}..."`);
            return;
          }
          
          seenPreviews.add(normalizedPreview);
          seenTexts.add(fullText);
          processedElements.add(htmlElement);
          
          console.log(`[DialogueVault] Turn ${turns.length + 1}: ${role} - "${preview.substring(0, 60)}..."`);
          turns.push({
            index: turns.length,
            type: role,
            preview,
            element: htmlElement
          });
        }
      }
    });

    console.log(`[DialogueVault] Final result: ${turns.length} conversation turns found`);
    return turns;
  }

  private determineRole(element: HTMLElement): 'user' | 'assistant' | null {
    console.log(`[DialogueVault] Determining role for element with class: ${element.className}`);
    
    // Method 1: Check platform-specific user indicators
    for (const selector of this.platformConfig.userIndicators) {
      if (element.matches(selector) || element.querySelector(selector)) {
        console.log(`[DialogueVault] Found user role via selector: ${selector}`);
        return 'user';
      }
    }
    
    // Method 2: Check platform-specific assistant indicators
    for (const selector of this.platformConfig.assistantIndicators) {
      if (element.matches(selector) || element.querySelector(selector)) {
        console.log(`[DialogueVault] Found assistant role via selector: ${selector}`);
        return 'assistant';
      }
    }

    // Method 3: Check parent elements for role attributes
    let current: HTMLElement | null = element;
    for (let i = 0; i < 3; i++) {
      if (!current) break;
      
      // Common role attributes across platforms
      const roleAttrs = [
        'data-message-author-role',
        'data-role',
        'data-author',
        'data-from',
        'data-testid'
      ];
      
      for (const attr of roleAttrs) {
        const value = current.getAttribute(attr)?.toLowerCase() || '';
        if (value.includes('user') || value.includes('human')) {
          console.log(`[DialogueVault] Found user role via ${attr}="${value}"`);
          return 'user';
        }
        if (value.includes('assistant') || value.includes('bot') || value.includes('ai') || value.includes('gpt') || value.includes('claude') || value.includes('gemini')) {
          console.log(`[DialogueVault] Found assistant role via ${attr}="${value}"`);
          return 'assistant';
        }
      }
      
      current = current.parentElement;
    }

    // Method 4: Look for common UI patterns
    // Check for typical user indicators
    const userPatterns = [
      'img[alt*="user" i]',
      'img[alt*="you" i]',
      '[class*="user" i]',
      '[class*="human" i]',
      'div[style*="align-items: flex-end"]', // Often user messages are right-aligned
      'div[style*="justify-content: flex-end"]'
    ];
    
    for (const pattern of userPatterns) {
      if (element.querySelector(pattern)) {
        console.log(`[DialogueVault] Found user indicator via pattern: ${pattern}`);
        return 'user';
      }
    }
    
    // Check for typical assistant indicators
    const assistantPatterns = [
      'svg',
      '[class*="bot" i]',
      '[class*="ai" i]',
      '[class*="assistant" i]',
      '[class*="gpt" i]',
      '[class*="claude" i]',
      '[class*="gemini" i]',
      'img[alt*="bot" i]',
      'img[alt*="ai" i]',
      'code', // Assistant messages often contain code
      'pre', // Pre-formatted text
      '.markdown' // Markdown formatting
    ];
    
    for (const pattern of assistantPatterns) {
      if (element.querySelector(pattern)) {
        console.log(`[DialogueVault] Found assistant indicator via pattern: ${pattern}`);
        return 'assistant';
      }
    }

    // Method 5: Simple alternating pattern based on document order (fallback)
    const container = document.querySelector('main') || document.body;
    if (container) {
      // Get all potential message elements
      const allMessages = container.querySelectorAll('div');
      const validMessages = Array.from(allMessages).filter(div => {
        const text = div.textContent?.trim() || '';
        return text.length > 50;
      });
      
      const index = Array.from(validMessages).findIndex(div => div === element);
      if (index >= 0) {
        const role = index % 2 === 0 ? 'user' : 'assistant';
        console.log(`[DialogueVault] Using alternating pattern: index ${index} = ${role}`);
        return role;
      }
    }

    console.log('[DialogueVault] Could not determine role, returning null');
    return null;
  }

  private extractPreview(element: HTMLElement): string {
    // Try platform-specific text extraction first
    for (const selector of this.platformConfig.textSelectors) {
      const textElement = element.querySelector(selector);
      if (textElement && textElement.textContent) {
        const text = textElement.textContent.trim();
        if (text.length > 10) {
          return this.truncateText(text, 100);
        }
      }
    }

    // Try common text extraction strategies
    const commonSelectors = [
      '.markdown',
      '.prose',
      '[class*="content"]',
      '[class*="text"]',
      '[class*="message"]',
      'p',
      'span',
      'div'
    ];

    for (const selector of commonSelectors) {
      const textElement = element.querySelector(selector);
      if (textElement && textElement.textContent) {
        const text = textElement.textContent.trim();
        if (text.length > 10) {
          return this.truncateText(text, 100);
        }
      }
    }

    // If no specific selector works, try direct text content
    let text = element.textContent?.trim() || '';
    
    // Clean up the text (remove extra whitespace, control characters)
    text = text.replace(/\s+/g, ' ').trim();
    
    // Filter out very short or empty text
    if (text.length < 3) {
      return 'Message';
    }
    
    return this.truncateText(text, 100);
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
  
  getPlatformName(): string {
    return this.platformConfig.name;
  }
}
