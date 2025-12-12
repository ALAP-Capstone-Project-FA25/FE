import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, Image, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import BaseRequest from '../../config/axios.config';

interface FileUploadProps {
  maxFiles: number;
  onFileUploaded: (fileUrls: string[]) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in MB
  className?: string;
}

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  url?: string;
  error?: string;
}

export default function MultiFileUpload({
  maxFiles,
  onFileUploaded,
  acceptedFileTypes = ['image/*', 'application/pdf', 'text/*'],
  maxFileSize = 10, // 10MB default
  className = ''
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles: UploadedFile[] = acceptedFiles
        .slice(0, maxFiles - uploadedFiles.length)
        .map((file) => ({
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview: URL.createObjectURL(file),
          status: 'pending',
          progress: 0
        }));

      setUploadedFiles((prev) => [...prev, ...newFiles]);
    },
    [maxFiles, uploadedFiles.length]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce(
      (acc, type) => ({ ...acc, [type]: [] }),
      {}
    ),
    maxFiles: maxFiles - uploadedFiles.length,
    maxSize: maxFileSize * 1024 * 1024, // Convert MB to bytes
    disabled: uploadedFiles.length >= maxFiles || isUploading
  });

  const uploadFile = async (fileData: UploadedFile) => {
    const formData = new FormData();
    formData.append('file', fileData.file);

    try {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileData.id ? { ...f, status: 'uploading', progress: 0 } : f
        )
      );

      const [error, response] = await BaseRequest.Post('/upload', formData);

      if (error) {
        throw new Error(error.data?.message || 'Upload failed');
      }

      const fileUrl = response.data?.downloadUrl;
      if (!fileUrl) {
        throw new Error('No file URL returned');
      }

      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileData.id
            ? { ...f, status: 'success', progress: 100, url: fileUrl }
            : f
        )
      );

      return fileUrl;
    } catch (error: any) {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileData.id
            ? { ...f, status: 'error', error: error.message }
            : f
        )
      );
      throw error;
    }
  };

  const handleUploadAll = async () => {
    const pendingFiles = uploadedFiles.filter((f) => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsUploading(true);

    try {
      const uploadPromises = pendingFiles.map((fileData) =>
        uploadFile(fileData)
      );
      const urls = await Promise.all(uploadPromises);

      // Gọi callback với tất cả URLs
      const allUrls = uploadedFiles
        .filter((f) => f.status === 'success')
        .map((f) => f.url!)
        .concat(urls);

      onFileUploaded(allUrls);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => {
      const file = prev.find((f) => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
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
          ${uploadedFiles.length >= maxFiles ? 'cursor-not-allowed opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? 'Thả files vào đây...'
            : `Kéo thả files hoặc click để chọn (tối đa ${maxFiles} files, ${maxFileSize}MB mỗi file)`}
        </p>
        {uploadedFiles.length >= maxFiles && (
          <p className="mt-1 text-sm text-red-500">
            Đã đạt giới hạn số lượng files
          </p>
        )}
      </div>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Files đã chọn:</h4>
          {uploadedFiles.map((fileData) => (
            <div
              key={fileData.id}
              className="flex items-center space-x-3 rounded-lg border p-3"
            >
              <div className="flex-shrink-0">{getFileIcon(fileData.file)}</div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {fileData.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(fileData.file.size)}
                </p>

                {fileData.status === 'uploading' && (
                  <div className="mt-2">
                    <Progress value={fileData.progress} className="h-2" />
                    <p className="mt-1 text-xs text-gray-500">
                      Đang upload... {fileData.progress}%
                    </p>
                  </div>
                )}

                {fileData.status === 'error' && (
                  <Alert className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      {fileData.error}
                    </AlertDescription>
                  </Alert>
                )}

                {fileData.status === 'success' && fileData.url && (
                  <p className="mt-1 text-xs text-green-600">
                    Upload thành công
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {getStatusIcon(fileData.status)}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(fileData.id)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {uploadedFiles.some((f) => f.status === 'pending') && (
        <Button
          onClick={handleUploadAll}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading
            ? 'Đang upload...'
            : `Upload ${uploadedFiles.filter((f) => f.status === 'pending').length} files`}
        </Button>
      )}

      {/* Summary */}
      {uploadedFiles.length > 0 && (
        <div className="text-sm text-gray-600">
          <p>
            Đã chọn: {uploadedFiles.length}/{maxFiles} files
          </p>
          <p>
            Thành công:{' '}
            {uploadedFiles.filter((f) => f.status === 'success').length} files
          </p>
          {uploadedFiles.some((f) => f.status === 'error') && (
            <p className="text-red-500">
              Lỗi: {uploadedFiles.filter((f) => f.status === 'error').length}{' '}
              files
            </p>
          )}
        </div>
      )}
    </div>
  );
}
