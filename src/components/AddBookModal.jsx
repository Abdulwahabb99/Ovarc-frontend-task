import React, { useState, useMemo } from 'react';
import ProtectedRoute from './ProtectedRoute';

const AddBookModal = ({ 
  isOpen, 
  onClose, 
  availableBooks, 
  onAddBook 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);

  // Filter available books based on search term
  const filteredBooks = useMemo(() => {
    if (!searchTerm.trim()) {
      return availableBooks.slice(0, 7); // Show first 7 books by default
    }
    
    const lowerSearch = searchTerm.toLowerCase();
    return availableBooks
      .filter(book =>
        book.name.toLowerCase().includes(lowerSearch) ||
        book.author_name.toLowerCase().includes(lowerSearch)
      )
      .slice(0, 7); // Limit to 7 results
  }, [availableBooks, searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedBook || !price) {
      alert('Please select a book and enter a price');
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue < 0) {
      alert('Please enter a valid price');
      return;
    }

    setLoading(true);
    const result = await onAddBook(selectedBook.id, priceValue);
    setLoading(false);

    if (result.success) {
      // Reset form
      setSelectedBook(null);
      setPrice('');
      setSearchTerm('');
      onClose();
    } else {
      alert(result.message || 'Failed to add book to store');
    }
  };

  const handleClose = () => {
    setSelectedBook(null);
    setPrice('');
    setSearchTerm('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ProtectedRoute requireEdit={true}>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
          <div className="bg-main text-white p-4">
            <h2 className="text-lg font-semibold">Add Book to Store</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              {/* Search Input */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Search Books
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by book title or author..."
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-main"
                />
              </div>

              {/* Book Selection */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Select Book
                </label>
                <div className="max-h-60 overflow-y-auto border border-gray-300 rounded">
                  {filteredBooks.length === 0 ? (
                    <div className="p-4 text-gray-500 text-center">
                      {searchTerm ? 'No books found matching your search' : 'No books available to add'}
                    </div>
                  ) : (
                    filteredBooks.map((book) => (
                      <div
                        key={book.id}
                        className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                          selectedBook?.id === book.id ? 'bg-main text-white' : ''
                        }`}
                        onClick={() => setSelectedBook(book)}
                      >
                        <div className="font-medium">{book.name}</div>
                        <div className={`text-sm ${selectedBook?.id === book.id ? 'text-white' : 'text-gray-500'}`}>
                          by {book.author_name} • {book.page_count} pages
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Price Input */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Price ($)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-main"
                  required
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedBook || !price || loading}
                className="px-4 py-2 bg-main text-white rounded hover:bg-main/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding...' : 'Add Book'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AddBookModal;
