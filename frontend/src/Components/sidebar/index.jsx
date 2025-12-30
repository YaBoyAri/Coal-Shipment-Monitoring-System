import { NavLink } from 'react-router-dom'
import './index.css'

function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
          <ul>
            <li>
              <NavLink to="/dashboard" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/data-shipment" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                Data Shipment
              </NavLink>
            </li>
            <li>
              <NavLink to="/input-data-shipment" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                Input Data Shipment
              </NavLink>
            </li>
            <li>
              <NavLink to="/login" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                Login
              </NavLink>
            </li>
          </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
