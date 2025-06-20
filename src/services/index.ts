import * as RAG from './aiServiceRAG';
import * as RAGAlt from './aiServiceRAG-alt';

// Toggle using environment variable
const useAlt = process.env.REACT_APP_USE_ALT_RAG === 'true';

// Export common functions, switching to alt implementation if flagged
export const retrieveContext = useAlt
  ? RAGAlt.retrieveContext
  : RAG.retrieveContext;

export const getSellerResponse = useAlt
  ? RAGAlt.getSellerResponse
  : RAG.getSellerResponse;

export const getSellerResponseSimple = useAlt
  ? RAGAlt.getSellerResponseSimple
  : RAG.getSellerResponseSimple;

export const getBuyerInitialMessage = useAlt
  ? RAGAlt.getBuyerInitialMessage
  : RAG.getBuyerInitialMessage;

export const getPatternAnalysisSuggestions = useAlt
  ? RAGAlt.getPatternAnalysisSuggestions
  : RAG.getPatternAnalysisSuggestions;

export const getSuggestionDetails = useAlt
  ? RAGAlt.getSuggestionDetails
  : RAG.getSuggestionDetails;

// Always use primary translation (no alt)
export const translateText = RAG.translateText;
