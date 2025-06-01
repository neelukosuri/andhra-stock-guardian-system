
// Mock API server to simulate backend search endpoint
import { Item } from '@/types';

interface SearchResponse {
  items: Array<{ id: string; name: string; code: string }>;
  total: number;
  limit: number;
  query: string;
}

// Mock database of items for search simulation
const mockItems: Item[] = [
  { id: '1', name: 'Office Chair', code: 'OFC001', description: 'Ergonomic office chair', ledgerId: '1' },
  { id: '2', name: 'Desk Lamp', code: 'DSK002', description: 'LED desk lamp', ledgerId: '1' },
  { id: '3', name: 'Printer Paper', code: 'PPR003', description: 'A4 printing paper', ledgerId: '2' },
  { id: '4', name: 'Stapler', code: 'STP004', description: 'Heavy duty stapler', ledgerId: '1' },
  { id: '5', name: 'File Cabinet', code: 'FLC005', description: '4-drawer file cabinet', ledgerId: '1' },
  { id: '6', name: 'Computer Monitor', code: 'MON006', description: '24 inch LCD monitor', ledgerId: '3' },
  { id: '7', name: 'Keyboard', code: 'KBD007', description: 'Wireless keyboard', ledgerId: '3' },
  { id: '8', name: 'Mouse', code: 'MSE008', description: 'Optical mouse', ledgerId: '3' },
];

// Mock search endpoint implementation
export const mockSearchEndpoint = async (query: string, limit: number = 10): Promise<SearchResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  console.log(`[Mock API] Searching for: "${query}" with limit: ${limit}`);
  
  if (!query.trim()) {
    return {
      items: [],
      total: 0,
      limit,
      query
    };
  }
  
  // Case-insensitive search implementation
  const searchTerm = query.toLowerCase();
  const filteredItems = mockItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm) ||
    item.code.toLowerCase().includes(searchTerm) ||
    item.description.toLowerCase().includes(searchTerm)
  );
  
  // Apply result limiting
  const limitedResults = filteredItems.slice(0, limit);
  
  console.log(`[Mock API] Found ${filteredItems.length} items, returning ${limitedResults.length}`);
  
  // Return simplified item structure for autocomplete
  const searchResults = limitedResults.map(item => ({
    id: item.id,
    name: item.name,
    code: item.code
  }));
  
  return {
    items: searchResults,
    total: filteredItems.length,
    limit,
    query
  };
};

// Enhanced error simulation for testing
export const simulateApiError = (errorType: 'network' | 'server' | 'notfound' = 'network') => {
  switch (errorType) {
    case 'network':
      throw new Error('TypeError: Failed to fetch');
    case 'server':
      throw new Error('HTTP error! status: 500');
    case 'notfound':
      throw new Error('HTTP error! status: 404');
    default:
      throw new Error('Unknown error occurred');
  }
};
