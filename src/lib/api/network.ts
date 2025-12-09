import { apiClient } from './client';

export interface Connection {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
    profile?: {
      headline?: string;
      location?: {
        city?: string;
      };
    };
  };
  status: 'pending' | 'accepted' | 'rejected';
  connectedAt?: string;
  message?: string;
}

export interface ConnectionRequest {
  _id: string;
  requester: {
    _id: string;
    name: string;
    avatar?: string;
    profile?: {
      headline?: string;
      location?: {
        city?: string;
      };
    };
  };
  recipient: {
    _id: string;
    name: string;
    avatar?: string;
  };
  message?: string;
  createdAt: string;
}

export interface UserSuggestion {
  _id: string;
  name: string;
  avatar?: string;
  profile?: {
    headline?: string;
    location?: {
      city?: string;
    };
    skills?: Array<{ name: string }>;
  };
  mutualConnectionsCount: number;
}

export const networkApi = {
  getConnections: async (page = 1, limit = 20, status = 'accepted') => {
    return apiClient.get<Connection[]>('/network/connections', { page, limit, status });
  },

  getPendingRequests: async (page = 1, limit = 20, type: 'received' | 'sent' = 'received') => {
    return apiClient.get<ConnectionRequest[]>('/network/requests', { page, limit, type });
  },

  getSuggestions: async (limit = 10) => {
    return apiClient.get<UserSuggestion[]>('/network/suggestions', { limit });
  },

  sendConnectionRequest: async (userId: string, message?: string) => {
    return apiClient.post(`/network/connect/${userId}`, { message });
  },

  acceptConnection: async (connectionId: string) => {
    return apiClient.post(`/network/accept/${connectionId}`);
  },

  rejectConnection: async (connectionId: string) => {
    return apiClient.post(`/network/reject/${connectionId}`);
  },

  removeConnection: async (userId: string) => {
    return apiClient.delete(`/network/remove/${userId}`);
  },

  getConnectionStatus: async (userId: string) => {
    return apiClient.get<{ status: string }>(`/network/status/${userId}`);
  },

  getMutualConnections: async (userId: string) => {
    return apiClient.get<Connection[]>(`/network/mutual/${userId}`);
  },
};
