import { FileText, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DocumentViewerProps {
  documentUrl?: string;
  documentContent?: string;
  title: string;
}

export default function DocumentViewer({
  documentUrl,
  documentContent,
  title
}: DocumentViewerProps) {
  if (documentUrl) {
    return (
      <div className="flex h-full flex-col bg-gray-900 p-4">
        <Card className="flex-1">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {title}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(documentUrl, '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Mở trong tab mới
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <iframe
              src={documentUrl}
              className="h-[calc(100vh-300px)] w-full"
              title={title}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (documentContent) {
    return (
      <div className="flex h-full flex-col bg-gray-900 p-4">
        <Card className="flex-1">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none p-6">
            <div
              className="ql-editor"
              dangerouslySetInnerHTML={{ __html: documentContent }}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center bg-gray-900">
      <div className="text-center">
        <FileText className="mx-auto h-16 w-16 text-gray-600" />
        <p className="mt-4 text-gray-400">Không có nội dung tài liệu</p>
      </div>
    </div>
  );
}
