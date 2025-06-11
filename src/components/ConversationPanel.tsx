import React, { useState, useEffect } from 'react';
import { ConversationData, Message } from '../types/conversation';
import MessageComponent from './MessageComponent';
import MessageInput from './MessageInput';
import './ConversationPanel.css';
import { getSellerResponse } from '../services/aiServiceRAG';

const ConversationPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStage, setCurrentStage] = useState<string>('initiation');
  const [isBotTyping, setIsBotTyping] = useState<boolean>(false);

  // Sample data from your example
  const sampleConversation: ConversationData = {
    conversation_id: "conv_demo_011",
    turns: [
      {
        turn_order: 1,
        timestamp: "2025-06-20T08:01:00",
        role: "Buyer",
        handle: "ShadowWolf",
        message: "Hey there, I hope this message finds you well. I'm reaching out to discuss acquiring some of your moonlight serum. Heard great things about it, and I'm quite intrigued. \n\nI'd like to propose a price of 0.05 BTC per unit for 2 units, assuming everything checks out on your end. I'm using secure communication to keep things clear and private—let me know if you're open to discussing terms further. \n\nLooking forward to hearing your thoughts!",
        negotiation_stage: "initiation",
        coded_language: true,
        security_flags: {
          encrypted: true,
          pgp_key_exchanged: true
        },
        payment_details: null
      },
      {
        turn_order: 2,
        timestamp: "2025-06-20T08:04:00",
        role: "Seller",
        handle: "SilverHawk",
        message: "Greetings, ShadowWolf, \n\nThank you for your interest in the Moonlight Serum. I am pleased to confirm that the serum is currently available and meets the highest standards of quality, sourced and refined under strict guidelines to ensure reliability and consistency. Each batch undergoes rigorous testing protocols to ensure it aligns with our premium grade specifications. \n\nFor the transaction, we use a secure simulated escrow service, identified as ES-001. This service is designed to protect both parties throughout the negotiation and exchange process. Kindly confirm your secure contact details so we can proceed with the next steps of verification and communication regarding this transaction. \n\nPlease let me know if you require further details or assurances regarding the product or the escrow service. I remain at",
        negotiation_stage: "specification",
        coded_language: true,
        security_flags: {
          encrypted: true,
          pgp_key_exchanged: true
        },
        payment_details: {
          escrow_id: "ES-001",
          crypto_wallet_requested: true
        }
      }
    ],
    outcome: "in_progress"
  };
  // Initialize with sample data on component mount
  React.useEffect(() => {
    setMessages(sampleConversation.turns);
    if (sampleConversation.turns.length > 0) {
      setCurrentStage(sampleConversation.turns[sampleConversation.turns.length - 1].negotiation_stage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMessage = async (messageText: string) => {
    const newMessage: Message = {
      turn_order: messages.length + 1,
      timestamp: new Date().toISOString(),
      role: "Buyer",
      handle: "ShadowWolf",
      message: messageText,
      negotiation_stage: currentStage,
      coded_language: false,
      security_flags: {
        encrypted: true,
        pgp_key_exchanged: true
      },
      payment_details: null
    };

    setMessages(prev => [...prev, newMessage]);
    setIsBotTyping(true);

    try {
      const botReply = await getSellerResponse(messageText);
      const sellerMessage: Message = {
        turn_order: messages.length + 2,
        timestamp: new Date().toISOString(),
        role: 'Seller',
        handle: 'SilverHawk',
        message: botReply,
        negotiation_stage: currentStage,
        coded_language: false,
        security_flags: { encrypted: true, pgp_key_exchanged: true },
        payment_details: null
      };
      setMessages(prev => [...prev, sellerMessage]);
    } catch (error) {
      console.error('Error fetching seller response:', error);
    } finally {
      setIsBotTyping(false);
    }
  };

  return (
    <div className="conversation-panel">
      <div className="conversation-header">
        <h2>Negotiation Conversation</h2>
        <div className="conversation-info">
          <span className="stage-indicator">Stage: {currentStage}</span>
          <span className="message-count">{messages.length} messages</span>
        </div>
      </div>
      
      <div className="messages-container">
        {isBotTyping && (
          <div className="bot-typing-indicator">SilverHawk is typing...</div>
        )}
        {messages.map((message, index) => (
          <MessageComponent 
            key={`${message.turn_order}-${index}`} 
            message={message} 
          />
        ))}
      </div>
      
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ConversationPanel;
