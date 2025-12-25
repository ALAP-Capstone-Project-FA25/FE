import React from 'react';
import { Handle, Position } from '@xyflow/react';

const bandColor = { intro: '#84cc16', core: '#f59e0b', advance: '#ef4444' };

function passStat(data) {
  const total = data.questions.length;
  const correct = data.progress?.correctQuestionIds.length ?? 0;
  const ratio = total ? correct / total : 0;
  return { total, correct, ratio, passed: total > 0 && ratio >= 0.7 };
}

export default function ConceptNode({ data, selected }) {
  const stat = passStat(data);
  const pillBg = stat.passed ? '#16a34a' : '#94a3b8';

  return (
    <div
      style={{
        minWidth: 220,
        borderRadius: 12,
        border: `2px solid ${selected ? '#111827' : '#e5e7eb'}`,
        background: '#fffbea',
        boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
        padding: 12,
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ fontWeight: 700 }}>{data.concept.name}</div>
        <span
          title={stat.passed ? 'Passed' : 'Todo'}
          style={{
            padding: '2px 8px',
            fontSize: 12,
            borderRadius: 999,
            color: 'white',
            background: pillBg,
            whiteSpace: 'nowrap'
          }}
        >
          {stat.correct}/{stat.total}
        </span>
      </div>

      <div
        style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: bandColor[data.concept.difficultyBand] || '#9ca3af',
            display: 'inline-block'
          }}
          title={data.concept.difficultyBand}
        />
        <small style={{ color: '#6b7280' }}>
          {data.resources.length} res • {data.questions.length} q
        </small>
      </div>

      {data.concept.description && (
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            color: '#4b5563',
            lineHeight: 1.3,
            maxHeight: 38,
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
          title={data.concept.description}
        >
          {data.concept.description}
        </div>
      )}

      <button
        type="button"
        onClick={data.onOpenDrawer}
        style={{
          marginTop: 10,
          width: '100%',
          borderRadius: 8,
          border: '1px solid #d1d5db',
          background: '#fff',
          padding: '6px 8px',
          cursor: 'pointer'
        }}
      >
        Edit / Learn
      </button>
    </div>
  );
}
