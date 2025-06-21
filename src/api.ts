import axios from 'axios';

const api = axios.create({ baseURL: '/api', withCredentials: true });

// Interceptor para adicionar automaticamente o token em todas as requisições
api.interceptors.request.use(
  (config) => {
    // Tentar ambos os nomes de token para compatibilidade
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para lidar com respostas de erro (token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido/expirado - limpar localStorage e redirecionar para login
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
