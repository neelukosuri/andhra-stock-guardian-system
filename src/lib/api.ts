
// API configuration and CORS handling
import { mockSearchEndpoint, simulateApiError } from './mockApiServer';
import { validateSearchQuery, sanitizeInput, createRateLimiter } from './validation';
import { NetworkError, RateLimitError, ValidationError, NotFoundError } from './errorTypes';

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000/api';

// Rate limiter for search requests (max 10 requests per minute)
const searchRateLimiter = createRateLimiter(10, 60000);

// CORS configuration for API requests
const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
};

// API client with CORS support and mock search endpoint
export const apiClient = {
  async get(endpoint: string) {
    try {
      // Handle mock search endpoint with validation
      if (endpoint.startsWith('/items/search')) {
        // Apply rate limiting for search requests
        searchRateLimiter();
        
        const url = new URL(endpoint, 'http://localhost');
        const query = url.searchParams.get('q') || '';
        const limit = parseInt(url.searchParams.get('limit') || '10');
        
        // Validate and sanitize input
        const sanitizedQuery = sanitizeInput(query);
        validateSearchQuery(sanitizedQuery, limit);
        
        console.log(`[API Client] Mock search request: query="${sanitizedQuery}", limit=${limit}`);
        
        const response = await mockSearchEndpoint(sanitizedQuery, limit);
        return response.items; // Return items array for compatibility
      }
      
      // Regular API calls
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: corsHeaders,
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new NotFoundError(`Resource not found: ${endpoint}`);
        }
        if (response.status === 429) {
          throw new RateLimitError();
        }
        throw new NetworkError(`HTTP error! status: ${response.status}`, response.status);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API GET error:', error);
      
      // Re-throw custom errors
      if (error instanceof ValidationError || 
          error instanceof RateLimitError || 
          error instanceof NotFoundError) {
        throw error;
      }
      
      // Convert network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new NetworkError('Network connection failed. Please check your internet connection.');
      }
      
      throw error;
    }
  },

  async post(endpoint: string, data: any) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: corsHeaders,
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        if (response.status === 400) {
          throw new ValidationError('Invalid data provided');
        }
        if (response.status === 429) {
          throw new RateLimitError();
        }
        throw new NetworkError(`HTTP error! status: ${response.status}`, response.status);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API POST error:', error);
      throw error;
    }
  },

  async put(endpoint: string, data: any) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: corsHeaders,
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        if (response.status === 400) {
          throw new ValidationError('Invalid data provided');
        }
        if (response.status === 404) {
          throw new NotFoundError();
        }
        if (response.status === 429) {
          throw new RateLimitError();
        }
        throw new NetworkError(`HTTP error! status: ${response.status}`, response.status);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API PUT error:', error);
      throw error;
    }
  },

  async delete(endpoint: string) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: corsHeaders,
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new NotFoundError();
        }
        if (response.status === 429) {
          throw new RateLimitError();
        }
        throw new NetworkError(`HTTP error! status: ${response.status}`, response.status);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API DELETE error:', error);
      throw error;
    }
  },
};

// Helper function to handle API errors
export const handleApiError = (error: any) => {
  if (error instanceof ValidationError) {
    return `Validation error: ${error.message}`;
  }
  
  if (error instanceof NetworkError) {
    return error.message;
  }
  
  if (error instanceof RateLimitError) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  
  if (error instanceof NotFoundError) {
    return 'Resource not found';
  }
  
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return 'Network error - please check your connection';
  }
  
  if (error.message.includes('HTTP error!')) {
    const status = error.message.match(/status: (\d+)/)?.[1];
    switch (status) {
      case '401':
        return 'Unauthorized - please login again';
      case '403':
        return 'Access denied';
      case '404':
        return 'Resource not found';
      case '500':
        return 'Server error - please try again later';
      default:
        return `Request failed with status ${status}`;
    }
  }
  
  return error.message || 'An unexpected error occurred';
};
