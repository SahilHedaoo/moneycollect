import axios from 'axios';

const api = axios.create({
  baseURL: 'https://moneycollect-iota.vercel.app/api', // replace <your-ip> with your local IP (e.g., 192.168.1.5)
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
