import { createRoot } from 'react-dom/client'
import App from './App'
import './App.css'
import './styles/tailwind.css'
import 'reactflow/dist/style.css'
import '@reactflow/node-resizer/dist/style.css'

console.log('🚀 Main.tsx loaded - attempting to render React app...')

const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('❌ Root element not found!')
} else {
  console.log('✅ Root element found, creating React root...')
  try {
    const root = createRoot(rootElement)
    root.render(<App />)
    console.log('✅ React app rendered successfully!')
  } catch (error) {
    console.error('❌ Error rendering React app:', error)
  }
}
