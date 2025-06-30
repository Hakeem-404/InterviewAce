import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure PDF.js worker with local worker file
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Extract text from PDF files
 * @param {File} file - PDF file to process
 * @returns {Promise<string>} - Extracted text content
 */
export const extractTextFromPDF = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map(item => item.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (pageText) {
        fullText += pageText + '\n\n';
      }
    }

    return fullText.trim();
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF. The file may be corrupted or password-protected.');
  }
};

/**
 * Extract text from Word documents (.docx)
 * @param {File} file - Word document to process
 * @returns {Promise<string>} - Extracted text content
 */
export const extractTextFromWord = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    if (result.messages && result.messages.length > 0) {
      console.warn('Word document processing warnings:', result.messages);
    }

    return result.value.trim();
  } catch (error) {
    console.error('Word extraction error:', error);
    throw new Error('Failed to extract text from Word document. The file may be corrupted or in an unsupported format.');
  }
};

/**
 * Extract text from plain text files
 * @param {File} file - Text file to process
 * @returns {Promise<string>} - File content
 */
export const extractTextFromTxt = async (file) => {
  try {
    const text = await file.text();
    return text.trim();
  } catch (error) {
    console.error('Text file reading error:', error);
    throw new Error('Failed to read text file. The file may be corrupted.');
  }
};

/**
 * Clean and preprocess extracted text
 * @param {string} text - Raw extracted text
 * @returns {string} - Cleaned text
 */
export const preprocessText = (text) => {
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove special characters that might interfere with processing
    .replace(/[^\w\s\-.,;:()[\]{}'"@#$%&*+=<>?/\\|`~]/g, '')
    // Normalize line breaks
    .replace(/\n\s*\n/g, '\n\n')
    // Trim whitespace
    .trim();
};

/**
 * Unified text extraction function that handles all supported file types
 * @param {File} file - File to process
 * @returns {Promise<{text: string, metadata: object}>} - Extracted text and metadata
 */
export const extractText = async (file) => {
  if (!file) {
    throw new Error('No file provided for text extraction.');
  }

  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  const metadata = {
    filename: file.name,
    size: file.size,
    type: file.type,
    extension: fileExtension,
    lastModified: file.lastModified
  };

  let extractedText = '';

  try {
    switch (fileExtension) {
      case 'pdf':
        extractedText = await extractTextFromPDF(file);
        break;
      case 'docx':
        extractedText = await extractTextFromWord(file);
        break;
      case 'doc':
        // Note: .doc files are not fully supported by mammoth, but we'll try
        try {
          extractedText = await extractTextFromWord(file);
        } catch (docError) {
          throw new Error('Legacy .doc files are not fully supported. Please convert to .docx format or use PDF/TXT.');
        }
        break;
      case 'txt':
        extractedText = await extractTextFromTxt(file);
        break;
      default:
        throw new Error(`Unsupported file type: .${fileExtension}. Please use PDF, DOCX, or TXT files.`);
    }

    if (!extractedText || extractedText.length < 10) {
      throw new Error('No readable text found in the file. Please ensure the file contains text content.');
    }

    const cleanedText = preprocessText(extractedText);
    
    return {
      text: cleanedText,
      metadata: {
        ...metadata,
        textLength: cleanedText.length,
        wordCount: cleanedText.split(/\s+/).length,
        extractedAt: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('Text extraction failed:', error);
    throw error;
  }
};

/**
 * Validate file before processing
 * @param {File} file - File to validate
 * @param {object} options - Validation options
 * @returns {object} - Validation result
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['pdf', 'docx', 'doc', 'txt']
  } = options;

  const errors = [];
  const warnings = [];

  if (!file) {
    errors.push('No file provided');
    return { isValid: false, errors, warnings };
  }

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${maxSize / 1024 / 1024}MB)`);
  }

  // Check file type
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  if (!allowedTypes.includes(fileExtension)) {
    errors.push(`File type .${fileExtension} is not supported. Allowed types: ${allowedTypes.join(', ')}`);
  }

  // Check for empty files
  if (file.size === 0) {
    errors.push('File appears to be empty');
  }

  // Warnings for potentially problematic files
  if (fileExtension === 'doc') {
    warnings.push('Legacy .doc files may not extract perfectly. Consider using .docx format for best results.');
  }

  if (file.size < 1024) {
    warnings.push('File seems very small. Please ensure it contains your complete CV/resume.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};