import { NavLink } from 'react-router-dom'
import './index.css'

function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/data-shipment" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Data Shipment
            </NavLink>
          </li>
          <li>
            <NavLink to="/input-data-shipment" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Input Data Shipment
            </NavLink>
          </li>
          <li>
            <NavLink to="/export-data-shipment" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Export Data Shipment
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
