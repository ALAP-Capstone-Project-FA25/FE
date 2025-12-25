import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  MarkerType,
  Handle,
  Position,
  addEdge,
  Connection,
  OnConnect
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  X,
  Book,
  CheckCircle2,
  Lock,
  Clock,
  TrendingUp,
  AlertCircle,
  Plus,
  Edit3,
  Save,
  Download,
  Trash2,
  Link,
  ExternalLink,
  GripVertical,
  Copy,
  Loader2
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import {
  useGetKnowledgeGraphBySubjectId,
  useImportKnowledgeGraph
} from '@/queries/knowledgrapth.query';
import { toast } from '@/components/ui/use-toast';
import { useGetListCourseByCategoryId } from '@/queries/course.query';

// ============================================
// INTERFACES 
// ============================================

interface Resource {
  id: string;
  name: string;
  url: string;
  courseId?: number;
}

interface NodeData {
  label: string;
  category: 'foundation' | 'core' | 'advanced' | 'optional';
  description: string;
  concepts: string[];
  examples: string[];
  prerequisites: string[];
  estimatedTime: string;
  difficulty: 'Cơ bản' | 'Trung bình' | 'Nâng cao';
  status: 'completed' | 'in-progress' | 'locked' | 'available';
  resources: Resource[];
}

type EditorMode = 'view' | 'edit';

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  salePrice: number;
  members: number;
  categoryId: number;
}

// API Response Interfaces
interface ApiNodeData {
  label: string;
  category: 'foundation' | 'core' | 'advanced' | 'optional';
  description: string;
  concepts: string[];
  examples: string[];
  prerequisites: string[];
  estimatedTime: string;
  difficulty: 'Cơ bản' | 'Trung bình' | 'Nâng cao';
  status: 'completed' | 'in-progress' | 'locked' | 'available';
  resources: Resource[];
}

interface ApiNode {
  id: string;
  position: { x: number; y: number };
  data: ApiNodeData;
}

interface ApiEdge {
  id: string;
  source: string;
  target: string;
  type: 'required' | 'optional';
}

interface ApiResponse {
  version: string;
  exportedAt: string;
  nodes: ApiNode[];
  edges: ApiEdge[];
}

// ============================================
// TRANSFORM FUNCTIONS
// ============================================

const transformApiNodesToReactFlowNodes = (
  apiNodes: ApiNode[]
): Node<NodeData>[] => {
  return apiNodes.map((apiNode) => ({
    id: apiNode.id,
    type: 'knowledge',
    position: apiNode.position,
    data: {
      label: apiNode.data.label,
      category: apiNode.data.category,
      description: apiNode.data.description,
      concepts: apiNode.data.concepts || [],
      examples: apiNode.data.examples || [],
      prerequisites: apiNode.data.prerequisites || [],
      estimatedTime: apiNode.data.estimatedTime,
      difficulty: apiNode.data.difficulty,
      status: apiNode.data.status,
      resources: apiNode.data.resources || []
    }
  }));
};

const transformApiEdgesToReactFlowEdges = (apiEdges: ApiEdge[]): Edge[] => {
  return apiEdges.map((apiEdge) => {
    const isOptional = apiEdge.type === 'optional';

    return {
      id: apiEdge.id,
      source: apiEdge.source,
      target: apiEdge.target,
      type: 'smoothstep',
      animated: !isOptional,
      style: isOptional
        ? { stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5,5' }
        : { stroke: '#3b82f6', strokeWidth: 3 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isOptional ? '#10b981' : '#3b82f6',
        width: 20,
        height: 20
      }
    };
  });
};

// ============================================
// CUSTOM NODE COMPONENT
// ============================================

const KnowledgeNode = ({
  data,
  selected
}: {
  data: NodeData;
  selected?: boolean;
}) => {
  const getCategoryStyle = () => {
    switch (data.category) {
      case 'foundation':
        return 'bg-gradient-to-br from-sky-50 to-sky-100 border-sky-500';
      case 'core':
        return 'bg-gradient-to-br from-violet-50 to-violet-100 border-violet-500';
      case 'advanced':
        return 'bg-gradient-to-br from-rose-50 to-rose-100 border-rose-500';
      case 'optional':
        return 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-500';
      default:
        return 'bg-white border-slate-400';
    }
  };

  const getStatusOverlay = () => {
    switch (data.status) {
      case 'completed':
        return 'ring-2 ring-emerald-500 ring-offset-2';
      case 'in-progress':
        return 'ring-2 ring-sky-500 ring-offset-2 animate-pulse';
      case 'locked':
        return 'opacity-60';
      default:
        return '';
    }
  };

  const getStatusIcon = () => {
    switch (data.status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
      case 'in-progress':
        return <TrendingUp className="h-5 w-5 text-sky-600" />;
      case 'locked':
        return <Lock className="h-5 w-5 text-slate-400" />;
      default:
        return <Book className="h-5 w-5 text-violet-600" />;
    }
  };

  const getCategoryLabel = () => {
    switch (data.category) {
      case 'foundation':
        return 'Nền tảng';
      case 'core':
        return 'Cốt lõi';
      case 'advanced':
        return 'Nâng cao';
      case 'optional':
        return 'Khuyên học';
      default:
        return '';
    }
  };

  return (
    <div
      className={`min-w-[220px] max-w-[280px] cursor-pointer rounded-2xl border-2 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${getCategoryStyle()} ${getStatusOverlay()} ${selected ? 'ring-4 ring-amber-400 ring-offset-2' : ''}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-3 !w-3 !border-2 !border-white !bg-violet-600"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-3 !w-3 !border-2 !border-white !bg-violet-600"
      />

      <div className="rounded-t-2xl border-b border-slate-200/50 bg-white/60 px-4 py-2 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {getCategoryLabel()}
          </span>
          {getStatusIcon()}
        </div>
      </div>

      <div className="px-4 py-3">
        <div className="mb-2 text-base font-bold leading-tight text-slate-800">
          {data.label}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Clock className="h-3 w-3" />
          <span>{data.estimatedTime}</span>
          <span className="mx-1 text-slate-300">•</span>
          <span className="font-semibold">{data.difficulty}</span>
        </div>
      </div>

      {data.prerequisites.length > 0 && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <AlertCircle className="h-3 w-3" />
            <span>{data.prerequisites.length} kiến thức cần thiết</span>
          </div>
        </div>
      )}
    </div>
  );
};

const nodeTypes = { knowledge: KnowledgeNode };

// ============================================
// NODE EDITOR DIALOG
// ============================================

const NodeEditorDialog = ({
  node,
  allNodes,
  onSave,
  onDelete,
  onClose,
  isNew = false,
  listCourse = [],
  onSaveToServer,
  isSaving = false
}: {
  node: Node<NodeData>;
  allNodes: Node<NodeData>[];
  onSave: (node: Node<NodeData>) => void;
  onDelete?: (nodeId: string) => void;
  onClose: () => void;
  isNew?: boolean;
  listCourse?: Course[];
  onSaveToServer?: () => Promise<void>;
  isSaving?: boolean;
}) => {
  const [formData, setFormData] = useState<NodeData>({ ...node.data });
  const [newConcept, setNewConcept] = useState('');
  const [newExample, setNewExample] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  const handleSave = async () => {
    onSave({
      ...node,
      data: formData
    });

    // Call API to save to server after updating local state
    if (onSaveToServer) {
      await onSaveToServer();
    }

    onClose();
  };

  const addConcept = () => {
    if (newConcept.trim()) {
      setFormData({
        ...formData,
        concepts: [...formData.concepts, newConcept.trim()]
      });
      setNewConcept('');
    }
  };

  const removeConcept = (index: number) => {
    setFormData({
      ...formData,
      concepts: formData.concepts.filter((_, i) => i !== index)
    });
  };

  const addExample = () => {
    if (newExample.trim()) {
      setFormData({
        ...formData,
        examples: [...formData.examples, newExample.trim()]
      });
      setNewExample('');
    }
  };

  const removeExample = (index: number) => {
    setFormData({
      ...formData,
      examples: formData.examples.filter((_, i) => i !== index)
    });
  };

  const addResourceFromCourse = () => {
    if (!selectedCourseId) return;

    const course = listCourse.find((c) => c.id === Number(selectedCourseId));
    if (!course) return;

    // Check if course already added
    const alreadyExists = formData.resources.some(
      (r) => r.courseId === course.id
    );
    if (alreadyExists) {
      return;
    }

    const resource: Resource = {
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: course.title,
      url: `/course/${course.id}`,
      courseId: course.id
    };

    setFormData({
      ...formData,
      resources: [...formData.resources, resource]
    });
    setSelectedCourseId('');
  };

  const removeResource = (id: string) => {
    setFormData({
      ...formData,
      resources: formData.resources.filter((r) => r.id !== id)
    });
  };

  const togglePrerequisite = (nodeId: string) => {
    if (formData.prerequisites.includes(nodeId)) {
      setFormData({
        ...formData,
        prerequisites: formData.prerequisites.filter((p) => p !== nodeId)
      });
    } else {
      setFormData({
        ...formData,
        prerequisites: [...formData.prerequisites, nodeId]
      });
    }
  };

  // Filter out courses that are already added
  const availableCourses = listCourse.filter(
    (course) => !formData.resources.some((r) => r.courseId === course.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 rounded-t-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {isNew ? 'Tạo Node Mới' : 'Chỉnh Sửa Node'}
              </h2>
              <p className="mt-1 text-violet-100">
                Điền thông tin chi tiết cho node
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-2 transition-colors hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6 p-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Tên Node *
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 outline-none transition-all focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                placeholder="VD: Limits, Derivatives..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Phân loại *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as NodeData['category']
                  })
                }
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 outline-none transition-all focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              >
                <option value="foundation">🏗️ Nền tảng</option>
                <option value="core">⭐ Cốt lõi</option>
                <option value="advanced">🚀 Nâng cao</option>
                <option value="optional">💡 Khuyên học</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Độ khó
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    difficulty: e.target.value as NodeData['difficulty']
                  })
                }
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 outline-none transition-all focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              >
                <option value="Cơ bản">Cơ bản</option>
                <option value="Trung bình">Trung bình</option>
                <option value="Nâng cao">Nâng cao</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Thời gian ước tính
              </label>
              <input
                type="text"
                value={formData.estimatedTime}
                onChange={(e) =>
                  setFormData({ ...formData, estimatedTime: e.target.value })
                }
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 outline-none transition-all focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                placeholder="VD: 2 tuần"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full resize-none rounded-xl border-2 border-slate-200 px-4 py-3 outline-none transition-all focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              rows={3}
              placeholder="Mô tả chi tiết về kiến thức này..."
            />
          </div>

          {/* Prerequisites */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <label className="mb-3 block text-sm font-semibold text-slate-700">
              <AlertCircle className="mr-1 inline h-4 w-4 text-amber-600" />
              Kiến thức cần có trước
            </label>
            <div className="flex flex-wrap gap-2">
              {allNodes
                .filter((n) => n.id !== node.id)
                .map((n) => (
                  <button
                    key={n.id}
                    onClick={() => togglePrerequisite(n.id)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                      formData.prerequisites.includes(n.id)
                        ? 'bg-amber-500 text-white shadow-lg'
                        : 'border border-slate-200 bg-white text-slate-600 hover:border-amber-400'
                    }`}
                  >
                    {n.data.label}
                  </button>
                ))}
            </div>
          </div>

          {/* Concepts */}
          <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
            <label className="mb-3 block text-sm font-semibold text-slate-700">
              <Book className="mr-1 inline h-4 w-4 text-violet-600" />
              Các khái niệm chính
            </label>
            <div className="mb-3 space-y-2">
              {formData.concepts.map((concept, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-lg border border-violet-100 bg-white p-2"
                >
                  <GripVertical className="h-4 w-4 text-slate-300" />
                  <span className="flex-1 text-sm text-slate-700">
                    {concept}
                  </span>
                  <button
                    onClick={() => removeConcept(index)}
                    className="rounded-lg p-1 text-rose-500 transition-colors hover:bg-rose-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newConcept}
                onChange={(e) => setNewConcept(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addConcept()}
                className="flex-1 rounded-lg border border-violet-200 px-3 py-2 text-sm outline-none focus:border-violet-500"
                placeholder="Thêm khái niệm mới..."
              />
              <button
                onClick={addConcept}
                className="rounded-lg bg-violet-600 px-4 py-2 text-white transition-colors hover:bg-violet-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Examples */}
          <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
            <label className="mb-3 block text-sm font-semibold text-slate-700">
              <TrendingUp className="mr-1 inline h-4 w-4 text-sky-600" />
              Ví dụ ứng dụng
            </label>
            <div className="mb-3 space-y-2">
              {formData.examples.map((example, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-lg border border-sky-100 bg-white p-2"
                >
                  <span className="flex-1 text-sm text-slate-700">
                    {example}
                  </span>
                  <button
                    onClick={() => removeExample(index)}
                    className="rounded-lg p-1 text-rose-500 transition-colors hover:bg-rose-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newExample}
                onChange={(e) => setNewExample(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addExample()}
                className="flex-1 rounded-lg border border-sky-200 px-3 py-2 text-sm outline-none focus:border-sky-500"
                placeholder="Thêm ví dụ mới..."
              />
              <button
                onClick={addExample}
                className="rounded-lg bg-sky-600 px-4 py-2 text-white transition-colors hover:bg-sky-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Resources with Course Selector */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <label className="mb-3 block text-sm font-semibold text-slate-700">
              <Link className="mr-1 inline h-4 w-4 text-emerald-600" />
              Khóa học liên quan
            </label>
            <div className="mb-3 space-y-2">
              {formData.resources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-white p-3"
                >
                  <ExternalLink className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-slate-700">
                      {resource.name}
                    </div>
                    <div className="truncate text-xs text-emerald-600">
                      {resource.url}
                    </div>
                  </div>
                  <button
                    onClick={() => removeResource(resource.id)}
                    className="flex-shrink-0 rounded-lg p-1 text-rose-500 transition-colors hover:bg-rose-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="flex-1 rounded-lg border border-emerald-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              >
                <option value="">-- Chọn khóa học --</option>
                {availableCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
              <button
                onClick={addResourceFromCourse}
                disabled={!selectedCourseId}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {listCourse.length === 0 && (
              <p className="mt-2 text-xs text-slate-500">
                Chưa có khóa học nào trong danh mục này
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 border-t border-slate-200 pt-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  {isNew ? 'Tạo Node' : 'Lưu Thay Đổi'}
                </>
              )}
            </button>
            {!isNew && onDelete && (
              <button
                onClick={() => {
                  if (confirm('Bạn có chắc muốn xóa node này?')) {
                    onDelete(node.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-2 rounded-xl bg-rose-100 px-6 py-3 font-semibold text-rose-600 transition-colors hover:bg-rose-200"
              >
                <Trash2 className="h-5 w-5" />
                Xóa
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-xl bg-slate-100 px-6 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-200"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// VIEW DETAIL DIALOG (Read-only)
// ============================================

const KnowledgeDetailDialog = ({
  node,
  allNodes,
  onClose,
  onEdit
}: {
  node: Node<NodeData> | null;
  allNodes: Node<NodeData>[];
  onClose: () => void;
  onEdit?: () => void;
}) => {
  if (!node) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Cơ bản':
        return 'bg-emerald-100 text-emerald-800';
      case 'Trung bình':
        return 'bg-amber-100 text-amber-800';
      case 'Nâng cao':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getCategoryBadge = () => {
    const badges = {
      foundation: { color: 'bg-sky-100 text-sky-800', label: '🏗️ Nền tảng' },
      core: { color: 'bg-violet-100 text-violet-800', label: '⭐ Cốt lõi' },
      advanced: { color: 'bg-rose-100 text-rose-800', label: '🚀 Nâng cao' },
      optional: {
        color: 'bg-emerald-100 text-emerald-800',
        label: '💡 Khuyên học'
      }
    };
    const badge = badges[node.data.category] || badges.foundation;
    return (
      <span
        className={`rounded-full px-3 py-1 text-sm font-semibold ${badge.color}`}
      >
        {badge.label}
      </span>
    );
  };

  const prerequisiteNodes = allNodes.filter((n) =>
    node.data.prerequisites.includes(n.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 rounded-t-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="mb-2 text-3xl font-bold">{node.data.label}</h2>
              <p className="leading-relaxed text-violet-100">
                {node.data.description}
              </p>
            </div>
            <div className="ml-4 flex gap-2">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="rounded-xl p-2 transition-colors hover:bg-white/20"
                  title="Chỉnh sửa"
                >
                  <Edit3 className="h-6 w-6" />
                </button>
              )}
              <button
                onClick={onClose}
                className="rounded-xl p-2 transition-colors hover:bg-white/20"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Metadata */}
          <div className="mb-6 flex flex-wrap gap-3">
            {getCategoryBadge()}
            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${getDifficultyColor(node.data.difficulty)}`}
            >
              {node.data.difficulty}
            </span>
            <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-800">
              ⏱️ {node.data.estimatedTime}
            </span>
          </div>

          {/* Prerequisites */}
          {prerequisiteNodes.length > 0 && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-800">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                Kiến thức cần có trước
              </h3>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {prerequisiteNodes.map((preNode) => (
                  <div
                    key={preNode.id}
                    className="flex items-center gap-2 rounded-lg border border-amber-100 bg-white p-2 text-sm"
                  >
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="font-semibold text-slate-700">
                      {preNode.data.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Concepts */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-800">
                <Book className="h-5 w-5 text-violet-600" />
                Các khái niệm chính
              </h3>
              <div className="space-y-2">
                {node.data.concepts.map((concept, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-xl border border-violet-100 bg-violet-50 p-3 transition-colors hover:bg-violet-100"
                  >
                    <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
                      {index + 1}
                    </div>
                    <p className="flex-1 text-sm text-slate-700">{concept}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Examples */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-800">
                <TrendingUp className="h-5 w-5 text-sky-600" />
                Ví dụ ứng dụng
              </h3>
              <div className="space-y-2">
                {node.data.examples.map((example, index) => (
                  <div
                    key={index}
                    className="rounded-xl border-l-4 border-sky-500 bg-sky-50 p-3 transition-colors hover:bg-sky-100"
                  >
                    <p className="text-sm text-slate-700">{example}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resources */}
          {node.data.resources && node.data.resources.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-800">
                <Link className="h-5 w-5 text-emerald-600" />
                Khóa học liên quan
              </h3>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {node.data.resources.map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-slate-700 transition-all hover:bg-emerald-100 hover:shadow-md"
                  >
                    <ExternalLink className="h-4 w-4 text-emerald-600 transition-transform group-hover:scale-110" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">
                        {resource.name}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            <button className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-lg">
              Bắt đầu học ngay
            </button>
            <button className="rounded-xl bg-slate-100 px-6 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-200">
              Lưu lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// EXPORT DIALOG
// ============================================

const ExportDialog = ({
  nodes,
  edges,
  onClose
}: {
  nodes: Node<NodeData>[];
  edges: Edge[];
  onClose: () => void;
}) => {
  const [copied, setCopied] = useState(false);

  const payload = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    nodes: nodes.map((n) => ({
      id: n.id,
      position: n.position,
      data: n.data
    })),
    edges: edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: e.style?.strokeDasharray ? 'optional' : 'required'
    }))
  };

  const jsonString = JSON.stringify(payload, null, 2);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJson = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `knowledge-graph-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold">
                <Download className="h-6 w-6" />
                Export Knowledge Graph
              </h2>
              <p className="mt-1 text-emerald-100">
                {nodes.length} nodes • {edges.length} connections
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-2 transition-colors hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* JSON Preview */}
        <div className="flex-1 overflow-auto p-6">
          <pre className="max-h-96 overflow-auto rounded-xl bg-slate-900 p-4 font-mono text-sm text-emerald-400">
            {jsonString}
          </pre>
        </div>

        {/* Actions */}
        <div className="flex gap-3 border-t border-slate-200 p-6">
          <button
            onClick={copyToClipboard}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-semibold transition-all ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Copy className="h-5 w-5" />
            {copied ? 'Đã copy!' : 'Copy JSON'}
          </button>
          <button
            onClick={downloadJson}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-lg"
          >
            <Download className="h-5 w-5" />
            Tải về file JSON
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// LOADING COMPONENT
// ============================================

const LoadingState = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 via-violet-50/30 to-sky-50/30">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-violet-600" />
      <p className="text-lg font-medium text-slate-600">
        Đang tải Knowledge Graph...
      </p>
    </div>
  </div>
);

// ============================================
// ERROR COMPONENT
// ============================================

const ErrorState = ({ message }: { message: string }) => (
  <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 via-violet-50/30 to-sky-50/30">
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-8">
      <AlertCircle className="h-12 w-12 text-rose-600" />
      <p className="text-lg font-medium text-rose-800">Có lỗi xảy ra</p>
      <p className="text-sm text-rose-600">{message}</p>
    </div>
  </div>
);

// ============================================
// EMPTY STATE COMPONENT
// ============================================

const EmptyState = ({ onCreateNode }: { onCreateNode: () => void }) => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
      <Book className="h-12 w-12 text-violet-600" />
      <p className="text-lg font-medium text-slate-800">
        Chưa có kiến thức nào
      </p>
      <p className="text-sm text-slate-500">
        Bắt đầu bằng cách tạo node đầu tiên
      </p>
      <button
        onClick={onCreateNode}
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 font-medium text-white transition-all hover:scale-105 hover:shadow-lg"
      >
        <Plus className="h-5 w-5" />
        Tạo Node Đầu Tiên
      </button>
    </div>
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================

const KnowledgeGraphEditor = () => {
  const [mode, setMode] = useState<EditorMode>('edit');
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const [editingNode, setEditingNode] = useState<Node<NodeData> | null>(null);
  const [isCreatingNode, setIsCreatingNode] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { subjectId } = useParams();
  const {
    data: apiData,
    isLoading,
    isError,
    error
  } = useGetKnowledgeGraphBySubjectId(Number(subjectId));
  const { data: listCourse } = useGetListCourseByCategoryId(Number(subjectId));

  const { initialNodes, initialEdges } = useMemo(() => {
    if (!apiData) {
      return { initialNodes: [], initialEdges: [] };
    }

    const typedApiData = apiData as ApiResponse;

    return {
      initialNodes: transformApiNodesToReactFlowNodes(typedApiData.nodes || []),
      initialEdges: transformApiEdgesToReactFlowEdges(typedApiData.edges || [])
    };
  }, [apiData]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  React.useEffect(() => {
    if (initialNodes.length > 0) {
      setNodes(initialNodes);
    }
  }, [initialNodes, setNodes]);

  React.useEffect(() => {
    if (initialEdges.length > 0) {
      setEdges(initialEdges);
    }
  }, [initialEdges, setEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<NodeData>) => {
      if (mode === 'view') {
        setSelectedNode(node);
      } else {
        setEditingNode(node);
      }
    },
    [mode]
  );

  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      if (mode === 'edit') {
        const newEdge: Edge = {
          ...params,
          id: `e-${params.source}-${params.target}`,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#3b82f6', strokeWidth: 3 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#3b82f6',
            width: 20,
            height: 20
          }
        } as Edge;
        setEdges((eds) => addEdge(newEdge, eds));
      }
    },
    [mode, setEdges]
  );

  const handleSaveNode = (updatedNode: Node<NodeData>) => {
    let currentNodes: Node<NodeData>[] = [];
    let currentEdges: Edge[] = [];

    if (isCreatingNode) {
      setNodes((nds) => {
        currentNodes = [...nds, updatedNode];
        return currentNodes;
      });
      setIsCreatingNode(false);
    } else {
      setNodes((nds) => {
        currentNodes = nds.map((n) =>
          n.id === updatedNode.id ? updatedNode : n
        );
        return currentNodes;
      });
    }

    // Update edges based on prerequisites
    setEdges((eds) => {
      const filteredEdges = eds.filter((e) => e.target !== updatedNode.id);

      const newEdges: Edge[] = updatedNode.data.prerequisites.map(
        (prereqId) => {
          const prereqNode =
            currentNodes.find((n) => n.id === prereqId) ||
            nodes.find((n) => n.id === prereqId);
          const isOptional =
            prereqNode?.data.category === 'optional' ||
            updatedNode.data.category === 'optional';

          return {
            id: `e-${prereqId}-${updatedNode.id}`,
            source: prereqId,
            target: updatedNode.id,
            type: 'smoothstep',
            animated: !isOptional,
            style: isOptional
              ? { stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5,5' }
              : { stroke: '#3b82f6', strokeWidth: 3 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: isOptional ? '#10b981' : '#3b82f6',
              width: 20,
              height: 20
            }
          } as Edge;
        }
      );

      currentEdges = [...filteredEdges, ...newEdges];
      return currentEdges;
    });

    setEditingNode(null);

    return { nodes: currentNodes, edges: currentEdges };
  };

  // Reference to store the latest updated node for saving
  const pendingNodeRef = React.useRef<Node<NodeData> | null>(null);

  const handleSaveNodeAndServer = async (updatedNode: Node<NodeData>) => {
    pendingNodeRef.current = updatedNode;
    handleSaveNode(updatedNode);
  };

  const saveToServer = async () => {
    setIsSaving(true);

    // Get updated nodes and edges after state update
    const updatedNode = pendingNodeRef.current;
    if (!updatedNode) return;

    // Calculate the new nodes array
    let newNodes: Node<NodeData>[];
    if (isCreatingNode) {
      newNodes = [...nodes, updatedNode];
    } else {
      newNodes = nodes.map((n) => (n.id === updatedNode.id ? updatedNode : n));
    }

    // Calculate the new edges array
    const filteredEdges = edges.filter((e) => e.target !== updatedNode.id);
    const newPrereqEdges: Edge[] = updatedNode.data.prerequisites.map(
      (prereqId) => {
        const prereqNode = newNodes.find((n) => n.id === prereqId);
        const isOptional =
          prereqNode?.data.category === 'optional' ||
          updatedNode.data.category === 'optional';

        return {
          id: `e-${prereqId}-${updatedNode.id}`,
          source: prereqId,
          target: updatedNode.id,
          type: 'smoothstep',
          animated: !isOptional,
          style: isOptional
            ? { stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5,5' }
            : { stroke: '#3b82f6', strokeWidth: 3 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isOptional ? '#10b981' : '#3b82f6',
            width: 20,
            height: 20
          }
        } as Edge;
      }
    );
    const newEdges = [...filteredEdges, ...newPrereqEdges];

    const payload = {
      subjectId: Number(subjectId),
      data: {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        nodes: newNodes.map((node) => ({
          id: node.id,
          position: node.position,
          data: node.data
        })),
        edges: newEdges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.style?.strokeDasharray ? 'optional' : 'required'
        }))
      }
    };

    const [err] = await importKnowledge(payload);
    setIsSaving(false);
    pendingNodeRef.current = null;

    if (err) {
      toast({
        title: 'Lỗi',
        description: err.message || 'Có lỗi xảy ra khi lưu',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Thành công',
        description: 'Lưu thành công!',
        variant: 'success'
      });
    }
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) =>
      eds.filter((e) => e.source !== nodeId && e.target !== nodeId)
    );
  };

  const generateUniqueId = () => {
    return `node-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };

  const createNewNode = () => {
    const newNode: Node<NodeData> = {
      id: generateUniqueId(),
      type: 'knowledge',
      position: { x: 400, y: 400 },
      data: {
        label: 'New Node',
        category: 'foundation',
        description: '',
        concepts: [],
        examples: [],
        prerequisites: [],
        estimatedTime: '1 tuần',
        difficulty: 'Cơ bản',
        status: 'available',
        resources: []
      }
    };
    setEditingNode(newNode);
    setIsCreatingNode(true);
  };

  const { mutateAsync: importKnowledge } = useImportKnowledgeGraph();
  const handleImport = async () => {
    const payload = {
      subjectId: Number(subjectId),
      data: {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        nodes: nodes.map((node) => ({
          id: node.id,
          position: node.position,
          data: node.data
        })),
        edges: edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type
        }))
      }
    };
    const [err] = await importKnowledge(payload);
    if (err) {
      toast({
        title: 'Lỗi',
        description: err.message || 'Có lỗi xảy ra khi lưu',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Thành công',
        description: 'Lưu thành công!',
        variant: 'success'
      });
    }
  };

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Error state
  if (isError) {
    return <ErrorState message={error?.message || 'Không thể tải dữ liệu'} />;
  }

  return (
    <div
      className="relative h-screen w-full"
      style={{ fontFamily: "'DM Sans', 'Noto Sans', sans-serif" }}
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-violet-50/30 to-sky-50/30" />

      {/* Header */}
      <div className="absolute left-0 right-0 top-0 z-20 border-b border-slate-200/50 bg-white/80 shadow-lg backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-600 bg-clip-text text-3xl font-bold text-transparent">
                Thiết kế lộ trình học
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {mode === 'edit' && (
                <button
                  onClick={createNewNode}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all hover:scale-105 hover:shadow-lg"
                >
                  <Plus className="h-4 w-4" />
                  Thêm Node
                </button>
              )}

              <button
                onClick={() => handleImport()}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-medium text-white transition-all hover:scale-105 hover:shadow-lg"
              >
                <Save className="h-4 w-4" />
                Lưu
              </button>

              <div className="border-l border-slate-200 pl-4 text-right">
                <div className="text-xs uppercase tracking-wider text-slate-400">
                  Tổng nodes
                </div>
                <div className="text-2xl font-bold text-violet-600">
                  {nodes.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="h-full w-full pb-32 pt-24">
        {nodes.length === 0 ? (
          <EmptyState onCreateNode={createNewNode} />
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            connectionLineType={ConnectionLineType.SmoothStep}
            fitView
            minZoom={0.2}
            maxZoom={1.5}
            nodesDraggable={mode === 'edit'}
            nodesConnectable={mode === 'edit'}
            elementsSelectable={true}
            className="bg-transparent"
          >
            <Background
              color="#e0e7ff"
              gap={20}
              size={1}
              style={{ backgroundColor: 'transparent' }}
            />
            <Controls className="rounded-xl border border-slate-200 bg-white/90 shadow-xl backdrop-blur-sm" />
            <MiniMap
              className="rounded-xl border-2 border-violet-200 bg-white/90 shadow-xl backdrop-blur-sm"
              nodeColor={(node) => {
                const data = node.data as NodeData;
                const colors = {
                  foundation: '#3b82f6',
                  core: '#8b5cf6',
                  advanced: '#ef4444',
                  optional: '#10b981'
                };
                return colors[data.category] || '#6b7280';
              }}
              maskColor="rgba(139, 92, 246, 0.1)"
            />
          </ReactFlow>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 left-6 z-10 max-w-sm rounded-2xl border border-slate-200/50 bg-white/90 p-5 shadow-xl backdrop-blur-xl">
        <h3 className="mb-4 text-lg font-bold text-slate-800">📚 Chú giải</h3>

        <div className="mb-4">
          <h4 className="mb-2 text-sm font-semibold text-slate-600">
            Phân loại:
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-md bg-gradient-to-br from-sky-400 to-sky-600" />
              <span>Nền tảng</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-md bg-gradient-to-br from-violet-400 to-violet-600" />
              <span>Cốt lõi</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-md bg-gradient-to-br from-rose-400 to-rose-600" />
              <span>Nâng cao</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-md bg-gradient-to-br from-emerald-400 to-emerald-600" />
              <span>Khuyên học</span>
            </div>
          </div>
        </div>

        <div className="mb-4 border-t border-slate-200 pt-3">
          <h4 className="mb-2 text-sm font-semibold text-slate-600">
            Liên kết:
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-8 bg-sky-600" />
              <span>→ Bắt buộc</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-8 border-t-2 border-dashed border-emerald-600" />
              <span>⤏ Khuyên học</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-3">
          <h4 className="mb-2 text-sm font-semibold text-slate-600">
            Trạng thái:
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Hoàn thành</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-sky-600" />
              <span>Đang học</span>
            </div>
            <div className="flex items-center gap-2">
              <Book className="h-4 w-4 text-violet-600" />
              <span>Sẵn sàng</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-slate-400" />
              <span>Khóa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Panel */}
      <div className="absolute bottom-6 right-6 z-10 rounded-2xl border border-slate-200/50 bg-white/90 p-5 shadow-xl backdrop-blur-xl">
        <h3 className="mb-3 font-bold text-slate-800">📊 Thống kê</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between gap-6">
            <span className="text-slate-500">Hoàn thành:</span>
            <span className="font-bold text-emerald-600">
              {nodes.filter((n) => n.data.status === 'completed').length} /{' '}
              {nodes.length}
            </span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-slate-500">Đang học:</span>
            <span className="font-bold text-sky-600">
              {nodes.filter((n) => n.data.status === 'in-progress').length}
            </span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-slate-500">Sẵn sàng:</span>
            <span className="font-bold text-violet-600">
              {nodes.filter((n) => n.data.status === 'available').length}
            </span>
          </div>
          <div className="flex justify-between gap-6 border-t border-slate-200 pt-2">
            <span className="text-slate-500">Kết nối:</span>
            <span className="font-bold text-slate-700">{edges.length}</span>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {selectedNode && mode === 'view' && (
        <KnowledgeDetailDialog
          node={selectedNode}
          allNodes={nodes}
          onClose={() => setSelectedNode(null)}
          onEdit={() => {
            setEditingNode(selectedNode);
            setSelectedNode(null);
            setMode('edit');
          }}
        />
      )}

      {editingNode && (
        <NodeEditorDialog
          node={editingNode}
          allNodes={nodes}
          onSave={handleSaveNodeAndServer}
          onDelete={handleDeleteNode}
          onClose={() => {
            setEditingNode(null);
            setIsCreatingNode(false);
          }}
          isNew={isCreatingNode}
          listCourse={(listCourse as Course[]) || []}
          onSaveToServer={saveToServer}
          isSaving={isSaving}
        />
      )}

      {showExport && (
        <ExportDialog
          nodes={nodes}
          edges={edges}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
};

export default KnowledgeGraphEditor;