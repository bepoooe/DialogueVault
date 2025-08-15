import React, { useState, useEffect } from 'react';

interface ConversationTurn {
  index: number;
  type: 'user' | 'assistant';
  preview: string;
  element: HTMLElement;
}

interface SidebarProps {}

export const Sidebar: React.FC<SidebarProps> = () => {
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [isDesktop, setIsDesktop] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    // Listen for messages from content script
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'DIALOGUEVAULT_UPDATE_TURNS') {
        setTurns(event.data.turns);
        setIsDesktop(event.data.isDesktop);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleTurnClick = (index: number) => {
    setSelectedIndex(index);
    
    // Send message to content script to scroll
    window.parent.postMessage({
      type: 'DIALOGUEVAULT_SCROLL_TO_TURN',
      index
    }, '*');
  };

  const handleClose = () => {
    window.parent.postMessage({
      type: 'DIALOGUEVAULT_CLOSE_SIDEBAR'
    }, '*');
  };

  return (
    <div className="dialoguevault-sidebar">
      <div className="dialoguevault-header">
        <div className="dialoguevault-title-container">
          <img 
            src="/logo2.png" 
            alt="DialogueVault Logo" 
            className="dialoguevault-logo"
          />
          <div className="dialoguevault-title">DialogueVault</div>
        </div>
        <button className="dialoguevault-close-btn" onClick={handleClose} title="Close sidebar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
      
      <div className="dialoguevault-content">
        {turns.length === 0 ? (
          <div className="dialoguevault-empty">
            <p>No conversation detected</p>
            <p className="dialoguevault-empty-subtitle">
              Navigate your conversation with the sidebar index once you start chatting
            </p>
          </div>
        ) : (
          <div className="dialoguevault-turns">
            {turns.map((turn, index) => (
              <div
                key={index}
                className={`dialoguevault-turn ${turn.type} ${
                  selectedIndex === index ? 'selected' : ''
                }`}
                onClick={() => handleTurnClick(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTurnClick(index);
                  }
                }}
              >
                <div className="dialoguevault-turn-header">
                  <span className="dialoguevault-turn-number">
                    {index + 1}
                  </span>
                  <span className="dialoguevault-turn-type">
                    {turn.type === 'user' ? 'You' : 'Assistant'}
                  </span>
                </div>
                <div className="dialoguevault-turn-preview">
                  {turn.preview}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="dialoguevault-footer">
        <div className="dialoguevault-shortcut">
          <div>Ctrl+Shift+I to toggle</div>
          <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '2px' }}>
            Ctrl+Shift+R to refresh
          </div>
        </div>
      </div>
    </div>
  );
};
