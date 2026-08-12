import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#1A2236',
          color: '#F0F4FF',
          border: '1px solid #1E2D45',
          borderRadius: '10px',
          fontSize: '14px',
        },
        success: { iconTheme: { primary: '#00C9A7', secondary: '#1A2236' } },
        error:   { iconTheme: { primary: '#FF6B6B', secondary: '#1A2236' } },
      }}
    />
  </BrowserRouter>
);
