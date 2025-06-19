import OpenAI from 'openai';
import { SearchClient, AzureKeyCredential } from '@azure/search-documents';
import { Message } from '../types/conversation';

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
export async function getSellerResponse(
  buyer: string,
  product: string,
  buyerMessage: string,
  conversationHistory: Message[] = []
): Promise<string> {
  try {
    // First, retrieve relevant context from Azure Search
    const contexts = await retrieveContext(buyerMessage);
    
    // Construct chat messages including history for context
    const messages = [
      { role: "system" as const,
        content: `You are SilverHawk, a seller of premium ${product}. Reply in a friendly, conversational style to ${buyer}. Use the grounding info to answer questions casually and clearly. Keep it concise. Whenever mentioning price, quote all amounts in cryptocurrency (e.g., BTC). If the buyer indicates they have sent BTC to your wallet, acknowledge receipt and proceed to finalize the sale.
+
+Info from past chats:
+${contexts.length > 0 ? contexts.join('\n\n') : 'No past chat data.'}` },
      // Include prior conversation messages
      ...conversationHistory.map(h => ({
        role: h.role === 'Buyer' ? 'user' : 'assistant',
        content: h.message
      })),
      // Latest buyer message
      { role: "user" as const, content: buyerMessage }
    ];

    // Bypass TypeScript overload mismatch by ignoring type check
    // @ts-ignore
    const result = await openaiClient.chat.completions.create({
      model: openaiDeployment,
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 500,
    });

    const chatChoice = result.choices[0];
    return chatChoice.message?.content?.trim() ||
      "Sorry, I'm having trouble responding right now. Could you ask again?";
  } catch (error) {
    console.error("Error generating seller response:", error);
    return "Hey! I'm having some issues. Please bear with me, and I'll get back shortly.";
  }
}

/**
 * Alternative fallback function that generates responses without RAG if search fails
 */
export async function getSellerResponseSimple(buyerMessage: string): Promise<string> {
  try {
    // Simplified fallback uses only the latest buyer message
    const messages = [
      { 
        role: "system" as const, 
        content: `You are SilverHawk, a professional seller of premium Moonlight Serum. Maintain a professional yet personable tone. Whenever mentioning price, quote all amounts in cryptocurrency (e.g., BTC). If the buyer indicates they have sent BTC to your wallet, acknowledge receipt and finalize the sale.`,
      },
      { role: "user" as const, content: buyerMessage }
    ];

    const result = await openaiClient.chat.completions.create({
       model: openaiDeployment,
       messages: messages as any,
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

/**
 * Generate the buyer's initial message expressing interest in a product using LLM.
 */
export async function getBuyerInitialMessage(
  buyer: string,
  product: string
): Promise<string> {
  try {
    const messages = [
      {
        role: 'system' as const,
        content: `You are ${buyer}, a buyer interested in ${product}. Write a quick, friendly chat message expressing interest and asking for details. Keep it casual and conversational, like a chat. When discussing price, quote all amounts in cryptocurrency (e.g., BTC).`
      }
    ];

    const result = await openaiClient.chat.completions.create({
      model: openaiDeployment,
      messages,
      temperature: 0.7,
      max_tokens: 200
    });

    return result.choices[0].message?.content?.trim() ||
      `Hi, I'm interested in ${product}. Can you share more details so we can chat further?`;
  } catch (err) {
    console.error('Error generating buyer initial message:', err);
    return `Hi, I'm interested in ${product}. Can you share more details?`;
  }
}
