import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const dashboardService = {
  getStats: () => api.get('/dashboard').then(res => res.data),
  getClusters: () => api.get('/clusters').then(res => res.data),
  getClusterDetails: (id) => api.get(`/cluster/${id}`).then(res => res.data),
  getInsights: () => api.get('/insights').then(res => res.data),
  getAIRecommendations: () => api.get('/ai-recommendations').then(res => res.data),
};

export const customerService = {
  getCustomers: (params, signal) => api.get('/customers', { params, signal }).then(res => res.data),
  getCustomerById: (id, signal) => api.get(`/customer/${id}`, { signal }).then(res => res.data),
  predictSegment: (payload) => api.post('/segment', payload).then(res => res.data),
  predictSegmentDetails: (payload) => api.post('/predict', payload).then(res => res.data),
};

export const uploadService = {
  uploadCSV: (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    }).then(res => res.data);
  },
};

export const reportService = {
  getPreview: (title, companyName) => api.get('/report/preview', { params: { title, company_name: companyName } }).then(res => res.data),
  exportPDFUrl: (title, companyName) => {
    const encodedTitle = encodeURIComponent(title);
    const encodedCompany = encodeURIComponent(companyName);
    return `${API_BASE_URL}/report/export?title=${encodedTitle}&company_name=${encodedCompany}`;
  }
};

export default api;
