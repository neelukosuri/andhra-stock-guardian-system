
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import { useData } from '@/contexts/DataContext';
import { useApi } from '@/hooks/useApi';
import { SearchIcon, Loader, AlertCircle } from 'lucide-react';
import { sanitizeInput } from '@/lib/validation';
import { ValidationError, RateLimitError } from '@/lib/errorTypes';

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
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Search items based on debounced search term
  useEffect(() => {
    const searchItems = async () => {
      // Clear previous errors
      setValidationError(null);
      setIsRateLimited(false);
      
      if (debouncedSearchTerm.trim().length === 0) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }
      
      // Validate search term length
      if (debouncedSearchTerm.length > 100) {
        setValidationError('Search term is too long (max 100 characters)');
        setSuggestions([]);
        setIsOpen(false);
        return;
      }
      
      try {
        // Sanitize the search term
        const sanitizedTerm = sanitizeInput(debouncedSearchTerm);
        
        // Try to fetch from API first, fallback to local data
        const apiResults = await get(`/items/search?q=${encodeURIComponent(sanitizedTerm)}&limit=10`);
        setSuggestions(apiResults);
        setIsOpen(apiResults.length > 0);
      } catch (error) {
        console.log('API search error:', error);
        
        // Handle specific error types
        if (error instanceof ValidationError) {
          setValidationError(error.message);
          setSuggestions([]);
          setIsOpen(false);
          return;
        }
        
        if (error instanceof RateLimitError) {
          setIsRateLimited(true);
          setSuggestions([]);
          setIsOpen(false);
          return;
        }
        
        // Fallback to local search if API fails
        console.log('Using local data fallback');
        const sanitizedTerm = sanitizeInput(debouncedSearchTerm);
        const filteredItems = items
          .filter(item => 
            item.name.toLowerCase().includes(sanitizedTerm.toLowerCase()) ||
            item.code.toLowerCase().includes(sanitizedTerm.toLowerCase())
          )
          .slice(0, 10);
          
        setSuggestions(filteredItems);
        setIsOpen(filteredItems.length > 0);
      }
    };

    searchItems();
  }, [debouncedSearchTerm, items, get]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Basic input validation
    if (newValue.length > 100) {
      setValidationError('Search term is too long (max 100 characters)');
      return;
    }
    
    setValidationError(null);
    setIsRateLimited(false);
    setSearchTerm(newValue);
  };

  const handleItemSelection = (item: { id: string; name: string; code: string }) => {
    setSearchTerm(item.name);
    setIsOpen(false);
    setValidationError(null);
    setIsRateLimited(false);
    onItemSelect(item);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setValidationError(null);
    }
  };

  const hasError = validationError || isRateLimited;
  const errorMessage = validationError || (isRateLimited ? 'Too many searches. Please wait a moment.' : '');

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
          className={`pl-9 ${hasError ? 'border-red-500 focus:border-red-500' : ''} ${className}`}
          disabled={isRateLimited}
        />
        {isLoading && (
          <Loader className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-500" />
        )}
        {hasError && (
          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
        )}
      </div>
      
      {hasError && (
        <div className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {errorMessage}
        </div>
      )}
      
      {isOpen && suggestions.length > 0 && !hasError && (
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
