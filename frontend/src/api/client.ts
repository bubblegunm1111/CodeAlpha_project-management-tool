import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api/v1';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;

// Auth APIs
export const authAPI = {
  register: (email: string, name: string, password: string) =>
    client.post('/auth/register', { email, name, password }),
  login: (email: string, password: string) =>
    client.post('/auth/login', { email, password }),
  me: () => client.get('/auth/me'),
};

// Project APIs
export const projectAPI = {
  list: () => client.get('/projects'),
  create: (title: string, description?: string) =>
    client.post('/projects', { title, description }),
  getDetail: (id: number) => client.get(`/projects/${id}`),
  update: (id: number, data: any) => client.put(`/projects/${id}`, data),
  delete: (id: number) => client.delete(`/projects/${id}`),
};

// Task APIs
export const taskAPI = {
  create: (projectId: number, columnId: number, title: string, description?: string, priority?: string, due_date?: string) =>
    client.post(`/projects/${projectId}/tasks`, {
      column_id: columnId,
      title,
      description,
      priority,
      due_date,
    }),
  update: (id: number, data: any) => client.put(`/tasks/${id}`, data),
  move: (id: number, columnId: number, position: number) =>
    client.post(`/tasks/${id}/move`, { column_id: columnId, position }),
  delete: (id: number) => client.delete(`/tasks/${id}`),
};

// Comment APIs
export const commentAPI = {
  list: (taskId: number) => client.get(`/tasks/${taskId}/comments`),
  create: (taskId: number, content: string) =>
    client.post(`/tasks/${taskId}/comments`, { content }),
};
