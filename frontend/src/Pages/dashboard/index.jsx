import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import './index.css'

function Dashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    totalShipments: 0,
    totalTonnage: 0,
    averageTonnage: 0,
    statusBreakdown: {},
    jettyBreakdown: {},
    monthlyData: []
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const sid = localStorage.getItem('ptba_sid')
      const res = await fetch('http://localhost:3000/api/shipping', {
        headers: {
          Authorization: `Bearer ${sid}`
        }
      })

      if (res.status === 401) {
        localStorage.removeItem('ptba_sid')
        localStorage.removeItem('ptba_user')
        navigate('/login', { replace: true })
        return
      }

      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      const json = await res.json()
      setData(json)
      processData(json)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function processData(shipments) {
    if (!Array.isArray(shipments) || shipments.length === 0) {
      setStats({
        totalShipments: 0,
        totalTonnage: 0,
        averageTonnage: 0,
        statusBreakdown: {},
        jettyBreakdown: {},
        monthlyData: []
      })
      return
    }

    // Calculate basic stats
    const totalShipments = shipments.length
    const totalTonnage = shipments.reduce((sum, s) => sum + (Number(s.tonnage) || 0), 0)
    const averageTonnage = totalShipments > 0 ? (totalTonnage / totalShipments).toFixed(2) : 0

    // Status breakdown
    const statusBreakdown = {}
    shipments.forEach(s => {
      const status = s.status || 'Unknown'
      statusBreakdown[status] = (statusBreakdown[status] || 0) + 1
    })

    // Jetty breakdown
    const jettyBreakdown = {}
    shipments.forEach(s => {
      const jetty = s.jetty || 'Unknown'
      jettyBreakdown[jetty] = (jettyBreakdown[jetty] || 0) + 1
    })

    // Monthly data (based on est_commenced_loading)
    const monthlyMap = {}
    shipments.forEach(s => {
      if (s.est_commenced_loading) {
        const date = new Date(s.est_commenced_loading)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        if (!monthlyMap[monthKey]) {
          monthlyMap[monthKey] = { month: monthKey, count: 0, tonnage: 0 }
        }
        monthlyMap[monthKey].count += 1
        monthlyMap[monthKey].tonnage += Number(s.tonnage) || 0
      }
    })

    const monthlyData = Object.values(monthlyMap)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12) // Last 12 months

    setStats({
      totalShipments,
      totalTonnage: totalTonnage.toFixed(2),
      averageTonnage,
      statusBreakdown,
      jettyBreakdown,
      monthlyData
    })
  }

  // Format data for charts
  const statusChartData = Object.entries(stats.statusBreakdown).map(([name, value]) => ({
    name,
    value
  }))

  const jettyChartData = Object.entries(stats.jettyBreakdown).map(([name, value]) => ({
    name,
    value
  }))

  const COLORS = ['#013262', '#F4B342', '#1976d2', '#d32f2f', '#2e7d32', '#f57c00']

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <h1>📊 Dashboard</h1>
          <p>Analisis dan monitoring data pengiriman batubara</p>
        </div>

        {loading && (
          <div className="loading-state">
            <p>⏳ Memuat data...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            ✗ {error}
          </div>
        )}

        {!loading && !error && (
          <div className="dashboard-content">
            {/* Summary Cards */}
            <div className="summary-section">
              <h2>📈 Ringkasan Data</h2>
              <div className="summary-cards">
                <div className="summary-card">
                  <div className="card-icon">📦</div>
                  <div className="card-content">
                    <p className="card-label">Total Pengiriman</p>
                    <p className="card-value">{stats.totalShipments}</p>
                  </div>
                </div>

                <div className="summary-card">
                  <div className="card-icon">⚖️</div>
                  <div className="card-content">
                    <p className="card-label">Total Tonnage</p>
                    <p className="card-value">{stats.totalTonnage}</p>
                    <p className="card-unit">ton</p>
                  </div>
                </div>

                <div className="summary-card">
                  <div className="card-icon">📊</div>
                  <div className="card-content">
                    <p className="card-label">Rata-rata Tonnage</p>
                    <p className="card-value">{stats.averageTonnage}</p>
                    <p className="card-unit">ton/shipment</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            {stats.totalShipments > 0 && (
              <>
                {/* Monthly Trend Chart */}
                {stats.monthlyData.length > 0 && (
                  <div className="chart-section">
                    <h2>📅 Tren Pengiriman per Bulan</h2>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={stats.monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                          <XAxis
                            dataKey="month"
                            stroke="#666"
                            style={{ fontSize: '0.85rem' }}
                          />
                          <YAxis stroke="#666" style={{ fontSize: '0.85rem' }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#fff',
                              border: '2px solid #013262',
                              borderRadius: '8px'
                            }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="count"
                            stroke="#013262"
                            strokeWidth={2}
                            dot={{ fill: '#013262', r: 5 }}
                            activeDot={{ r: 7 }}
                            name="Jumlah Pengiriman"
                          />
                          <Line
                            type="monotone"
                            dataKey="tonnage"
                            stroke="#F4B342"
                            strokeWidth={2}
                            dot={{ fill: '#F4B342', r: 5 }}
                            activeDot={{ r: 7 }}
                            name="Total Tonnage"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Status & Jetty Charts */}
                <div className="charts-grid">
                  {/* Status Distribution Chart */}
                  {statusChartData.length > 0 && (
                    <div className="chart-section">
                      <h2>🔄 Distribusi Status</h2>
                      <div className="chart-container compact">
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={statusChartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, value }) => `${name}: ${value}`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {statusChartData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Jetty Distribution Chart */}
                  {jettyChartData.length > 0 && (
                    <div className="chart-section">
                      <h2>⚓ Distribusi Jetty</h2>
                      <div className="chart-container compact">
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={jettyChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="name" stroke="#666" style={{ fontSize: '0.85rem' }} />
                            <YAxis stroke="#666" style={{ fontSize: '0.85rem' }} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#fff',
                                border: '2px solid #013262',
                                borderRadius: '8px'
                              }}
                            />
                            <Bar dataKey="value" fill="#013262" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status & Jetty Stats Tables */}
                <div className="stats-section">
                  <div className="stats-table">
                    <h2>📋 Detail Status</h2>
                    <table>
                      <thead>
                        <tr>
                          <th>Status</th>
                          <th>Jumlah</th>
                          <th>Persentase</th>
                        </tr>
                      </thead>
                      <tbody>
                        {statusChartData.map((item, idx) => (
                          <tr key={idx}>
                            <td>
                              <span
                                className="status-indicator"
                                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                              ></span>
                              {item.name}
                            </td>
                            <td>{item.value}</td>
                            <td>{((item.value / stats.totalShipments) * 100).toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="stats-table">
                    <h2>⚓ Detail Jetty</h2>
                    <table>
                      <thead>
                        <tr>
                          <th>Jetty</th>
                          <th>Jumlah</th>
                          <th>Persentase</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jettyChartData.map((item, idx) => (
                          <tr key={idx}>
                            <td>
                              <span
                                className="jetty-indicator"
                                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                              ></span>
                              {item.name}
                            </td>
                            <td>{item.value}</td>
                            <td>{((item.value / stats.totalShipments) * 100).toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {stats.totalShipments === 0 && !loading && (
              <div className="empty-state">
                <p>📭 Belum ada data untuk ditampilkan</p>
                <p>Tambahkan data shipment terlebih dahulu untuk melihat analisis dashboard</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
