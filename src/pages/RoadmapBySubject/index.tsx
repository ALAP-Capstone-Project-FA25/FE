import React, { useState, useCallback, useEffect } from 'react';
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
  ReactFlowProvider
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
  Target
} from 'lucide-react';
import { useGetPersonalizedRoadmap, useStartNode, useMarkNodeAsCompleted } from '@/queries/knowledgeGraph.query';
import { useToast } from '@/components/ui/use-toast';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';


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
  progressPercent?: number;
  hasPurchasedCourse?: boolean;
  relatedCourseIds?: number[];
}

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
        
        {/* Purchased Course Badge */}
        {data.hasPurchasedCourse && (
          <div className="mt-2 flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
            <Award className="h-3 w-3" />
            <span>Đã mua khóa học</span>
          </div>
        )}
        
        {/* Progress Bar */}
        {data.progressPercent && data.progressPercent > 0 && data.status !== 'completed' && (
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

const nodeTypes = { knowledge: KnowledgeNode };

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
            
            {!node.data.hasPurchasedCourse && node.data.relatedCourseIds && node.data.relatedCourseIds.length > 0 && (
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
  const [statistics, setStatistics] = useState<any>(null);

  const { fitView } = useReactFlow();
  const { toast } = useToast();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isLogin);

  // Fetch personalized roadmap
  const { data: roadmapData, isLoading: loading, error } = useGetPersonalizedRoadmap(
    parseInt(id || '0'),
    isAuthenticated
  );

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
        const isOptional = edge.type === 'optional';
        return {
          id: edge.id,
          source: edge.source,
          target: edge.target,
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
    },
    []
  );

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

      {/* Header */}

      {/* React Flow Canvas */}
      <div className="h-full w-full pb-32 pt-24">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
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
      </div>

      {/* Statistics Panel */}
      {statistics && (
        <div className="absolute right-[50px] top-[100px] z-10 w-80 rounded-2xl border border-slate-200/50 bg-white/90 p-5 shadow-xl backdrop-blur-xl">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
            <Target className="h-5 w-5 text-violet-600" />
            Tiến độ của bạn
          </h3>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-600">Hoàn thành</span>
              <span className="font-bold text-violet-600">{statistics.completionPercent}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${statistics.completionPercent}%` }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-emerald-50 p-3">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-semibold">Hoàn thành</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-emerald-700">
                {statistics.completedNodes}
              </p>
            </div>

            <div className="rounded-lg bg-sky-50 p-3">
              <div className="flex items-center gap-2 text-sky-600">
                <TrendingUp className="h-4 w-4" />
                <span className="font-semibold">Đang học</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-sky-700">
                {statistics.inProgressNodes}
              </p>
            </div>

            <div className="rounded-lg bg-violet-50 p-3">
              <div className="flex items-center gap-2 text-violet-600">
                <Book className="h-4 w-4" />
                <span className="font-semibold">Sẵn sàng</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-violet-700">
                {statistics.availableNodes}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-3">
              <div className="flex items-center gap-2 text-slate-600">
                <Lock className="h-4 w-4" />
                <span className="font-semibold">Khóa</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-slate-700">
                {statistics.lockedNodes}
              </p>
            </div>
          </div>

          {/* Courses Info */}
          <div className="mt-4 border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Khóa học đã mua</span>
              <span className="font-bold text-slate-800">{statistics.totalCoursesPurchased}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-slate-600">Khóa học hoàn thành</span>
              <span className="font-bold text-emerald-600">{statistics.totalCoursesCompleted}</span>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-[60px] left-[50px] z-10 max-w-sm rounded-2xl border border-slate-200/50 bg-white/90 p-5 shadow-xl backdrop-blur-xl">
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
