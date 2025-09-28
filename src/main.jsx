import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Initialize MSW in development
const isMockMode = import.meta.env.VITE_USE_MOCK_API === 'true';

if (isMockMode && import.meta.env.DEV) {
  import('./mocks/browser.js').then(({ worker }) => {
    worker.start().then(() => {
      console.log('MSW started successfully');
    }).catch((error) => {
      console.error('Failed to start MSW:', error);
    });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
