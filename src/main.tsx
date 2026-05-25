import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// Polices auto-hébergées (aucun appel externe) : Inter + JetBrains Mono
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';

import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* BrowserRouter : URLs propres sans #. Nécessite un fallback SPA côté hôte
        (toutes les routes profondes renvoient index.html). `basename` suit la base
        Vite pour fonctionner sous un sous-chemin (ex. GitHub Pages : /cc-poc/). */}
    <BrowserRouter
      basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <App />
    </BrowserRouter>
  </StrictMode>,
);
