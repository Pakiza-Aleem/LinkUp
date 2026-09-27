import './Skeleton.css';
// Placeholder shapes shown while content is loading.
export function PostSkeleton() {
  return (
    <div className="glass post-card skeleton-card" aria-hidden="true">
      <div className="skeleton-row">
        <span className="skeleton skeleton--circle" />
        <div className="skeleton-col">
          <span className="skeleton skeleton--line" style={{ width: '40%' }} />
          <span className="skeleton skeleton--line" style={{ width: '25%' }} />
        </div>
      </div>
      <span className="skeleton skeleton--line" style={{ width: '90%' }} />
      <span className="skeleton skeleton--line" style={{ width: '70%' }} />
    </div>
  );
}

export function UserSkeleton() {
  return (
    <div className="user-card skeleton-row" aria-hidden="true">
      <span className="skeleton skeleton--circle" />
      <div className="skeleton-col">
        <span className="skeleton skeleton--line" style={{ width: '50%' }} />
        <span className="skeleton skeleton--line" style={{ width: '30%' }} />
      </div>
    </div>
  );
}
