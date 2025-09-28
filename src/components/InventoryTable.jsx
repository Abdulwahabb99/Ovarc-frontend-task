import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';

const InventoryTable = ({ 
  books, 
  onUpdatePrice, 
  onRemoveBook, 
  onSort, 
  sortConfig 
}) => {
  const { canEdit } = useAuth();
  const [editingPrice, setEditingPrice] = useState(null);
  const [priceValue, setPriceValue] = useState('');

  const handleEditPrice = (book) => {
    setEditingPrice(book.id);
    setPriceValue(book.price?.toString() || '');
  };

  const handleSavePrice = async (bookId) => {
    const price = parseFloat(priceValue);
    if (isNaN(price) || price < 0) {
      alert('Please enter a valid price');
      return;
    }

    const result = await onUpdatePrice(bookId, price);
    if (result.success) {
      setEditingPrice(null);
      setPriceValue('');
    } else {
      alert(result.message || 'Failed to update price');
    }
  };

  const handleCancelEdit = () => {
    setEditingPrice(null);
    setPriceValue('');
  };

  const handleKeyPress = (e, bookId) => {
    if (e.key === 'Enter') {
      handleSavePrice(bookId);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th 
              className="border border-gray-200 p-3 text-left cursor-pointer font-medium text-gray-700 hover:bg-gray-200"
              onClick={() => onSort('id')}
            >
              <div className="flex items-center space-x-1">
                Book ID
                <span className="text-gray-500">{getSortIcon('id')}</span>
              </div>
            </th>
            <th 
              className="border border-gray-200 p-3 text-left cursor-pointer font-medium text-gray-700 hover:bg-gray-200"
              onClick={() => onSort('name')}
            >
              <div className="flex items-center space-x-1">
                Name
                <span className="text-gray-500">{getSortIcon('name')}</span>
              </div>
            </th>
            <th 
              className="border border-gray-200 p-3 text-left cursor-pointer font-medium text-gray-700 hover:bg-gray-200"
              onClick={() => onSort('page_count')}
            >
              <div className="flex items-center space-x-1">
                Pages
                <span className="text-gray-500">{getSortIcon('page_count')}</span>
              </div>
            </th>
            <th 
              className="border border-gray-200 p-3 text-left cursor-pointer font-medium text-gray-700 hover:bg-gray-200"
              onClick={() => onSort('author_name')}
            >
              <div className="flex items-center space-x-1">
                Author
                <span className="text-gray-500">{getSortIcon('author_name')}</span>
              </div>
            </th>
            <th 
              className="border border-gray-200 p-3 text-left cursor-pointer font-medium text-gray-700 hover:bg-gray-200"
              onClick={() => onSort('price')}
            >
              <div className="flex items-center space-x-1">
                Price
                <span className="text-gray-500">{getSortIcon('price')}</span>
              </div>
            </th>
            {canEdit() && (
              <th className="border border-gray-200 p-3 text-left font-medium text-gray-700">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {books.length === 0 ? (
            <tr>
              <td 
                colSpan={canEdit() ? 6 : 5} 
                className="border border-gray-200 p-8 text-center text-gray-500"
              >
                No books found in this store
              </td>
            </tr>
          ) : (
            books.map((book) => (
              <tr key={book.id} className="hover:bg-gray-50">
                <td className="border border-gray-200 p-3 text-gray-800">
                  {book.id}
                </td>
                <td className="border border-gray-200 p-3 text-gray-800">
                  {book.name}
                </td>
                <td className="border border-gray-200 p-3 text-gray-800">
                  {book.page_count}
                </td>
                <td className="border border-gray-200 p-3 text-gray-800">
                  {book.author_name}
                </td>
                <td className="border border-gray-200 p-3 text-gray-800">
                  {editingPrice === book.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={priceValue}
                        onChange={(e) => setPriceValue(e.target.value)}
                        onKeyDown={(e) => handleKeyPress(e, book.id)}
                        className="border border-gray-300 rounded px-2 py-1 w-20 text-sm"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSavePrice(book.id)}
                        className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>${book.price?.toFixed(2) || '0.00'}</span>
                      {canEdit() && (
                        <button
                          onClick={() => handleEditPrice(book)}
                          className="text-blue-500 hover:text-blue-700 text-xs"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  )}
                </td>
                {canEdit() && (
                  <td className="border border-gray-200 p-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          if (window.confirm(`Remove "${book.name}" from this store?`)) {
                            onRemoveBook(book.id);
                          }
                        }}
                        className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
