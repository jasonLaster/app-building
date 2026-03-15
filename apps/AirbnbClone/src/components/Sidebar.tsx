import { useState, useRef, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Menu } from 'lucide-react'
import type { RootState, AppDispatch } from '../store'
import { logout } from '../slices/authSlice'

function Sidebar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const currentUser = useSelector((state: RootState) => state.auth.currentUser)
  const dispatch = useDispatch<AppDispatch>()
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  if (location.pathname === '/login') {
    return null
  }

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/trips', label: 'My Trips' },
    ...(currentUser?.is_host
      ? [{ to: '/hosting', label: 'Hosting' }]
      : []),
    { to: '/profile', label: 'Profile' },
  ]

  return (
    <header data-testid="sidebar" className="header-bar">
      <div className="header-inner">
        <NavLink to="/" className="header-logo">
          <AirbnbLogo />
        </NavLink>

        <nav className="header-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              data-testid={`sidebar-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              className={({ isActive }) =>
                `header-nav-link ${isActive ? 'header-nav-link--active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-right" ref={menuRef}>
          {currentUser ? (
            <>
              <button
                data-testid="sidebar-toggle"
                className="header-menu-btn"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <Menu size={18} />
                <div className="header-avatar">
                  {currentUser.avatar_url ? (
                    <img src={currentUser.avatar_url} alt={currentUser.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-xs font-semibold text-text-secondary">
                      {currentUser.name?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
              </button>
              {menuOpen && (
                <div className="header-dropdown">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-semibold text-text">{currentUser.name}</p>
                    <p className="text-xs text-text-secondary">{currentUser.email}</p>
                  </div>
                  <div className="py-1">
                    {navItems.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/'}
                        className="block px-4 py-2 text-sm text-text hover:bg-bg-secondary"
                      >
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                  <div className="border-t border-border py-1">
                    <button
                      data-testid="sidebar-logout"
                      className="w-full text-left px-4 py-2 text-sm text-text hover:bg-bg-secondary cursor-pointer"
                      onClick={() => dispatch(logout())}
                    >
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <NavLink to="/login" className="header-login-btn">
              Log in
            </NavLink>
          )}
        </div>
      </div>
    </header>
  )
}

function AirbnbLogo() {
  return (
    <svg width="102" height="32" viewBox="0 0 102 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M29.24 22.68C29.24 22.04 28.84 21.56 28.2 21.56C27.56 21.56 27.12 22.08 27.12 22.68C27.12 23.32 27.56 23.8 28.2 23.8C28.88 23.8 29.24 23.28 29.24 22.68ZM28.6 19.08H27.8V24.6H28.6V19.08ZM30.76 21.04C30.76 20.48 31.2 20.12 31.8 20.12C32.12 20.12 32.4 20.24 32.56 20.44L33.12 19.96C32.84 19.6 32.36 19.4 31.76 19.4C30.76 19.4 29.96 20.04 29.96 21.04C29.96 22.04 30.76 22.68 31.76 22.68C32.36 22.68 32.84 22.48 33.12 22.12L32.56 21.64C32.4 21.84 32.12 21.96 31.8 21.96C31.2 21.96 30.76 21.6 30.76 21.04ZM25.12 24.6V19.08H24.32V24.6H25.12ZM35.16 22.68C35.16 22.04 34.76 21.56 34.12 21.56C33.48 21.56 33.04 22.08 33.04 22.68C33.04 23.32 33.48 23.8 34.12 23.8C34.8 23.8 35.16 23.28 35.16 22.68ZM36.04 24.6V21.44H35.24V21.88C34.96 21.56 34.56 21.36 34.04 21.36C33.08 21.36 32.28 22 32.28 22.92C32.28 23.84 33.08 24.48 34.04 24.48C34.56 24.48 34.96 24.28 35.24 23.96V24.6H36.04Z" fill="#FF5A5F"/>
      <path d="M16.84 15.96C16.84 13.24 14.64 11.04 11.92 11.04C9.2 11.04 7 13.24 7 15.96C7 18.68 9.2 20.88 11.92 20.88C14.64 20.88 16.84 18.68 16.84 15.96ZM11.92 6C6.4 6 2 10.4 2 15.96C2 21.48 6.4 25.88 11.92 25.88C17.44 25.88 21.84 21.48 21.84 15.96C21.84 10.4 17.44 6 11.92 6Z" fill="#FF5A5F"/>
      <text x="22" y="22" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="18" fontWeight="700" fill="#FF5A5F">airbnb</text>
    </svg>
  )
}

export default Sidebar
