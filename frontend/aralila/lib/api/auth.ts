import api from './index';

export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/api/token/', credentials);
    return response.data;
  },

  register: async (userData: any) => {
    const response = await api.post('/api/user/register/', userData);
    return response.data;
  },

  // POST /api/auth/logout/ - call Django logout view
  // logout: async () => {
  //   const response = await api.post('/api/auth/logout/');
  //   return response.data;
  // },

  getProfile: async () => {
    const response = await api.get('/api/profile/');
    return response.data;
  }
};