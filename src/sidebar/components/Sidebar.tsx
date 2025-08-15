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
      if (event.data.type === 'WAYGPT_UPDATE_TURNS') {
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
      type: 'WAYGPT_SCROLL_TO_TURN',
      index
    }, '*');
  };

  const handleClose = () => {
    window.parent.postMessage({
      type: 'WAYGPT_CLOSE_SIDEBAR'
    }, '*');
  };

  return (
    <div className="waygpt-sidebar">
      <div className="waygpt-content">
        {turns.length === 0 ? (
          <div className="waygpt-empty">
            <p>No conversation found</p>
            <p className="waygpt-empty-subtitle">
              Start a conversation with ChatGPT to see the navigation index
            </p>
          </div>
        ) : (
          <div className="waygpt-turns">
            {turns.map((turn, index) => (
              <div
                key={index}
                className={`waygpt-turn ${turn.type} ${
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
                <div className="waygpt-turn-header">
                  <span className="waygpt-turn-number">
                    {index + 1}
                  </span>
                  <span className="waygpt-turn-type">
                    {turn.type === 'user' ? '👤' : '🤖'}
                  </span>
                </div>
                <div className="waygpt-turn-preview">
                  {turn.preview}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="waygpt-footer">
        <div className="waygpt-shortcut">
          Press Ctrl+Shift+I to toggle
        </div>
      </div>
    </div>
  );
};
