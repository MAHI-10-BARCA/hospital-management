import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppRouter from './router.jsx'; // Import your router
import './index.css';

// This tells React to render your router component
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
);