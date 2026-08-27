import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8080/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('flycab_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the API ever returns 401, force a logout
api.interceptors.response.use(
(res)=>res,(err)=>{
  if(err.response?.status===40)
  {
    localStorage.removeItem('flycab_token');
    localStorage.removeItem('flycab_user');
    window.location.href = '/login';
  }
}
);
export default api;