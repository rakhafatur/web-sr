import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
// Di-host sendiri (bukan Google Fonts) supaya tetap tampil saat offline.
import '@fontsource-variable/inter';

import './styles/variable.css';
import './styles/global.css';
import './styles/reset.css';

import { Provider } from 'react-redux';
import { store } from './app/store';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { pasangPenangkapGlobal } from './lib/reportError';
import { mulaiTema } from './lib/tema';

// Error di luar jangkauan React (event handler async, promise tanpa catch)
// tidak tertangkap ErrorBoundary — ini yang menjaringnya.
pasangPenangkapGlobal();

// Tema gelap/terang (index.html sudah memasangnya lebih awal; ini menyamakan
// state & mengikuti perubahan tema sistem).
mulaiTema();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </Provider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
