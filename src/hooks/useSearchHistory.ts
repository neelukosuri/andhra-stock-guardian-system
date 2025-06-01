
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'item-search-history';
const MAX_HISTORY_ITEMS = 10;

export const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load search history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSearchHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  }, []);

  // Save search history to localStorage
  const saveToStorage = (history: string[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  };

  const addToHistory = (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (trimmed.length < 2) return; // Don't save very short searches

    setSearchHistory(prev => {
      // Remove existing occurrence and add to front
      const filtered = prev.filter(term => term !== trimmed);
      const newHistory = [trimmed, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      saveToStorage(newHistory);
      return newHistory;
    });
  };

  const clearHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  };

  return {
    searchHistory,
    addToHistory,
    clearHistory
  };
};
