import React, { useState, useRef, useEffect } from 'react';
import { Send, ShieldAlert, CheckCheck, Landmark } from 'lucide-react';
import type { Message, ParentId } from '../types';
import { ToneMeter, analyzeTone } from './ToneMeter';

interface MessagesTabProps {
  messages: Message[];
  addMessage: (message: Message) => void;
  activeParent: ParentId;
  parentNames: { sarah: string; david: string };
}

export const MessagesTab: React.FC<MessagesTabProps> = ({ messages, addMessage, activeParent, parentNames }) => {
  const [inputText, setInputText] = useState('');
  const [showWarningModal, setShowWarningModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const analysis = analyzeTone(inputText);
    
    // If tone analysis indicates a negative tone, block and warn the user
    if (analysis.status === 'negative') {
      setShowWarningModal(true);
    } else {
      performSend(analysis.status);
    }
  };

  const performSend = (status: 'positive' | 'neutral' | 'negative') => {
    const newMsg: Message = {
      id: Date.now().toString(),
      senderId: activeParent,
      timestamp: new Date().toISOString(),
      text: inputText,
      toneScore: status,
      readBy: [activeParent]
    };
    addMessage(newMsg);
    setInputText('');
    setShowWarningModal(false);
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateLabel = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  };

  // Group messages by calendar date
  const groupedMessages: { [dateStr: string]: Message[] } = {};
  messages.forEach(msg => {
    const dateLabel = formatDateLabel(msg.timestamp);
    if (!groupedMessages[dateLabel]) {
      groupedMessages[dateLabel] = [];
    }
    groupedMessages[dateLabel].push(msg);
  });

  return (
    <div className="messages-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      {/* Informative Security Header */}
      <div 
        style={{ 
          background: 'var(--primary-glow)', 
          border: '1px solid var(--border-light)', 
          borderRadius: 'var(--border-radius-sm)', 
          padding: '8px 12px', 
          fontSize: '0.7rem', 
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '10px'
        }}
      >
        <Landmark size={14} className="text-primary" />
        <span><strong>Court-Certified Records</strong>: Messages are immutable, timestamped, and cannot be deleted or altered once sent.</span>
      </div>

      {/* Message List Panel */}
      <div 
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          paddingRight: '4px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {Object.keys(groupedMessages).map((dateLabel) => (
          <div key={dateLabel} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Date separator */}
            <div 
              style={{ 
                textAlign: 'center', 
                fontSize: '0.65rem', 
                color: 'var(--text-muted)', 
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                margin: '10px 0'
              }}
            >
              {dateLabel}
            </div>

            {/* Day Messages */}
            <div className="chat-bubble-container">
              {groupedMessages[dateLabel].map((msg) => {
                const isMe = msg.senderId === activeParent;
                const senderName = msg.senderId === 'sarah' ? parentNames.sarah : parentNames.david;
                const isReadByBoth = msg.readBy.includes('sarah') && msg.readBy.includes('david');

                return (
                  <div 
                    key={msg.id} 
                    className={`message-bubble-wrapper ${isMe ? 'right' : 'left'} ${msg.senderId}`}
                  >
                    <div className={`message-meta ${isMe ? 'right' : ''}`}>
                      <span className="message-sender-name">{senderName}</span>
                      <span>•</span>
                      <span>{formatTime(msg.timestamp)}</span>
                    </div>
                    
                    <div className="message-bubble">
                      {msg.text}
                    </div>

                    {isMe && (
                      <div className="message-status-bar">
                        {isReadByBoth ? (
                          <>
                            <CheckCheck size={12} style={{ color: 'var(--success)' }} />
                            <span>Read by {activeParent === 'sarah' ? parentNames.david : parentNames.sarah}</span>
                          </>
                        ) : (
                          <span>Sent</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* ToneMeter Advisor */}
      {inputText.trim() && <ToneMeter text={inputText} />}

      {/* Compose Row */}
      <div className="chat-input-panel">
        <div className="chat-input-row">
          <textarea
            className="chat-textarea"
            placeholder="Type your message here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button 
            className={`chat-send-btn ${!inputText.trim() ? 'disabled' : ''}`}
            onClick={handleSend}
            disabled={!inputText.trim()}
            aria-label="Send Message"
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* High Conflict Tone Warning Modal Sheet */}
      {showWarningModal && (
        <div className="modal-overlay" onClick={() => setShowWarningModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div 
              style={{ 
                color: 'var(--danger)', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '12px', 
                textAlign: 'center',
                padding: '10px 0'
              }}
            >
              <ShieldAlert size={48} />
              <h3 style={{ margin: 0, color: 'var(--danger)' }}>Communication Check</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                Our ToneMeter has detected words in this draft that could escalate conflict. Co-parenting messages may be reviewed in custody hearings.
              </p>
              
              <div 
                style={{ 
                  background: 'var(--danger-bg)', 
                  border: '1px solid hsla(0 75% 45% / 0.15)',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '12px',
                  width: '100%',
                  fontSize: '0.75rem',
                  color: 'var(--danger)',
                  textAlign: 'left',
                  margin: '10px 0'
                }}
              >
                <strong>Suggested Approach:</strong> Adjust absolute terms like <em>"always"</em> or <em>"never"</em> to objective facts, keeping the focus entirely on logistics or the children's needs.
              </div>

              <div style={{ display: 'flex', width: '100%', gap: '10px', marginTop: '10px' }}>
                <button 
                  className="form-submit-btn" 
                  style={{ background: 'var(--border-light)', color: 'var(--text-primary)', margin: 0 }}
                  onClick={() => setShowWarningModal(false)}
                >
                  Edit Message
                </button>
                <button 
                  className="form-submit-btn" 
                  style={{ background: 'var(--danger)', color: 'white', margin: 0 }}
                  onClick={() => performSend('negative')}
                >
                  Send Anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
