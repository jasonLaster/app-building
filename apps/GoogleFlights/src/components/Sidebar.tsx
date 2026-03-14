import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import './Sidebar.css'

const navItems = [
  { path: '/', label: 'Search', icon: '✈' },
  { path: '/explore', label: 'Explore', icon: '🌍' },
  { path: '/trips', label: 'My Trips', icon: '🧳' },
]

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <nav
      className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}
      data-testid="sidebar"
    >
      <div className="sidebar__header">
        {!collapsed && <span className="sidebar__logo" data-testid="sidebar-logo">Flights</span>}
        <button
          className="sidebar__toggle"
          onClick={() => setCollapsed(!collapsed)}
          data-testid="sidebar-toggle"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '▶' : '◀'}
        </button>
      </div>
      <ul className="sidebar__nav">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
              data-testid={`sidebar-link-${item.label.toLowerCase().replace(/\s/g, '-')}`}
              title={item.label}
              end={item.path === '/'}
            >
              <span className="sidebar__icon">{item.icon}</span>
              {!collapsed && <span className="sidebar__label">{item.label}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Sidebar
