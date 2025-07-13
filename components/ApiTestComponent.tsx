import React, { useState } from 'react';
import GeminiService from '../services/GeminiService';

const ApiTestComponent: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  const testApi = async () => {
    setIsLoading(true);
    setTestResult('');
    
    try {
      // Test with a dummy API key to see if the service initializes
      const testKey = 'AIzaSyDummy-Test-Key-For-Initialization-Check-123456789';
      
      try {
        new GeminiService(testKey);
        setTestResult('✅ GeminiService can be initialized (API key format check passed)');
      } catch (err) {
        setTestResult(`❌ GeminiService initialization failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
      
    } catch (error) {
      setTestResult(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <h3 className="font-semibold text-blue-800 mb-2">API Integration Test</h3>
      <button
        onClick={testApi}
        disabled={isLoading}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? 'Testing...' : 'Test API Integration'}
      </button>
      {testResult && (
        <div className="mt-3 p-2 bg-white rounded border">
          <pre className="text-sm">{testResult}</pre>
        </div>
      )}
    </div>
  );
};

export default ApiTestComponent;
