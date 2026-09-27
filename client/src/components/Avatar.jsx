import { useEffect, useState } from 'react';
import './Avatar.css';

// Shows the profile picture. If there is none (or the link is broken)
// it shows the first letter of the name on an emerald gradient.
export default function Avatar({ user, size = 44, className = '' }) {
  const [failed, setFailed] = useState(false);
  const name = user?.name || user?.username || 'User';

  // Reset the "failed" flag when the image URL changes.
  useEffect(() => setFailed(false), [user?.profileImage]);

  const style = { width: size, height: size, fontSize: size * 0.42 };

  if (user?.profileImage && !failed) {
    return (
      <img
        className={`avatar ${className}`}
        style={style}
        src={user.profileImage}
        alt={`${name}'s profile picture`}
        onError={() => setFailed(true)}
      />
    );
  }

  // Pick a slightly different green for each username.
  const seed = [...(user?.username || name)].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const hue = 140 + (seed % 40);
  return (
    <span
      className={`avatar avatar--initial ${className}`}
      style={{ ...style, background: `linear-gradient(135deg, hsl(${hue} 60% 38%), hsl(${hue + 15} 65% 20%))` }}
      role="img"
      aria-label={`${name}'s avatar`}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
