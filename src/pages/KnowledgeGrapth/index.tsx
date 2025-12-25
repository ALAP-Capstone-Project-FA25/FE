// KnowledgeGraphPage.jsx
import { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
  ConnectionMode
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

/* ======================== Helpers ======================== */

const passStat = (nodeData) => {
  const total = nodeData.questions.length;
  const correct = nodeData.progress?.correctQuestionIds.length ?? 0;
  const ratio = total ? correct / total : 0;
  return { total, correct, ratio, passed: total > 0 && ratio >= 0.7 };
};

const edgeStyleFromMeta = (meta = {}) => {
  const { dashed = false, weight = 0.7, color = '#5b7fb0' } = meta as any;
  return {
    stroke: color,
    strokeWidth: Math.max(1.5, weight * 3),
    strokeDasharray: dashed ? '6 6' : undefined
  };
};

/* ---------- Serialize / Deserialize (Save / Load) ---------- */

// React Flow state -> JSON phẳng để lưu DB
function serializeGraph(nodes, edges) {
  const concepts = [] as any;
  const resources = [] as any;
  const questions = [] as any;
  const progress = [] as any;
  const positions = [] as any;

  for (const n of nodes) {
    const d = n.data || {};
    const c = d.concept || ({ id: n.id, name: d.label || 'Concept' } as any);

    concepts.push({
      id: c.id,
      topicId: c.topicId ?? null,
      name: c.name,
      description: c.description ?? '',
      difficultyBand: c.difficultyBand ?? 'intro',
      isActive: c.isActive ?? true,
      version: c.version ?? 1
    });

    positions.push({
      conceptId: c.id,
      x: n.position?.x ?? 0,
      y: n.position?.y ?? 0
    });

    for (const r of d.resources || []) {
      resources.push({
        id: r.id,
        conceptId: c.id,
        resType: r.resType,
        title: r.title,
        url: r.url,
        isActive: r.isActive ?? true,
        difficulty: r.difficulty ?? null,
        metaData: r.metaData ?? null
      });
    }

    for (const q of d.questions || []) {
      questions.push({
        id: q.id,
        conceptId: c.id,
        title: q.title,
        description: q.description ?? '',
        answer: q.answer ?? ''
      });
    }

    const corr = d.progress?.correctQuestionIds || [];
    progress.push({
      conceptId: c.id,
      correctQuestionIds: corr
    });
  }

  const edgesOut = edges.map((e) => {
    const meta = e.data?.meta || {};
    return {
      id: e.id,
      fromConceptId: e.source,
      toConceptId: e.target,
      relationType: meta.relationType ?? e.label ?? 'prerequisite',
      weight: meta.weight ?? 0.7,
      dashed: !!meta.dashed,
      color: meta.color ?? '#5b7fb0',
      label: e.label ?? null
    };
  });

  return {
    concepts,
    resources,
    questions,
    progress,
    edges: edgesOut,
    positions
  };
}

// JSON -> React Flow state (để load)
function deserializeGraph(payload) {
  const {
    concepts = [],
    resources = [],
    questions = [],
    progress = [],
    edges = [],
    positions = []
  } = payload;

  const posMap = new Map(
    positions.map((p) => [p.conceptId, { x: p.x, y: p.y }])
  );
  const progMap = new Map(progress.map((p) => [p.conceptId, p]));

  const resMap = new Map();
  for (const r of resources) {
    if (!resMap.has(r.conceptId)) resMap.set(r.conceptId, []);
    resMap.get(r.conceptId).push(r);
  }
  const qMap = new Map();
  for (const q of questions) {
    if (!qMap.has(q.conceptId)) qMap.set(q.conceptId, []);
    qMap.get(q.conceptId).push(q);
  }

  const nodes = concepts.map((c, i) => ({
    id: c.id,
    type: 'default',
    position: posMap.get(c.id) || { x: i * 240, y: 120 },
    data: {
      concept: c,
      resources: resMap.get(c.id) || [],
      questions: qMap.get(c.id) || [],
      progress: progMap.get(c.id) || { conceptId: c.id, correctQuestionIds: [] }
    }
  }));

  const edgesRF = edges.map((e) => ({
    id: e.id,
    source: e.fromConceptId,
    target: e.toConceptId,
    type: 'smoothstep',
    label: e.label ?? e.relationType ?? 'prerequisite',
    data: {
      meta: {
        relationType: e.relationType ?? 'prerequisite',
        weight: e.weight ?? 0.7,
        dashed: !!e.dashed,
        color: e.color ?? '#5b7fb0'
      }
    },
    style: edgeStyleFromMeta({
      relationType: e.relationType ?? 'prerequisite',
      weight: e.weight ?? 0.7,
      dashed: !!e.dashed,
      color: e.color ?? '#5b7fb0'
    })
  }));

  return { nodes, edges: edgesRF };
}

/* ======================== Drawers ======================== */

function NodeDrawer({
  open,
  onClose,
  nodeData,
  onUpdateConcept,
  onAddResource,
  onRemoveResource,
  onAddQuestion,
  onRemoveQuestion,
  onToggleCorrect
}) {
  if (!nodeData) return null;
  const stat = passStat(nodeData);

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,.25)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity .2s ease',
          zIndex: 9
        }}
      />
      <aside
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100%',
          width: 420,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform .25s ease',
          background: '#fff',
          boxShadow: '0 0 0 1px #eee, 0 10px 30px rgba(0,0,0,.15)',
          padding: 16,
          zIndex: 10,
          overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h3 style={{ margin: 0, flex: 1 }}>Concept</h3>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 999,
              color: '#fff',
              background: stat.passed ? '#16a34a' : '#94a3b8'
            }}
          >
            {stat.correct}/{stat.total}
          </span>
          <button
            onClick={onClose}
            style={{
              marginLeft: 'auto',
              fontSize: 24,
              border: 0,
              background: 'transparent'
            }}
          >
            ×
          </button>
        </div>

        <label>Title</label>
        <input
          value={nodeData.concept.name}
          onChange={(e) => onUpdateConcept({ name: e.target.value })}
          style={{ width: '100%', padding: 8, marginBottom: 8 }}
        />

        <label>Difficulty</label>
        <select
          value={nodeData.concept.difficultyBand}
          onChange={(e) => onUpdateConcept({ difficultyBand: e.target.value })}
          style={{ width: '100%', padding: 8, marginBottom: 8 }}
        >
          <option value="intro">intro</option>
          <option value="core">core</option>
          <option value="advance">advance</option>
        </select>

        <label>Description</label>
        <textarea
          value={nodeData.concept.description ?? ''}
          onChange={(e) => onUpdateConcept({ description: e.target.value })}
          style={{ width: '100%', padding: 8, minHeight: 80, marginBottom: 12 }}
        />

        <hr />
        <h4>Resources</h4>
        <ul style={{ paddingLeft: 18 }}>
          {nodeData.resources.map((r) => (
            <li key={r.id} style={{ marginBottom: 8 }}>
              <a href={r.url} target="_blank" rel="noreferrer">
                {r.title}
              </a>
              <small style={{ marginLeft: 6, color: '#6b7280' }}>
                ({r.resType}
                {r.difficulty ? `/${r.difficulty}` : ''})
              </small>
              <button
                onClick={() => onRemoveResource(r.id)}
                style={{
                  marginLeft: 8,
                  border: 0,
                  background: 'transparent',
                  color: '#b91c1c',
                  cursor: 'pointer'
                }}
              >
                xoá
              </button>
            </li>
          ))}
        </ul>
        <button
          onClick={() =>
            onAddResource({
              resType: 'reading',
              title: 'New resource',
              url: 'https://example.com',
              isActive: true
            })
          }
        >
          + Add Resource
        </button>

        <hr />
        <h4>Questions</h4>
        <ul style={{ paddingLeft: 18 }}>
          {nodeData.questions.map((q) => {
            const correct = nodeData.progress?.correctQuestionIds.includes(
              q.id
            );
            return (
              <li key={q.id} style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 600 }}>{q.title}</div>
                {q.description && (
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    {q.description}
                  </div>
                )}
                <label style={{ fontSize: 12 }}>
                  <input
                    type="checkbox"
                    checked={!!correct}
                    onChange={(e) => onToggleCorrect(q.id, e.target.checked)}
                  />{' '}
                  Mark correct
                </label>
                <button
                  onClick={() => onRemoveQuestion(q.id)}
                  style={{
                    marginLeft: 8,
                    border: 0,
                    background: 'transparent',
                    color: '#b91c1c',
                    cursor: 'pointer'
                  }}
                >
                  xoá
                </button>
              </li>
            );
          })}
        </ul>
        <button
          onClick={() =>
            onAddQuestion({
              title: 'New question',
              description: '…',
              answer: '…'
            })
          }
        >
          + Add Question
        </button>
      </aside>
    </>
  );
}

function EdgeDrawer({ open, onClose, edge, onUpdate, onDelete }) {
  if (!edge) return null;
  const meta = edge.data?.meta || {};
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,.25)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity .2s ease',
          zIndex: 19
        }}
      />
      <aside
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100%',
          width: 360,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform .25s ease',
          background: '#fff',
          boxShadow: '0 0 0 1px #eee, 0 10px 30px rgba(0,0,0,.15)',
          padding: 16,
          zIndex: 20,
          overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h3 style={{ margin: 0, flex: 1 }}>Edge</h3>
          <button
            onClick={onClose}
            style={{ fontSize: 24, border: 0, background: 'transparent' }}
          >
            ×
          </button>
        </div>

        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
          {edge.source} → {edge.target}
        </div>

        <label>Label</label>
        <input
          value={edge.label ?? ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
          style={{ width: '100%', padding: 8, marginBottom: 8 }}
        />

        <label>Relation type</label>
        <select
          value={meta.relationType ?? 'prerequisite'}
          onChange={(e) =>
            onUpdate({
              data: { meta: { ...meta, relationType: e.target.value } }
            })
          }
          style={{ width: '100%', padding: 8, marginBottom: 8 }}
        >
          <option value="prerequisite">prerequisite</option>
          <option value="optional">optional</option>
          <option value="reference">reference</option>
        </select>

        <label>Weight (độ dày)</label>
        <input
          type="number"
          step="0.1"
          min="0.1"
          max="3"
          value={meta.weight ?? 0.7}
          onChange={(e) =>
            onUpdate({
              data: { meta: { ...meta, weight: Number(e.target.value) } }
            })
          }
          style={{ width: '100%', padding: 8, marginBottom: 8 }}
        />

        <label>Màu</label>
        <input
          type="color"
          value={meta.color ?? '#5b7fb0'}
          onChange={(e) =>
            onUpdate({ data: { meta: { ...meta, color: e.target.value } } })
          }
          style={{ width: 60, height: 34, padding: 0, marginBottom: 12 }}
        />

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12
          }}
        >
          <input
            type="checkbox"
            checked={!!meta.dashed}
            onChange={(e) =>
              onUpdate({
                data: { meta: { ...meta, dashed: e.target.checked } }
              })
            }
          />
          Nét đứt (dashed)
        </label>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose}>Lưu</button>
          <button
            onClick={() => {
              onDelete();
              onClose();
            }}
            style={{ color: '#b91c1c' }}
          >
            Xoá Edge
          </button>
        </div>
      </aside>
    </>
  );
}

/* ======================== Graph chính ======================== */

const initialNodes = [
  {
    id: 'c1',
    type: 'default',
    position: { x: 0, y: 120 },
    data: {
      concept: {
        id: 'c1',
        topicId: 't1',
        name: 'Internet',
        description: 'Basics of networking & web.',
        difficultyBand: 'intro',
        isActive: true,
        version: 1
      },
      resources: [
        {
          id: 'r1',
          conceptId: 'c1',
          resType: 'video',
          title: 'How the Internet works',
          url: '#',
          isActive: true,
          difficulty: 'easy'
        }
      ],
      questions: [],
      progress: { conceptId: 'c1', correctQuestionIds: [] }
    }
  },
  {
    id: 'c2',
    type: 'default',
    position: { x: 260, y: 60 },
    data: {
      concept: {
        id: 'c2',
        topicId: 't1',
        name: 'HTTP',
        description: 'Requests, responses, methods.',
        difficultyBand: 'core',
        isActive: true,
        version: 1
      },
      resources: [
        {
          id: 'r2',
          conceptId: 'c2',
          resType: 'reading',
          title: 'MDN: HTTP overview',
          url: '#',
          isActive: true,
          difficulty: 'medium'
        }
      ],
      questions: [
        {
          id: 'q1',
          conceptId: 'c2',
          title: 'Idempotent methods?',
          description: 'Which methods are idempotent?',
          answer: 'GET/PUT'
        }
      ],
      progress: { conceptId: 'c2', correctQuestionIds: ['q1'] }
    }
  }
];

const initialEdges = [
  {
    id: 'e-c1-c2',
    source: 'c1',
    target: 'c2',
    type: 'smoothstep',
    label: 'prerequisite',
    data: {
      meta: {
        relationType: 'prerequisite',
        weight: 0.8,
        dashed: false,
        color: '#5b7fb0'
      }
    },
    style: edgeStyleFromMeta({
      relationType: 'prerequisite',
      weight: 0.8,
      dashed: false,
      color: '#5b7fb0'
    })
  }
];

let seq = 3;
const nextId = (prefix = 'c') => `${prefix}-${Date.now()}-${seq++}`;
const nodeOrigin: any = [0.5, 0];

function KnowledgeGraphInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { screenToFlowPosition } = useReactFlow();

  // Admin
  const isAdmin = true;
  const [adminMode, setAdminMode] = useState(true);

  // Node drawer
  const [nodeOpen, setNodeOpen] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const currentNode = useMemo(
    () => nodes.find((n) => n.id === editingNodeId),
    [nodes, editingNodeId]
  );

  // Edge drawer
  const [edgeOpen, setEdgeOpen] = useState(false);
  const [editingEdgeId, setEditingEdgeId] = useState(null);
  const currentEdge = useMemo(
    () => edges.find((e) => e.id === editingEdgeId),
    [edges, editingEdgeId]
  );

  // hiển thị label node có badge pass
  const displayNodes = useMemo(
    () =>
      nodes.map((n) => {
        const s = n.data?.concept ? passStat(n.data) : null;
        const badge = s && s.total ? ` (${s.correct}/${s.total})` : '';
        return {
          ...n,
          data: {
            ...(n.data || {}),
            label: n.data?.concept?.name
              ? `${n.data.concept.name}${badge}`
              : (n.data as any)?.label || 'Node'
          }
        };
      }),
    [nodes]
  );

  // click node → mở node drawer
  const onNodeClick = useCallback((_, node) => {
    setEditingNodeId(node.id);
    setNodeOpen(true);
  }, []);

  // click edge → mở edge drawer
  const onEdgeClick = useCallback(
    (_, edge) => {
      if (!isAdmin) return;
      setEditingEdgeId(edge.id);
      setEdgeOpen(true);
    },
    [isAdmin]
  );

  // tạo edge thường (khi nối node-to-node)
  const onConnect = useCallback(
    (params) => {
      const newMeta = {
        relationType: 'prerequisite',
        weight: 0.7,
        dashed: false,
        color: '#5b7fb0'
      };
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            label: newMeta.relationType,
            data: { meta: newMeta },
            style: edgeStyleFromMeta(newMeta)
          },
          eds
        )
      );
    },
    [setEdges]
  );

  // Add Node On Edge Drop (chỉ khi admin)
  const onConnectEnd = useCallback(
    (event, connectionState) => {
      if (!adminMode) return;
      if (!connectionState?.isValid) {
        const newId = nextId('c');
        const { clientX, clientY } =
          'changedTouches' in event ? event.changedTouches[0] : event;
        const position = screenToFlowPosition({ x: clientX, y: clientY });

        const newConcept = {
          id: newId,
          topicId: 't1',
          name: 'New Concept',
          description: '',
          difficultyBand: 'intro',
          isActive: true,
          version: 1
        };

        const newNode = {
          id: newId,
          type: 'default',
          position,
          data: {
            concept: newConcept,
            resources: [],
            questions: [],
            progress: { conceptId: newId, correctQuestionIds: [] }
          },
          origin: [0.5, 0.0]
        };
        setNodes((nds) => nds.concat(newNode));

        const newMeta = {
          relationType: 'prerequisite',
          weight: 0.7,
          dashed: false,
          color: '#5b7fb0'
        };
        setEdges((eds) =>
          eds.concat({
            id: `e-${connectionState.fromNode.id}-${newId}`,
            source: connectionState.fromNode.id,
            target: newId,
            type: 'smoothstep',
            label: newMeta.relationType,
            data: { meta: newMeta },
            style: edgeStyleFromMeta(newMeta)
          })
        );

        setEditingNodeId(newId);
        setNodeOpen(true);
      }
    },
    [adminMode, screenToFlowPosition, setNodes, setEdges]
  );

  /* ---------- Node handlers ---------- */
  const updateConcept = (patch) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === editingNodeId
          ? {
              ...n,
              data: { ...n.data, concept: { ...n.data.concept, ...patch } }
            }
          : n
      )
    );
  };
  const addResource = (payload) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === editingNodeId
          ? {
              ...n,
              data: {
                ...n.data,
                resources: n.data.resources.concat({
                  id: nextId('r'),
                  conceptId: n.id,
                  ...payload
                })
              }
            }
          : n
      )
    );
  };
  const removeResource = (rid) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === editingNodeId
          ? {
              ...n,
              data: {
                ...n.data,
                resources: n.data.resources.filter((r) => r.id !== rid)
              }
            }
          : n
      )
    );
  };
  const addQuestion = (payload) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === editingNodeId
          ? {
              ...n,
              data: {
                ...n.data,
                questions: n.data.questions.concat({
                  id: nextId('q'),
                  conceptId: n.id,
                  ...payload
                })
              }
            }
          : n
      )
    );
  };
  const removeQuestion = (qid) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === editingNodeId
          ? {
              ...n,
              data: {
                ...n.data,
                questions: n.data.questions.filter((q) => q.id !== qid),
                progress: {
                  conceptId: n.id,
                  correctQuestionIds: (
                    n.data.progress?.correctQuestionIds || []
                  ).filter((x) => x !== qid)
                }
              }
            }
          : n
      )
    );
  };
  const toggleCorrect = (qid, correct) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id !== editingNodeId) return n;
        const set = new Set(n.data.progress?.correctQuestionIds || []);
        correct ? set.add(qid) : set.delete(qid);
        return {
          ...n,
          data: {
            ...n.data,
            progress: { conceptId: n.id, correctQuestionIds: [...set] }
          }
        };
      })
    );
  };

  /* ---------- Edge handlers ---------- */
  const updateEdge = (patch) => {
    setEdges((eds) =>
      eds.map((e) => {
        if (e.id !== editingEdgeId) return e;
        const next = {
          ...e,
          ...('label' in patch ? { label: patch.label } : {})
        };
        if (patch.data?.meta) {
          const meta = { ...(e.data?.meta || {}), ...patch.data.meta };
          next.data = { ...(e.data || {}), meta };
          next.style = { ...(e.style || {}), ...edgeStyleFromMeta(meta) };
          if (patch.data.meta.relationType)
            next.label = patch.data.meta.relationType;
        }
        return next;
      })
    );
  };
  const deleteEdge = () =>
    setEdges((eds) => eds.filter((e) => e.id !== editingEdgeId));

  /* ---------- Save / Load ---------- */
  const handleSave = () => {
    const exportData = serializeGraph(nodes, edges);
    console.log('GRAPH_EXPORT', exportData);
    try {
      navigator.clipboard?.writeText(JSON.stringify(exportData, null, 2));
      console.log('→ JSON copied to clipboard');
    } catch {}
  };

  // Demo load lại từ dữ liệu đang có (bạn thay bằng fetch từ DB)
  const handleLoadDemo = () => {
    const exportData = serializeGraph(nodes, edges);
    const { nodes: n2, edges: e2 } = deserializeGraph(exportData);
    setNodes(n2);
    setEdges(e2);
  };

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {/* Toolbar Admin */}
      {isAdmin && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 30,
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 10,
            padding: 8,
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,.08)'
          }}
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="checkbox"
              checked={adminMode}
              onChange={(e) => setAdminMode(e.target.checked)}
            />
            Admin mode (Add-on-edge-drop & edit edges)
          </label>
          <button
            onClick={handleSave}
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              border: '1px solid #111'
            }}
          >
            Save
          </button>
          <button
            onClick={handleLoadDemo}
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              border: '1px solid #aaa'
            }}
          >
            Reload demo
          </button>
        </div>
      )}

      <ReactFlow
        nodes={displayNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        nodeOrigin={nodeOrigin}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background />
      </ReactFlow>

      {/* Drawers */}
      <NodeDrawer
        open={nodeOpen}
        onClose={() => setNodeOpen(false)}
        nodeData={currentNode?.data}
        onUpdateConcept={updateConcept}
        onAddResource={addResource}
        onRemoveResource={removeResource}
        onAddQuestion={addQuestion}
        onRemoveQuestion={removeQuestion}
        onToggleCorrect={toggleCorrect}
      />
      <EdgeDrawer
        open={edgeOpen}
        onClose={() => setEdgeOpen(false)}
        edge={currentEdge}
        onUpdate={updateEdge}
        onDelete={deleteEdge}
      />
    </div>
  );
}

export default function KnowledgeGraphPage() {
  return (
    <ReactFlowProvider>
      <KnowledgeGraphInner />
    </ReactFlowProvider>
  );
}
