import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles/index.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Dismiss critical first-load brand splash screen once React mounts
if (typeof window !== 'undefined') {
  requestAnimationFrame(() => {
    setTimeout(() => {
      const loader = document.getElementById('reloop-app-loader');
      if (loader) {
        loader.classList.add('fade-out');
        setTimeout(() => loader.remove(), 400);
      }
    }, 100);
  });
}
