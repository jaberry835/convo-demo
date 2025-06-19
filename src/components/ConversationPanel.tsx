import React from 'react';
import MessageComponent from './MessageComponent';
import MessageInput from './MessageInput';
import './ConversationPanel.css';
import { Message } from '../types/conversation';

interface ConversationPanelProps {
  messages: Message[];
  isBotTyping: boolean;
  onSendMessage: (messageText: string) => Promise<void>;
  started: boolean;
}

const ConversationPanel: React.FC<ConversationPanelProps> = ({ messages, isBotTyping, onSendMessage, started }) => {
  return (
    <div className="conversation-panel">
      <div className="conversation-header">
        <h2>AI Negotiation Simulation</h2>
        {/* initiation controls moved to CopilotPanel */}
      </div>

      <div className="messages-container">
        {isBotTyping && <div className="bot-typing-indicator">SilverHawk is typing...</div>}
        {messages.map((m, i) => <MessageComponent key={i} message={m} />)}
      </div>

      <MessageInput onSendMessage={onSendMessage} disabled={!started} />
    </div>
  );
};

export default ConversationPanel;
