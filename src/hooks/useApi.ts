
import { useState } from 'react';
import { apiClient, handleApiError } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Custom hook for API calls with loading states and error handling
export const useApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const makeRequest = async (
    requestFn: () => Promise<any>,
    showSuccessToast = false,
    successMessage = 'Operation completed successfully'
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await requestFn();
      
      if (showSuccessToast) {
        toast({
          title: 'Success',
          description: successMessage,
        });
      }
      
      return result;
    } catch (err: any) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const get = (endpoint: string) => makeRequest(() => apiClient.get(endpoint));
  
  const post = (endpoint: string, data: any, showSuccessToast = true) =>
    makeRequest(() => apiClient.post(endpoint, data), showSuccessToast);
  
  const put = (endpoint: string, data: any, showSuccessToast = true) =>
    makeRequest(() => apiClient.put(endpoint, data), showSuccessToast);
  
  const del = (endpoint: string, showSuccessToast = true) =>
    makeRequest(() => apiClient.delete(endpoint), showSuccessToast);

  return {
    isLoading,
    error,
    get,
    post,
    put,
    delete: del,
  };
};
