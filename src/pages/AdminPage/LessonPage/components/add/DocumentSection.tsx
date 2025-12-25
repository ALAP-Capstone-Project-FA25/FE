import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Link as LinkIcon } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface DocumentSectionProps {
  documentUrl: string;
  documentContent: string;
  onDocumentUrlChange: (url: string) => void;
  onDocumentContentChange: (content: string) => void;
}

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ color: [] }, { background: [] }],
    ['link', 'image', 'code-block'],
    ['clean']
  ]
};

export function DocumentSection({
  documentUrl,
  documentContent,
  onDocumentUrlChange,
  onDocumentContentChange
}: DocumentSectionProps) {
  const [activeTab, setActiveTab] = useState<'url' | 'content'>('url');

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <FileText className="h-5 w-5 text-blue-600" />
          Nội dung tài liệu
        </CardTitle>
        <CardDescription>
          Thêm link tài liệu hoặc soạn nội dung trực tiếp
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">
              <LinkIcon className="mr-2 h-4 w-4" />
              Link tài liệu
            </TabsTrigger>
            <TabsTrigger value="content">
              <FileText className="mr-2 h-4 w-4" />
              Soạn nội dung
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="documentUrl">URL tài liệu</Label>
              <Input
                id="documentUrl"
                placeholder="https://docs.google.com/... hoặc link PDF"
                value={documentUrl}
                onChange={(e) => onDocumentUrlChange(e.target.value)}
                className="focus-visible:ring-blue-500"
              />
              <p className="text-xs text-gray-500">
                Hỗ trợ: Google Docs, PDF, Word Online, v.v.
              </p>
            </div>

            {documentUrl && (
              <div className="rounded-lg border-2 border-dashed border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-medium text-blue-900">
                  Link đã nhập:
                </p>
                <a
                  href={documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block truncate text-sm text-blue-600 underline"
                >
                  {documentUrl}
                </a>
              </div>
            )}
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <div className="space-y-2">
              <Label>Nội dung tài liệu</Label>
              <div className="rounded-lg border">
                <ReactQuill
                  theme="snow"
                  value={documentContent}
                  onChange={onDocumentContentChange}
                  modules={quillModules}
                  className="min-h-[300px]"
                  placeholder="Nhập nội dung tài liệu học tập..."
                />
              </div>
              <p className="text-xs text-gray-500">
                Sử dụng editor để định dạng văn bản, thêm hình ảnh, link, v.v.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
