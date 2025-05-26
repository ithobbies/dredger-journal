import type { ApiError as ApiErrorType } from '../types';

export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: any): never => {
  if (error.response?.data) {
    const data = error.response.data as ApiErrorType;
    throw new ApiError(
      data.message || 'An error occurred',
      data.code,
      data.details
    );
  }
  
  if (error instanceof ApiError) {
    throw error;
  }
  
  throw new ApiError(
    error.message || 'An unexpected error occurred',
    'UNKNOWN_ERROR'
  );
};

export function formatValidationErrors(details?: Record<string, string[]>): string {
  if (!details) return '';
  
  return Object.entries(details)
    .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
    .join('\n');
} 