import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Initialize MSW in development
const isMockMode = import.meta.env.VITE_USE_MOCK_API === 'true';

console.log('🔧 Environment check:', {
  isMockMode,
  isDev: import.meta.env.DEV,
  envVar: import.meta.env.VITE_USE_MOCK_API
});

if (isMockMode && import.meta.env.DEV) {
  console.log('🚀 Starting MSW...');
  import('./mocks/browser.js').then(({ worker }) => {
    console.log('📦 MSW worker loaded, starting...');
    worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js'
      }
    }).then(() => {
      console.log('✅ MSW started successfully - Mock API enabled');
      console.log('📡 Available endpoints: /api/auth/*, /api/books/*, /api/authors/*, /api/stores/*, /api/inventory/*');
    }).catch((error) => {
      console.error('❌ Failed to start MSW:', error);
    });
  }).catch((error) => {
    console.error('❌ Failed to load MSW:', error);
  });
} else {
  console.log('🌐 Using real API - Mock disabled');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
