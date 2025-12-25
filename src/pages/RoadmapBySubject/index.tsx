import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
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
  useReactFlow,
  ReactFlowProvider,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  EdgeProps
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
  ExternalLink,
  Link,
  Loader2,
  ShoppingCart,
  Award,
  Search,
  Pin
} from 'lucide-react';
import {
  useGetPersonalizedRoadmap,
  useStartNode,
  useMarkNodeAsCompleted
} from '@/queries/knowledgeGraph.query';
import { useToast } from '@/components/ui/use-toast';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Input } from '@/components/ui/input';

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
  category: string; // Can be predefined or custom
  description: string;
  concepts: string[];
  examples: string[];
  prerequisites: string[];
  estimatedTime: string;
  difficulty: 'Cơ bản' | 'Trung bình' | 'Nâng cao';
  status: 'completed' | 'in-progress' | 'locked' | 'available';
  resources: Resource[];
  progressPercent?: number;
  hasPurchasedCourse?: boolean;
  relatedCourseIds?: number[];
}

// ============================================
// CUSTOM NODE COMPONENT
// ============================================

const KnowledgeNode = ({
  data,
  selected,
  id,
  isPinned,
  isRelated,
  hasPinnedNode,
  onPinClick
}: {
  data: NodeData;
  selected?: boolean;
  id: string;
  isPinned: boolean;
  isRelated: boolean;
  hasPinnedNode: boolean;
  onPinClick: (nodeId: string) => void;
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
      case 'intermediate':
        return 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-500';
      case 'expert':
        return 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-500';
      case 'beginner':
        return 'bg-gradient-to-br from-green-50 to-green-100 border-green-500';
      case 'specialized':
        return 'bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-500';
      case 'practical':
        return 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-500';
      case 'theoretical':
        return 'bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-500';
      default:
        // Custom categories - use a default style
        return 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-500';
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
    const categoryLabels: Record<string, string> = {
      foundation: 'Nền tảng',
      core: 'Cốt lõi',
      advanced: 'Nâng cao',
      optional: 'Khuyên học',
      intermediate: 'Trung cấp',
      expert: 'Chuyên sâu',
      beginner: 'Người mới',
      specialized: 'Chuyên ngành',
      practical: 'Thực hành',
      theoretical: 'Lý thuyết'
    };

    return categoryLabels[data.category] || data.category;
  };

  // Only apply dimming if there's a pinned node and this node is not related
  const shouldDim = hasPinnedNode && !isPinned && !isRelated;

  return (
    <div
      className={`min-w-[220px] max-w-[280px] cursor-pointer rounded-2xl border-2 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${getCategoryStyle()} ${getStatusOverlay()} ${selected ? 'ring-4 ring-amber-400 ring-offset-2' : ''} ${isPinned ? 'ring-4 ring-violet-500 ring-offset-2' : ''} ${shouldDim ? 'opacity-30' : ''}`}
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
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPinClick(id);
              }}
              className={`rounded-lg p-1.5 transition-all hover:bg-white/50 ${
                isPinned
                  ? 'bg-violet-500 text-white'
                  : 'bg-white/60 text-slate-600 hover:text-violet-600'
              }`}
              title={isPinned ? 'Bỏ ghim' : 'Ghim node'}
            >
              <Pin className={`h-4 w-4 ${isPinned ? 'fill-current' : ''}`} />
            </button>
            {getStatusIcon()}
          </div>
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

        {/* Purchased Course Badge */}
        {data.hasPurchasedCourse && (
          <div className="mt-2 flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
            <Award className="h-3 w-3" />
            <span>Đã mua khóa học</span>
          </div>
        )}

        {/* Progress Bar */}
        {data.progressPercent &&
          data.progressPercent > 0 &&
          data.status !== 'completed' && (
            <div className="mt-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-sky-500 transition-all"
                  style={{ width: `${data.progressPercent}%` }}
                />
              </div>
            </div>
          )}
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

// ============================================
// RELATIONSHIP TYPES CONSTANTS
// ============================================

const RELATIONSHIP_TYPE_LABELS: Record<string, string> = {
  required: 'Bắt buộc',
  optional: 'Khuyên học',
  foundation_of: 'Là nền tảng của',
  equivalent_to: 'Tương đương với',
  leads_to: 'Dẫn đến',
  prerequisite_for: 'Yêu cầu cho'
};

const getRelationshipTypeLabel = (type: string): string => {
  return RELATIONSHIP_TYPE_LABELS[type] || type;
};

const getRelationshipTypeStyle = (type: string) => {
  switch (type) {
    case 'required':
      return { stroke: '#3b82f6', strokeWidth: 3, strokeDasharray: undefined };
    case 'optional':
      return { stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5,5' };
    case 'foundation_of':
      return { stroke: '#f97316', strokeWidth: 3, strokeDasharray: undefined };
    case 'equivalent_to':
      return { stroke: '#a855f7', strokeWidth: 3, strokeDasharray: undefined };
    case 'leads_to':
      return { stroke: '#14b8a6', strokeWidth: 3, strokeDasharray: undefined };
    case 'prerequisite_for':
      return { stroke: '#f59e0b', strokeWidth: 3, strokeDasharray: undefined };
    default:
      // Custom types
      return { stroke: '#6b7280', strokeWidth: 2, strokeDasharray: undefined };
  }
};

const getRelationshipTypeColor = (type: string): string => {
  switch (type) {
    case 'required':
      return '#3b82f6';
    case 'optional':
      return '#10b981';
    case 'foundation_of':
      return '#f97316';
    case 'equivalent_to':
      return '#a855f7';
    case 'leads_to':
      return '#14b8a6';
    case 'prerequisite_for':
      return '#f59e0b';
    default:
      return '#6b7280';
  }
};

// ============================================
// CUSTOM EDGE COMPONENT
// ============================================

const CustomEdge = (props: EdgeProps) => {
  const {
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    label: propLabel
  } = props;

  // Get label and styles from edge data or props
  const label = (propLabel as string) || (props.data as any)?.label;
  const labelStyle = (props as any).labelStyle;
  const labelBgStyle = (props as any).labelBgStyle;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {label && typeof label === 'string' && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              pointerEvents: 'all'
            }}
            className="nodrag nopan"
          >
            <div
              style={{
                ...labelBgStyle,
                padding: '4px 8px',
                borderRadius: '6px',
                border: `1px solid ${labelStyle?.fill || '#6b7280'}`,
                whiteSpace: 'nowrap'
              }}
            >
              <span style={labelStyle}>{label}</span>
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

// Node types will be created dynamically in the component
const edgeTypes = {
  smoothstep: CustomEdge
};

// ============================================
// VIEW DETAIL DIALOG
// ============================================

const KnowledgeDetailDialog = ({
  node,
  allNodes,
  onClose,
  startNode,
  markCompleted,
  toast
}: {
  node: Node<NodeData> | null;
  allNodes: Node<NodeData>[];
  onClose: () => void;
  startNode: any;
  markCompleted: any;
  toast: any;
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
    const badges: Record<string, { color: string; label: string }> = {
      foundation: { color: 'bg-sky-100 text-sky-800', label: '🏗️ Nền tảng' },
      core: { color: 'bg-violet-100 text-violet-800', label: '⭐ Cốt lõi' },
      advanced: { color: 'bg-rose-100 text-rose-800', label: '🚀 Nâng cao' },
      optional: {
        color: 'bg-emerald-100 text-emerald-800',
        label: '💡 Khuyên học'
      },
      intermediate: {
        color: 'bg-amber-100 text-amber-800',
        label: '📊 Trung cấp'
      },
      expert: {
        color: 'bg-purple-100 text-purple-800',
        label: '🎯 Chuyên sâu'
      },
      beginner: { color: 'bg-green-100 text-green-800', label: '🌱 Người mới' },
      specialized: {
        color: 'bg-indigo-100 text-indigo-800',
        label: '🔬 Chuyên ngành'
      },
      practical: {
        color: 'bg-orange-100 text-orange-800',
        label: '🛠️ Thực hành'
      },
      theoretical: { color: 'bg-cyan-100 text-cyan-800', label: '📚 Lý thuyết' }
    };

    const badge = badges[node.data.category];
    if (badge) {
      return (
        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${badge.color}`}
        >
          {badge.label}
        </span>
      );
    }

    // Custom category
    return (
      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-800">
        {node.data.category}
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
            <button
              onClick={onClose}
              className="ml-4 rounded-xl p-2 transition-colors hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </button>
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
            {node.data.concepts.length > 0 && (
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
            )}

            {/* Examples */}
            {node.data.examples.length > 0 && (
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
            )}
          </div>

          {/* Resources */}
          {node.data.resources && node.data.resources.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-800">
                <Link className="h-5 w-5 text-emerald-600" />
                Tài nguyên học tập
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
                      {resource.courseId && (
                        <div className="text-xs text-emerald-600">
                          Course #{resource.courseId}
                        </div>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            {node.data.status === 'available' && (
              <button
                onClick={async () => {
                  try {
                    await startNode(parseInt(node.id));
                    toast({
                      title: 'Thành công!',
                      description: 'Đã bắt đầu học chủ đề này'
                    });
                    onClose();
                  } catch (error) {
                    toast({
                      title: 'Lỗi',
                      description: 'Không thể bắt đầu học',
                      variant: 'destructive'
                    });
                  }
                }}
                className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-lg"
              >
                Bắt đầu học ngay
              </button>
            )}

            {node.data.status === 'in-progress' && (
              <>
                <button
                  onClick={async () => {
                    try {
                      await markCompleted(parseInt(node.id));
                      toast({
                        title: 'Chúc mừng! 🎉',
                        description: 'Bạn đã hoàn thành chủ đề này'
                      });
                      onClose();
                    } catch (error) {
                      toast({
                        title: 'Lỗi',
                        description: 'Không thể đánh dấu hoàn thành',
                        variant: 'destructive'
                      });
                    }
                  }}
                  className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 py-3 font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-lg"
                >
                  Đánh dấu hoàn thành
                </button>
              </>
            )}

            {node.data.status === 'completed' && (
              <div className="flex-1 rounded-xl bg-emerald-100 py-3 text-center font-semibold text-emerald-700">
                ✓ Đã hoàn thành
              </div>
            )}

            {node.data.status === 'locked' && (
              <div className="flex-1 rounded-xl bg-slate-100 py-3 text-center font-semibold text-slate-500">
                🔒 Hoàn thành kiến thức cần thiết trước
              </div>
            )}

            {!node.data.hasPurchasedCourse &&
              node.data.relatedCourseIds &&
              node.data.relatedCourseIds.length > 0 && (
                <button
                  onClick={() => {
                    // Navigate to course page
                    window.location.href = `/course/${node.data.relatedCourseIds![0]}`;
                  }}
                  className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-600"
                >
                  <ShoppingCart className="mr-2 inline h-4 w-4" />
                  Mua khóa học
                </button>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT (Inner)
// ============================================

const KnowledgeGraphViewerInner = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [, setStatistics] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(
    null
  );
  const [pinnedNodeId, setPinnedNodeId] = useState<string | null>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);

  const { fitView, getNode, setCenter } = useReactFlow();
  const { toast } = useToast();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isLogin);

  // Fetch personalized roadmap
  const {
    data: roadmapData,
    isLoading: loading,
    error
  } = useGetPersonalizedRoadmap(parseInt(id || '0'), isAuthenticated);

  const { mutateAsync: startNode } = useStartNode();
  const { mutateAsync: markCompleted } = useMarkNodeAsCompleted();

  // Transform data when loaded
  useEffect(() => {
    if (roadmapData) {
      // Transform API nodes to ReactFlow nodes
      const transformedNodes: Node<NodeData>[] = roadmapData.nodes.map(
        (node: any) => ({
          id: node.id,
          type: 'knowledge',
          position: node.position,
          data: {
            ...node.data,
            // Add progress indicator
            progressPercent: node.data.progressPercent || 0,
            hasPurchasedCourse: node.data.hasPurchasedCourse || false,
            relatedCourseIds: node.data.relatedCourseIds || []
          }
        })
      );

      // Transform API edges to ReactFlow edges
      const transformedEdges: Edge[] = roadmapData.edges.map((edge: any) => {
        const relationshipType = edge.type || 'required';
        const style = getRelationshipTypeStyle(relationshipType);
        const color = getRelationshipTypeColor(relationshipType);
        const label = getRelationshipTypeLabel(relationshipType);

        return {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: 'smoothstep',
          animated: relationshipType !== 'optional',
          style: style,
          label: label,
          labelStyle: {
            fill: color,
            fontWeight: 600,
            fontSize: 12
          },
          labelBgStyle: {
            fill: '#ffffff',
            fillOpacity: 0.8,
            stroke: color,
            strokeWidth: 1
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: color,
            width: 20,
            height: 20
          },
          data: {
            relationshipType: relationshipType
          }
        };
      });

      setNodes(transformedNodes);
      setEdges(transformedEdges);
      setStatistics(roadmapData.statistics);
      setDataLoaded(true);
    }
  }, [roadmapData, setNodes, setEdges]);

  // FitView after data is loaded and nodes are rendered
  useEffect(() => {
    if (dataLoaded && nodes.length > 0) {
      // Small delay to ensure nodes are rendered
      const timer = setTimeout(() => {
        fitView({
          padding: 0.2,
          duration: 500,
          maxZoom: 1
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [dataLoaded, nodes.length, fitView]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<NodeData>) => {
      setSelectedNode(node);
      setHighlightedNodeId(node.id);
    },
    []
  );

  // Calculate related nodes (1 level) when a node is pinned
  const relatedNodeIds = useMemo(() => {
    if (!pinnedNodeId) return new Set<string>();

    const related = new Set<string>();
    related.add(pinnedNodeId); // Include the pinned node itself

    // Find all edges connected to the pinned node
    edges.forEach((edge) => {
      if (edge.source === pinnedNodeId) {
        related.add(edge.target);
      }
      if (edge.target === pinnedNodeId) {
        related.add(edge.source);
      }
    });

    return related;
  }, [pinnedNodeId, edges]);

  // Handle pin click
  const handlePinClick = useCallback(
    (nodeId: string) => {
      if (pinnedNodeId === nodeId) {
        // Unpin if clicking the same node
        setPinnedNodeId(null);
      } else {
        // Pin the new node
        setPinnedNodeId(nodeId);
      }
    },
    [pinnedNodeId]
  );

  // Create node types with pin functionality
  const nodeTypes = useMemo(
    () => ({
      knowledge: (props: any) => (
        <KnowledgeNode
          {...props}
          isPinned={pinnedNodeId === props.id}
          isRelated={relatedNodeIds.has(props.id)}
          hasPinnedNode={pinnedNodeId !== null}
          onPinClick={handlePinClick}
        />
      )
    }),
    [pinnedNodeId, relatedNodeIds, handlePinClick]
  );

  // Helper function to get category label for search
  const getCategoryLabelForSearch = useCallback((category: string): string => {
    const categoryLabels: Record<string, string> = {
      foundation: 'Nền tảng',
      core: 'Cốt lõi',
      advanced: 'Nâng cao',
      optional: 'Khuyên học',
      intermediate: 'Trung cấp',
      expert: 'Chuyên sâu',
      beginner: 'Người mới',
      specialized: 'Chuyên ngành',
      practical: 'Thực hành',
      theoretical: 'Lý thuyết'
    };

    return categoryLabels[category] || category;
  }, []);

  // Filter nodes based on search query
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase().trim();
    return nodes
      .filter((node) => {
        const label = node.data.label?.toLowerCase() || '';
        const description = node.data.description?.toLowerCase() || '';
        const concepts = node.data.concepts?.join(' ').toLowerCase() || '';
        const category = getCategoryLabelForSearch(
          node.data.category
        ).toLowerCase();

        return (
          label.includes(query) ||
          description.includes(query) ||
          concepts.includes(query) ||
          category.includes(query)
        );
      })
      .slice(0, 10); // Limit to 10 results
  }, [searchQuery, nodes, getCategoryLabelForSearch]);

  // Navigate to node when clicked from search results
  const handleNodeSelect = useCallback(
    (nodeId: string) => {
      const node = getNode(nodeId);
      if (node) {
        setHighlightedNodeId(nodeId);
        setShowSearchResults(false);
        setSearchQuery('');

        // Center the view on the selected node with smooth animation
        setCenter(node.position.x, node.position.y, { zoom: 1, duration: 500 });

        // Also fit view with padding around the node
        setTimeout(() => {
          fitView({
            padding: 0.3,
            duration: 500,
            maxZoom: 1.2,
            minZoom: 0.5,
            nodes: [node]
          });
        }, 100);

        // Remove highlight after animation
        setTimeout(() => {
          setHighlightedNodeId(null);
        }, 2000);
      }
    },
    [getNode, setCenter, fitView]
  );

  // Handle click outside to close search results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as HTMLElement)
      ) {
        setShowSearchResults(false);
      }
    }

    if (showSearchResults) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearchResults]);

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 via-violet-50/30 to-sky-50/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-violet-600" />
          <p className="text-lg font-medium text-slate-600">
            Đang tải dữ liệu...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 via-violet-50/30 to-sky-50/30">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center shadow-xl">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-rose-500" />
          <h2 className="mb-2 text-xl font-bold text-rose-800">
            Lỗi tải dữ liệu
          </h2>
          <p className="text-rose-600">{error?.message || 'Đã xảy ra lỗi'}</p>
          {!isAuthenticated && (
            <p className="mt-2 text-sm text-rose-600">
              Vui lòng đăng nhập để xem lộ trình cá nhân hóa
            </p>
          )}
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-xl bg-rose-600 px-6 py-2 font-medium text-white transition-colors hover:bg-rose-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative h-screen"
      style={{ fontFamily: "'DM Sans', 'Noto Sans', sans-serif" }}
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 " />

      {/* Search Bar */}
      <div
        className="absolute left-1/2 top-6 z-30 -translate-x-1/2"
        ref={searchContainerRef}
      >
        <div className="relative w-96">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Tìm kiếm kiến thức..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(e.target.value.length > 0);
              }}
              onFocus={() => {
                if (searchQuery.length > 0) {
                  setShowSearchResults(true);
                }
              }}
              className="w-full rounded-xl border-2 border-slate-200 bg-white/95 py-2 pl-10 pr-4 shadow-lg backdrop-blur-sm transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchResults(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && filteredNodes.length > 0 && (
            <div className="absolute top-full mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-xl">
              <div className="max-h-80 overflow-y-auto">
                {filteredNodes.map((node) => (
                  <button
                    key={node.id}
                    onClick={() => handleNodeSelect(node.id)}
                    className="w-full border-b border-slate-100 px-4 py-3 text-left transition-colors first:rounded-t-xl last:rounded-b-xl last:border-b-0 hover:bg-violet-50"
                  >
                    <div className="flex items-start gap-3">
                      <Book className="mt-0.5 h-4 w-4 flex-shrink-0 text-violet-600" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-slate-800">
                          {node.data.label}
                        </div>
                        {node.data.description && (
                          <div className="mt-1 line-clamp-1 text-xs text-slate-500">
                            {node.data.description}
                          </div>
                        )}
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                          <span>
                            {getCategoryLabelForSearch(node.data.category)}
                          </span>
                          {node.data.concepts.length > 0 && (
                            <>
                              <span>•</span>
                              <span>{node.data.concepts.length} khái niệm</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {showSearchResults && searchQuery && filteredNodes.length === 0 && (
            <div className="absolute top-full mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-6 text-center shadow-xl">
              <p className="text-sm text-slate-500">
                Không tìm thấy kiến thức nào phù hợp
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Header */}

      {/* React Flow Canvas */}
      <div className="h-full w-full pb-32 pt-24">
        <ReactFlow
          nodes={nodes.map((node) => ({
            ...node,
            selected: highlightedNodeId === node.id,
            style: {
              ...node.style,
              ...(highlightedNodeId === node.id
                ? {
                    filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.6))',
                    zIndex: 1000
                  }
                : {})
            }
          }))}
          edges={edges.map((edge) => {
            // Apply opacity to edges based on pin state
            // If no node is pinned, show all edges normally
            // If a node is pinned, only show edges connected to related nodes
            const isRelatedEdge =
              !pinnedNodeId ||
              (relatedNodeIds.has(edge.source) &&
                relatedNodeIds.has(edge.target));

            const updatedEdge = {
              ...edge,
              style: {
                ...edge.style,
                opacity: isRelatedEdge ? 1 : pinnedNodeId ? 0.2 : 1,
                transition: 'opacity 0.3s ease-in-out'
              }
            };

            if (edge.markerEnd && typeof edge.markerEnd === 'object') {
              updatedEdge.markerEnd = {
                ...edge.markerEnd,
                opacity: isRelatedEdge ? 1 : pinnedNodeId ? 0.2 : 1
              } as any;
            }

            return updatedEdge;
          })}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionLineType={ConnectionLineType.SmoothStep}
          fitView
          fitViewOptions={{
            padding: 0.2,
            maxZoom: 1,
            minZoom: 0.3
          }}
          minZoom={0.1}
          maxZoom={1.5}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
          className="bg-transparent"
          defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
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
              const colors: Record<string, string> = {
                foundation: '#3b82f6',
                core: '#8b5cf6',
                advanced: '#ef4444',
                optional: '#10b981',
                intermediate: '#f59e0b',
                expert: '#a855f7',
                beginner: '#22c55e',
                specialized: '#6366f1',
                practical: '#f97316',
                theoretical: '#06b6d4'
              };
              return colors[data.category] || '#6b7280';
            }}
            maskColor="rgba(139, 92, 246, 0.1)"
          />
        </ReactFlow>
      </div>

      {/* Legend */}
      <div className="absolute bottom-[60px] left-[50px] z-10 max-w-sm rounded-2xl border border-slate-200/50 bg-white/90 p-5 shadow-xl backdrop-blur-xl">
        <h3 className="mb-4 text-lg font-bold text-slate-800">📚 Chú giải</h3>

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
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-8 bg-orange-500" />
              <span>→ Là nền tảng của</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-8 bg-purple-500" />
              <span>→ Tương đương với</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-8 bg-teal-500" />
              <span>→ Dẫn đến</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-8 bg-amber-500" />
              <span>→ Yêu cầu cho</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-3">
          <h4 className="mb-2 text-sm font-semibold text-slate-600">
            Trạng thái:
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
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

      {selectedNode && (
        <KnowledgeDetailDialog
          node={selectedNode}
          allNodes={nodes}
          onClose={() => setSelectedNode(null)}
          startNode={startNode}
          markCompleted={markCompleted}
          toast={toast}
        />
      )}
    </div>
  );
};

// ============================================
// WRAPPER COMPONENT WITH PROVIDER
// ============================================

const KnowledgeGraphViewer = () => {
  return (
    <ReactFlowProvider>
      <KnowledgeGraphViewerInner />
    </ReactFlowProvider>
  );
};

export default KnowledgeGraphViewer;
