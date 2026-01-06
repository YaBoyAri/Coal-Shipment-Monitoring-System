import { useNavigate } from 'react-router-dom'
import './index.css'

function Header() {
  const navigate = useNavigate()

  function handleLogout() {
    try {
      localStorage.removeItem('ptba_sid')
      localStorage.removeItem('ptba_user')
    } catch {
      // ignore
    }
    navigate('/login', { replace: true })
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <img src="/logo/Bukit Asam.svg" alt="Bukit Asam Logo" />
        </div>
        <h2 className="header-title">Coal Shipment Monitoring System</h2>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  )
}

export default Header
