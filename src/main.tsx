import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { DataProvider } from './context/DataContext'
import './index.css'

import { ErrorBoundary } from './components/ErrorBoundary'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HashRouter>
        <DataProvider>
          <App />
        </DataProvider>
      </HashRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
