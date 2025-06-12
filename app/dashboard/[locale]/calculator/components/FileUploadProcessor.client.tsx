'use client';
import React, { useRef } from 'react';

interface FileUploadProcessorProps {
  onFileUpload: (file: File) => void;
}

const FileUploadProcessor: React.FC<FileUploadProcessorProps> = ({
  onFileUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div className="my-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
    </div>
  );
};

export default FileUploadProcessor;
