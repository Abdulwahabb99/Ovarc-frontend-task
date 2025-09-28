import { useState, useEffect, useMemo, useCallback } from 'react';
import { apiClient } from '@/api/client';
import type { 
  Book, 
  Author, 
  BookWithInventory, 
  UseInventoryReturn, 
  SortConfig, 
  ApiResponse 
} from '@/types';

// State interface
interface InventoryState {
  books: BookWithInventory[];
  allBooks: Book[];
  authors: Author[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  sortConfig: SortConfig;
}

// Initial state
const initialState: InventoryState = {
  books: [],
  allBooks: [],
  authors: [],
  loading: true,
  error: null,
  searchTerm: '',
  sortConfig: { key: null, direction: 'asc' },
};

export const useInventory = (storeId: number): UseInventoryReturn => {
  const [state, setState] = useState<InventoryState>(initialState);

  // Fetch data function
  const fetchData = useCallback(async () => {
    if (!storeId) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Try API first, fallback to direct JSON if MSW fails
      let storeBooksData: BookWithInventory[];
      let allBooksData: Book[];
      let authorsData: Author[];
      
      try {
        [storeBooksData, allBooksData, authorsData] = await Promise.all([
          apiClient.inventory.getStoreBooks(storeId),
          apiClient.books.getAll(),
          apiClient.authors.getAll()
        ]);
      } catch (apiError) {
        console.warn('API failed, falling back to direct JSON fetch:', apiError);
        // Fallback to direct JSON fetching
        const [booksRes, authorsRes, inventoryRes] = await Promise.all([
          fetch('/data/books.json').then(r => r.json()),
          fetch('/data/authors.json').then(r => r.json()),
          fetch('/data/inventory.json').then(r => r.json())
        ]);
        
        const books = Array.isArray(booksRes) ? booksRes : [booksRes];
        const authors = Array.isArray(authorsRes) ? authorsRes : [authorsRes];
        const inventory = Array.isArray(inventoryRes) ? inventoryRes : [inventoryRes];
        
        // Filter books for this store
        const storeInventory = inventory.filter(item => item.store_id === parseInt(storeId.toString()));
        storeBooksData = books
          .filter(book => storeInventory.some(item => item.book_id === book.id))
          .map(book => {
            const inventoryItem = storeInventory.find(item => item.book_id === book.id);
            const author = authors.find(a => a.id === book.author_id);
            return {
              ...book,
              price: inventoryItem?.price || 0,
              author_name: author ? `${author.first_name} ${author.last_name}` : 'Unknown Author',
              inventory_id: inventoryItem?.id || 0
            };
          });
        
        allBooksData = books;
        authorsData = authors;
      }

      console.log('Loaded inventory data:', {
        storeBooks: storeBooksData,
        allBooks: allBooksData,
        authors: authorsData
      });

      setState(prev => ({
        ...prev,
        books: storeBooksData,
        allBooks: allBooksData,
        authors: authorsData,
        loading: false,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      console.error('Error fetching inventory data:', err);
    }
  }, [storeId]);

  // Fetch data on mount and when storeId changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Create author lookup map
  const authorMap = useMemo(() => {
    return state.authors.reduce((map, author) => {
      map[author.id] = `${author.first_name} ${author.last_name}`;
      return map;
    }, {} as Record<number, string>);
  }, [state.authors]);

  // Filter and sort books
  const filteredAndSortedBooks = useMemo(() => {
    let filtered = state.books;

    // Apply search filter
    if (state.searchTerm.trim()) {
      const lowerSearch = state.searchTerm.toLowerCase();
      filtered = state.books.filter(book =>
        book.name.toLowerCase().includes(lowerSearch) ||
        book.author_name.toLowerCase().includes(lowerSearch) ||
        book.id.toString().includes(lowerSearch)
      );
    }

    // Apply sorting
    if (state.sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[state.sortConfig.key!];
        let bValue = b[state.sortConfig.key!];

        // Handle numeric values
        if (state.sortConfig.key === 'id' || state.sortConfig.key === 'page_count' || state.sortConfig.key === 'price') {
          aValue = Number(aValue) || 0;
          bValue = Number(bValue) || 0;
        } else {
          aValue = String(aValue || '').toLowerCase();
          bValue = String(bValue || '').toLowerCase();
        }

        if (aValue < bValue) {
          return state.sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return state.sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [state.books, state.searchTerm, state.sortConfig]);

  // Get available books for adding to store (excluding already added books)
  const availableBooks = useMemo(() => {
    const storeBookIds = new Set(state.books.map(book => book.id));
    return state.allBooks
      .filter(book => !storeBookIds.has(book.id))
      .map(book => ({
        ...book,
        author_name: authorMap[book.author_id] || 'Unknown Author'
      }));
  }, [state.allBooks, state.books, authorMap]);

  // Actions
  const addBookToStore = useCallback(async (bookId: number, price: number): Promise<ApiResponse> => {
    try {
      await apiClient.inventory.addBookToStore(storeId, bookId, price);
      
      // Refresh store books
      const updatedBooks = await apiClient.inventory.getStoreBooks(storeId);
      setState(prev => ({ ...prev, books: updatedBooks }));
      
      return { success: true };
    } catch (err) {
      console.error('Error adding book to store:', err);
      return { 
        success: false, 
        message: err instanceof Error ? err.message : 'Failed to add book' 
      };
    }
  }, [storeId]);

  const updateBookPrice = useCallback(async (bookId: number, newPrice: number): Promise<ApiResponse> => {
    try {
      // Find the inventory item for this book in this store
      const inventoryItem = state.books.find(book => book.id === bookId);
      if (!inventoryItem) {
        throw new Error('Book not found in store inventory');
      }

      console.log('Updating book price:', {
        bookId,
        newPrice,
        inventoryId: inventoryItem.inventory_id,
        book: inventoryItem
      });

      if (!inventoryItem.inventory_id) {
        throw new Error('Inventory ID not found for this book');
      }

      try {
        await apiClient.inventory.updatePrice(inventoryItem.inventory_id, newPrice);
      } catch (apiError) {
        console.warn('API update failed, using local update:', apiError);
        // Fallback: just update locally
      }
      
      // Update local state
      setState(prev => ({
        ...prev,
        books: prev.books.map(book =>
          book.id === bookId ? { ...book, price: newPrice } : book
        )
      }));
      
      return { success: true };
    } catch (err) {
      console.error('Error updating book price:', err);
      return { 
        success: false, 
        message: err instanceof Error ? err.message : 'Failed to update price' 
      };
    }
  }, [state.books]);

  const removeBookFromStore = useCallback(async (bookId: number): Promise<ApiResponse> => {
    try {
      await apiClient.inventory.removeBookFromStore(storeId, bookId);
      
      // Update local state
      setState(prev => ({
        ...prev,
        books: prev.books.filter(book => book.id !== bookId)
      }));
      
      return { success: true };
    } catch (err) {
      console.error('Error removing book from store:', err);
      return { 
        success: false, 
        message: err instanceof Error ? err.message : 'Failed to remove book' 
      };
    }
  }, [storeId]);

  const handleSort = useCallback((key: keyof BookWithInventory) => {
    setState(prev => ({
      ...prev,
      sortConfig: {
        key,
        direction: prev.sortConfig.key === key && prev.sortConfig.direction === 'asc' ? 'desc' : 'asc'
      }
    }));
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    setState(prev => ({ ...prev, searchTerm: term }));
  }, []);

  return {
    books: filteredAndSortedBooks,
    availableBooks,
    authors: state.authors,
    authorMap,
    loading: state.loading,
    error: state.error,
    searchTerm: state.searchTerm,
    setSearchTerm,
    sortConfig: state.sortConfig,
    handleSort,
    addBookToStore,
    updateBookPrice,
    removeBookFromStore,
  };
};
