// Content script that creates a ChatGPT Smart Index sidebar
interface ConversationTurn {
  id: string;
  text: string;
  isUser: boolean;
  element: HTMLElement;
  preview: string;
}

class WayGPTExtension {
  private sidebar: HTMLDivElement | null = null;
  private promptList: HTMLDivElement | null = null;
  private isVisible: boolean = true;
  private prompts: ConversationTurn[] = [];
  private observer: MutationObserver | null = null;
  private debounceTimer: number | null = null;
  private expandBtn: HTMLButtonElement | null = null;
  private isMobile: boolean = window.matchMedia("(max-width: 768px)").matches;
  private selectedPromptId: string | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  private setup(): void {
    this.createSidebar();
    this.createFloatingExpandBtn();
    this.setupObserver();
    this.scanForPrompts();
    this.setupKeyboardShortcuts();

    window.addEventListener('resize', () => this.handleResize());
    this.handleResize();

    const reposition = () => {
      this.positionExpandBtnDesktop();
      this.positionExpandBtnMobile();
    };
    window.addEventListener('scroll', reposition, { passive: true });
    setInterval(reposition, 800);
  }

  private setupObserver(): void {
    this.observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          const addedNodes = Array.from(mutation.addedNodes);
          const hasRelevantChanges = addedNodes.some(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              return element.matches('[data-message-author-role]') ||
                     element.querySelector('[data-message-author-role]') ||
                     element.matches('.group\\/conversation-turn') ||
                     element.querySelector('.group\\/conversation-turn');
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
        if (this.debounceTimer) {
          clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = window.setTimeout(() => {
          this.scanForPrompts();
        }, 500);
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private scanForPrompts(): void {
    const messageSelectors = [
      '[data-message-author-role]',
      '.group\\/conversation-turn',
      '.group.w-full',
      '[data-testid*="conversation-turn"]'
    ];
    
    let messages: Element[] = [];
    for (const selector of messageSelectors) {
      messages = Array.from(document.querySelectorAll(selector));
      if (messages.length > 0) break;
    }

    if (messages.length === 0) {
      console.log('[WayGPT] No conversation messages found');
      this.updatePromptList();
      return;
    }

    console.log(`[WayGPT] Found ${messages.length} messages`);
    this.prompts = [];

    messages.forEach((message, index) => {
      try {
        // Determine role
        let isUser = false;
        const roleAttr = message.getAttribute('data-message-author-role');
        if (roleAttr) {
          isUser = roleAttr === 'user';
        } else {
          // Try to determine from content structure
          const hasAvatar = message.querySelector('img[alt*="User"], .relative.p-1.rounded-sm');
          const hasAssistantIndicator = message.querySelector('[data-testid*="turn"], .markdown, code');
          isUser = !!(hasAvatar && !hasAssistantIndicator);
        }

        // Extract text content
        let text = '';
        const textContainers = message.querySelectorAll('div[class*="markdown"], .prose, p, div');
        for (const container of textContainers) {
          const containerText = container.textContent?.trim();
          if (containerText && containerText.length > text.length) {
            text = containerText;
          }
        }

        if (!text) {
          text = message.textContent?.trim() || '';
        }

        if (text && text.length > 10) {
          const preview = text.length > 100 ? text.substring(0, 100) + '...' : text;
          
          this.prompts.push({
            id: `turn-${index}`,
            text,
            isUser,
            element: message as HTMLElement,
            preview
          });
        }
      } catch (error) {
        console.error('[WayGPT] Error parsing message:', error);
      }
    });

    console.log(`[WayGPT] Parsed ${this.prompts.length} conversation items`);
    this.updatePromptList();
  }

  private setupKeyboardShortcuts(): void {
    // Keyboard shortcut: Ctrl+Shift+I
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        this.toggleSidebar();
      }
    });
  }

  private updatePromptList(): void {
    if (!this.promptList) return;

    this.promptList.innerHTML = '';

    if (this.prompts.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      emptyState.textContent = 'No conversation yet. Start chatting to see your message index here.';
      emptyState.style.cssText = `
        text-align: center;
        padding: 40px 24px;
        color: #8e8ea0;
        font-size: 13px;
        line-height: 1.5;
      `;
      this.promptList.appendChild(emptyState);
      return;
    }

    this.prompts.forEach((prompt) => {
      const promptElement = document.createElement('div');
      promptElement.className = 'prompt-item';
      promptElement.style.cssText = `
        padding: 12px 20px;
        border-bottom: 1px solid #4d4d4f;
        cursor: pointer;
        transition: background-color 0.15s ease;
        background: #2f2f2f;
        margin: 0;
        position: relative;
      `;

      // Role indicator
      const roleIndicator = document.createElement('div');
      roleIndicator.style.cssText = `
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: ${prompt.isUser ? '#19c37d' : '#ab68ff'};
      `;

      const roleLabel = document.createElement('div');
      roleLabel.textContent = prompt.isUser ? 'You' : 'ChatGPT';
      roleLabel.style.cssText = `
        font-size: 11px;
        color: ${prompt.isUser ? '#19c37d' : '#ab68ff'};
        margin-bottom: 6px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      `;

      const previewText = document.createElement('div');
      previewText.textContent = prompt.preview;
      previewText.style.cssText = `
        font-size: 13px;
        line-height: 1.4;
        color: #ececec;
        margin-left: 8px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
      `;

      promptElement.appendChild(roleIndicator);
      promptElement.appendChild(roleLabel);
      promptElement.appendChild(previewText);

      promptElement.addEventListener('mouseover', () => {
        promptElement.style.backgroundColor = '#40414f';
      });

      promptElement.addEventListener('mouseout', () => {
        if (this.selectedPromptId !== prompt.id) {
          promptElement.style.backgroundColor = '#2f2f2f';
        }
      });

      promptElement.addEventListener('click', () => {
        this.scrollToPrompt(prompt);
        this.setSelectedPrompt(prompt.id, promptElement);
      });

      if (this.promptList) {
        this.promptList.appendChild(promptElement);
      }
    });
  }

  private scrollToPrompt(prompt: ConversationTurn): void {
    prompt.element.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });

    // Highlight the message briefly with ChatGPT-style highlighting
    const originalBg = prompt.element.style.backgroundColor;
    const originalTransition = prompt.element.style.transition;
    
    prompt.element.style.backgroundColor = '#dbeafe';
    prompt.element.style.transition = 'background-color 0.3s ease';
    
    setTimeout(() => {
      prompt.element.style.backgroundColor = originalBg;
      prompt.element.style.transition = originalTransition;
    }, 2000);
  }

  private setSelectedPrompt(promptId: string, promptElement: HTMLElement): void {
    // Remove previous selection
    this.promptList?.querySelectorAll('.prompt-item').forEach(item => {
      (item as HTMLElement).style.backgroundColor = '#2f2f2f';
      (item as HTMLElement).style.fontWeight = '';
    });

    // Highlight selected item
    this.selectedPromptId = promptId;
    promptElement.style.backgroundColor = '#343541';
    promptElement.style.fontWeight = '';
  }

  private applySelectedStyling(): void {
    if (this.selectedPromptId && this.promptList) {
      const selectedElement = Array.from(this.promptList.querySelectorAll('.prompt-item'))
        .find(item => {
          const promptIndex = Array.from(this.promptList!.children).indexOf(item);
          return this.prompts[promptIndex]?.id === this.selectedPromptId;
        }) as HTMLElement;
      
      if (selectedElement) {
        selectedElement.style.backgroundColor = '#343541';
        selectedElement.style.fontWeight = '';
      }
    }
  }

  private handleResize(): void {
    this.isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (this.isMobile) {
      this.isVisible = false;
      if (this.sidebar) {
        this.sidebar.classList.remove('active');
        this.sidebar.classList.add('collapsed');
        this.sidebar.style.display = 'none';
      }
      this.positionExpandBtnMobile();
      this.showExpandBtn();
    } else {
      if (this.isVisible) this.showSidebar();
      else this.hideSidebar();
      this.positionExpandBtnDesktop();
    }
  }

  private createSidebar(): void {
    this.sidebar = document.createElement('div');
    this.sidebar.id = 'waygpt-smart-index';
    this.sidebar.className = 'waygpt-sidebar';
    this.sidebar.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: 300px;
      height: 100vh;
      background: #212121;
      border-left: 1px solid #4d4d4f;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      transition: right 0.3s ease;
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.3);
    `;

    // Header
    const header = document.createElement('div');
    header.className = 'sidebar-header';
    header.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid #4d4d4f;
      background: #2f2f2f;
      min-height: 60px;
    `;

    const title = document.createElement('h3');
    title.textContent = 'Conversation Index';
    title.className = 'sidebar-title';
    title.style.cssText = `
      margin: 0;
      color: #ececec;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.025em;
    `;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
    `;
    closeBtn.title = 'Close sidebar';
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: #8e8ea0;
      cursor: pointer;
      padding: 8px;
      border-radius: 6px;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
    `;
    closeBtn.addEventListener('click', () => this.hideSidebar());
    closeBtn.addEventListener('mouseover', () => {
      closeBtn.style.backgroundColor = '#40414f';
      closeBtn.style.color = '#ececec';
    });
    closeBtn.addEventListener('mouseout', () => {
      closeBtn.style.backgroundColor = 'transparent';
      closeBtn.style.color = '#8e8ea0';
    });

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Prompt list
    this.promptList = document.createElement('div');
    this.promptList.className = 'prompt-list';
    this.promptList.style.cssText = `
      flex: 1;
      overflow-y: auto;
      background: #212121;
    `;

    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.textContent = 'No conversation yet. Start chatting to see your message index here.';
    emptyState.style.cssText = `
      text-align: center;
      padding: 40px 24px;
      color: #8e8ea0;
      font-size: 13px;
      line-height: 1.5;
    `;
    this.promptList.appendChild(emptyState);

    this.sidebar.appendChild(header);
    this.sidebar.appendChild(this.promptList);
    document.body.appendChild(this.sidebar);
  }

  private createFloatingExpandBtn(): void {
    this.expandBtn = document.createElement('button');
    this.expandBtn.id = 'waygpt-sidebar-expand-btn';
    this.expandBtn.className = 'floating-expand-btn';
    this.expandBtn.setAttribute('aria-label', 'Open conversation index');
    this.expandBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M3 12h18M3 6h18M3 18h18"/>
      </svg>
    `;
    this.expandBtn.style.cssText = `
      position: fixed;
      width: 44px;
      height: 44px;
      border-radius: 8px;
      background: #ffffff;
      color: #374151;
      border: 1px solid #d1d5db;
      cursor: pointer;
      z-index: 10001;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    this.expandBtn.addEventListener('click', () => this.showSidebar());
    
    // Add hover effects
    this.expandBtn.addEventListener('mouseover', () => {
      if (this.expandBtn) {
        this.expandBtn.style.backgroundColor = '#f9fafb';
        this.expandBtn.style.borderColor = '#9ca3af';
        this.expandBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      }
    });
    
    this.expandBtn.addEventListener('mouseout', () => {
      if (this.expandBtn) {
        this.expandBtn.style.backgroundColor = '#ffffff';
        this.expandBtn.style.borderColor = '#d1d5db';
        this.expandBtn.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
      }
    });
    
    document.body.appendChild(this.expandBtn);
  }

  private getShareButtonRect(): DOMRect | null {
    const shareBtn = 
      document.querySelector('button[aria-label*="Share" i]') ||
      document.querySelector('button:has(svg[aria-label*="Share" i])') ||
      Array.from(document.querySelectorAll('button')).find(b => /share/i.test(b.textContent || ''));
    return shareBtn ? shareBtn.getBoundingClientRect() : null;
  }

  private getSearchInputRect(): DOMRect | null {
    const input = 
      document.querySelector('input[type="search"]') ||
      document.querySelector('header input[type="text"]') ||
      document.querySelector('form input[type="search"]');
    return input ? input.getBoundingClientRect() : null;
  }

  private positionExpandBtnDesktop(): void {
    if (this.isMobile || !this.expandBtn) return;
    
    const shareRect = this.getShareButtonRect();
    if (shareRect) {
      const offsetY = 10;
      this.expandBtn.style.position = 'fixed';
      this.expandBtn.style.top = Math.max(10, Math.round(shareRect.bottom + offsetY)) + 'px';
      this.expandBtn.style.right = Math.max(20, Math.round(window.innerWidth - shareRect.right + 8)) + 'px';
      this.expandBtn.style.left = '';
      this.expandBtn.style.bottom = '';
    } else {
      this.expandBtn.style.position = 'fixed';
      this.expandBtn.style.top = '86px';
      this.expandBtn.style.right = '28px';
      this.expandBtn.style.left = '';
      this.expandBtn.style.bottom = '';
    }
    this.expandBtn.style.display = this.isVisible ? 'none' : 'flex';
  }

  private positionExpandBtnMobile(): void {
    if (!this.isMobile || !this.expandBtn) return;
    
    const searchRect = this.getSearchInputRect();
    if (searchRect) {
      const topPos = Math.max(10, Math.round(searchRect.top - 72));
      this.expandBtn.style.position = 'fixed';
      this.expandBtn.style.top = topPos + 'px';
      this.expandBtn.style.right = '16px';
      this.expandBtn.style.left = '';
      this.expandBtn.style.bottom = '';
    } else {
      this.expandBtn.style.position = 'fixed';
      this.expandBtn.style.right = '16px';
      this.expandBtn.style.bottom = '36px';
      this.expandBtn.style.top = '';
      this.expandBtn.style.left = '';
    }
    this.expandBtn.style.display = this.isVisible ? 'none' : 'flex';
  }

  private showExpandBtn(): void {
    if (this.isMobile) this.positionExpandBtnMobile();
    else this.positionExpandBtnDesktop();
    if (this.expandBtn) {
      this.expandBtn.style.display = this.isVisible ? 'none' : 'flex';
    }
  }

  private hideExpandBtn(): void {
    if (this.expandBtn) {
      this.expandBtn.style.display = 'none';
    }
  }

  private showSidebar(): void {
    this.isVisible = true;
    if (this.sidebar) {
      this.sidebar.classList.add('active');
      this.sidebar.classList.remove('collapsed');
      this.sidebar.style.display = 'flex';
      this.sidebar.style.right = '0';
    }
    this.hideExpandBtn();
    if (this.isMobile && this.sidebar) {
      this.sidebar.style.width = '100%';
      document.body.style.overflow = 'hidden';
    }
    this.applySelectedStyling();
  }

  private hideSidebar(): void {
    this.isVisible = false;
    if (this.sidebar) {
      this.sidebar.classList.remove('active');
      this.sidebar.classList.add('collapsed');
      if (this.isMobile) {
        this.sidebar.style.display = 'none';
        document.body.style.overflow = '';
      } else {
        this.sidebar.style.right = '-300px';
      }
    }
    
    if (this.isMobile) {
      this.positionExpandBtnMobile();
    } else {
      this.positionExpandBtnDesktop();
    }
    this.showExpandBtn();
  }

  private updateLayout(): void {
    if (!this.sidebar) return;
    
    const wasDesktop = window.innerWidth >= 768;
    if (this.isMobile === (window.innerWidth >= 768)) {
      this.isMobile = window.innerWidth < 768;
      this.setupResponsiveLayout();
    }
  }

  private setupResponsiveLayout(): void {
    if (!this.sidebar || !this.expandBtn) return;

    if (this.isMobile) {
      // Mobile layout
      this.sidebar.style.width = '100%';
      this.sidebar.style.height = '100%';
      this.sidebar.style.right = this.isVisible ? '0' : '-100%';
    } else {
      // Desktop layout  
      this.sidebar.style.width = '300px';
      this.sidebar.style.height = '100vh';
      this.sidebar.style.right = this.isVisible ? '0' : '-300px';
    }
  }

  private toggleSidebar(): void {
    if (this.isVisible) {
      this.hideSidebar();
    } else {
      this.showSidebar();
    }
  }

}

// Initialize the extension
new WayGPTExtension();
