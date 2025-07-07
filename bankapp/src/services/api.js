import axios from 'axios';

const api = axios.create({
  baseURL: 'https://moneycollect-git-main-sahil-hedaoos-projects.vercel.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
