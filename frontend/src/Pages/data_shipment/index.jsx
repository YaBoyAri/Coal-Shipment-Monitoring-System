import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './index.css'

function DataShipment() {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const highlight = (text, term) => {
    const str = String(text ?? '')
    const t = String(term ?? '').trim()
    if (!t) return str
    try {
      const re = new RegExp(`(${escapeRegExp(t)})`, 'ig')
      const parts = str.split(re)
      return parts.map((part, i) =>
        part.toLowerCase() === t.toLowerCase() ? (
          <span key={i} className="hl">
            {part}
          </span>
        ) : (
          part
        )
      )
    } catch (e) {
      return str
    }
  }

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
          <div className="search-bar">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search shipments..."
            />
          </div>
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
              {(() => {
                const term = searchTerm.trim().toLowerCase()
                if (!term) {
                  return data.map((row) => (
                    <tr key={row.id}>
                      <td>{highlight(row.no, term)}</td>
                      <td>{highlight(row.tug_barge_name, term)}</td>
                      <td>{highlight(row.brand, term)}</td>
                      <td>{highlight(row.tonnage, term)}</td>
                      <td>{highlight(row.buyer, term)}</td>
                      <td>{highlight(row.pod, term)}</td>
                      <td>{highlight(row.jetty, term)}</td>
                      <td>{highlight(row.status, term)}</td>
                      <td>{highlight(row.est_commenced_loading, term)}</td>
                      <td>{highlight(row.est_completed_loading, term)}</td>
                      <td>{highlight(row.rata_rata_muat, term)}</td>
                      <td>{highlight(row.si_spk, term)}</td>
                    </tr>
                  ))
                }

                // define column accessors in order to determine match priority
                const accessors = [
                  (r) => String(r.no ?? ''),
                  (r) => String(r.tug_barge_name ?? ''),
                  (r) => String(r.brand ?? ''),
                  (r) => String(r.tonnage ?? ''),
                  (r) => String(r.buyer ?? ''),
                  (r) => String(r.pod ?? ''),
                  (r) => String(r.jetty ?? ''),
                  (r) => String(r.status ?? ''),
                  (r) => String(r.est_commenced_loading ?? ''),
                  (r) => String(r.est_completed_loading ?? ''),
                  (r) => String(r.rata_rata_muat ?? ''),
                  (r) => String(r.si_spk ?? '')
                ]

                const matches = []

                data.forEach((row, idx) => {
                  let firstMatchCol = -1
                  for (let i = 0; i < accessors.length; i++) {
                    const val = accessors[i](row).toLowerCase()
                    if (val.includes(term)) {
                      firstMatchCol = i
                      break
                    }
                  }
                  if (firstMatchCol >= 0) matches.push({ row, firstMatchCol, idx })
                })

                // sort matches by firstMatchCol then original index to keep stable
                matches.sort((a, b) => a.firstMatchCol - b.firstMatchCol || a.idx - b.idx)

                const ordered = matches.map((m) => m.row)

                if (ordered.length === 0) {
                  return (
                    <tr>
                      <td colSpan={12} style={{ textAlign: 'center', padding: '18px' }}>
                        No results found
                      </td>
                    </tr>
                  )
                }

                return ordered.map((row) => (
                  <tr key={row.id}>
                    <td>{highlight(row.no, term)}</td>
                    <td>{highlight(row.tug_barge_name, term)}</td>
                    <td>{highlight(row.brand, term)}</td>
                    <td>{highlight(row.tonnage, term)}</td>
                    <td>{highlight(row.buyer, term)}</td>
                    <td>{highlight(row.pod, term)}</td>
                    <td>{highlight(row.jetty, term)}</td>
                    <td>{highlight(row.status, term)}</td>
                    <td>{highlight(row.est_commenced_loading, term)}</td>
                    <td>{highlight(row.est_completed_loading, term)}</td>
                    <td>{highlight(row.rata_rata_muat, term)}</td>
                    <td>{highlight(row.si_spk, term)}</td>
                  </tr>
                ))
              })()}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default DataShipment
