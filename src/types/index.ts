// Core domain types
export interface Book {
  id: number;
  author_id: number;
  name: string;
  isbn: string;
  language: string;
  page_count: number;
  format: 'paperback' | 'hardcover' | 'ebook';
}

export interface Author {
  id: number;
  first_name: string;
  last_name: string;
}

export interface Store {
  id: number;
  name: string;
  address: string;
}

export interface InventoryItem {
  id: number;
  store_id: number;
  book_id: number;
  price: number;
}

export interface BookWithInventory extends Book {
  price: number;
  author_name: string;
  inventory_id: number;
}

export interface User {
  id: number;
  username: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

// Component prop types
export interface InventoryTableProps {
  books: BookWithInventory[];
  onUpdatePrice: (bookId: number, newPrice: number) => Promise<ApiResponse>;
  onRemoveBook: (bookId: number) => Promise<ApiResponse>;
  onSort: (key: keyof BookWithInventory) => void;
  sortConfig: SortConfig;
  loading?: boolean;
}

export interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBooks: Book[];
  onAddBook: (bookId: number, price: number) => Promise<ApiResponse>;
}

export interface SortConfig {
  key: keyof BookWithInventory | null;
  direction: 'asc' | 'desc';
}

// Hook return types
export interface UseInventoryReturn {
  books: BookWithInventory[];
  availableBooks: Book[];
  authors: Author[];
  authorMap: Record<number, string>;
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortConfig: SortConfig;
  handleSort: (key: keyof BookWithInventory) => void;
  addBookToStore: (bookId: number, price: number) => Promise<ApiResponse>;
  updateBookPrice: (bookId: number, newPrice: number) => Promise<ApiResponse>;
  removeBookFromStore: (bookId: number) => Promise<ApiResponse>;
}

export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<ApiResponse>;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
  canEdit: () => boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Environment types
export interface AppConfig {
  apiBaseUrl: string;
  useMockApi: boolean;
  environment: 'development' | 'production' | 'test';
}
