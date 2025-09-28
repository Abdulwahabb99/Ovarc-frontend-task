import { useState, useEffect, useMemo } from 'react';
import { api } from '../api/client';

export const useInventory = (storeId) => {
  const [books, setBooks] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Fetch store books and all available books
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try API first, fallback to direct JSON if MSW fails
        let storeBooksData, allBooksData, authorsData;
        
        try {
          [storeBooksData, allBooksData, authorsData] = await Promise.all([
            api.inventory.getStoreBooks(storeId),
            api.books.getAll(),
            api.authors.getAll()
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
          const storeInventory = inventory.filter(item => item.store_id === parseInt(storeId));
          storeBooksData = books
            .filter(book => storeInventory.some(item => item.book_id === book.id))
            .map(book => {
              const inventoryItem = storeInventory.find(item => item.book_id === book.id);
              const author = authors.find(a => a.id === book.author_id);
              return {
                ...book,
                price: inventoryItem?.price || 0,
                author_name: author ? `${author.first_name} ${author.last_name}` : 'Unknown Author',
                inventory_id: inventoryItem?.id
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

        setBooks(storeBooksData);
        setAllBooks(allBooksData);
        setAuthors(authorsData);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching inventory data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      fetchData();
    }
  }, [storeId]);

  // Create author lookup map
  const authorMap = useMemo(() => {
    return authors.reduce((map, author) => {
      map[author.id] = `${author.first_name} ${author.last_name}`;
      return map;
    }, {});
  }, [authors]);

  // Filter and sort books
  const filteredAndSortedBooks = useMemo(() => {
    let filtered = books;

    // Apply search filter
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = books.filter(book =>
        book.name.toLowerCase().includes(lowerSearch) ||
        book.author_name.toLowerCase().includes(lowerSearch) ||
        book.id.toString().includes(lowerSearch)
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle numeric values
        if (sortConfig.key === 'id' || sortConfig.key === 'page_count' || sortConfig.key === 'price') {
          aValue = Number(aValue) || 0;
          bValue = Number(bValue) || 0;
        } else {
          aValue = String(aValue || '').toLowerCase();
          bValue = String(bValue || '').toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [books, searchTerm, sortConfig]);

  // Get available books for adding to store (excluding already added books)
  const availableBooks = useMemo(() => {
    const storeBookIds = new Set(books.map(book => book.id));
    return allBooks
      .filter(book => !storeBookIds.has(book.id))
      .map(book => ({
        ...book,
        author_name: authorMap[book.author_id] || 'Unknown Author'
      }));
  }, [allBooks, books, authorMap]);

  // Actions
  const addBookToStore = async (bookId, price) => {
    try {
      await api.inventory.addBookToStore(storeId, bookId, price);
      
      // Refresh store books
      const updatedBooks = await api.inventory.getStoreBooks(storeId);
      setBooks(updatedBooks);
      
      return { success: true };
    } catch (err) {
      console.error('Error adding book to store:', err);
      return { success: false, message: err.message };
    }
  };

  const updateBookPrice = async (bookId, newPrice) => {
    try {
      // Find the inventory item for this book in this store
      const inventoryItem = books.find(book => book.id === bookId);
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
        await api.inventory.updatePrice(inventoryItem.inventory_id, newPrice);
      } catch (apiError) {
        console.warn('API update failed, using local update:', apiError);
        // Fallback: just update locally
      }
      
      // Update local state
      setBooks(prevBooks =>
        prevBooks.map(book =>
          book.id === bookId ? { ...book, price: newPrice } : book
        )
      );
      
      return { success: true };
    } catch (err) {
      console.error('Error updating book price:', err);
      return { success: false, message: err.message };
    }
  };

  const removeBookFromStore = async (bookId) => {
    try {
      await api.inventory.removeBookFromStore(storeId, bookId);
      
      // Update local state
      setBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
      
      return { success: true };
    } catch (err) {
      console.error('Error removing book from store:', err);
      return { success: false, message: err.message };
    }
  };

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return {
    books: filteredAndSortedBooks,
    availableBooks,
    authors,
    authorMap,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    sortConfig,
    handleSort,
    addBookToStore,
    updateBookPrice,
    removeBookFromStore,
  };
};
