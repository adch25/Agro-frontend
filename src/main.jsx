import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom";
import WrapContexts from "./context/wrapContexts";


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <WrapContexts>
        <App />
      </WrapContexts>
    </BrowserRouter>
  </StrictMode>
)