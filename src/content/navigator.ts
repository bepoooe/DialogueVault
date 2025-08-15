export interface ConversationTurn {
  index: number;
  type: 'user' | 'assistant';
  preview: string;
  element: HTMLElement;
}

export class ChatGPTNavigator {
  private observer: MutationObserver | null = null;
  private updateCallback: (() => void) | null = null;

  // Debug function to analyze page structure
  debugPageStructure(): void {
    console.log('[WayGPT] === DEBUG PAGE STRUCTURE ===');
    console.log('[WayGPT] URL:', window.location.href);
    console.log('[WayGPT] Title:', document.title);
    
    const main = document.querySelector('main');
    console.log('[WayGPT] Main element:', main ? 'found' : 'not found');
    
    if (main) {
      console.log('[WayGPT] Main children count:', main.children.length);
      const divs = main.querySelectorAll('div');
      console.log('[WayGPT] Divs in main:', divs.length);
      
      // Show first few divs with substantial text
      const textDivs = Array.from(divs).filter(div => {
        const text = div.textContent?.trim() || '';
        return text.length > 30;
      }).slice(0, 5);
      
      textDivs.forEach((div, i) => {
        const text = div.textContent?.trim().substring(0, 100) + '...';
        console.log(`[WayGPT] Text div ${i}:`, text);
        console.log(`[WayGPT] Classes:`, div.className);
        console.log(`[WayGPT] Data attrs:`, Array.from(div.attributes).filter(attr => attr.name.startsWith('data-')));
      });
    }
    
    // Check for common selectors
    const commonSelectors = [
      '[data-message-author-role]',
      '[data-testid*="conversation"]',
      '.group.w-full',
      '[role="presentation"]'
    ];
    
    commonSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      console.log(`[WayGPT] Selector "${selector}": ${elements.length} elements`);
    });
  }

  startObserving(callback: () => void): void {
    this.updateCallback = callback;
    
    // Create mutation observer to detect changes
    this.observer = new MutationObserver(() => {
      // Debounce updates
      setTimeout(() => {
        if (this.updateCallback) {
          this.updateCallback();
        }
      }, 500);
    });

    // Start observing
    const targetNode = document.body;
    this.observer.observe(targetNode, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
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
    
    console.log('[WayGPT] Starting conversation detection...');
    console.log('[WayGPT] Current URL:', window.location.href);
    
    // Simple and direct approach - look for the most common patterns
    const possibleSelectors = [
      // Modern ChatGPT selectors (2024-2025)
      '[data-message-author-role]',
      '[data-testid*="conversation-turn"]',
      'div[class*="group"][class*="w-full"]',
      '.group.w-full',
      'main div[class*="flex"][class*="flex-col"]',
      'main > div > div > div > div'
    ];

    let foundElements: Element[] = [];
    
    for (const selector of possibleSelectors) {
      const elements = document.querySelectorAll(selector);
      console.log(`[WayGPT] Selector "${selector}" found ${elements.length} elements`);
      
      if (elements.length > 0) {
        // Filter for elements that actually contain text content
        const validElements = Array.from(elements).filter(el => {
          const text = el.textContent?.trim() || '';
          return text.length > 20; // Must have substantial content
        });
        
        if (validElements.length > 0) {
          foundElements = validElements;
          console.log(`[WayGPT] Using ${validElements.length} valid elements from selector: ${selector}`);
          break;
        }
      }
    }

    // If no specific selectors work, try a more general approach
    if (foundElements.length === 0) {
      console.log('[WayGPT] No elements found with specific selectors, trying general approach...');
      
      // Look for any divs in main content that might be messages
      const main = document.querySelector('main');
      if (main) {
        const allDivs = main.querySelectorAll('div');
        console.log(`[WayGPT] Found ${allDivs.length} divs in main`);
        
        // Filter divs that look like messages
        foundElements = Array.from(allDivs).filter(div => {
          const text = div.textContent?.trim() || '';
          const hasEnoughText = text.length > 50;
          const hasChildren = div.children.length > 0;
          const notTooDeep = div.querySelectorAll('div').length < 50; // Avoid container divs
          
          return hasEnoughText && hasChildren && notTooDeep;
        });
        
        console.log(`[WayGPT] Filtered to ${foundElements.length} potential message elements`);
      }
    }

    if (foundElements.length === 0) {
      console.log('[WayGPT] No conversation elements found at all');
      return turns;
    }

    // Process found elements
    foundElements.forEach((element, index) => {
      const htmlElement = element as HTMLElement;
      const role = this.determineRole(htmlElement);
      
      if (role) {
        const preview = this.extractPreview(htmlElement);
        if (preview && preview.length > 3) {
          console.log(`[WayGPT] Turn ${turns.length + 1}: ${role} - "${preview.substring(0, 60)}..."`);
          turns.push({
            index: turns.length,
            type: role,
            preview,
            element: htmlElement
          });
        }
      }
    });

    console.log(`[WayGPT] Final result: ${turns.length} conversation turns found`);
    return turns;
  }

  private determineRole(element: HTMLElement): 'user' | 'assistant' | null {
    console.log(`[WayGPT] Determining role for element with class: ${element.className}`);
    
    // Method 1: Check data attributes (most reliable)
    const authorRole = element.getAttribute('data-message-author-role');
    if (authorRole === 'user') {
      console.log('[WayGPT] Found user role via data-message-author-role');
      return 'user';
    }
    if (authorRole === 'assistant') {
      console.log('[WayGPT] Found assistant role via data-message-author-role');
      return 'assistant';
    }

    // Method 2: Check parent elements for role attributes
    let current: HTMLElement | null = element;
    for (let i = 0; i < 3; i++) {
      if (!current) break;
      const role = current.getAttribute('data-message-author-role');
      if (role === 'user' || role === 'assistant') {
        console.log(`[WayGPT] Found ${role} role via parent element`);
        return role as 'user' | 'assistant';
      }
      current = current.parentElement;
    }

    // Method 3: Look for SVG icons (ChatGPT messages often have SVG icons)
    const svgs = element.querySelectorAll('svg');
    if (svgs.length > 0) {
      console.log('[WayGPT] Found SVG, assuming assistant role');
      return 'assistant';
    }

    // Method 4: Look for images/avatars
    const images = element.querySelectorAll('img');
    for (const img of images) {
      const alt = img.alt?.toLowerCase() || '';
      const src = img.src?.toLowerCase() || '';
      if (alt.includes('user') || src.includes('user')) {
        console.log('[WayGPT] Found user indicator in image');
        return 'user';
      }
      if (alt.includes('gpt') || alt.includes('assistant') || src.includes('gpt')) {
        console.log('[WayGPT] Found assistant indicator in image');
        return 'assistant';
      }
    }

    // Method 5: Simple alternating pattern based on document order
    const main = document.querySelector('main');
    if (main) {
      // Get all potential message elements
      const allMessages = main.querySelectorAll('div');
      const validMessages = Array.from(allMessages).filter(div => {
        const text = div.textContent?.trim() || '';
        return text.length > 50;
      });
      
      const index = Array.from(validMessages).findIndex(div => div === element);
      if (index >= 0) {
        const role = index % 2 === 0 ? 'user' : 'assistant';
        console.log(`[WayGPT] Using alternating pattern: index ${index} = ${role}`);
        return role;
      }
    }

    console.log('[WayGPT] Could not determine role, returning null');
    return null;
  }

  private extractPreview(element: HTMLElement): string {
    // Try multiple text extraction strategies
    const textSelectors = [
      '.markdown', // Markdown formatted content
      '[data-message-text]', // Direct message text
      '.prose', // Prose content
      'p', // Paragraphs
      'div[class*="message"]', // Message divs
      'span', // Span elements
      'div' // Generic divs
    ];

    // First, try specific selectors
    for (const selector of textSelectors) {
      const textElement = element.querySelector(selector);
      if (textElement && textElement.textContent) {
        const text = textElement.textContent.trim();
        if (text.length > 10) { // Ensure we have substantial content
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
}
