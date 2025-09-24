import { Link } from 'react-router-dom';
import { Github, Linkedin, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__bar" />
      <div className="footer__panel">
        <div className="footer__inner">
          <div className="footer__grid">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div className="brand__logo" />
                <span className="brand__name">NewsNow</span>
              </div>
              <p className="muted">Your personalized hub for the latest news.</p>
            </div>
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Company</h4>
              <ul className="stack-sm" style={{ fontSize: 14 }}>
                <li><Link to="#" className="nav-link">About</Link></li>
                <li><Link to="#" className="nav-link">Privacy</Link></li>
                <li><Link to="#" className="nav-link">Terms</Link></li>
                <li><Link to="#" className="nav-link">Contact</Link></li>
              </ul>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Follow</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <a href="#" className="icon-btn" aria-label="Twitter"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="icon-btn" aria-label="LinkedIn"><Linkedin className="w-5 h-5" /></a>
                <a href="#" className="icon-btn" aria-label="GitHub"><Github className="w-5 h-5" /></a>
              </div>
            </div>
          </div>
          <div className="muted" style={{ marginTop: 16, fontSize: 12 }}>© {new Date().getFullYear()} NewsNow. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}


