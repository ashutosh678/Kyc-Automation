import httpClient from '../utils/httpClient';

const authService = {
  signup: async (email, password) => {
    try {
      const response = await httpClient.post('/user/signup', { email, password });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  login: async (email, password) => {
    try {
      const response = await httpClient.post('/user/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  logout: async () => {
    try {
      await httpClient.post('/user/logout');
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error);
      // Still remove the token even if the server logout fails
      localStorage.removeItem('token');
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getToken: () => {
    return localStorage.getItem('token');
  },
};

export default authService;