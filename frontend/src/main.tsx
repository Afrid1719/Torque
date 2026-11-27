import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@app/App'
import '@app/index.css'

globalThis.__TORQUE_API_BASE_URL__ = import.meta.env.VITE_API_BASE_URL

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
