import { useState } from 'react';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { downloadQuestionTemplate, parseExcelFile, validateImportedQuestions, ImportedQuestion } from '@/utils/excel.utils';
import { useCreateUpdateTopicQuestion } from '@/queries/topic-question.query';
import { useParams } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

interface ExcelImportDialogProps {
  onImportSuccess: () => void;
}

export default function ExcelImportDialog({ onImportSuccess }: ExcelImportDialogProps) {
  const { topicId } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importedQuestions, setImportedQuestions] = useState<ImportedQuestion[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [step, setStep] = useState<'upload' | 'preview' | 'importing'>('upload');
  
  const { mutateAsync: createUpdateTopicQuestion } = useCreateUpdateTopicQuestion();

  const handleDownloadTemplate = () => {
    downloadQuestionTemplate();
    toast({
      title: 'Thành công!',
      description: 'Template Excel đã được tải xuống',
      variant: 'default'
    });
  };

  const handleFileSelect = async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn file Excel (.xlsx hoặc .xls)',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    try {
      const questions = await parseExcelFile(file);
      const errors = validateImportedQuestions(questions);
      
      setImportedQuestions(questions);
      setValidationErrors(errors);
      setStep('preview');
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: (error as Error).message,
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleImport = async () => {
    if (validationErrors.length > 0) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng sửa các lỗi trước khi import',
        variant: 'destructive'
      });
      return;
    }

    setStep('importing');
    let successCount = 0;
    let errorCount = 0;

    for (const question of importedQuestions) {
      try {
        const payload = {
          id: 0,
          topicId: Number(topicId),
          maxChoices: question.maxChoices,
          question: question.question,
          answers: question.answers.map((a) => ({
            id: 0,
            answer: a.answer,
            isCorrect: a.isCorrect
          }))
        };

        const [err] = await createUpdateTopicQuestion(payload);
        if (err) {
          errorCount++;
        } else {
          successCount++;
        }
      } catch (error) {
        errorCount++;
      }
    }

    toast({
      title: successCount > 0 ? 'Hoàn thành!' : 'Lỗi',
      description: `Import thành công ${successCount} câu hỏi${errorCount > 0 ? `, ${errorCount} câu hỏi lỗi` : ''}`,
      variant: successCount > 0 ? 'default' : 'destructive'
    });

    if (successCount > 0) {
      onImportSuccess();
      setIsOpen(false);
      resetState();
    }
  };

  const resetState = () => {
    setStep('upload');
    setImportedQuestions([]);
    setValidationErrors([]);
    setIsProcessing(false);
  };

  const renderUploadStep = () => (
    <div className="space-y-6">
      {/* Download Template Section */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <FileSpreadsheet className="h-5 w-5" />
            Bước 1: Tải Template
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-blue-800">
            Tải xuống template Excel mẫu để tạo câu hỏi theo đúng định dạng
          </p>
          <Button 
            onClick={handleDownloadTemplate}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            <Download className="mr-2 h-4 w-4" />
            Tải Template Excel
          </Button>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bước 2: Upload File Excel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              isDragOver
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
          >
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileInputChange}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              disabled={isProcessing}
            />
            
            <div className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <FileSpreadsheet className="h-8 w-8 text-gray-600" />
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {isProcessing ? 'Đang xử lý...' : 'Kéo thả file Excel vào đây'}
                </p>
                <p className="text-sm text-gray-600">
                  hoặc click để chọn file (.xlsx, .xls)
                </p>
              </div>
              
              {isProcessing && (
                <div className="flex justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Lưu ý:</strong> File Excel phải tuân theo định dạng template. 
          Mỗi câu hỏi cần có ít nhất 2 đáp án và ít nhất 1 đáp án đúng.
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Xem trước dữ liệu</h3>
          <p className="text-sm text-gray-600">
            Tìm thấy {importedQuestions.length} câu hỏi
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetState}>
            Chọn file khác
          </Button>
          <Button 
            onClick={handleImport}
            disabled={validationErrors.length > 0}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Import {importedQuestions.length} câu hỏi
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <strong>Phát hiện {validationErrors.length} lỗi:</strong>
              <ul className="list-disc pl-4 space-y-1">
                {validationErrors.slice(0, 5).map((error, index) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
                {validationErrors.length > 5 && (
                  <li className="text-sm">... và {validationErrors.length - 5} lỗi khác</li>
                )}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Questions Preview */}
      <div className="max-h-96 space-y-4 overflow-y-auto">
        {importedQuestions.slice(0, 3).map((question, index) => (
          <Card key={index} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Badge variant="secondary" className="mb-2">
                    Câu {index + 1}
                  </Badge>
                  <CardTitle className="text-base">{question.question}</CardTitle>
                </div>
                <Badge variant="outline">
                  Chọn tối đa: {question.maxChoices}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {question.answers.map((answer, answerIndex) => (
                  <div
                    key={answerIndex}
                    className={`flex items-center gap-2 rounded p-2 text-sm ${
                      answer.isCorrect
                        ? 'bg-green-50 text-green-800'
                        : 'bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div
                      className={`h-3 w-3 rounded-full ${
                        answer.isCorrect ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                    {answer.answer}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {importedQuestions.length > 3 && (
          <div className="text-center text-sm text-gray-600">
            ... và {importedQuestions.length - 3} câu hỏi khác
          </div>
        )}
      </div>
    </div>
  );

  const renderImportingStep = () => (
    <div className="flex flex-col items-center justify-center space-y-4 py-12">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      <p className="text-lg font-medium">Đang import câu hỏi...</p>
      <p className="text-sm text-gray-600">Vui lòng đợi trong giây lát</p>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        resetState();
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <FileSpreadsheet size={20} />
          Import Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Câu Hỏi từ Excel</DialogTitle>
          <DialogDescription>
            Tải xuống template và upload file Excel để import hàng loạt câu hỏi
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {step === 'upload' && renderUploadStep()}
          {step === 'preview' && renderPreviewStep()}
          {step === 'importing' && renderImportingStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
}