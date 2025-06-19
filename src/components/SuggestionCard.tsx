import React, { useState } from 'react';
import { Suggestion } from '../types/conversation';
import './SuggestionCard.css';

interface SuggestionCardProps {
  suggestion: Suggestion;
  onRefresh?: () => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, onRefresh }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      'pattern_analysis': '🔍',
      'negotiation_tactic': '💡',
      'risk_assessment': '⚠️',
      'next_move': '🎯'
    };
    return icons[type] || '📋';
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'pattern_analysis': '#007bff',
      'negotiation_tactic': '#28a745',
      'risk_assessment': '#dc3545',
      'next_move': '#6f42c1'
    };
    return colors[type] || '#6c757d';
  };

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    return 'low';
  };

  return (
    <div className={`suggestion-card ${suggestion.type}`}>
      <div className="suggestion-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="suggestion-title">
          <span 
            className="type-icon"
            style={{ color: getTypeColor(suggestion.type) }}
          >
            {getTypeIcon(suggestion.type)}
          </span>
          <h3>{suggestion.title}</h3>
        </div>
        <div className="suggestion-controls">
          <div className={`confidence-badge ${getConfidenceLevel(suggestion.confidence)}`}>
            {Math.round(suggestion.confidence * 100)}% confidence
          </div>
          {onRefresh && (
            <button
              className="refresh-link"
              onClick={(e) => { e.stopPropagation(); onRefresh(); }}
              title="Refresh this suggestion"
            >
              🔄
            </button>
          )}
          <button className={`expand-btn ${isExpanded ? 'expanded' : ''}`}>
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="suggestion-body">
          <div className="suggestion-content">
            <p>{suggestion.content}</p>
          </div>
          
          {suggestion.action_items.length > 0 && (
            <div className="action-items">
              <h4>Recommended Actions:</h4>
              <ul>
                {suggestion.action_items.map((item, index) => (
                  <li key={index}>
                    <span className="action-bullet">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="suggestion-footer">
            <div className="suggestion-actions">
              <button className="action-btn primary">Apply Suggestion</button>
              <button className="action-btn secondary">Save for Later</button>
              <button className="action-btn tertiary">Get More Details</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuggestionCard;
