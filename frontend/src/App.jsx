import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './App.css'
import DataShipment from './Pages/data_shipment'
import Dashboard from './Pages/dashboard'
import InputDataShipment from './Pages/input_data_shipment'
import EditDataShipment from './Pages/edit_data_shipment'
import ExportDataShipment from './Pages/export_data_shipment'
import Login from './Pages/login'
import Header from './Components/header'
import Sidebar from './Components/sidebar'
import Footer from './Components/footer'

function isAuthed() {
  try {
    return Boolean(localStorage.getItem('ptba_sid'))
  } catch {
    return false
  }
}

function RequireAuth({ children }) {
  if (!isAuthed()) return <Navigate to="/login" replace />
  return children
}

function AppShell() {
  const location = useLocation()
  const authed = isAuthed()
  const isLogin = location.pathname === '/login'
  const showLayout = authed && !isLogin

  return (
    <div className="App">
      {showLayout && <Header />}
      <div className="app-container">
        {showLayout && <Sidebar />}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to={authed ? '/data-shipment' : '/login'} replace />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/data-shipment"
              element={
                <RequireAuth>
                  <DataShipment />
                </RequireAuth>
              }
            />
            <Route
              path="/input-data-shipment"
              element={
                <RequireAuth>
                  <InputDataShipment />
                </RequireAuth>
              }
            />
            <Route
              path="/edit-data-shipment/:id"
              element={
                <RequireAuth>
                  <EditDataShipment />
                </RequireAuth>
              }
            />
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/export-data-shipment"
              element={
                <RequireAuth>
                  <ExportDataShipment />
                </RequireAuth>
              }
            />
            <Route path="*" element={<Navigate to={authed ? '/data-shipment' : '/login'} replace />} />
          </Routes>
        </main>
      </div>
      {showLayout && <Footer />}
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  )
}

export default App
