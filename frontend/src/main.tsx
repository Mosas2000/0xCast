import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import './styles/mobile.css'
import './styles/animations.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import { registerServiceWorker } from './utils/registerSW'

const LandingPage = lazy(() => import('./pages/LandingPage'))

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
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
                <LandingPage />
              </Suspense>
            }
          />
          <Route
            path="/app/*"
            element={
              <WalletProvider>
                <App />
              </WalletProvider>
            }
          />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
