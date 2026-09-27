import './Logo.css';
// Original Link Up logo: an "L" and a "U" linked together.
// The L slides under the U's left stem and ends inside it, like two links of a chain.
// The two round dots are people (nodes) in the network.
export default function Logo({ size = 40, animated = false, showText = false, className = '' }) {
  return (
    <span className={`logo ${className}`}>
      <svg
        className={`logo__mark ${animated ? 'logo__mark--animated' : ''}`}
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        role="img"
        aria-label="Link Up logo"
      >
        <defs>
          <linearGradient id="lu-a" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#43E6A5" />
            <stop offset="1" stopColor="#0B6B4F" />
          </linearGradient>
          <linearGradient id="lu-b" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8FFFC7" />
            <stop offset="1" stopColor="#43E6A5" />
          </linearGradient>
        </defs>
        {/* L */}
        <path className="logo__path logo__path--l" pathLength="1" d="M11 8V26a6 6 0 0 0 6 6H34" stroke="url(#lu-a)" strokeWidth="5" />
        {/* dark outline under the U creates the "passes under" gap */}
        <path className="logo__path logo__path--u" pathLength="1" d="M23 14V34a8 8 0 0 0 16 0V14" stroke="#06110D" strokeWidth="10" />
        {/* U */}
        <path className="logo__path logo__path--u" pathLength="1" d="M23 14V34a8 8 0 0 0 16 0V14" stroke="url(#lu-b)" strokeWidth="5" />
        <circle className="logo__dot" cx="11" cy="8" r="3.400" fill="#8FFFC7" />
        <circle className="logo__dot" cx="39" cy="14" r="3.400" fill="#43E6A5" />
      </svg>
      {showText && <span className="logo__text">LINK UP</span>}
    </span>
  );
}
