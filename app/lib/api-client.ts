// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

// Generic fetch wrapper
async function fetchAPI(endpoint: string, options: FetchOptions = {}) {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
    credentials: 'include', // Include cookies
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

// Auth API
export const authAPI = {
  register: async (userData: { email: string; password: string; name: string }) => {
    return fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials: { email: string; password: string }) => {
    return fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  logout: async () => {
    return fetchAPI('/auth/logout', {
      method: 'POST',
    });
  },

  getCurrentUser: async (token?: string) => {
    return fetchAPI('/auth/me', { token });
  },
};

// Recipe API
export const recipeAPI = {
  getAll: async (params?: { status?: string; includeAll?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.includeAll) queryParams.append('includeAll', 'true');
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return fetchAPI(`/recipes${query}`);
  },

  getById: async (id: string) => {
    return fetchAPI(`/recipes/${id}`);
  },

  create: async (recipeData: any, token?: string) => {
    return fetchAPI('/recipes', {
      method: 'POST',
      body: JSON.stringify(recipeData),
      token,
    });
  },

  update: async (id: string, recipeData: any, token?: string) => {
    return fetchAPI(`/recipes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(recipeData),
      token,
    });
  },

  delete: async (id: string, token?: string) => {
    return fetchAPI(`/recipes/${id}`, {
      method: 'DELETE',
      token,
    });
  },

  review: async (id: string, reviewData: { status: string; reviewNote?: string }, token?: string) => {
    return fetchAPI(`/recipes/${id}/review`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
      token,
    });
  },
};

// User API
export const userAPI = {
  getAll: async (token?: string) => {
    return fetchAPI('/users', { token });
  },

  toggleActive: async (id: string, token?: string) => {
    return fetchAPI(`/users/${id}/toggle-active`, {
      method: 'PATCH',
      token,
    });
  },

  delete: async (id: string, token?: string) => {
    return fetchAPI(`/users/${id}`, {
      method: 'DELETE',
      token,
    });
  },
};

// Meal Plan API
export const mealPlanAPI = {
  getAll: async (params?: { startDate?: string; endDate?: string }, token?: string) => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return fetchAPI(`/meal-plans${query}`, { token });
  },

  createOrUpdate: async (mealPlanData: any, token?: string) => {
    return fetchAPI('/meal-plans', {
      method: 'POST',
      body: JSON.stringify(mealPlanData),
      token,
    });
  },

  delete: async (id: string, token?: string) => {
    return fetchAPI(`/meal-plans/${id}`, {
      method: 'DELETE',
      token,
    });
  },
};
