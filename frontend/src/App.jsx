import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import DataShipment from './Pages/data_shipment'
import Dashboard from './Pages/dashboard'
import Login from './Pages/login'
import Header from './Components/header'
import Sidebar from './Components/sidebar'
import Footer from './Components/footer'

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/data-shipment" replace />} />
              <Route path="/data-shipment" element={<DataShipment />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/data-shipment" replace />} />
            </Routes>
          </main>
        </div>
        <Footer />
      </div>
    </Router>
  )
}

export default App
