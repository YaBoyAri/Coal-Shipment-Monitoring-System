import { Link } from 'react-router-dom'
import './index.css'

function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/data-shipment" className="nav-link">
              Data Shipment
            </Link>
          </li>
          <li>
            <Link to="/input-data-shipment" className="nav-link">
              Input Data Shipment
            </Link>
          </li>
          <li>
            <Link to="/login" className="nav-link">
              Login
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
