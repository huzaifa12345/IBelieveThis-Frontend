import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// SEO body inside #root is replaced by React; keep #lcp-hero-shell (outside #root) until ThemeHome drops it
document.getElementById('seo-prerender')?.remove()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
