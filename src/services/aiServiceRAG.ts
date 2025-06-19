import OpenAI from 'openai';
import { SearchClient, AzureKeyCredential } from '@azure/search-documents';

// Load configuration from environment variables (set in .env)
const openaiEndpoint = process.env.REACT_APP_OPENAI_ENDPOINT!;
const openaiApiKey = process.env.REACT_APP_OPENAI_API_KEY!;
const openaiDeployment = process.env.REACT_APP_OPENAI_DEPLOYMENT!;
const searchEndpoint = process.env.REACT_APP_AZURE_SEARCH_ENDPOINT!;
const searchApiKey = process.env.REACT_APP_AZURE_SEARCH_API_KEY!;
const searchIndexName = process.env.REACT_APP_SEARCH_INDEX_NAME!;

// Initialize Azure AI Search client
const searchClient = new SearchClient(
  searchEndpoint,
  searchIndexName,
  new AzureKeyCredential(searchApiKey)
);

// Initialize OpenAI client for Azure (browser-compatible)
const openaiClient = new OpenAI({
  apiKey: openaiApiKey,
  dangerouslyAllowBrowser: true,
  baseURL: `${openaiEndpoint}/openai/deployments/${openaiDeployment}`,
  defaultQuery: { 'api-version': '2024-02-15-preview' },
  defaultHeaders: {
    'api-key': openaiApiKey,
  },
});

/**
 * Perform a search on the Azure Cognitive Search index to retrieve relevant context.
 */
async function retrieveContext(query: string, topK: number = 5): Promise<string[]> {
  try {
    const results = await searchClient.search(query, {
      top: topK,
      select: ['content', 'message', 'role', 'negotiation_stage'], // Adjust based on your index schema
    });

    const contexts: string[] = [];
    for await (const result of results.results) {
      if (result.document) {
        // Format the context in a way that's useful for the AI
        const doc = result.document as Record<string, any>;
        const contextStr = JSON.stringify({
          content: doc.content || doc.message || '',
          role: doc.role || '',
          stage: doc.negotiation_stage || '',
          score: result.score
        });
        contexts.push(contextStr);
      }
    }
    return contexts;
  } catch (error) {
    console.error('Error retrieving context from Azure Search:', error);
    return []; // Return empty array if search fails
  }
}
export async function getSellerResponse(buyerMessage: string): Promise<string> {
  try {
    // First, retrieve relevant context from Azure Search
    const contexts = await retrieveContext(buyerMessage);
    
    const messages = [
      { 
        role: "system" as const, 
        content: `You are SilverHawk, a professional seller of premium Moonlight Serum. 
        You should respond to buyer inquiries with helpful, secure, and persuasive responses. 
        Use the following grounding data from previous conversations to inform your responses. 
        Maintain a professional tone while being personable and trustworthy.
        
        Grounding Data from Previous Conversations:
        ${contexts.length > 0 ? contexts.join('\n\n') : 'No previous conversation data available.'}` 
      },
      { 
        role: "user" as const, 
        content: buyerMessage 
      }
    ];

    // Use standard OpenAI chat completion with Azure endpoint
    const result = await openaiClient.chat.completions.create({
      model: openaiDeployment,
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const chatChoice = result.choices[0];
    return chatChoice.message?.content?.trim() || "I apologize, but I'm having trouble processing your request right now. Please try again.";
    
  } catch (error) {
    console.error("Error generating seller response:", error);
    
    // Fallback response if Azure services are unavailable
    return "Thank you for your message. I'm currently experiencing some technical difficulties. Please allow me a moment to get back to you with a proper response.";
  }
}

/**
 * Alternative fallback function that generates responses without RAG if search fails
 */
export async function getSellerResponseSimple(buyerMessage: string): Promise<string> {
  try {
    const messages = [
      { 
        role: "system" as const, 
        content: `You are SilverHawk, a professional seller of premium Moonlight Serum. 
        You should respond to buyer inquiries with helpful, secure, and persuasive responses. 
        Maintain a professional tone while being personable and trustworthy.` 
      },
      { 
        role: "user" as const, 
        content: buyerMessage 
      }
    ];

    const result = await openaiClient.chat.completions.create({
      model: openaiDeployment,
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const chatChoice = result.choices[0];
    return chatChoice.message?.content?.trim() || "I apologize, but I'm having trouble processing your request right now. Please try again.";
    
  } catch (error) {
    console.error("Error generating seller response:", error);
    return "Thank you for your message. I'm currently experiencing some technical difficulties. Please allow me a moment to get back to you with a proper response.";
  }
}
