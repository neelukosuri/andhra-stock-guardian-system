
import { z } from 'zod';

// Schema for item search validation
export const searchQuerySchema = z.object({
  query: z.string().min(1, 'Search query cannot be empty').max(100, 'Search query too long'),
  limit: z.number().min(1, 'Limit must be at least 1').max(50, 'Limit cannot exceed 50').optional()
});

// Schema for item validation
export const itemSchema = z.object({
  id: z.string().min(1, 'Item ID is required'),
  name: z.string().min(1, 'Item name is required').max(100, 'Item name too long'),
  code: z.string().min(1, 'Item code is required').max(20, 'Item code too long'),
  description: z.string().optional(),
  ledgerId: z.string().min(1, 'Ledger ID is required')
});

// Validation helper functions
export const validateSearchQuery = (query: string, limit?: number) => {
  try {
    return searchQuerySchema.parse({ query, limit });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message);
    }
    throw error;
  }
};

export const validateItem = (item: any) => {
  try {
    return itemSchema.parse(item);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid item data: ${error.errors[0].message}`);
    }
    throw error;
  }
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// Rate limiting helper
export const createRateLimiter = (maxRequests: number, windowMs: number) => {
  const requests: number[] = [];
  
  return () => {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Remove old requests outside the window
    while (requests.length > 0 && requests[0] < windowStart) {
      requests.shift();
    }
    
    if (requests.length >= maxRequests) {
      throw new Error('Too many requests. Please try again later.');
    }
    
    requests.push(now);
    return true;
  };
};
