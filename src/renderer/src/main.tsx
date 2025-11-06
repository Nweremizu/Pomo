import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import App from './App'
import { Routes } from '@renderer/routes'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <App /> */}
    <Routes />
  </StrictMode>
)
