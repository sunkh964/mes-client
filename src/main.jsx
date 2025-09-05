import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { IconProvider } from './utils/IconContext.jsx'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  //   
  // </StrictMode>,
  <BrowserRouter>
    <IconProvider>
      <App />
    </IconProvider>
  </BrowserRouter>
)
