// Centralized API client for TRIPONA

export function getAuthHeader() {
  const token = localStorage.getItem('tripona_token');
  const storedUser = localStorage.getItem('tripona_user');
  const headers = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      headers['x-user-id'] = user.uid;
      if (!headers['Authorization']) {
        headers['Authorization'] = `Bearer test-valid-user-${user.uid}`;
      }
    } catch (e) {
      // ignore JSON parse error
    }
  }

  return headers;
}

export async function apiRequest(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.error || data?.details || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
