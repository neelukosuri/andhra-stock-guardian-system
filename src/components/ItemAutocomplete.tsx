
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import { useData } from '@/contexts/DataContext';
import { useApi } from '@/hooks/useApi';
import { SearchIcon, Loader } from 'lucide-react';

interface ItemAutocompleteProps {
  onItemSelect: (item: { id: string; name: string; code: string }) => void;
  placeholder?: string;
  value?: string;
  className?: string;
}

const ItemAutocomplete: React.FC<ItemAutocompleteProps> = ({
  onItemSelect,
  placeholder = "Search items...",
  value = "",
  className = ""
}) => {
  const { items } = useData();
  const { get, isLoading } = useApi();
  const [searchTerm, setSearchTerm] = useState(value);
  const [suggestions, setSuggestions] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Search items based on debounced search term
  useEffect(() => {
    const searchItems = async () => {
      if (debouncedSearchTerm.trim().length > 0) {
        try {
          // Try to fetch from API first, fallback to local data
          const apiResults = await get(`/items/search?q=${encodeURIComponent(debouncedSearchTerm)}&limit=10`);
          setSuggestions(apiResults);
          setIsOpen(apiResults.length > 0);
        } catch (error) {
          // Fallback to local search if API fails
          console.log('API search failed, using local data');
          const filteredItems = items
            .filter(item => 
              item.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
              item.code.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
            )
            .slice(0, 10);
            
          setSuggestions(filteredItems);
          setIsOpen(filteredItems.length > 0);
        }
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    };

    searchItems();
  }, [debouncedSearchTerm, items, get]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleItemSelection = (item: { id: string; name: string; code: string }) => {
    setSearchTerm(item.name);
    setIsOpen(false);
    onItemSelect(item);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className={`pl-9 ${className}`}
        />
        {isLoading && (
          <Loader className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-500" />
        )}
      </div>
      
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((item) => (
            <button
              key={item.id}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
              onClick={() => handleItemSelection(item)}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{item.name}</span>
                <span className="text-sm text-gray-500">{item.code}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ItemAutocomplete;
