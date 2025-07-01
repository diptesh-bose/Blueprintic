import { GenAIProvider } from './contexts/GenAIContext';
import DesignerPage from './pages/DesignerPage';
import './App.css';

function App() {
  return (
    <GenAIProvider>
      <DesignerPage />
    </GenAIProvider>
  );
}

export default App;
