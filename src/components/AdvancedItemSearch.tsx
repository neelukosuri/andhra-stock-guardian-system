
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ItemAutocomplete from './ItemAutocomplete';
import SearchFilters from './SearchFilters';
import { useData } from '@/contexts/DataContext';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Clock, Search } from 'lucide-react';

interface AdvancedItemSearchProps {
  onItemSelect: (item: { id: string; name: string; code: string }) => void;
}

const AdvancedItemSearch: React.FC<AdvancedItemSearchProps> = ({ onItemSelect }) => {
  const { items, getLedgerById } = useData();
  const { searchHistory, addToHistory, clearHistory } = useSearchHistory();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLedger, setSelectedLedger] = useState('');
  const [filteredResults, setFilteredResults] = useState<Array<{ id: string; name: string; code: string }>>([]);

  // Filter items based on search term and selected ledger
  useEffect(() => {
    let filtered = items;

    // Filter by ledger if selected
    if (selectedLedger) {
      filtered = filtered.filter(item => item.ledgerId === selectedLedger);
    }

    // Filter by search term if provided
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchLower) ||
        item.code.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower)
      );
    }

    setFilteredResults(filtered.map(item => ({
      id: item.id,
      name: item.name,
      code: item.code
    })));
  }, [searchTerm, selectedLedger, items]);

  const handleItemSelect = (item: { id: string; name: string; code: string }) => {
    // Add search term to history if it was used
    if (searchTerm.trim()) {
      addToHistory(searchTerm);
    }
    
    onItemSelect(item);
    
    toast({
      title: "Item Selected",
      description: `Selected ${item.name} (${item.code})${selectedLedger ? ` from ${getLedgerById(selectedLedger)?.name}` : ''}`,
    });
  };

  const handleHistorySelect = (term: string) => {
    setSearchTerm(term);
  };

  const handleClearFilters = () => {
    setSelectedLedger('');
    setSearchTerm('');
  };

  return (
    <Card className="ap-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Advanced Item Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Search Input */}
        <ItemAutocomplete
          onItemSelect={handleItemSelect}
          placeholder="Search items with advanced filtering..."
          value={searchTerm}
          className="w-full"
        />

        {/* Search Filters */}
        <SearchFilters
          selectedLedger={selectedLedger}
          onLedgerChange={setSelectedLedger}
          searchHistory={searchHistory}
          onHistorySelect={handleHistorySelect}
          onClearHistory={clearHistory}
          onClearFilters={handleClearFilters}
        />

        {/* Search Results Summary */}
        {(searchTerm || selectedLedger) && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Found {filteredResults.length} items</span>
              {selectedLedger && (
                <Badge variant="secondary" className="text-xs">
                  {getLedgerById(selectedLedger)?.name}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {searchHistory.length > 0 && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <Clock className="h-3 w-3" />
              <span>Recent searches are saved locally</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedItemSearch;
