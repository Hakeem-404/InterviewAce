import React, { useState } from 'react';
import { FileText, Upload } from 'lucide-react';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
  value,
  onChange,
  placeholder = "Paste the job description here or upload as a file..."
}) => {
  const [charCount, setCharCount] = useState(value.length);
  const maxChars = 5000;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxChars) {
      onChange(newValue);
      setCharCount(newValue.length);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text.length <= maxChars) {
          onChange(text);
          setCharCount(text.length);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Job Description
        </label>
        <div className="flex items-center space-x-4">
          <span className={`text-xs ${
            charCount > maxChars * 0.9 ? 'text-red-600' : 'text-gray-500'
          }`}>
            {charCount}/{maxChars}
          </span>
          <label className="cursor-pointer text-blue-600 hover:text-blue-700 transition-colors duration-200">
            <input
              type="file"
              accept=".txt,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex items-center space-x-1 text-xs">
              <Upload className="h-3 w-3" />
              <span>Upload file</span>
            </div>
          </label>
        </div>
      </div>
      
      <div className="relative">
        <textarea
          value={value}
          onChange={handleTextChange}
          placeholder={placeholder}
          rows={12}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
        />
        
        {value.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-gray-400">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No job description provided</p>
            </div>
          </div>
        )}
      </div>
      
      <p className="mt-2 text-xs text-gray-600">
        Provide a detailed job description to get more personalized interview questions.
      </p>
    </div>
  );
};

export default JobDescriptionInput;