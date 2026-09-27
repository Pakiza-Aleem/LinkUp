// A loose network of connected dots, echoing the logo's "link" motif.
// Used as the visual anchor on the auth screen instead of a generic bullet list.
export default function NetworkGraphic({ className = '' }) {
  const nodes = [
    [40, 60], [150, 30], [255, 95], [70, 150], [190, 175], [300, 40], [320, 160], [110, 95],
  ];
  const edges = [[0, 1], [1, 2], [0, 3], [3, 4], [1, 7], [7, 3], [2, 5], [2, 6], [4, 6], [7, 4]];

  return (
    <svg className={`network-graphic ${className}`} viewBox="0 0 340 210" fill="none" aria-hidden="true">
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]}
          stroke="url(#network-line)" strokeWidth="1.4"
          className="network-graphic__edge"
        />
      ))}
      {nodes.map(([x, y], i) => (
        <circle
          key={i} cx={x} cy={y} r={i % 3 === 0 ? 6 : 4}
          fill={i % 3 === 0 ? 'var(--mint)' : 'var(--emerald)'}
          className="network-graphic__node"
        />
      ))}
      <defs>
        <linearGradient id="network-line" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--emerald)" stopOpacity="0.65" />
          <stop offset="1" stopColor="var(--mint)" stopOpacity="0.15" />
        </linearGradient>
      </defs>
    </svg>
  );
}
