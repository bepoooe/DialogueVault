// Content script that creates a DialogueVault sidebar
import { UniversalChatbotNavigator, type ConversationTurn } from './navigator';
import { PlatformDetector } from './platform-detector';

interface ConversationTurnLegacy {
  id: string;
  text: string;
  isUser: boolean;
  element: HTMLElement;
  preview: string;
}

class UniversalChatbotExtension {
  private sidebar: HTMLDivElement | null = null;
  private promptList: HTMLDivElement | null = null;
  private isVisible: boolean = true;
  private prompts: ConversationTurnLegacy[] = [];
  private observer: MutationObserver | null = null;
  private debounceTimer: number | null = null;
  private expandBtn: HTMLButtonElement | null = null;
  private isMobile: boolean = window.matchMedia("(max-width: 768px)").matches;
  private selectedPromptId: string | null = null;
  private navigator: UniversalChatbotNavigator;
  private platformName: string;

  constructor() {
    this.navigator = new UniversalChatbotNavigator();
    this.platformName = this.navigator.getPlatformName();
    console.log(`[DialogueVault] Initializing extension for ${this.platformName}`);
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
    // Use the universal navigator's observer
    this.navigator.startObserving(() => {
      this.scanForPrompts();
    });
  }

  private scanForPrompts(): void {
    console.log(`[DialogueVault] Scanning for prompts on ${this.platformName}...`);
    
    // Get conversation turns using the universal navigator
    const turns = this.navigator.getConversationTurns();
    
    if (turns.length === 0) {
      console.log('[DialogueVault] No conversation messages found');
      this.prompts = [];
      this.updatePromptList();
      return;
    }

    console.log(`[DialogueVault] Found ${turns.length} messages`);
    
    // Convert to legacy format for compatibility
    this.prompts = turns.map((turn, index) => ({
      id: `turn-${index}`,
      text: turn.preview,
      isUser: turn.type === 'user',
      element: turn.element,
      preview: turn.preview
    }));

    console.log(`[DialogueVault] Parsed ${this.prompts.length} conversation items`);
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
      emptyState.textContent = `No conversation detected. Start chatting to see your message index here.`;
      emptyState.style.cssText = `
        text-align: center;
        padding: 40px 24px;
        color: #8b7355;
        font-size: 13px;
        line-height: 1.5;
      `;
      this.promptList.appendChild(emptyState);
      return;
    }

    // Add platform indicator
    const platformIndicator = document.createElement('div');
    platformIndicator.textContent = `${this.platformName} Conversation`;
    platformIndicator.style.cssText = `
      padding: 12px 20px;
      color: #8b7355;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #e5d6c3;
      background: #e8dbc9;
      font-weight: 600;
    `;
    this.promptList.appendChild(platformIndicator);

    this.prompts.forEach((prompt) => {
      const promptElement = document.createElement('div');
      promptElement.className = 'prompt-item';
      promptElement.style.cssText = `
        padding: 16px 20px;
        border-bottom: 1px solid #e5d6c3;
        cursor: pointer;
        transition: all 0.15s ease;
        background: #ffffff;
        margin: 0;
        position: relative;
        border-radius: 8px;
        margin: 4px;
        box-shadow: 0 1px 3px rgba(93, 78, 55, 0.1);
      `;

      // Role indicator
      const roleIndicator = document.createElement('div');
      roleIndicator.style.cssText = `
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: ${prompt.isUser ? '#d4c4a8' : '#d2c2a6'};
        border-radius: 0 4px 4px 0;
      `;

      const roleLabel = document.createElement('div');
      roleLabel.textContent = prompt.isUser ? 'You' : this.getAssistantName();
      roleLabel.style.cssText = `
        font-size: 11px;
        color: ${prompt.isUser ? '#8b7355' : '#5d4e37'};
        margin-bottom: 8px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding-left: 12px;
      `;

      const previewText = document.createElement('div');
      previewText.textContent = prompt.preview;
      previewText.style.cssText = `
        font-size: 13px;
        line-height: 1.4;
        color: #5d4e37;
        margin-left: 12px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        line-clamp: 3;
      `;

      promptElement.appendChild(roleIndicator);
      promptElement.appendChild(roleLabel);
      promptElement.appendChild(previewText);

      promptElement.addEventListener('mouseover', () => {
        promptElement.style.backgroundColor = '#eee3d5';
        promptElement.style.transform = 'translateY(-1px)';
        promptElement.style.boxShadow = '0 2px 6px rgba(93, 78, 55, 0.15)';
      });

      promptElement.addEventListener('mouseout', () => {
        if (this.selectedPromptId !== prompt.id) {
          promptElement.style.backgroundColor = '#ffffff';
          promptElement.style.transform = 'translateY(0)';
          promptElement.style.boxShadow = '0 1px 3px rgba(93, 78, 55, 0.1)';
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

  private getAssistantName(): string {
    switch (this.platformName) {
      case 'ChatGPT': return 'ChatGPT';
      case 'Claude': return 'Claude';
      case 'Gemini': return 'Gemini';
      case 'DeepSeek': return 'DeepSeek';
      case 'Poe': return 'Bot';
      case 'You.com': return 'You.com';
      case 'Character.AI': return 'Character';
      case 'Mistral': return 'Mistral';
      case 'Hugging Face': return 'Assistant';
      case 'LMSYS Chatbot Arena': return 'Bot';
      default: return 'Assistant';
    }
  }

  private scrollToPrompt(prompt: ConversationTurnLegacy): void {
    prompt.element.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });

    // Highlight the message briefly with platform-appropriate highlighting
    const originalBg = prompt.element.style.backgroundColor;
    const originalTransition = prompt.element.style.transition;
    
    prompt.element.style.backgroundColor = '#e8dbc9';
    prompt.element.style.transition = 'background-color 0.3s ease';
    
    setTimeout(() => {
      prompt.element.style.backgroundColor = originalBg;
      prompt.element.style.transition = originalTransition;
    }, 2000);
  }

  private setSelectedPrompt(promptId: string, promptElement: HTMLElement): void {
    // Remove previous selection
    this.promptList?.querySelectorAll('.prompt-item').forEach(item => {
      (item as HTMLElement).style.backgroundColor = '#ffffff';
      (item as HTMLElement).style.transform = 'translateY(0)';
      (item as HTMLElement).style.boxShadow = '0 1px 3px rgba(93, 78, 55, 0.1)';
    });

    // Highlight selected item
    this.selectedPromptId = promptId;
    promptElement.style.backgroundColor = '#e8dbc9';
    promptElement.style.boxShadow = '0 2px 8px rgba(93, 78, 55, 0.15)';
  }

  private applySelectedStyling(): void {
    if (this.selectedPromptId && this.promptList) {
      const selectedElement = Array.from(this.promptList.querySelectorAll('.prompt-item'))
        .find(item => {
          const promptIndex = Array.from(this.promptList!.children).indexOf(item) - 1; // -1 for platform indicator
          return this.prompts[promptIndex]?.id === this.selectedPromptId;
        }) as HTMLElement;
      
      if (selectedElement) {
        selectedElement.style.backgroundColor = '#e8dbc9';
        selectedElement.style.boxShadow = '0 2px 8px rgba(93, 78, 55, 0.15)';
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
    this.sidebar.id = 'dialoguevault-navigator';
    this.sidebar.className = 'dialoguevault-navigator-sidebar';
    this.sidebar.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: 320px;
      height: 100vh;
      background: #e6d7c4;
      border-left: 1px solid #d4c4a8;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: -2px 0 12px rgba(93, 78, 55, 0.15);
    `;

    // Header
    const header = document.createElement('div');
    header.className = 'sidebar-header';
    header.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px;
      border-bottom: 1px solid #d4c4a8;
      background: #e4d5c2;
      min-height: 60px;
    `;

    const title = document.createElement('h3');
    title.textContent = 'DialogueVault';
    title.className = 'sidebar-title';
    title.style.cssText = `
      margin: 0;
      color: #5d4e37;
      font-size: 16px;
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
      color: #8b7355;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
    `;
    closeBtn.addEventListener('click', () => this.hideSidebar());
    closeBtn.addEventListener('mouseover', () => {
      closeBtn.style.backgroundColor = '#ddceb9';
      closeBtn.style.color = '#5d4e37';
    });
    closeBtn.addEventListener('mouseout', () => {
      closeBtn.style.backgroundColor = 'transparent';
      closeBtn.style.color = '#8b7355';
    });

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Prompt list
    this.promptList = document.createElement('div');
    this.promptList.className = 'prompt-list';
    this.promptList.style.cssText = `
      flex: 1;
      overflow-y: auto;
      background: #e6d7c4;
      padding: 8px;
    `;

    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.textContent = 'No conversation detected. Start chatting to see your message index here.';
    emptyState.style.cssText = `
      text-align: center;
      padding: 40px 24px;
      color: #8b7355;
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
    this.expandBtn.id = 'dialoguevault-expand-btn';
    this.expandBtn.className = 'floating-expand-btn';
    this.expandBtn.setAttribute('aria-label', 'Open DialogueVault navigator');
    this.expandBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M3 12h18M3 6h18M3 18h18"/>
      </svg>
    `;
    this.expandBtn.style.cssText = `
      position: fixed;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: #e6d7c4;
      color: #5d4e37;
      border: 1px solid #d4c4a8;
      cursor: pointer;
      z-index: 10001;
      box-shadow: 0 2px 8px rgba(93, 78, 55, 0.15);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    this.expandBtn.addEventListener('click', () => this.showSidebar());
    
    // Add hover effects
    this.expandBtn.addEventListener('mouseover', () => {
      if (this.expandBtn) {
        this.expandBtn.style.backgroundColor = '#e4d5c2';
        this.expandBtn.style.borderColor = '#d2c2a6';
        this.expandBtn.style.boxShadow = '0 4px 12px rgba(93, 78, 55, 0.2)';
        this.expandBtn.style.transform = 'translateY(-1px)';
      }
    });
    
    this.expandBtn.addEventListener('mouseout', () => {
      if (this.expandBtn) {
        this.expandBtn.style.backgroundColor = '#e6d7c4';
        this.expandBtn.style.borderColor = '#d4c4a8';
        this.expandBtn.style.boxShadow = '0 2px 8px rgba(93, 78, 55, 0.15)';
        this.expandBtn.style.transform = 'translateY(0)';
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

  private toggleSidebar(): void {
    if (this.isVisible) {
      this.hideSidebar();
    } else {
      this.showSidebar();
    }
  }
}

// Initialize the extension
new UniversalChatbotExtension();
