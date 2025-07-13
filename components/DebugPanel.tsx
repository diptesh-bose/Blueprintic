import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Info, Loader } from 'lucide-react';
import { useGenAI } from '../contexts/EnhancedGenAIContext';
import GeminiService from '../services/GeminiService';

const DebugPanel: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  
  const { isApiConfigured, error } = useGenAI();

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testGeminiConnection = async () => {
    setIsTesting(true);
    setTestResults([]);
    
    try {
      addTestResult('🔧 Starting Gemini API connection test...');
      
      // Test API key from user input
      const testApiKey = (document.getElementById('test-api-key') as HTMLInputElement)?.value;
      
      if (!testApiKey) {
        addTestResult('❌ No API key provided for testing');
        return;
      }
      
      addTestResult('🔑 Testing with provided API key...');
      
      // Create test service
      const testService = new GeminiService(testApiKey);
      addTestResult('✅ GeminiService instance created successfully');
      
      // Test simple content generation
      addTestResult('🚀 Testing simple content generation...');
      const testInfrastructure = await testService.parseNaturalLanguageToInfrastructure(
        'Create a simple web application with a database'
      );
      
      addTestResult('✅ Gemini API call successful!');
      addTestResult(`📋 Generated ${testInfrastructure.services.length} services`);
      addTestResult(`📊 Services: ${testInfrastructure.services.map(s => s.name).join(', ')}`);
      
    } catch (error) {
      addTestResult('❌ Test failed:');
      addTestResult(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Gemini test error:', error);
    } finally {
      setIsTesting(false);
    }
  };

  if (!showDebug) {
    return (
      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => setShowDebug(true)}
          className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-700"
        >
          Debug
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-4 bg-white rounded-lg shadow-xl border border-gray-300 z-50 overflow-hidden flex flex-col">
      <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
        <h3 className="font-semibold">Gemini API Debug Panel</h3>
        <button
          onClick={() => setShowDebug(false)}
          className="text-gray-300 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        {/* Current Status */}
        <div className="mb-6">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Info size={16} />
            Current Status
          </h4>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {isApiConfigured ? (
                <CheckCircle className="text-green-500" size={16} />
              ) : (
                <AlertCircle className="text-yellow-500" size={16} />
              )}
              <span>API Configured: {isApiConfigured ? 'Yes' : 'No'}</span>
            </div>
            
            {error && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle size={16} />
                <span>Current Error: {error}</span>
              </div>
            )}
          </div>
        </div>

        {/* API Key Test */}
        <div className="mb-6">
          <h4 className="font-semibold mb-2">Test Gemini API Connection</h4>
          <div className="space-y-3">
            <input
              id="test-api-key"
              type="password"
              placeholder="Enter Gemini API key to test"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <button
              onClick={testGeminiConnection}
              disabled={isTesting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {isTesting ? <Loader className="animate-spin" size={16} /> : null}
              {isTesting ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div>
          <h4 className="font-semibold mb-2">Test Results</h4>
          <div className="bg-gray-900 text-green-400 font-mono text-sm p-3 rounded-lg h-64 overflow-auto">
            {testResults.length === 0 ? (
              <div className="text-gray-500">No test results yet. Click "Test Connection" to begin.</div>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Quick Test Steps:</h4>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. <strong>Demo Mode:</strong> Don't enter API key, type "web app with database", click Generate</li>
            <li>2. <strong>Real Mode:</strong> Get API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" className="underline">Google AI Studio</a></li>
            <li>3. <strong>API Key Format:</strong> Should start with "AIza" and be ~39 characters long</li>
            <li>4. <strong>Check Console:</strong> Press F12 and look for 🚀 🎭 🤖 emoji logs</li>
            <li>5. <strong>Network Issues:</strong> Check if requests to generativelanguage.googleapis.com are blocked</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;
