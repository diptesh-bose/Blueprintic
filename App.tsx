import { GenAIProvider } from './contexts/EnhancedGenAIContext';
import EnhancedDesignerPage from './pages/EnhancedDesignerPage';
import './App.css';

function App() {
  console.log('🎯 Full App component rendering...')
  
  return (
    <GenAIProvider>
      <EnhancedDesignerPage />
    </GenAIProvider>
  );
}

export default App;
