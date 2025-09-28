// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'
import App from './App.tsx'
import Table2 from './components/Table2';

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
    // <App />
    <Table2 />
  // </StrictMode>,
)
