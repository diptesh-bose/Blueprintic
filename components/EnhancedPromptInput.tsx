import React, { useState, useRef } from 'react';
import { Send, Loader, Key, AlertCircle, Sparkles, Settings, X } from 'lucide-react';
import { useGenAI } from '../contexts/EnhancedGenAIContext';

interface PromptInputProps {
  className?: string;
}

const PromptInput: React.FC<PromptInputProps> = ({ className = '' }) => {
  const [inputValue, setInputValue] = useState('');
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { 
    processPrompt, 
    optimizeInfrastructure,
    isProcessing, 
    error, 
    clearError,
    setApiKey: setGeminiApiKey,
    isApiConfigured,
    clearGenerated
  } = useGenAI();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;
    
    console.log('🚀 EnhancedPromptInput handleSubmit called with:', inputValue);
    console.log('🔧 API Configured:', isApiConfigured);
    
    clearError();
    try {
      await processPrompt(inputValue.trim());
      setInputValue('');
      console.log('✅ Prompt processed successfully');
    } catch (error) {
      console.error('❌ Error in handleSubmit:', error);
    }
  };

  const handleOptimize = async () => {
    if (isProcessing) return;
    clearError();
    await optimizeInfrastructure();
  };

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      setGeminiApiKey(apiKey.trim());
      setShowApiConfig(false);
      setApiKey('');
    }
  };

  const examplePrompts = [
    "I need a web application with a SQL database, storage for user uploads, and authentication",
    "Create a microservices architecture with API gateway, multiple services, and message queuing",
    "Build a data analytics platform with data lake, processing pipeline, and dashboard",
    "Design a machine learning solution with model training, deployment, and monitoring"
  ];

  const handleExampleClick = (prompt: string) => {
    setInputValue(prompt);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-blue-500" size={20} />
            <h3 className="text-lg font-semibold text-gray-800">Describe Your Infrastructure</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowApiConfig(true)}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${isApiConfigured
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                }
              `}
            >
              <Key size={14} />
              {isApiConfigured ? 'API Configured' : 'Configure API'}
            </button>
            
            {isApiConfigured && (
              <button
                onClick={clearGenerated}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* API Configuration Modal */}
      {showApiConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800">Configure Gemini API</h4>
              <button
                onClick={() => setShowApiConfig(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                Enter your Google Gemini API key to enable AI-powered infrastructure generation.
                You can get your API key from{' '}
                <a 
                  href="https://makersuite.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Google AI Studio
                </a>
              </p>
              
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleApiKeySubmit}
                  disabled={!apiKey.trim()}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save API Key
                </button>
                <button
                  onClick={() => setShowApiConfig(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="text-red-500 flex-shrink-0" size={16} />
          <span className="text-red-700 text-sm">{error}</span>
          <button
            onClick={clearError}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Input */}
      <div className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                isApiConfigured 
                  ? "Describe your Azure infrastructure needs in natural language..."
                  : "Describe your infrastructure needs - this will run in demo mode (configure API key for AI generation)"
              }
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
            
            <div className="absolute bottom-3 right-3 flex gap-2">
              <button
                type="button"
                onClick={handleOptimize}
                disabled={!isApiConfigured || isProcessing}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Settings size={14} />
                Optimize
              </button>
              
              <button
                type="submit"
                disabled={!inputValue.trim() || isProcessing}
                className="flex items-center gap-2 px-4 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? (
                  <Loader className="animate-spin" size={14} />
                ) : (
                  <Send size={14} />
                )}
                {isProcessing ? 'Generating...' : (isApiConfigured ? 'Generate' : 'Demo Mode')}
              </button>
            </div>
          </div>
        </form>

        {/* Example Prompts */}
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">
            Try these examples {!isApiConfigured && '(demo mode)'}:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {examplePrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(prompt)}
                className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptInput;
