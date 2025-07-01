import { useState } from 'react';
import { Button, Textarea } from '../../components/ui';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

const PromptInput = ({ onSubmit, isLoading }: PromptInputProps) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = () => {
    if (prompt.trim()) {
      onSubmit(prompt);
    }
  };

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-2">Describe Your Azure Infrastructure</h2>
      <p className="text-sm text-gray-600 mb-4">
        Describe the infrastructure you need in natural language, and our AI will generate a design for you.
      </p>
      <Textarea
        placeholder="Example: I need a web application with a SQL database, storage for user uploads, and authentication..."
        value={prompt}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
        className="min-h-[120px] mb-4"
      />
      <Button 
        onClick={handleSubmit} 
        disabled={isLoading || !prompt.trim()}
        className="w-full"
      >
        {isLoading ? 'Generating...' : 'Generate Infrastructure'}
      </Button>
    </div>
  );
};

export default PromptInput;
