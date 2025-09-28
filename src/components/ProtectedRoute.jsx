import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireEdit = false }) => {
  const { isAuthenticated, canEdit, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Authentication Required
          </h3>
          <p className="text-gray-500">
            Please sign in to access this feature.
          </p>
        </div>
      </div>
    );
  }

  if (requireEdit && !canEdit()) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Permission Denied
          </h3>
          <p className="text-gray-500">
            You don't have permission to perform this action.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
