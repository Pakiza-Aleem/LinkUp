import Logo from './Logo';
import NetworkGraphic from './NetworkGraphic';
import './AuthAside.css';

// Brand panel shown next to the login / register form on large screens.
export default function AuthAside() {
  return (
    <section className="auth-aside" aria-label="About Link Up">
      <Logo size={64} />
      <h2>Connect. Share. Belong.</h2>
      <p>Follow the people you care about, share what you are up to and keep the conversation going.</p>
      <NetworkGraphic className="auth-aside__graphic" />
      <dl className="auth-aside__stats">
        <div><dt>Build</dt><dd>your own circle</dd></div>
        <div><dt>Share</dt><dd>photos &amp; thoughts</dd></div>
        <div><dt>Discover</dt><dd>new people</dd></div>
      </dl>
    </section>
  );
}
