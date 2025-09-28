// API client with environment-based switching
const isMockMode = import.meta.env.VITE_USE_MOCK_API === 'true';
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Helper function to get full URL
const getURL = (endpoint) => {
  if (isMockMode) {
    return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  }
  return `${baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Generic fetch wrapper with error handling
const apiRequest = async (endpoint, options = {}) => {
  const url = getURL(endpoint);
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// API methods
export const api = {
  // Authentication
  auth: {
    login: (credentials) => apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
    logout: () => apiRequest('/api/auth/logout', { method: 'POST' }),
    getCurrentUser: () => apiRequest('/api/auth/me'),
  },

  // Books
  books: {
    getAll: (params = {}) => {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.append('search', params.search);
      if (params.storeId) searchParams.append('storeId', params.storeId);
      
      const queryString = searchParams.toString();
      return apiRequest(`/api/books${queryString ? `?${queryString}` : ''}`);
    },
    getById: (id) => apiRequest(`/api/books/${id}`),
    create: (book) => apiRequest('/api/books', {
      method: 'POST',
      body: JSON.stringify(book),
    }),
    update: (id, updates) => apiRequest(`/api/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
    delete: (id) => apiRequest(`/api/books/${id}`, { method: 'DELETE' }),
  },

  // Authors
  authors: {
    getAll: (params = {}) => {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.append('search', params.search);
      
      const queryString = searchParams.toString();
      return apiRequest(`/api/authors${queryString ? `?${queryString}` : ''}`);
    },
    getById: (id) => apiRequest(`/api/authors/${id}`),
    create: (author) => apiRequest('/api/authors', {
      method: 'POST',
      body: JSON.stringify(author),
    }),
    update: (id, updates) => apiRequest(`/api/authors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
    delete: (id) => apiRequest(`/api/authors/${id}`, { method: 'DELETE' }),
  },

  // Stores
  stores: {
    getAll: (params = {}) => {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.append('search', params.search);
      
      const queryString = searchParams.toString();
      return apiRequest(`/api/stores${queryString ? `?${queryString}` : ''}`);
    },
    getById: (id) => apiRequest(`/api/stores/${id}`),
  },

  // Inventory
  inventory: {
    getAll: (params = {}) => {
      const searchParams = new URLSearchParams();
      if (params.storeId) searchParams.append('storeId', params.storeId);
      
      const queryString = searchParams.toString();
      return apiRequest(`/api/inventory${queryString ? `?${queryString}` : ''}`);
    },
    getStoreBooks: (storeId) => apiRequest(`/api/inventory/${storeId}/books`),
    addBookToStore: (storeId, bookId, price) => apiRequest('/api/inventory', {
      method: 'POST',
      body: JSON.stringify({ store_id: storeId, book_id: bookId, price }),
    }),
    updatePrice: (id, price) => apiRequest(`/api/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ price }),
    }),
    removeBookFromStore: (storeId, bookId) => apiRequest(`/api/inventory/store/${storeId}/book/${bookId}`, {
      method: 'DELETE',
    }),
  },
};

// Legacy data fetching for backward compatibility
export const fetchData = async (dataType) => {
  if (isMockMode) {
    switch (dataType) {
      case 'books':
        return api.books.getAll();
      case 'authors':
        return api.authors.getAll();
      case 'stores':
        return api.stores.getAll();
      case 'inventory':
        return api.inventory.getAll();
      default:
        throw new Error(`Unknown data type: ${dataType}`);
    }
  } else {
    // Fallback to direct JSON file fetching
    const response = await fetch(`/data/${dataType}.json`);
    const data = await response.json();
    return Array.isArray(data) ? data : [data];
  }
};

export default api;
