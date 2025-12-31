import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './index.css'

function DataShipment() {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

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
      setSuccess('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleEdit(id) {
    // TODO: Implement edit functionality
    console.log('Edit:', id)
    alert('Fitur edit akan segera hadir!')
  }

  function handleDeleteClick(id) {
    setDeleteId(id)
    setShowConfirm(true)
  }

  async function confirmDelete() {
    setShowConfirm(false)
    setDeleting(true)

    try {
      const sid = localStorage.getItem('ptba_sid')
      const res = await fetch(`http://localhost:3000/api/shipping/${deleteId}`, {
        method: 'DELETE',
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

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.error || `${res.status} ${res.statusText}`)
      }

      setSuccess('✓ Data berhasil dihapus!')
      setDeleteId(null)
      await fetchData()
    } catch (err) {
      setError('✗ ' + err.message)
    } finally {
      setDeleting(false)
    }
  }

  function cancelDelete() {
    setShowConfirm(false)
    setDeleteId(null)
  }

  function handleAddNew() {
    navigate('/input-data-shipment')
  }

  return (
    <div className="data-shipment-container">
      <div className="data-shipment-card">
        <div className="data-shipment-header">
          <h1>Data Shipment</h1>
          <p>Kelola dan monitor data pengiriman batubara</p>
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
        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        {!loading && !error && (
          <div className="table-wrapper">
            <div className="table-controls">
              <div className="search-bar">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="🔍 Cari data shipment..."
                />
              </div>
              <button className="btn btn-add" onClick={handleAddNew}>
                ➕ Tambah Data
              </button>
            </div>

            {data.length === 0 ? (
              <div className="empty-state">
                <p>📭 Belum ada data shipment</p>
                <button className="btn btn-add" onClick={handleAddNew}>
                  ➕ Tambah Data Pertama
                </button>
              </div>
            ) : (
              <div className="table-scroll">
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
                      <th className="action-column">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const term = searchTerm.trim().toLowerCase()
                      let filtered = data

                      if (term) {
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

                        matches.sort((a, b) => a.firstMatchCol - b.firstMatchCol || a.idx - b.idx)
                        filtered = matches.map((m) => m.row)
                      }

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={13} style={{ textAlign: 'center', padding: '18px' }}>
                              Tidak ada hasil pencarian
                            </td>
                          </tr>
                        )
                      }

                      return filtered.map((row) => (
                        <tr key={row.id}>
                          <td>{highlight(row.no, searchTerm)}</td>
                          <td>{highlight(row.tug_barge_name, searchTerm)}</td>
                          <td>{highlight(row.brand, searchTerm)}</td>
                          <td>{highlight(row.tonnage, searchTerm)}</td>
                          <td>{highlight(row.buyer, searchTerm)}</td>
                          <td>{highlight(row.pod, searchTerm)}</td>
                          <td>{highlight(row.jetty, searchTerm)}</td>
                          <td>
                            <span className={`status-badge status-${row.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                              {highlight(row.status, searchTerm)}
                            </span>
                          </td>
                          <td>{highlight(row.est_commenced_loading, searchTerm)}</td>
                          <td>{highlight(row.est_completed_loading, searchTerm)}</td>
                          <td>{highlight(row.rata_rata_muat, searchTerm)}</td>
                          <td>{highlight(row.si_spk, searchTerm)}</td>
                          <td className="action-cell">
                            <button
                              className="btn-action btn-edit"
                              onClick={() => handleEdit(row.id)}
                              title="Edit data"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-action btn-delete"
                              onClick={() => handleDeleteClick(row.id)}
                              title="Hapus data"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))
                    })()}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🗑️ Hapus Data Shipment?</h3>
            </div>
            <div className="modal-body">
              <p>Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-modal-cancel"
                onClick={cancelDelete}
                disabled={deleting}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn btn-modal-confirm"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? '⏳ Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataShipment
