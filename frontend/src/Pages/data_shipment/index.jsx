import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './index.css'

function DataShipment() {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
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
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [navigate])

  return (
    <div className="data-shipment-container">
      <h1>Shipping Data</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!loading && !error && (
        <div style={{ overflowX: 'auto' }}>
          <table className="shipping-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Tug / Barge</th>
                <th>Brand</th>
                <th>Tonnage</th>
                <th>Buyer</th>
                <th>POD</th>
                <th>Jetty</th>
                <th>Status</th>
                <th>Est Commenced</th>
                <th>Est Completed</th>
                <th>Rata-rata Muat</th>
                <th>SI/SPK</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id}>
                  <td>{row.no}</td>
                  <td>{row.tug_barge_name}</td>
                  <td>{row.brand}</td>
                  <td>{row.tonnage}</td>
                  <td>{row.buyer}</td>
                  <td>{row.pod}</td>
                  <td>{row.jetty}</td>
                  <td>{row.status}</td>
                  <td>{row.est_commenced_loading}</td>
                  <td>{row.est_completed_loading}</td>
                  <td>{row.rata_rata_muat}</td>
                  <td>{row.si_spk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default DataShipment
