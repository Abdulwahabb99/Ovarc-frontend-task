import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthButton = () => {
  const { user, login, logout, loading } = useAuth();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    const result = await login(credentials);
    if (result.success) {
      setShowLoginForm(false);
      setCredentials({ username: '', password: '' });
    } else {
      setLoginError(result.message);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="px-4 py-2 text-gray-500">
        Loading...
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700">
          Welcome, {user.name}
        </span>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors text-sm"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {!showLoginForm ? (
        <button
          onClick={() => setShowLoginForm(true)}
          className="bg-main text-white px-4 py-2 rounded-md hover:bg-main/90 transition-colors text-sm"
        >
          Sign In
        </button>
      ) : (
        <form onSubmit={handleLogin} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Username"
            value={credentials.username}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            required
          />
          <button
            type="submit"
            className="bg-main text-white px-3 py-1 rounded text-sm hover:bg-main/90"
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setShowLoginForm(false);
              setLoginError('');
              setCredentials({ username: '', password: '' });
            }}
            className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
          >
            Cancel
          </button>
        </form>
      )}
      
      {loginError && (
        <div className="text-red-500 text-xs">
          {loginError}
        </div>
      )}
    </div>
  );
};

export default AuthButton;
