import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  // comment strict mode for now to avoid duplication of request
  // <StrictMode>
    <App />
  // </StrictMode>,
)
