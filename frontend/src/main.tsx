import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/mobile.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import { registerServiceWorker } from './utils/registerSW'

// Register service worker
if (import.meta.env.PROD) {
  window.addEventListener('load', () => {
    registerServiceWorker();
  });
}

import { WalletProvider } from './components/wallet/WalletProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <WalletProvider>
        <App />
      </WalletProvider>
    </ErrorBoundary>
  </StrictMode>,
)
