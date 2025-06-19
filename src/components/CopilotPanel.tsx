import React, { useState, useMemo } from 'react';
import { Suggestion, Message } from '../types/conversation';
import { getPatternAnalysisSuggestions } from '../services/aiServiceRAG';
import SuggestionCard from './SuggestionCard';
import './CopilotPanel.css';

interface CopilotPanelProps {
  buyerOptions: string[];
  selectedBuyer: string;
  setSelectedBuyer: React.Dispatch<React.SetStateAction<string>>;
  productDesc: string;
  setProductDesc: React.Dispatch<React.SetStateAction<string>>;
  initiateConversation: () => Promise<void>;
  started: boolean;
  messages: Message[];
  setDraftMessage: React.Dispatch<React.SetStateAction<string>>; // New prop for prefilling input
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
  , setDraftMessage
}) => {
  // Pattern analysis suggestions and loading state
  const [patternSuggestions, setPatternSuggestions] = useState<Suggestion[]>([]);
  const [patternLoading, setPatternLoading] = useState(false);
  const [patternError, setPatternError] = useState<string>('');

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

  // Refresh only pattern analysis section
  const handleRefreshPattern = () => {
    setPatternError('');
    setPatternLoading(true);
    getPatternAnalysisSuggestions(messages)
      .then(s => setPatternSuggestions(s))
      .catch((err) => {
        console.error('Pattern analysis fetch error:', err);
        setPatternSuggestions([]);
        setPatternError(err?.message || 'Error fetching pattern analysis.');
      })
      .finally(() => setPatternLoading(false));
  };

  return (
    <div className="copilot-panel">
      <div className="copilot-header">
        <h2>AI Negotiation Assistant</h2>
        <button 
          className="refresh-btn"
          onClick={handleRefreshPattern}
          disabled={!started || patternLoading}
        >
          {patternLoading ? 'Analyzing Patterns...' : 'Refresh Patterns'}
        </button>
      </div>

      {patternError && (
        <div className="pattern-error">
          {patternError}
        </div>
      )}

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
              <span className={`status-dot ${patternLoading ? 'analyzing' : 'ready'}`}></span>
              {patternLoading ? 'Analyzing patterns...' : 'Pattern analysis complete'}
            </div>
          </div>

          <div className="suggestions-container">
            {patternLoading ? (
               <div className="loading-placeholder">
                 <div className="loading-spinner"></div>
                <p>Generating pattern analysis via RAG + OpenAI...</p>
               </div>
            ) : (
              patternSuggestions.length > 0 ? (
                patternSuggestions.map(suggestion => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onRefresh={handleRefreshPattern}
                    isRefreshing={patternLoading}
                    onSelectAction={text => setDraftMessage(text)}
                  />
                ))
              ) : (
                <div className="placeholder">
                  Click 'Refresh Patterns' to generate AI-powered negotiation suggestions for the buyer.
                </div>
              )
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
