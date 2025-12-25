import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

type NodeItem = {
  id: string;
  title: string;
  x: number;
  y: number;
  width?: number;
};

function MindNode({ item }: { item: NodeItem }) {
  return (
    <div
      className="absolute"
      style={{ left: item.x, top: item.y, width: item.width ?? 180 }}
    >
      <Card className="select-none px-3 py-2 text-sm shadow-sm">
        {item.title}
      </Card>
    </div>
  );
}

function Connector({ from, to }: { from: NodeItem; to: NodeItem }) {
  const path = useMemo(() => {
    const x1 = from.x + (from.width ?? 180) / 2;
    const y1 = from.y + 24;
    const x2 = to.x + (to.width ?? 180) / 2;
    const y2 = to.y + 24;
    const dx = (x2 - x1) * 0.4;
    // cubic Bezier smooth curve
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  }, [from, to]);

  return <path d={path} stroke="#60a5fa" strokeWidth={2} fill="none" />;
}

export default function MindMap() {
  const [scale, setScale] = useState(1);

  const nodes: NodeItem[] = [
    { id: 'backend', title: 'Backend', x: 520, y: 40, width: 160 },
    { id: 'internet', title: 'Internet', x: 460, y: 110 },
    { id: 'frontend-basics', title: 'Frontend Basics', x: 460, y: 170 },
    { id: 'html', title: 'HTML', x: 360, y: 230, width: 120 },
    { id: 'css', title: 'CSS', x: 520, y: 230, width: 120 },
    { id: 'js', title: 'JavaScript', x: 440, y: 290, width: 180 },

    { id: 'vcs', title: 'Version Control Systems', x: 420, y: 360 },
    { id: 'hosting', title: 'Repo Hosting Services', x: 420, y: 420 },
    { id: 'git', title: 'Git', x: 680, y: 360, width: 100 },
    { id: 'github', title: 'GitHub', x: 640, y: 420, width: 120 },
    { id: 'gitlab', title: 'GitLab', x: 780, y: 420, width: 120 },

    { id: 'db', title: 'Relational Databases', x: 360, y: 520 },
    { id: 'mysql', title: 'MySQL', x: 140, y: 520, width: 120 },
    { id: 'postgres', title: 'PostgreSQL', x: 140, y: 560, width: 120 },
    { id: 'sqlite', title: 'SQLite', x: 140, y: 600, width: 120 },
    { id: 'oracle', title: 'Oracle', x: 140, y: 640, width: 120 },

    { id: 'apis', title: 'Learn about APIs', x: 420, y: 620 },
    { id: 'api-styles', title: 'API Styles', x: 720, y: 520 },
    { id: 'rest', title: 'REST', x: 720, y: 560, width: 120 },
    { id: 'jsonapi', title: 'JSON APIs', x: 860, y: 560, width: 140 },
    { id: 'soap', title: 'SOAP', x: 720, y: 600, width: 120 },
    { id: 'grpc', title: 'gRPC', x: 860, y: 600, width: 120 },
    { id: 'graphql', title: 'GraphQL', x: 720, y: 640, width: 280 }
  ];

  const nodeById = useMemo(() => {
    const map: Record<string, NodeItem> = {};
    nodes.forEach((n) => (map[n.id] = n));
    return map;
  }, [nodes]);

  const links: [string, string][] = [
    ['backend', 'internet'],
    ['backend', 'frontend-basics'],
    ['frontend-basics', 'html'],
    ['frontend-basics', 'css'],
    ['frontend-basics', 'js'],
    ['backend', 'vcs'],
    ['backend', 'hosting'],
    ['vcs', 'git'],
    ['hosting', 'github'],
    ['hosting', 'gitlab'],
    ['backend', 'db'],
    ['db', 'mysql'],
    ['db', 'postgres'],
    ['db', 'sqlite'],
    ['db', 'oracle'],
    ['backend', 'apis'],
    ['apis', 'api-styles'],
    ['api-styles', 'rest'],
    ['api-styles', 'jsonapi'],
    ['api-styles', 'soap'],
    ['api-styles', 'grpc'],
    ['api-styles', 'graphql']
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-2 py-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() =>
            setScale((s) => Math.max(0.6, parseFloat((s - 0.1).toFixed(2))))
          }
        >
          -
        </Button>
        <div className="text-xs tabular-nums">{Math.round(scale * 100)}%</div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() =>
            setScale((s) => Math.min(2, parseFloat((s + 0.1).toFixed(2))))
          }
        >
          +
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setScale(1)}>
          Reset
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-160px)] w-full border-t">
        <div className="relative min-h-[900px] min-w-[1100px]">
          <svg
            className="pointer-events-none absolute left-0 top-0 h-full w-full"
            viewBox={`0 0 1200 900`}
            style={{ transform: `scale(${scale})`, transformOrigin: '0 0' }}
          >
            {links.map(([a, b]) => (
              <Connector
                key={`${a}-${b}`}
                from={nodeById[a]}
                to={nodeById[b]}
              />
            ))}
          </svg>

          <div
            className="absolute left-0 top-0"
            style={{ transform: `scale(${scale})`, transformOrigin: '0 0' }}
          >
            {nodes.map((n) => (
              <MindNode key={n.id} item={n} />
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
