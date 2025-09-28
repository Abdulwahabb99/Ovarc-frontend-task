import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import InventoryTable from '../components/InventoryTable';
import AddBookModal from '../components/AddBookModal';
import Searchbar from '../components/Searchbar';
import { useInventory } from '../hooks/useInventory';
import Loading from './Loading';
import ProtectedRoute from '../components/ProtectedRoute';

const StoreInventory = () => {
  const { storeId } = useParams();
  const [activeTab, setActiveTab] = useState('books');
  const [showAddModal, setShowAddModal] = useState(false);

  const {
    books,
    availableBooks,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    sortConfig,
    handleSort,
    addBookToStore,
    updateBookPrice,
    removeBookFromStore,
  } = useInventory(storeId);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="py-6">
        <div className="text-center text-red-500">
          Error loading inventory: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* Tab Navigation */}
      <div className="flex mb-6 w-full justify-center items-center">
        <button
          onClick={() => setActiveTab('books')}
          className={`px-6 py-3 border-b-2 font-medium ${
            activeTab === 'books' 
              ? 'border-b-main text-main' 
              : 'border-b-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Books
        </button>
        <button
          onClick={() => setActiveTab('authors')}
          className={`px-6 py-3 border-b-2 font-medium ${
            activeTab === 'authors' 
              ? 'border-b-main text-main' 
              : 'border-b-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Authors
        </button>
      </div>

      {/* Header with Search and Add Button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1 max-w-md">
          <Searchbar 
            onSearchChange={setSearchTerm}
            placeholder="Search books in store..."
          />
        </div>
        <ProtectedRoute requireEdit={true}>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-main text-white px-4 py-2 rounded-md hover:bg-main/90 transition-colors"
          >
            Add Book to Store
          </button>
        </ProtectedRoute>
      </div>

      {/* Content */}
      {activeTab === 'books' ? (
        <div>
          <InventoryTable
            books={books}
            onUpdatePrice={updateBookPrice}
            onRemoveBook={removeBookFromStore}
            onSort={handleSort}
            sortConfig={sortConfig}
          />
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">Authors view coming soon...</p>
        </div>
      )}

      {/* Add Book Modal */}
      <AddBookModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        availableBooks={availableBooks}
        onAddBook={addBookToStore}
      />
    </div>
  );
};

export default StoreInventory;