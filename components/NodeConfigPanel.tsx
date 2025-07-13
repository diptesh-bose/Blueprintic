import React, { useState } from 'react';
import { Node } from 'reactflow';

interface NodeConfigPanelProps {
  node: Node | null;
  onSave: (nodeId: string, newData: any) => void;
  onClose: () => void;
}

const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({ node, onSave, onClose }) => {
  const [formData, setFormData] = useState<Record<string, string>>(node?.data?.properties || {});

  if (!node) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(node.id, { properties: formData });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 transform transition-all duration-300 scale-95 animate-scale-in">
        <h2 className="text-lg font-semibold mb-4">Edit {node.data.label} Configuration</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {Object.entries(formData).map(([key, value], idx) => (
            <div
              key={key}
              className="transition-all duration-200 animate-fade-in"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <label className="block text-sm font-medium mb-1">{key}</label>
              <input
                className="w-full border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-400 transition-shadow duration-200"
                name={key}
                value={String(value)}
                onChange={handleChange}
                type="text"
              />
            </div>
          ))}
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 transition-colors duration-150" onClick={onClose}>Cancel</button>
            <button type="submit" className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-150">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NodeConfigPanel;
