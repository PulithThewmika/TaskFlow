import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import RebuildApp from './rebuild/RebuildApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RebuildApp />
  </StrictMode>,
)
