import React from 'react';
import MessageComponent from './MessageComponent';
import MessageInput from './MessageInput';
import './ConversationPanel.css';
import { Message } from '../types/conversation';

// Utility to pick badge color based on negotiation stage
const stageColors: Record<string, string> = {
  initiation: '#007bff',
  specification: '#28a745',
  payment: '#ffc107',
  finalization: '#17a2b8',
  offer_extra: '#6f42c1'
};

interface ConversationPanelProps {
  messages: Message[];
  isBotTyping: boolean;
  onSendMessage: (messageText: string) => Promise<void>;
  started: boolean;
}

const ConversationPanel: React.FC<ConversationPanelProps> = ({ messages, isBotTyping, onSendMessage, started }) => {
  const currentStage = messages.length > 0 ? messages[messages.length - 1].negotiation_stage : '';
  return (
    <div className="conversation-panel">
      <div className="conversation-header">
        <h2>AI Negotiation Simulation</h2>
        {/* initiation controls moved to CopilotPanel */}
      </div>
      {started && currentStage && (
        <div className="stage-display">
          <span className="stage-label">Negotiation Stage:</span>
          <span className={`stage-badge ${currentStage}`}>{currentStage}</span>
        </div>
      )}

      <div className="messages-container">
        {isBotTyping && <div className="bot-typing-indicator">SilverHawk is typing...</div>}
        {messages.map((m, i) => <MessageComponent key={i} message={m} />)}
      </div>

      <MessageInput onSendMessage={onSendMessage} disabled={!started} />
    </div>
  );
};

export default ConversationPanel;
