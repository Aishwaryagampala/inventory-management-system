const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

// Shared API helper that always uses cookie-based auth via credentials: 'include'.
// No Authorization header or localStorage token is required.
export const fetchData = async (path, method = 'GET', body = null) => {
  const options = {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(body && { body: JSON.stringify(body) }),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, options);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'API request failed');
  }
  if (response.status === 204) return null;
  return await response.json();
};


