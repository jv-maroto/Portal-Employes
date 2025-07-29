import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter as Router } from 'react-router-dom'; // Importa Router

import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router> {/* Asegúrate de envolver todo el contenido dentro de Router */}
      <App />
    </Router>
  </React.StrictMode>
);
