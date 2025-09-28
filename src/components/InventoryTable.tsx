import React, { useState, useCallback, memo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { InventoryTableProps, BookWithInventory } from '@/types';

// Memoized table cell component for better performance
const TableCell = memo<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  colSpan?: number;
}>(({ children, className = '', onClick, colSpan }) => (
  <td 
    className={`border border-gray-200 p-3 text-gray-800 ${className}`} 
    onClick={onClick}
    colSpan={colSpan}
  >
    {children}
  </td>
));

TableCell.displayName = 'TableCell';

// Memoized sortable header component
const SortableHeader = memo<{
  children: React.ReactNode;
  sortKey: keyof BookWithInventory;
  currentSort: { key: keyof BookWithInventory | null; direction: 'asc' | 'desc' };
  onSort: (key: keyof BookWithInventory) => void;
}>(({ children, sortKey, currentSort, onSort }) => {
  const getSortIcon = () => {
    if (currentSort.key !== sortKey) return '↕';
    return currentSort.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <th 
      className="border border-gray-200 p-3 text-left cursor-pointer font-medium text-gray-700 hover:bg-gray-200"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center space-x-1">
        {children}
        <span className="text-gray-500">{getSortIcon()}</span>
      </div>
    </th>
  );
});

SortableHeader.displayName = 'SortableHeader';

// Memoized price editor component
const PriceEditor = memo<{
  bookId: number;
  currentPrice: number;
  onSave: (bookId: number, price: number) => Promise<void>;
  onCancel: () => void;
}>(({ bookId, currentPrice, onSave, onCancel }) => {
  const [price, setPrice] = useState(currentPrice.toString());
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue < 0) {
      alert('Please enter a valid price');
      return;
    }

    setSaving(true);
    try {
      await onSave(bookId, priceValue);
    } catch (error) {
      console.error('Failed to save price:', error);
      alert('Failed to update price');
    } finally {
      setSaving(false);
    }
  }, [bookId, price, onSave]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  }, [handleSave, onCancel]);

  return (
    <div className="flex items-center space-x-2">
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        onKeyDown={handleKeyPress}
        className="border border-gray-300 rounded px-2 py-1 w-20 text-sm"
        placeholder="0.00"
        step="0.01"
        min="0"
        autoFocus
        disabled={saving}
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
      <button
        onClick={onCancel}
        disabled={saving}
        className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600 disabled:opacity-50"
      >
        Cancel
      </button>
    </div>
  );
});

PriceEditor.displayName = 'PriceEditor';

// Main component
const InventoryTable: React.FC<InventoryTableProps> = ({ 
  books, 
  onUpdatePrice, 
  onRemoveBook, 
  onSort, 
  sortConfig,
  loading = false
}) => {
  const { canEdit } = useAuth();
  const [editingPrice, setEditingPrice] = useState<number | null>(null);

  const handleEditPrice = useCallback((bookId: number) => {
    setEditingPrice(bookId);
  }, []);

  const handleSavePrice = useCallback(async (bookId: number, newPrice: number) => {
    const result = await onUpdatePrice(bookId, newPrice);
    if (result.success) {
      setEditingPrice(null);
    } else {
      throw new Error(result.message || 'Failed to update price');
    }
  }, [onUpdatePrice]);

  const handleCancelEdit = useCallback(() => {
    setEditingPrice(null);
  }, []);

  const handleRemoveBook = useCallback(async (bookId: number, bookName: string) => {
    if (window.confirm(`Remove "${bookName}" from this store?`)) {
      await onRemoveBook(bookId);
    }
  }, [onRemoveBook]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <SortableHeader
              sortKey="id"
              currentSort={sortConfig}
              onSort={onSort}
            >
              Book ID
            </SortableHeader>
            <SortableHeader
              sortKey="name"
              currentSort={sortConfig}
              onSort={onSort}
            >
              Name
            </SortableHeader>
            <SortableHeader
              sortKey="page_count"
              currentSort={sortConfig}
              onSort={onSort}
            >
              Pages
            </SortableHeader>
            <SortableHeader
              sortKey="author_name"
              currentSort={sortConfig}
              onSort={onSort}
            >
              Author
            </SortableHeader>
            <SortableHeader
              sortKey="price"
              currentSort={sortConfig}
              onSort={onSort}
            >
              Price
            </SortableHeader>
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
              <TableCell 
                colSpan={canEdit() ? 6 : 5} 
                className="text-center text-gray-500"
              >
                No books found in this store
              </TableCell>
            </tr>
          ) : (
            books.map((book) => (
              <tr key={book.id} className="hover:bg-gray-50">
                <TableCell>{book.id}</TableCell>
                <TableCell>{book.name}</TableCell>
                <TableCell>{book.page_count}</TableCell>
                <TableCell>{book.author_name}</TableCell>
                <TableCell>
                  {editingPrice === book.id ? (
                    <PriceEditor
                      bookId={book.id}
                      currentPrice={book.price}
                      onSave={handleSavePrice}
                      onCancel={handleCancelEdit}
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>${book.price?.toFixed(2) || '0.00'}</span>
                      {canEdit() && (
                        <button
                          onClick={() => handleEditPrice(book.id)}
                          className="text-blue-500 hover:text-blue-700 text-xs"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  )}
                </TableCell>
                {canEdit() && (
                  <TableCell>
                    <button
                      onClick={() => handleRemoveBook(book.id, book.name)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </TableCell>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default memo(InventoryTable);
