import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AppProvider } from './context/AppContext'
import { GameProvider } from './game'
import { ConfirmationProvider } from './contributions'
import { SparklesProvider } from './sparkles'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <ConfirmationProvider>
          <GameProvider>
            <SparklesProvider>
              <App />
            </SparklesProvider>
          </GameProvider>
        </ConfirmationProvider>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
