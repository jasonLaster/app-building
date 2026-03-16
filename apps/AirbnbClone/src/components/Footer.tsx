import { NavLink, useLocation } from 'react-router-dom'

export default function Footer() {
  const location = useLocation()

  if (location.pathname === '/login') {
    return null
  }

  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-section">
            <h4>Support</h4>
            <a href="#help">Help Center</a>
            <a href="#safety">Safety information</a>
            <a href="#cancellation">Cancellation options</a>
          </div>
          <div className="footer-section">
            <h4>Hosting</h4>
            <NavLink to="/hosting">Airbnb your home</NavLink>
            <a href="#resources">Hosting resources</a>
            <a href="#forum">Community forum</a>
          </div>
          <div className="footer-section">
            <h4>Airbnb</h4>
            <a href="#newsroom">Newsroom</a>
            <a href="#features">New features</a>
            <a href="#careers">Careers</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 Airbnb, Inc. All rights reserved.</span>
          <span>Privacy · Terms · Sitemap</span>
        </div>
      </div>
    </footer>
  )
}
