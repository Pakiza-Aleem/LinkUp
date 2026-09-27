import Logo from '../components/Logo';
import './Splash.css';

// Start-up screen. "leaving" fades it out when the app is ready.
export default function Splash({ leaving }) {
  return (
    <div className={`splash ${leaving ? 'splash--leaving' : ''}`} role="status" aria-label="Link Up is loading">
      <div className="splash__glow" />
      <div className="splash__card glass">
        <Logo size={92} animated />
        <h1 className="splash__title">LINK UP</h1>
        <p className="splash__tagline">Connect. Share. Belong.</p>
        <div className="splash__bar"><span /></div>
      </div>
    </div>
  );
}
