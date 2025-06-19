import React, { useState, useEffect } from 'react';
import { Suggestion } from '../types/conversation';
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
}

const CopilotPanel: React.FC<CopilotPanelProps> = ({
  buyerOptions,
  selectedBuyer,
  setSelectedBuyer,
  productDesc,
  setProductDesc,
  initiateConversation,
  started
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Sample suggestions based on the negotiation stage
  const sampleSuggestions: Suggestion[] = [
    {
      id: '1',
      type: 'pattern_analysis',
      title: 'Similar Conversation Pattern Detected',
      content: 'This conversation follows a typical "premium product verification" pattern. In 78% of similar cases, buyers who emphasize quality concerns at this stage successfully negotiate 10-15% price reductions.',
      confidence: 0.85,
      action_items: [
        'Ask for product certification details',
        'Request third-party quality verification',
        'Inquire about bulk pricing options'
      ]
    },
    {
      id: '2',
      type: 'negotiation_tactic',
      title: 'Leverage Escrow Service Discussion',
      content: 'The seller mentioned a specific escrow service (ES-001). This creates an opportunity to negotiate transaction fees or suggest alternative escrow services with better terms.',
      confidence: 0.72,
      action_items: [
        'Research ES-001 fee structure',
        'Propose alternative escrow services',
        'Negotiate who pays escrow fees'
      ]
    },
    {
      id: '3',
      type: 'risk_assessment',
      title: 'Communication Security Analysis',
      content: 'Both parties are emphasizing secure communication. This suggests high-value transaction expectations. Consider this when positioning your price negotiations.',
      confidence: 0.91,
      action_items: [
        'Maintain professional security language',
        'Use this as leverage for bulk discounts',
        'Position yourself as a serious, long-term client'
      ]
    },
    {
      id: '4',
      type: 'next_move',
      title: 'Recommended Next Response',
      content: 'Based on the current stage (specification), the optimal next move is to acknowledge their quality standards while introducing a volume-based pricing inquiry.',
      confidence: 0.88,
      action_items: [
        'Acknowledge their quality standards',
        'Ask about volume pricing tiers',
        'Request sample for verification'
      ]
    }
  ];
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

  const handleRefreshSuggestions = () => {
    setIsAnalyzing(true);
    setSuggestions([]);
    
    // Simulate new analysis
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
          {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
        </button>
      </div>

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
              <>
                {suggestions.length === 0 ? (
                  <div className="no-suggestions">
                    <p>No suggestions available. Continue the conversation to get more insights.</p>
                  </div>
                ) : (
                  suggestions.map(suggestion => (
                    <SuggestionCard 
                      key={suggestion.id} 
                      suggestion={suggestion} 
                    />
                  ))
                )}
              </>
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
