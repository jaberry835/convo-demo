import React, { useState } from 'react';
import { Allotment } from 'allotment';
import ConversationPanel from './components/ConversationPanel';
import CopilotPanel from './components/CopilotPanel';
import { Message } from './types/conversation';
import { getBuyerInitialMessage, getSellerResponse } from './services/aiServiceRAG';
import 'allotment/dist/style.css';
import './App.css';

const buyerOptions = ['ShadowWolf', 'LunarShopper', 'MoonBuyerX'];

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState(buyerOptions[0]);
  const [productDesc, setProductDesc] = useState('');
  const [started, setStarted] = useState(false);

  const initiateConversation = async () => {
    if (!productDesc.trim()) return;
    setMessages([]);
    setIsBotTyping(true);
    setStarted(true);
    const initialText = await getBuyerInitialMessage(selectedBuyer, productDesc);
    const buyerMsg: Message = {
      turn_order: 1,
      timestamp: new Date().toISOString(),
      role: 'Buyer',
      handle: selectedBuyer,
      message: initialText,
      negotiation_stage: 'initiation',
      coded_language: false,
      security_flags: { encrypted: false, pgp_key_exchanged: false },
      payment_details: null
    };
    setMessages([buyerMsg]);

    const reply = await getSellerResponse(selectedBuyer, productDesc, initialText);
    const sellerMsg: Message = {
      turn_order: 2,
      timestamp: new Date().toISOString(),
      role: 'Seller',
      handle: 'SilverHawk',
      message: reply,
      negotiation_stage: 'specification',
      coded_language: false,
      security_flags: { encrypted: false, pgp_key_exchanged: false },
      payment_details: null
    };
    setMessages([buyerMsg, sellerMsg]);
    setIsBotTyping(false);
  };

  const handleSendMessage = async (messageText: string) => {
    const newMessage: Message = {
      turn_order: messages.length + 1,
      timestamp: new Date().toISOString(),
      role: 'Buyer',
      handle: selectedBuyer,
      message: messageText,
      negotiation_stage: messages.length === 0 ? 'initiation' : 'in_progress',
      coded_language: false,
      security_flags: { encrypted: true, pgp_key_exchanged: true },
      payment_details: null
    };

    setMessages(prev => [...prev, newMessage]);
    setIsBotTyping(true);

    try {
      const botReply = await getSellerResponse(selectedBuyer, productDesc, messageText);
      const sellerMessage: Message = {
        turn_order: messages.length + 2,
        timestamp: new Date().toISOString(),
        role: 'Seller',
        handle: 'SilverHawk',
        message: botReply,
        negotiation_stage: 'specification',
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
    <div className="App">
      <header className="App-header">
        <h1>Azure AI Negotiation Assistant Demo</h1>
      </header>
      <div className="App-content">
        <Allotment defaultSizes={[60, 40]}>
          <Allotment.Pane minSize={300}>
            <ConversationPanel
              messages={messages}
              isBotTyping={isBotTyping}
              onSendMessage={handleSendMessage}
              started={started}
            />
          </Allotment.Pane>
          <Allotment.Pane minSize={250}>
            <CopilotPanel
              buyerOptions={buyerOptions}
              selectedBuyer={selectedBuyer}
              setSelectedBuyer={setSelectedBuyer}
              productDesc={productDesc}
              setProductDesc={setProductDesc}
              initiateConversation={initiateConversation}
              started={started}
            />
          </Allotment.Pane>
        </Allotment>
      </div>
    </div>
  );
}

export default App;
