import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, AlertCircle, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { extractText, validateFile } from '../services/fileProcessor';

interface FileUploadProps {
  onFileSelect: (result: { file: File | null; text: string; metadata: object | null }) => void;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  label?: string;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.txt'],
  maxSize = 10,
  label = 'Upload your CV',
  disabled = false
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [metadata, setMetadata] = useState<object | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [error, setError] = useState<string>('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isTextPreviewExpanded, setIsTextPreviewExpanded] = useState(false);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setProcessingProgress(0);
    setError('');
    setWarnings([]);

    try {
      // Validate file first
      const validation = validateFile(file, { 
        maxSize: maxSize * 1024 * 1024, 
        allowedTypes: acceptedTypes.map(type => type.replace('.', ''))
      });

      if (!validation.isValid) {
        throw new Error(validation.errors.join('. '));
      }

      if (validation.warnings.length > 0) {
        setWarnings(validation.warnings);
      }

      setProcessingProgress(25);

      // Extract text
      const result = await extractText(file);
      setProcessingProgress(75);

      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      setProcessingProgress(100);

      setExtractedText(result.text);
      setMetadata(result.metadata);
      setSelectedFile(file);

      // Notify parent component
      onFileSelect({
        file,
        text: result.text,
        metadata: result.metadata
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process file';
      setError(errorMessage);
      setSelectedFile(null);
      setExtractedText('');
      setMetadata(null);
      onFileSelect({ file: null, text: '', metadata: null });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors.some((e: any) => e.code === 'file-too-large')) {
        setError(`File is too large. Maximum size is ${maxSize}MB.`);
      } else if (rejection.errors.some((e: any) => e.code === 'file-invalid-type')) {
        setError(`File type not supported. Please use: ${acceptedTypes.join(', ')}`);
      } else {
        setError('File upload failed. Please try again.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      processFile(acceptedFiles[0]);
    }
  }, [maxSize, acceptedTypes]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      const mimeTypes: { [key: string]: string[] } = {
        '.pdf': ['application/pdf'],
        '.doc': ['application/msword'],
        '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        '.txt': ['text/plain']
      };
      if (mimeTypes[type]) {
        mimeTypes[type].forEach(mimeType => {
          acc[mimeType] = [];
        });
      }
      return acc;
    }, {} as any),
    maxSize: maxSize * 1024 * 1024,
    multiple: false,
    disabled: disabled || isProcessing
  });

  const removeFile = () => {
    if (showRemoveConfirmation) {
      setSelectedFile(null);
      setExtractedText('');
      setMetadata(null);
      setError('');
      setWarnings([]);
      setShowRemoveConfirmation(false);
      onFileSelect({ file: null, text: '', metadata: null });
    } else {
      setShowRemoveConfirmation(true);
      setTimeout(() => setShowRemoveConfirmation(false), 3000);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPreviewText = (text: string, maxLength: number = 200): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getBorderColor = () => {
    if (disabled) return 'border-gray-200';
    if (isDragReject || error) return 'border-red-300';
    if (isDragActive) return 'border-blue-500';
    if (selectedFile && extractedText) return 'border-green-300';
    return 'border-gray-300 hover:border-blue-400';
  };

  const getBackgroundColor = () => {
    if (disabled) return 'bg-gray-50';
    if (isDragReject || error) return 'bg-red-50';
    if (isDragActive) return 'bg-blue-50';
    if (selectedFile && extractedText) return 'bg-green-50';
    return 'hover:bg-blue-50';
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      {!selectedFile || error ? (
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${getBorderColor()} ${getBackgroundColor()}`}
        >
          <input {...getInputProps()} />
          
          {isProcessing ? (
            <div className="space-y-4">
              <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin" />
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">Processing file...</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600">{processingProgress}% complete</p>
              </div>
            </div>
          ) : (
            <>
              <Upload className={`mx-auto h-12 w-12 mb-4 ${
                error ? 'text-red-400' : isDragActive ? 'text-blue-500' : 'text-gray-400'
              }`} />
              
              <p className="text-lg font-medium text-gray-900 mb-2">
                {isDragActive 
                  ? 'Drop your file here' 
                  : error 
                  ? 'Upload failed - try again' 
                  : 'Upload your CV'}
              </p>
              
              <p className="text-sm text-gray-600 mb-4">
                Drag and drop your file here, or click to browse
              </p>
              
              <p className="text-xs text-gray-500">
                Supported formats: {acceptedTypes.join(', ')} (max {maxSize}MB)
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* File Info */}
          <div className="border border-green-200 rounded-lg p-4 bg-green-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <File className="h-8 w-8 text-green-600" />
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    {formatFileSize(selectedFile.size)} • {metadata && (metadata as any).wordCount} words
                  </p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className={`text-gray-400 hover:text-red-500 transition-colors duration-200 ${
                  showRemoveConfirmation ? 'text-red-500 animate-pulse' : ''
                }`}
                title={showRemoveConfirmation ? 'Click again to confirm removal' : 'Remove file'}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Text Preview */}
          {extractedText && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900">Extracted Text Preview</h4>
                <button
                  onClick={() => setIsTextPreviewExpanded(!isTextPreviewExpanded)}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                >
                  {isTextPreviewExpanded ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                      <span>Collapse</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      <span>Expand</span>
                    </>
                  )}
                </button>
              </div>
              <div className="text-sm text-gray-700 bg-white p-3 rounded border max-h-32 overflow-y-auto">
                {isTextPreviewExpanded ? extractedText : getPreviewText(extractedText)}
              </div>
              {!isTextPreviewExpanded && extractedText.length > 200 && (
                <p className="text-xs text-gray-500 mt-1">
                  Showing first 200 characters of {extractedText.length} total
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="mt-2 space-y-1">
          {warnings.map((warning, index) => (
            <div key={index} className="flex items-center space-x-2 text-yellow-600">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">{warning}</p>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-2 flex items-center space-x-2 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {selectedFile && extractedText && !error && (
        <div className="mt-2 flex items-center space-x-2 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <p className="text-sm">
            File processed successfully! {(metadata as any)?.wordCount} words extracted.
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;