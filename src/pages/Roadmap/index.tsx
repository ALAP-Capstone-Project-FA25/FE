import React, {
  useCallback,
  useRef,
  useState,
  useMemo,
  useEffect
} from 'react';
import {
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
  ReactFlow,
  ConnectionMode
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
const initialNodes = [
  {
    id: '0',
    type: 'default',
    data: {
      label: 'Frontend Basics',
      variant: 'primary',
      checked: true,
      muted: false
    },
    position: { x: 0, y: 80 }
  },
  {
    id: '1',
    type: 'default',
    data: { label: 'HTML', variant: 'secondary', checked: true, muted: false },
    position: { x: 260, y: 40 }
  },
  {
    id: '2',
    type: 'default',
    data: { label: 'CSS', variant: 'secondary', checked: false, muted: false },
    position: { x: 260, y: 120 }
  }
];

const initialEdges = [
  { id: 'e-0-1', source: '0', target: '1' },
  { id: 'e-0-2', source: '0', target: '2' }
];

let gid = 3;
const getId = () => `${gid++}`;

function FlowWithDrawer() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { screenToFlowPosition } = useReactFlow();

  // Drawer state
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // để add node mượt khi kéo dây ra vùng trống
  const connectingNodeIdRef = useRef(null);
  const creatingRef = useRef(false);

  const onConnectStart = useCallback((_, { nodeId }) => {
    connectingNodeIdRef.current = nodeId;
  }, []);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onConnectEnd = useCallback(
    (event) => {
      const paneEl = event.target?.closest?.('.react-flow__pane');
      const fromId = connectingNodeIdRef.current;
      if (!paneEl || !fromId || creatingRef.current) return;

      creatingRef.current = true;
      const { clientX, clientY } =
        'changedTouches' in event ? event.changedTouches[0] : event;

      const newId = getId();
      const position = screenToFlowPosition({ x: clientX, y: clientY });

      setNodes((nds) =>
        nds.concat({
          id: newId,
          position,
          data: {
            label: `Node ${newId}`,
            variant: 'secondary',
            checked: false,
            muted: false
          }
        })
      );
      setEdges((eds) =>
        eds.concat({
          id: `e-${fromId}-${newId}`,
          source: fromId,
          target: newId
        })
      );

      connectingNodeIdRef.current = null;
      requestAnimationFrame(() => {
        creatingRef.current = false;
      });
    },
    [screenToFlowPosition, setNodes, setEdges]
  );

  // mở drawer khi click node
  const onNodeClick = useCallback((_, node) => {
    setEditingId(node.id);
    setOpen(true);
  }, []);

  // data node đang edit
  const editingNode = useMemo(
    () => nodes.find((n) => n.id === editingId),
    [nodes, editingId]
  );

  // cập nhật field trong node
  const updateNodeData = useCallback(
    (patch) => {
      if (!editingId) return;
      setNodes((nds) =>
        nds.map((n) =>
          n.id === editingId ? { ...n, data: { ...n.data, ...patch } } : n
        )
      );
    },
    [editingId, setNodes]
  );

  // đóng bằng ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background />
      </ReactFlow>

      {/* Overlay */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.25)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity .2s ease'
        }}
      />

      {/* Drawer phải */}
      <aside
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          height: '100%',
          width: 360,
          background: '#fff',
          boxShadow: '0 0 0 1px #eee, 0 10px 30px rgba(0,0,0,0.15)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform .25s ease',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}
        role="dialog"
        aria-modal="true"
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <h3 style={{ margin: 0 }}>Sửa node</h3>
          <button
            onClick={() => setOpen(false)}
            style={{
              border: 0,
              background: 'transparent',
              fontSize: 20,
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        {editingNode ? (
          <>
            <label style={{ fontSize: 12, color: '#666' }}>ID</label>
            <input
              className="xy-theme__input"
              value={editingNode.id}
              readOnly
            />

            <label className="xy-theme__label">Label</label>
            <input
              className="xy-theme__input"
              value={editingNode.data?.label || ''}
              onChange={(e) => updateNodeData({ label: e.target.value })}
              placeholder="Nhập tiêu đề"
            />

            <label className="xy-theme__label">Variant</label>
            <select
              className="xy-theme__select"
              value={editingNode.data?.variant || 'secondary'}
              onChange={(e) => updateNodeData({ variant: e.target.value })}
            >
              <option value="primary">primary (vàng đậm)</option>
              <option value="secondary">secondary (kem)</option>
            </select>

            <div
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                marginTop: 4
              }}
            >
              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  className="xy-theme__checkbox"
                  checked={!!editingNode.data?.checked}
                  onChange={(e) =>
                    updateNodeData({ checked: e.target.checked })
                  }
                />
                Có dấu ✓
              </label>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  className="xy-theme__checkbox"
                  checked={!!editingNode.data?.muted}
                  onChange={(e) => updateNodeData({ muted: e.target.checked })}
                />
                Mờ (muted)
              </label>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
              <button
                className="xy-theme__button"
                onClick={() => setOpen(false)}
              >
                Lưu & đóng
              </button>
              <button
                className="xy-theme__button"
                onClick={() => {
                  // xóa node đang sửa
                  const id = editingNode.id;
                  setNodes((nds) => nds.filter((n) => n.id !== id));
                  setEdges((eds) =>
                    eds.filter((e) => e.source !== id && e.target !== id)
                  );
                  setOpen(false);
                }}
              >
                Xoá node
              </button>
            </div>
          </>
        ) : (
          <p style={{ color: '#777' }}>Chọn một node để chỉnh sửa.</p>
        )}
      </aside>
    </div>
  );
}

export default function RoadmapPage() {
  return (
    <ReactFlowProvider>
      <FlowWithDrawer />
    </ReactFlowProvider>
  );
}
