import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './app/App'
import { initDB } from './lib/sqlite'

const rootElement = document.getElementById('root')!
const root = createRoot(rootElement)

root.render(
  <div style={{ padding: '40px 20px', textAlign: 'center', color: 'white', backgroundColor: '#0F172A', height: '100vh' }}>
    <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Conectando a SQLite...</h2>
    <p style={{ color: '#94A3B8', marginTop: '10px' }}>Por favor, espera.</p>
  </div>
)

const boot = async () => {
  try {
    await initDB()
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    )
  } catch (err) {
    root.render(
      <div style={{ padding: '40px 20px', color: '#EF4444', backgroundColor: '#0F172A', height: '100vh' }}>
        <h2>Error Crítico de SQLite</h2>
        <p>{String(err)}</p>
      </div>
    )
  }
}

boot()
