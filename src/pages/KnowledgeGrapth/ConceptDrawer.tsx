import React from 'react';

export default function ConceptDrawer({
  open,
  onClose,
  data,
  onUpdate,
  onAddResource,
  onAddQuestion,
  onMarkCorrect
}) {
  if (!data) return null;

  return (
    <>
      {/* overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.25)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity .2s ease',
          zIndex: 49
        }}
      />
      {/* drawer */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 420,
          height: '100%',
          background: '#fff',
          boxShadow: '0 0 0 1px #eee, 0 10px 30px rgba(0,0,0,.15)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform .25s ease',
          padding: 16,
          overflowY: 'auto',
          zIndex: 50
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h3 style={{ margin: 0 }}>{data.concept.name}</h3>
          <button
            onClick={onClose}
            style={{ border: 0, background: 'transparent', fontSize: 22 }}
          >
            ×
          </button>
        </div>

        <label>Title</label>
        <input
          value={data.concept.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          style={{ width: '100%', padding: 8, marginBottom: 8 }}
        />

        <label>Difficulty</label>
        <select
          value={data.concept.difficultyBand}
          onChange={(e) => onUpdate({ difficultyBand: e.target.value })}
          style={{ width: '100%', padding: 8, marginBottom: 8 }}
        >
          <option value="intro">intro</option>
          <option value="core">core</option>
          <option value="advance">advance</option>
        </select>

        <label>Description</label>
        <textarea
          value={data.concept.description ?? ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          style={{ width: '100%', padding: 8, minHeight: 80 }}
        />

        <hr />

        <h4>Resources</h4>
        <ul>
          {data.resources.map((r) => (
            <li key={r.id} style={{ marginBottom: 6 }}>
              <a href={r.url} target="_blank" rel="noreferrer">
                {r.title}
              </a>
              <small style={{ marginLeft: 6, color: '#6b7280' }}>
                ({r.resType}
                {r.difficulty ? `/${r.difficulty}` : ''})
              </small>
            </li>
          ))}
        </ul>
        <button
          onClick={() =>
            onAddResource({
              conceptId: data.concept.id,
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
        <ul>
          {data.questions.map((q) => {
            const correct = data.progress?.correctQuestionIds.includes(q.id);
            return (
              <li key={q.id} style={{ marginBottom: 8 }}>
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
                    onChange={(e) => onMarkCorrect(q.id, e.target.checked)}
                  />{' '}
                  Mark correct
                </label>
              </li>
            );
          })}
        </ul>
        <button
          onClick={() =>
            onAddQuestion({
              conceptId: data.concept.id,
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
