import React, { useState, useEffect, useMemo } from 'react';
import { Suggestion, Message } from '../types/conversation';
import SuggestionCard from './SuggestionCard';
import './CopilotPanel.css';

// Static sample data for all sections
const sampleSuggestions: Suggestion[] = [
  { id: '1', type: 'pattern_analysis', title: 'Similar Conversation Pattern Detected', content: '', confidence: 0.85,
    action_items: ['Ask for product certification details', 'Request third-party quality verification','Inquire about bulk pricing options']
  },
  { id: '2', type: 'negotiation_tactic', title: 'Leverage Escrow Service Discussion', content: 'The seller mentioned ES-001 escrow; use this to negotiate fees.', confidence: 0.72,
    action_items: ['Research ES-001 fee structure', 'Propose alternative escrow services', 'Negotiate who pays escrow fees']
  },
  { id: '3', type: 'risk_assessment', title: 'Communication Security Analysis', content: 'Secure channel detected; leverage this to ask for volume discounts.', confidence: 0.91,
    action_items: ['Maintain professional security language', 'Use leverage for bulk discounts','Position as long-term client']
  },
  { id: '4', type: 'next_move', title: 'Recommended Next Response', content: 'Acknowledge quality standards, then ask about volume tiers.', confidence: 0.88,
    action_items: ['Acknowledge quality standards', 'Ask about volume pricing tiers','Request sample for verification']
  }
];

interface CopilotPanelProps {
  buyerOptions: string[];
  selectedBuyer: string;
  setSelectedBuyer: React.Dispatch<React.SetStateAction<string>>;
  productDesc: string;
  setProductDesc: React.Dispatch<React.SetStateAction<string>>;
  initiateConversation: () => Promise<void>;
  started: boolean;
  messages: Message[];
}

const CopilotPanel: React.FC<CopilotPanelProps> = ({
  buyerOptions,
  selectedBuyer,
  setSelectedBuyer,
  productDesc,
  setProductDesc,
  initiateConversation,
  started,
  messages
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(sampleSuggestions);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [refreshingIds, setRefreshingIds] = useState<Record<string, boolean>>({});

  // Detect crypto amounts and estimate USD
  const conversion = useMemo(() => {
    const regex = /([0-9]+(?:\.[0-9]+)?)\s*(BTC|ETH)/i;
    // Find the latest crypto mention by scanning messages in reverse
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      const match = msg.message.match(regex);
      if (match) {
        const amount = parseFloat(match[1]);
        const currency = match[2].toUpperCase();
        const rates: Record<string, number> = { BTC: 60000, ETH: 3500 };
        const usd = (amount * (rates[currency] || 0)).toFixed(2);
        return `${amount} ${currency} ≈ $${usd}`;
      }
    }
    return '';
  }, [messages]);

  useEffect(() => {
    // Simulate AI analysis loading
    setIsAnalyzing(true);
    const timer = setTimeout(() => {
      setSuggestions(sampleSuggestions);
      setIsAnalyzing(false);
    }, 1500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh all suggestions
  const handleRefreshSuggestions = () => {
    setIsAnalyzing(true);
    setSuggestions([]);
    setTimeout(() => {
      setSuggestions(sampleSuggestions);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="copilot-panel">
      <div className="copilot-header">
        <h2>AI Negotiation Assistant</h2>
        <button 
          className="refresh-btn"
          onClick={handleRefreshSuggestions}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? 'Analyzing...' : 'Refresh All Analysis'}
        </button>
      </div>

      {conversion && (
        <div className="conversion-display">
          <strong>Estimated USD:</strong> {conversion}
        </div>
      )}

      {/* initiation controls now in CopilotPanel */}
      {!started && (
        <div className="initiation-controls">
          <select
            aria-label="Select buyer"
            value={selectedBuyer}
            onChange={e => setSelectedBuyer(e.target.value)}
          >
            {buyerOptions.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <input
            type="text"
            placeholder="Describe the product"
            value={productDesc}
            onChange={e => setProductDesc(e.target.value)}
          />
          <button
            className="initiate-btn"
            onClick={initiateConversation}
            disabled={!productDesc.trim()}
          >
            Initiate Conversation
          </button>
        </div>
      )}

      {!started ? (
        <div className="initiation-placeholder">
          Start a negotiation to see AI-powered insights and recommendations.
        </div>
      ) : (
        <>
          <div className="analysis-status">
            <div className="status-indicator">
              <span className={`status-dot ${isAnalyzing ? 'analyzing' : 'ready'}`}></span>
              {isAnalyzing ? 'Analyzing conversation patterns...' : 'Analysis complete'}
            </div>
          </div>

          <div className="suggestions-container">
            {isAnalyzing ? (
              <div className="loading-placeholder">
                <div className="loading-spinner"></div>
                <p>Analyzing conversation using Azure AI Search and OpenAI...</p>
              </div>
            ) : (
              suggestions.map(suggestion => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  isRefreshing={!!refreshingIds[suggestion.id]}
                  onRefresh={() => {
                    setRefreshingIds(prev => ({ ...prev, [suggestion.id]: true }));
                    setTimeout(() => {
                      setRefreshingIds(prev => ({ ...prev, [suggestion.id]: false }));
                    }, 1000);
                  }}
                />
              ))
            )}
          </div>
        </>
      )}

      <div className="copilot-footer">
        <div className="power-indicator">
          <span>Powered by Azure OpenAI + AI Search</span>
        </div>
      </div>
    </div>
  );
};

export default CopilotPanel;
