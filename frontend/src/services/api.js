const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };

  // ✅ Add /api prefix here
  const response = await fetch(`${BASE_URL}/api${endpoint}`, { ...options, headers });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'API request failed');
  }
  return response.json();
};