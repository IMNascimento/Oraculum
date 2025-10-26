import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import CodingCoach from './oraculum.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CodingCoach />
  </StrictMode>,
)
