import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, Image, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import BaseRequest from '../../config/axios.config';

interface SingleFileUploadProps {
  onFileUploaded: (fileUrl: string) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
  className?: string;
  placeholder?: string;
  autoUpload?: boolean;
}

interface UploadState {
  file: File | null;
  preview: string | null;
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress: number;
  url?: string;
  error?: string;
}

export default function SingleFileUpload({
  onFileUploaded,
  acceptedFileTypes = ['image/*', 'application/pdf', 'text/*'],
  maxFileSize = 10,
  className = '',
  placeholder = 'Kéo thả file hoặc click để chọn',
  autoUpload = false
}: SingleFileUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    preview: null,
    status: 'idle',
    progress: 0
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const preview = URL.createObjectURL(file);
      setUploadState({
        file,
        preview,
        status: 'idle',
        progress: 0
      });

      if (autoUpload) {
        await uploadFile(file, preview);
      }
    },
    [autoUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce(
      (acc, type) => ({ ...acc, [type]: [] }),
      {}
    ),
    maxFiles: 1,
    maxSize: maxFileSize * 1024 * 1024, 
    disabled: uploadState.status === 'uploading'
  });

  const uploadFile = async (file: File, preview: string) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadState((prev) => ({ ...prev, status: 'uploading', progress: 0 }));

      const [error, response] = await BaseRequest.Post('/upload', formData);

      if (error) {
        throw new Error(error?.message || 'Upload failed');
      }
      console.log(response);

      const fileUrl = response?.downloadUrl;
      if (!fileUrl) {
        throw new Error('No file URL returned');
      }

      setUploadState((prev) => ({
        ...prev,
        status: 'success',
        progress: 100,
        url: fileUrl
      }));

      onFileUploaded(fileUrl);
    } catch (error: any) {
      setUploadState((prev) => ({
        ...prev,
        status: 'error',
        error: error.message
      }));
    }
  };

  const handleManualUpload = async () => {
    if (!uploadState.file) return;
    await uploadFile(uploadState.file, uploadState.preview!);
  };

  const clearFile = () => {
    if (uploadState.preview) {
      URL.revokeObjectURL(uploadState.preview);
    }
    setUploadState({
      file: null,
      preview: null,
      status: 'idle',
      progress: 0
    });
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  const getStatusIcon = (status: UploadState['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'uploading':
        return (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        );
      default:
        return null;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploadState.status === 'uploading' ? 'cursor-not-allowed opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive ? 'Thả file vào đây...' : placeholder}
        </p>
        <p className="mt-1 text-xs text-gray-500">Tối đa {maxFileSize}MB</p>
      </div>

      {/* File Preview */}
      {uploadState.file && (
        <div className="space-y-3">
          {/* Image Preview cho ảnh */}
          {uploadState.file.type.startsWith('image/') &&
            uploadState.preview && (
              <div className="rounded-lg border p-3">
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Preview:
                </p>
                <img
                  src={uploadState.preview}
                  alt="File preview"
                  className="h-32 w-32 rounded object-cover"
                />
              </div>
            )}

          {/* File Info */}
          <div className="flex items-center space-x-3 rounded-lg border p-3">
            <div className="flex-shrink-0">{getFileIcon(uploadState.file)}</div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {uploadState.file.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(uploadState.file.size)}
              </p>

              {uploadState.status === 'uploading' && (
                <div className="mt-2">
                  <Progress value={uploadState.progress} className="h-2" />
                  <p className="mt-1 text-xs text-gray-500">
                    Đang upload... {uploadState.progress}%
                  </p>
                </div>
              )}

              {uploadState.status === 'error' && (
                <Alert className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    {uploadState.error}
                  </AlertDescription>
                </Alert>
              )}

              {uploadState.status === 'success' && uploadState.url && (
                <p className="mt-1 text-xs text-green-600">Upload thành công</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {getStatusIcon(uploadState.status)}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFile}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Button - chỉ hiển thị khi không auto upload */}
      {uploadState.file && uploadState.status === 'idle' && !autoUpload && (
        <Button onClick={handleManualUpload} className="w-full">
          Upload File
        </Button>
      )}
    </div>
  );
}
