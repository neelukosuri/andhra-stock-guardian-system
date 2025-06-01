
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

interface SearchFiltersProps {
  selectedLedger: string;
  onLedgerChange: (ledger: string) => void;
  searchHistory: string[];
  onHistorySelect: (term: string) => void;
  onClearHistory: () => void;
  onClearFilters: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  selectedLedger,
  onLedgerChange,
  searchHistory,
  onHistorySelect,
  onClearHistory,
  onClearFilters
}) => {
  const { ledgers } = useData();

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Search Filters</span>
      </div>
      
      {/* Ledger Filter */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600">Filter by Ledger</label>
        <Select value={selectedLedger} onValueChange={onLedgerChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All ledgers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All ledgers</SelectItem>
            {ledgers.map((ledger) => (
              <SelectItem key={ledger.id} value={ledger.id}>
                {ledger.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Search History */}
      {searchHistory.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-600">Recent Searches</label>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearHistory}
              className="h-6 px-2 text-xs text-gray-500"
            >
              Clear
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {searchHistory.slice(0, 5).map((term, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-gray-200 text-xs"
                onClick={() => onHistorySelect(term)}
              >
                {term}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Clear All Filters */}
      {selectedLedger && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="w-full"
        >
          <X className="h-3 w-3 mr-1" />
          Clear Filters
        </Button>
      )}
    </div>
  );
};

export default SearchFilters;
