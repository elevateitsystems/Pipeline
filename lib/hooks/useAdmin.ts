import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../fetcher';
import { User, Presentation } from '../types';

// Query keys
export const adminKeys = {
  all: ['admin'] as const,
  users: (limit?: number, page?: number, search?: string) => [...adminKeys.all, 'users', { limit, page, search }] as const,
  audits: (limit?: number, page?: number, search?: string) => [...adminKeys.all, 'audits', { limit, page, search }] as const,
};

// Get all users (admin only)
export function useAllUsers(limit?: number, page?: number, search?: string) {
  return useQuery({
    queryKey: adminKeys.users(limit, page, search),
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (limit) params.limit = limit.toString();
      if (page) params.page = page.toString();
      if (search) params.search = search;
      
      const response = await apiClient.get<{ users: User[]; total: number; page: number; totalPages: number }>(
        '/admin/all-users',
        { params: Object.keys(params).length > 0 ? params : undefined }
      );
      return response;
    },
  });
}

// Get all audits (admin only)
export function useAllAudits(limit?: number, page?: number, search?: string) {
  return useQuery({
    queryKey: adminKeys.audits(limit, page, search),
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (limit) params.limit = limit.toString();
      if (page) params.page = page.toString();
      if (search) params.search = search;
      
      const response = await apiClient.get<{ 
        audits: Array<Presentation & { 
          user: Pick<User, 'id' | 'name' | 'email'> & { company?: { id: string; name: string } };
          _count: { tests: number };
        }>; 
        total: number; 
        page: number; 
        totalPages: number;
      }>(
        '/admin/audits',
        { params: Object.keys(params).length > 0 ? params : undefined }
      );
      return response;
    },
  });
}

