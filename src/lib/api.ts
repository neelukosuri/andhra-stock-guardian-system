// API configuration and CORS handling
import { mockSearchEndpoint, simulateApiError } from './mockApiServer';

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000/api';

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
      // Handle mock search endpoint
      if (endpoint.startsWith('/items/search')) {
        const url = new URL(endpoint, 'http://localhost');
        const query = url.searchParams.get('q') || '';
        const limit = parseInt(url.searchParams.get('limit') || '10');
        
        console.log(`[API Client] Mock search request: query="${query}", limit=${limit}`);
        
        const response = await mockSearchEndpoint(query, limit);
        return response.items; // Return items array for compatibility
      }
      
      // Regular API calls
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: corsHeaders,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API GET error:', error);
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
        throw new Error(`HTTP error! status: ${response.status}`);
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
        throw new Error(`HTTP error! status: ${response.status}`);
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
        throw new Error(`HTTP error! status: ${response.status}`);
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
