import React from 'react';
import { Allotment } from 'allotment';
import ConversationPanel from './components/ConversationPanel';
import CopilotPanel from './components/CopilotPanel';
import 'allotment/dist/style.css';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Azure AI Negotiation Assistant Demo</h1>
      </header>
      <div className="App-content">
        <Allotment defaultSizes={[60, 40]}>
          <Allotment.Pane minSize={300}>
            <ConversationPanel />
          </Allotment.Pane>
          <Allotment.Pane minSize={250}>
            <CopilotPanel />
          </Allotment.Pane>
        </Allotment>
      </div>
    </div>
  );
}

export default App;
