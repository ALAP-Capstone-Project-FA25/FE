import React, { useState, useCallback } from 'react';
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
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  X,
  Book,
  CheckCircle2,
  Lock,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

// Interface cho dữ liệu node
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
  resources?: string[];
}

// Custom Node Component với styling theo category
const KnowledgeNode = ({ data }: { data: NodeData }) => {
  const getCategoryStyle = () => {
    switch (data.category) {
      case 'foundation':
        return 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-500';
      case 'core':
        return 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-500';
      case 'advanced':
        return 'bg-gradient-to-br from-red-50 to-red-100 border-red-500';
      case 'optional':
        return 'bg-gradient-to-br from-green-50 to-green-100 border-green-500';
      default:
        return 'bg-white border-gray-400';
    }
  };

  const getStatusOverlay = () => {
    switch (data.status) {
      case 'completed':
        return 'ring-2 ring-green-500 ring-offset-2';
      case 'in-progress':
        return 'ring-2 ring-blue-500 ring-offset-2 animate-pulse';
      case 'locked':
        return 'opacity-60';
      default:
        return '';
    }
  };

  const getStatusIcon = () => {
    switch (data.status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'in-progress':
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'locked':
        return <Lock className="h-5 w-5 text-gray-400" />;
      default:
        return <Book className="h-5 w-5 text-purple-600" />;
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
      className={`min-w-[220px] max-w-[280px] cursor-pointer rounded-xl border-2 shadow-lg transition-all duration-300 hover:shadow-2xl ${getCategoryStyle()} ${getStatusOverlay()}`}
    >
      {/* Handles for connections */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#9333ea', width: 12, height: 12 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#9333ea', width: 12, height: 12 }}
      />

      {/* Header */}
      <div className="border-b border-gray-200 bg-white bg-opacity-50 px-4 py-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wide text-gray-600">
            {getCategoryLabel()}
          </span>
          {getStatusIcon()}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        <div className="mb-2 text-base font-bold leading-tight text-gray-800">
          {data.label}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Clock className="h-3 w-3" />
          <span>{data.estimatedTime}</span>
          <span className="mx-1">•</span>
          <span className="font-semibold">{data.difficulty}</span>
        </div>
      </div>

      {/* Prerequisites count */}
      {data.prerequisites.length > 0 && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <AlertCircle className="h-3 w-3" />
            <span>{data.prerequisites.length} kiến thức cần thiết</span>
          </div>
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  knowledge: KnowledgeNode
};

// Dialog Component với nhiều thông tin hơn
const KnowledgeDetailDialog = ({
  node,
  allNodes,
  onClose
}: {
  node: Node<NodeData> | null;
  allNodes: Node<NodeData>[];
  onClose: () => void;
}) => {
  if (!node) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Cơ bản':
        return 'bg-green-100 text-green-800';
      case 'Trung bình':
        return 'bg-yellow-100 text-yellow-800';
      case 'Nâng cao':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryBadge = () => {
    const badges = {
      foundation: { color: 'bg-blue-100 text-blue-800', label: '🏗️ Nền tảng' },
      core: { color: 'bg-purple-100 text-purple-800', label: '⭐ Cốt lõi' },
      advanced: { color: 'bg-red-100 text-red-800', label: '🚀 Nâng cao' },
      optional: { color: 'bg-green-100 text-green-800', label: '💡 Khuyên học' }
    };
    const badge = badges[node.data.category];
    return (
      <span
        className={`rounded-full px-3 py-1 text-sm font-semibold ${badge.color}`}
      >
        {badge.label}
      </span>
    );
  };

  // Tìm các node prerequisite
  const prerequisiteNodes = allNodes.filter((n) =>
    node.data.prerequisites.includes(n.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 rounded-t-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="mb-2 text-3xl font-bold">{node.data.label}</h2>
              <p className="text-sm leading-relaxed text-purple-100">
                {node.data.description}
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 flex-shrink-0 rounded-lg p-2 transition-colors hover:bg-white hover:bg-opacity-20"
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
              className={`rounded-full px-3 py-1 text-sm font-semibold ${getDifficultyColor(
                node.data.difficulty
              )}`}
            >
              {node.data.difficulty}
            </span>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
              ⏱️ {node.data.estimatedTime}
            </span>
          </div>

          {/* Prerequisites */}
          {prerequisiteNodes.length > 0 && (
            <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-800">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                Kiến thức cần có trước
              </h3>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {prerequisiteNodes.map((preNode) => (
                  <div
                    key={preNode.id}
                    className="flex items-center gap-2 rounded-lg bg-white p-2 text-sm"
                  >
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    <span className="font-semibold text-gray-700">
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
              <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-800">
                <Book className="h-5 w-5 text-purple-600" />
                Các khái niệm chính
              </h3>
              <div className="space-y-2">
                {node.data.concepts.map((concept, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-lg bg-purple-50 p-3 transition-colors hover:bg-purple-100"
                  >
                    <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">
                      {index + 1}
                    </div>
                    <p className="flex-1 text-sm text-gray-700">{concept}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Examples */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-800">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Ví dụ ứng dụng
              </h3>
              <div className="space-y-2">
                {node.data.examples.map((example, index) => (
                  <div
                    key={index}
                    className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3 transition-colors hover:bg-blue-100"
                  >
                    <p className="text-sm text-gray-700">{example}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resources */}
          {node.data.resources && node.data.resources.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-lg font-bold text-gray-800">
                📚 Tài nguyên học tập
              </h3>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {node.data.resources.map((resource, index) => (
                  <div
                    key={index}
                    className="cursor-pointer rounded-lg bg-gray-50 p-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    {resource}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            <button className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-3 font-semibold text-white transition-all hover:scale-105 hover:shadow-lg">
              Bắt đầu học ngay
            </button>
            <button className="rounded-xl bg-gray-100 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-200">
              Lưu lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
const KnowledgeGraph = () => {
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);

  // Dữ liệu Knowledge Graph cho AP Calculus
  const initialNodes: Node<NodeData>[] = [
    {
      id: 'limits',
      type: 'knowledge',
      position: { x: 400, y: 0 },
      data: {
        label: 'Limits',
        category: 'foundation',
        description:
          'Giới hạn là nền tảng của toàn bộ giải tích, giúp hiểu sự biến đổi và xu hướng của hàm số.',
        concepts: [
          'Định nghĩa giới hạn theo ε-δ',
          'Các quy tắc tính giới hạn cơ bản',
          'Giới hạn một phía và giới hạn hai phía',
          'Giới hạn vô cực và giới hạn tại vô cực',
          'Định lý kẹp (Squeeze Theorem)'
        ],
        examples: [
          'lim(x→0) sin(x)/x = 1',
          'Tính vận tốc tức thời của vật chuyển động',
          'Phân tích hành vi của hàm tại điểm không xác định'
        ],
        prerequisites: [],
        estimatedTime: '2 tuần',
        difficulty: 'Cơ bản',
        status: 'completed',
        resources: ['Khan Academy: Limits', "Paul's Online Math Notes"]
      }
    },
    {
      id: 'continuity',
      type: 'knowledge',
      position: { x: 150, y: 150 },
      data: {
        label: 'Continuity',
        category: 'foundation',
        description:
          'Tính liên tục mô tả sự "không gián đoạn" của hàm số, quan trọng cho nhiều định lý sau này.',
        concepts: [
          'Định nghĩa hàm liên tục tại một điểm',
          'Các loại gián đoạn: removable, jump, infinite',
          'Tính liên tục trên đoạn và khoảng',
          'Định lý giá trị trung gian (IVT)',
          'Định lý Extreme Value'
        ],
        examples: [
          'Chứng minh phương trình có nghiệm bằng IVT',
          'Phân tích các điểm gián đoạn của hàm phân thức',
          'Ứng dụng trong bài toán tối ưu'
        ],
        prerequisites: ['limits'],
        estimatedTime: '1.5 tuần',
        difficulty: 'Cơ bản',
        status: 'completed'
      }
    },
    {
      id: 'derivative-def',
      type: 'knowledge',
      position: { x: 650, y: 150 },
      data: {
        label: 'Definition of Derivative',
        category: 'foundation',
        description:
          'Đạo hàm đo tốc độ biến thiên tức thời, là công cụ cốt lõi của giải tích.',
        concepts: [
          'Định nghĩa đạo hàm qua giới hạn',
          'Ý nghĩa hình học: tiếp tuyến',
          'Ý nghĩa vật lý: vận tốc tức thời',
          'Tính khả vi và tính liên tục',
          'Đạo hàm bên trái và bên phải'
        ],
        examples: [
          "f'(x) = lim(h→0) [f(x+h)-f(x)]/h",
          'Tính vận tốc và gia tốc',
          'Phương trình tiếp tuyến tại một điểm'
        ],
        prerequisites: ['limits', 'continuity'],
        estimatedTime: '1 tuần',
        difficulty: 'Trung bình',
        status: 'in-progress'
      }
    },
    {
      id: 'derivative-rules',
      type: 'knowledge',
      position: { x: 400, y: 300 },
      data: {
        label: 'Differentiation Rules',
        category: 'core',
        description:
          'Các quy tắc tính đạo hàm giúp tính toán nhanh chóng mà không cần dùng định nghĩa.',
        concepts: [
          'Power rule, Product rule, Quotient rule',
          'Chain rule - quy tắc dây chuyền',
          'Đạo hàm hàm lượng giác',
          'Đạo hàm hàm mũ và logarit',
          'Đạo hàm ngầm (implicit differentiation)',
          'Đạo hàm cấp cao'
        ],
        examples: [
          'd/dx[x^n] = nx^(n-1)',
          'd/dx[sin(x²)] = 2x·cos(x²) - chain rule',
          'Tìm dy/dx khi x² + y² = 25'
        ],
        prerequisites: ['derivative-def'],
        estimatedTime: '3 tuần',
        difficulty: 'Trung bình',
        status: 'available'
      }
    },
    {
      id: 'applications-derivative',
      type: 'knowledge',
      position: { x: 150, y: 450 },
      data: {
        label: 'Applications of Derivatives',
        category: 'core',
        description:
          'Ứng dụng đạo hàm vào phân tích hàm số và giải quyết bài toán thực tế.',
        concepts: [
          'Related rates - tốc độ biến thiên liên quan',
          'Linear approximation',
          'Định lý giá trị trung bình (MVT)',
          'Tìm cực trị: cực đại, cực tiểu',
          'Bài toán tối ưu hóa',
          'Phân tích đồ thị: concavity, inflection points'
        ],
        examples: [
          'Bài toán hình hộp tích lớn nhất',
          'Tốc độ thay đổi thể tích bóng bay',
          'Phân tích và vẽ đồ thị hàm số'
        ],
        prerequisites: ['derivative-rules'],
        estimatedTime: '3 tuần',
        difficulty: 'Trung bình',
        status: 'locked'
      }
    },
    {
      id: 'lhospital',
      type: 'knowledge',
      position: { x: 50, y: 300 },
      data: {
        label: "L'Hospital's Rule",
        category: 'optional',
        description:
          'Kỹ thuật mạnh mẽ để tính các giới hạn dạng vô định sử dụng đạo hàm.',
        concepts: [
          'Các dạng vô định: 0/0, ∞/∞',
          'Điều kiện áp dụng quy tắc',
          'Áp dụng nhiều lần',
          'Các dạng khác: 0·∞, ∞-∞, 0⁰, 1^∞, ∞⁰'
        ],
        examples: [
          'lim(x→0) sin(x)/x',
          'lim(x→∞) ln(x)/x',
          'lim(x→0⁺) x·ln(x)'
        ],
        prerequisites: ['derivative-rules'],
        estimatedTime: '1 tuần',
        difficulty: 'Trung bình',
        status: 'locked'
      }
    },
    {
      id: 'integration-basic',
      type: 'knowledge',
      position: { x: 650, y: 450 },
      data: {
        label: 'Basic Integration',
        category: 'core',
        description:
          'Tích phân là phép toán ngược của đạo hàm, tính tổng tích lũy.',
        concepts: [
          'Nguyên hàm và tích phân bất định',
          'Tổng Riemann',
          'Định lý cơ bản của giải tích (FTC)',
          'Tích phân xác định',
          'Các tính chất của tích phân'
        ],
        examples: [
          '∫x^n dx = x^(n+1)/(n+1) + C',
          'Tính diện tích dưới đường cong',
          'Tính độ dịch chuyển từ vận tốc'
        ],
        prerequisites: ['derivative-rules'],
        estimatedTime: '2.5 tuần',
        difficulty: 'Trung bình',
        status: 'locked'
      }
    },
    {
      id: 'integration-techniques',
      type: 'knowledge',
      position: { x: 400, y: 600 },
      data: {
        label: 'Integration Techniques',
        category: 'core',
        description: 'Các kỹ thuật nâng cao để tính tích phân phức tạp.',
        concepts: [
          'U-substitution (phương pháp thế)',
          'Integration by parts (tích phân từng phần)',
          'Tích phân hàm lượng giác',
          'Tích phân phân thức hữu tỉ',
          'Phương pháp phân tích thành phân số đơn giản'
        ],
        examples: [
          '∫x·e^x dx - integration by parts',
          '∫sin²(x) dx - trig integration',
          '∫dx/(x²-1) - partial fractions'
        ],
        prerequisites: ['integration-basic'],
        estimatedTime: '3 tuần',
        difficulty: 'Nâng cao',
        status: 'locked'
      }
    },
    {
      id: 'applications-integration',
      type: 'knowledge',
      position: { x: 150, y: 750 },
      data: {
        label: 'Applications of Integration',
        category: 'advanced',
        description:
          'Sử dụng tích phân để giải quyết các bài toán hình học và vật lý.',
        concepts: [
          'Diện tích giữa các đường cong',
          'Thể tích vật thể tròn xoay',
          'Thể tích theo thiết diện chéo',
          'Chiều dài cung (arc length)',
          'Diện tích bề mặt tròn xoay',
          'Công và áp suất chất lỏng'
        ],
        examples: [
          'Thể tích hình nón bằng disk method',
          'Diện tích vùng giữa y=x² và y=x',
          'Tính công nâng vật lên cao'
        ],
        prerequisites: ['integration-techniques'],
        estimatedTime: '3 tuần',
        difficulty: 'Nâng cao',
        status: 'locked'
      }
    },
    {
      id: 'differential-equations',
      type: 'knowledge',
      position: { x: 650, y: 750 },
      data: {
        label: 'Differential Equations',
        category: 'advanced',
        description:
          'Phương trình vi phân mô tả mối quan hệ giữa hàm số và đạo hàm của nó.',
        concepts: [
          'Slope fields',
          'Phương trình vi phân tách biến',
          'Phương trình tuyến tính bậc nhất',
          'Mô hình tăng trưởng mũ: dP/dt = kP',
          'Mô hình Logistic',
          "Euler's method - xấp xỉ số"
        ],
        examples: [
          "dT/dt = k(T-Tₐ) - Newton's cooling",
          'dP/dt = kP(1-P/M) - Logistic growth',
          'Mô hình phân rã phóng xạ'
        ],
        prerequisites: ['integration-techniques'],
        estimatedTime: '2 tuần',
        difficulty: 'Nâng cao',
        status: 'locked'
      }
    },
    {
      id: 'parametric',
      type: 'knowledge',
      position: { x: 400, y: 900 },
      data: {
        label: 'Parametric & Polar',
        category: 'advanced',
        description: 'Các cách biểu diễn đường cong khác ngoài y = f(x).',
        concepts: [
          'Phương trình tham số: x=f(t), y=g(t)',
          'Đạo hàm dy/dx từ phương trình tham số',
          'Chiều dài cung với tham số',
          'Tọa độ cực r = f(θ)',
          'Diện tích trong tọa độ cực',
          'Vector và chuyển động'
        ],
        examples: [
          'Quỹ đạo đường tròn: x=r·cos(t), y=r·sin(t)',
          'Đường xoắn ốc: r = θ',
          'Vận tốc và gia tốc vector'
        ],
        prerequisites: ['integration-techniques', 'applications-derivative'],
        estimatedTime: '2.5 tuần',
        difficulty: 'Nâng cao',
        status: 'locked'
      }
    },
    {
      id: 'sequences-series',
      type: 'knowledge',
      position: { x: 400, y: 1050 },
      data: {
        label: 'Sequences & Series',
        category: 'advanced',
        description: 'Dãy số và chuỗi vô hạn - đặc trưng của BC Calculus.',
        concepts: [
          'Dãy số và giới hạn dãy',
          'Chuỗi vô hạn và hội tụ',
          'Các test hội tụ: divergence, ratio, root, integral',
          'Chuỗi lũy thừa',
          'Khai triển Taylor và Maclaurin',
          'Bán kính và khoảng hội tụ',
          'Sai số và xấp xỉ'
        ],
        examples: [
          'e^x = Σ x^n/n!',
          'sin(x) = Σ (-1)^n·x^(2n+1)/(2n+1)!',
          'Chuỗi hình học: Σ ar^n'
        ],
        prerequisites: ['integration-techniques', 'lhospital'],
        estimatedTime: '4 tuần',
        difficulty: 'Nâng cao',
        status: 'locked'
      }
    },
    {
      id: 'vectors',
      type: 'knowledge',
      position: { x: 750, y: 900 },
      data: {
        label: 'Vectors & Motion',
        category: 'optional',
        description:
          'Mở rộng hiểu biết về chuyển động trong không gian 2D và 3D.',
        concepts: [
          'Vector trong mặt phẳng và không gian',
          'Phép toán vector: cộng, trừ, nhân vô hướng',
          'Vận tốc vector và gia tốc vector',
          'Chuyển động đường cong',
          'Độ lớn và hướng của vector'
        ],
        examples: [
          'Chuyển động viên đạn',
          'Phân tích lực trong vật lý',
          'Vận tốc tương đối'
        ],
        prerequisites: ['parametric'],
        estimatedTime: '1.5 tuần',
        difficulty: 'Trung bình',
        status: 'locked'
      }
    }
  ];

  // Các edges với loại khác nhau
  const initialEdges: Edge[] = [
    // Required prerequisites (solid lines)
    {
      id: 'e-limits-continuity',
      source: 'limits',
      target: 'continuity',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 3 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#3b82f6',
        width: 20,
        height: 20
      },
      label: 'Bắt buộc',
      labelStyle: { fill: '#3b82f6', fontWeight: 700, fontSize: 12 },
      labelBgStyle: { fill: '#fff', fillOpacity: 0.8 },
      labelBgPadding: [8, 4] as [number, number],
      labelBgBorderRadius: 4
    },
    {
      id: 'e-limits-derivative',
      source: 'limits',
      target: 'derivative-def',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 3 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#3b82f6',
        width: 20,
        height: 20
      },
      label: 'Bắt buộc',
      labelStyle: { fill: '#3b82f6', fontWeight: 700, fontSize: 12 },
      labelBgStyle: { fill: '#fff', fillOpacity: 0.8 }
    },
    {
      id: 'e-continuity-derivative',
      source: 'continuity',
      target: 'derivative-def',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 3 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#3b82f6',
        width: 20,
        height: 20
      },
      label: 'Bắt buộc',
      labelStyle: { fill: '#3b82f6', fontWeight: 700, fontSize: 12 },
      labelBgStyle: { fill: '#fff', fillOpacity: 0.8 }
    },
    {
      id: 'e-derivative-def-rules',
      source: 'derivative-def',
      target: 'derivative-rules',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 3 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#3b82f6',
        width: 20,
        height: 20
      },
      label: 'Bắt buộc',
      labelStyle: { fill: '#3b82f6', fontWeight: 700, fontSize: 12 },
      labelBgStyle: { fill: '#fff', fillOpacity: 0.8 }
    },
    {
      id: 'e-rules-applications',
      source: 'derivative-rules',
      target: 'applications-derivative',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 3 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#3b82f6',
        width: 20,
        height: 20
      },
      label: 'Bắt buộc',
      labelStyle: { fill: '#3b82f6', fontWeight: 700, fontSize: 12 },
      labelBgStyle: { fill: '#fff', fillOpacity: 0.8 }
    },
    {
      id: 'e-rules-integration',
      source: 'derivative-rules',
      target: 'integration-basic',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 3 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#3b82f6',
        width: 20,
        height: 20
      },
      label: 'Bắt buộc',
      labelStyle: { fill: '#3b82f6', fontWeight: 700, fontSize: 12 },
      labelBgStyle: { fill: '#fff', fillOpacity: 0.8 }
    },
    {
      id: 'e-integration-techniques',
      source: 'integration-basic',
      target: 'integration-techniques',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 3 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#3b82f6',
        width: 20,
        height: 20
      },
      label: 'Bắt buộc',
      labelStyle: { fill: '#3b82f6', fontWeight: 700, fontSize: 12 },
      labelBgStyle: { fill: '#fff', fillOpacity: 0.8 }
    },
    {
      id: 'e-techniques-applications-int',
      source: 'integration-techniques',
      target: 'applications-integration',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 3 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#3b82f6',
        width: 20,
        height: 20
      },
      label: 'Bắt buộc',
      labelStyle: { fill: '#3b82f6', fontWeight: 700, fontSize: 12 },
      labelBgStyle: { fill: '#fff', fillOpacity: 0.8 }
    },
    {
      id: 'e-techniques-diff-eq',
      source: 'integration-techniques',
      target: 'differential-equations',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 3 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#3b82f6',
        width: 20,
        height: 20
      },
      label: 'Bắt buộc',
      labelStyle: { fill: '#3b82f6', fontWeight: 700, fontSize: 12 },
      labelBgStyle: { fill: '#fff', fillOpacity: 0.8 }
    },
    {
      id: 'e-techniques-parametric',
      source: 'integration-techniques',
      target: 'parametric',
      type: 'smoothstep',
      style: { stroke: '#3b82f6', strokeWidth: 3 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#3b82f6',
        width: 20,
        height: 20
      },
      label: 'Bắt buộc',
      labelStyle: { fill: '#3b82f6', fontWeight: 700, fontSize: 12 },
      labelBgStyle: { fill: '#fff', fillOpacity: 0.8 }
    },
    {
      id: 'e-applications-parametric',
      source: 'applications-derivative',
      target: 'parametric',
      type: 'smoothstep',
      style: { stroke: '#3b82f6', strokeWidth: 3 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#3b82f6',
        width: 20,
        height: 20
      },
      label: 'Bắt buộc',
      labelStyle: { fill: '#3b82f6', fontWeight: 700, fontSize: 12 },
      labelBgStyle: { fill: '#fff', fillOpacity: 0.8 }
    },
    {
      id: 'e-techniques-series',
      source: 'integration-techniques',
      target: 'sequences-series',
      type: 'smoothstep',
      style: { stroke: '#3b82f6', strokeWidth: 3 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#3b82f6',
        width: 20,
        height: 20
      },
      label: 'Bắt buộc',
      labelStyle: { fill: '#3b82f6', fontWeight: 700, fontSize: 12 },
      labelBgStyle: { fill: '#fff', fillOpacity: 0.8 }
    },

    // Recommended/Optional connections (dashed lines)
    {
      id: 'e-rules-lhospital',
      source: 'derivative-rules',
      target: 'lhospital',
      type: 'smoothstep',
      style: { stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5,5' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#10b981',
        width: 20,
        height: 20
      },
      label: 'Khuyên học',
      labelStyle: { fill: '#10b981', fontWeight: 600, fontSize: 12 },
      labelBgStyle: { fill: '#fff', fillOpacity: 0.8 }
    },
    {
      id: 'e-lhospital-series',
      source: 'lhospital',
      target: 'sequences-series',
      type: 'smoothstep',
      style: { stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5,5' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#10b981',
        width: 20,
        height: 20
      },
      label: 'Khuyên học',
      labelStyle: { fill: '#10b981', fontWeight: 600, fontSize: 12 },
      labelBgStyle: { fill: '#fff', fillOpacity: 0.8 }
    },
    {
      id: 'e-parametric-vectors',
      source: 'parametric',
      target: 'vectors',
      type: 'smoothstep',
      style: { stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5,5' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#10b981',
        width: 20,
        height: 20
      },
      label: 'Khuyên học',
      labelStyle: { fill: '#10b981', fontWeight: 600, fontSize: 12 },
      labelBgStyle: { fill: '#fff', fillOpacity: 0.8 }
    }
  ];

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<NodeData>) => {
      setSelectedNode(node);
    },
    []
  );

  return (
    <div className="h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="border-gradient-to-r absolute left-0 right-0 top-0 z-10 border-b-4 bg-white from-purple-600 to-blue-600 shadow-lg">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-3xl font-bold text-transparent">
                AP Calculus BC - Knowledge Graph
              </h1>
              <p className="mt-1 text-gray-600">
                Sơ đồ tri thức với các mối liên hệ phụ thuộc • Click vào node để
                xem chi tiết
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Tổng số khái niệm</div>
              <div className="text-3xl font-bold text-purple-600">
                {nodes.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* React Flow */}
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
          minZoom={0.2}
          maxZoom={1.5}
          className="bg-transparent"
        >
          <Background
            color="#e0e7ff"
            gap={20}
            size={1}
            style={{ backgroundColor: 'transparent' }}
          />
          <Controls className="rounded-lg bg-white shadow-lg" />
          <MiniMap
            className="rounded-lg border-2 border-purple-200 bg-white shadow-lg"
            nodeColor={(node) => {
              const data = node.data as NodeData;
              const colors = {
                foundation: '#3b82f6',
                core: '#9333ea',
                advanced: '#dc2626',
                optional: '#10b981'
              };
              return colors[data.category] || '#6b7280';
            }}
            maskColor="rgba(147, 51, 234, 0.1)"
          />
        </ReactFlow>
      </div>

      {/* Dialog */}
      {selectedNode && (
        <KnowledgeDetailDialog
          node={selectedNode}
          allNodes={nodes}
          onClose={() => setSelectedNode(null)}
        />
      )}

      {/* Enhanced Legend */}
      <div className="absolute bottom-6 left-6 z-10 max-w-md rounded-xl border-2 border-purple-100 bg-white p-5 shadow-2xl">
        <h3 className="mb-4 text-lg font-bold text-gray-800">📚 Chú giải</h3>

        {/* Categories */}
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-semibold text-gray-700">
            Phân loại kiến thức:
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-gradient-to-br from-blue-400 to-blue-600" />
              <span>🏗️ Nền tảng - Kiến thức cơ bản nhất</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-gradient-to-br from-purple-400 to-purple-600" />
              <span>⭐ Cốt lõi - Kiến thức quan trọng</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-gradient-to-br from-red-400 to-red-600" />
              <span>🚀 Nâng cao - Đặc trưng BC Calculus</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-gradient-to-br from-green-400 to-green-600" />
              <span>💡 Khuyên học - Bổ sung hữu ích</span>
            </div>
          </div>
        </div>

        {/* Edge types */}
        <div className="mb-4 border-t border-gray-200 pt-3">
          <h4 className="mb-2 text-sm font-semibold text-gray-700">
            Mối liên hệ:
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-8 bg-blue-600" />
              <span>→ Bắt buộc học trước</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-8 border-t-2 border-dashed border-green-600 bg-green-600 bg-transparent" />
              <span>⤏ Khuyên học thêm</span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="border-t border-gray-200 pt-3">
          <h4 className="mb-2 text-sm font-semibold text-gray-700">
            Trạng thái học:
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Đã hoàn thành</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span>Đang học</span>
            </div>
            <div className="flex items-center gap-2">
              <Book className="h-4 w-4 text-purple-600" />
              <span>Sẵn sàng học</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-gray-400" />
              <span>Chưa mở khóa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Panel */}
      <div className="absolute bottom-6 right-6 z-10 rounded-xl border-2 border-blue-100 bg-white p-5 shadow-2xl">
        <h3 className="mb-3 font-bold text-gray-800">📊 Thống kê</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Đã hoàn thành:</span>
            <span className="font-bold text-green-600">
              {nodes.filter((n) => n.data.status === 'completed').length} /{' '}
              {nodes.length}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Đang học:</span>
            <span className="font-bold text-blue-600">
              {nodes.filter((n) => n.data.status === 'in-progress').length}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Sẵn sàng:</span>
            <span className="font-bold text-purple-600">
              {nodes.filter((n) => n.data.status === 'available').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraph;
