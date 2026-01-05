import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'
import './index.css'

function ExportDataShipment() {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState('')
  const [exportFormat, setExportFormat] = useState('full')
  const [selectedColumns, setSelectedColumns] = useState({
    no: true,
    tug_barge_name: true,
    brand: true,
    tonnage: true,
    buyer: true,
    pod: true,
    jetty: true,
    status: true,
    est_commenced_loading: true,
    est_completed_loading: true,
    rata_rata_muat: true,
    si_spk: true
  })
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterJetty, setFilterJetty] = useState('all')

  const columnLabels = {
    no: 'No',
    tug_barge_name: 'Tug / Barge',
    brand: 'Brand',
    tonnage: 'Tonnage (ton)',
    buyer: 'Buyer',
    pod: 'POD',
    jetty: 'Jetty',
    status: 'Status',
    est_commenced_loading: 'Est Commenced',
    est_completed_loading: 'Est Completed',
    rata_rata_muat: 'Rata-rata Muat',
    si_spk: 'SI/SPK'
  }

  const allColumns = Object.keys(columnLabels)

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
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function getFilteredData() {
    let filtered = [...data]

    if (filterStatus !== 'all') {
      filtered = filtered.filter(d => d.status === filterStatus)
    }

    if (filterJetty !== 'all') {
      filtered = filtered.filter(d => d.jetty === filterJetty)
    }

    return filtered
  }

  function toggleColumn(col) {
    setSelectedColumns(prev => ({
      ...prev,
      [col]: !prev[col]
    }))
  }

  function selectAllColumns() {
    const newState = {}
    allColumns.forEach(col => {
      newState[col] = true
    })
    setSelectedColumns(newState)
  }

  function deselectAllColumns() {
    const newState = {}
    allColumns.forEach(col => {
      newState[col] = false
    })
    setSelectedColumns(newState)
  }

  function handleExport() {
    try {
      const filteredData = getFilteredData()

      if (filteredData.length === 0) {
        setError('Tidak ada data untuk di-export')
        return
      }

      // Prepare export data
      const selectedCols = allColumns.filter(col => selectedColumns[col])
      const exportData = filteredData.map((row, idx) => {
        const obj = { No: idx + 1 }
        selectedCols.forEach(col => {
          if (col !== 'no') {
            obj[columnLabels[col]] = row[col] || '-'
          }
        })
        return obj
      })

      // Create workbook
      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Shipping Data')

      // Style the header (if supported by xlsx)
      ws['!cols'] = selectedCols.map(() => ({ wch: 15 }))

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `Shipping_Data_${timestamp}.xlsx`

      // Export
      XLSX.writeFile(wb, filename)
      setSuccess(`✓ Data berhasil di-export sebagai ${filename}`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('✗ Gagal mengexport data: ' + err.message)
    }
  }

  const filteredData = getFilteredData()
  const statusOptions = [...new Set(data.map(d => d.status))]
  const jettyOptions = [...new Set(data.map(d => d.jetty))]
  const selectedCount = Object.values(selectedColumns).filter(v => v).length

  return (
    <div className="export-container">
      <div className="export-card">
        <div className="export-header">
          <h1>📥 Export Data Shipment</h1>
          <p>Export data pengiriman batubara ke format Excel</p>
        </div>

        {loading && (
          <div className="loading-state">
            <p>⏳ Memuat data...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        {!loading && !error && data.length > 0 && (
          <div className="export-content">
            {/* Filter Section */}
            <div className="filter-section">
              <h2>🔍 Filter Data</h2>
              <div className="filter-grid">
                <div className="filter-group">
                  <label>Status</label>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="all">Semua Status ({data.length})</option>
                    {statusOptions.map(status => {
                      const count = data.filter(d => d.status === status).length
                      return (
                        <option key={status} value={status}>
                          {status} ({count})
                        </option>
                      )
                    })}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Jetty</label>
                  <select value={filterJetty} onChange={(e) => setFilterJetty(e.target.value)}>
                    <option value="all">Semua Jetty ({data.length})</option>
                    {jettyOptions.map(jetty => {
                      const count = data.filter(d => d.jetty === jetty).length
                      return (
                        <option key={jetty} value={jetty}>
                          {jetty} ({count})
                        </option>
                      )
                    })}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Jumlah Data</label>
                  <div className="data-count">
                    <p className="count-value">{filteredData.length}</p>
                    <p className="count-label">dari {data.length} total</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Column Selection Section */}
            <div className="columns-section">
              <div className="columns-header">
                <h2>📋 Pilih Kolom Export</h2>
                <div className="columns-actions">
                  <button className="btn-link" onClick={selectAllColumns}>
                    Pilih Semua
                  </button>
                  <span className="divider">|</span>
                  <button className="btn-link" onClick={deselectAllColumns}>
                    Hapus Semua
                  </button>
                </div>
              </div>

              <div className="columns-grid">
                {allColumns.map(col => (
                  <div key={col} className="column-checkbox">
                    <input
                      type="checkbox"
                      id={`col-${col}`}
                      checked={selectedColumns[col]}
                      onChange={() => toggleColumn(col)}
                    />
                    <label htmlFor={`col-${col}`}>
                      {columnLabels[col]}
                    </label>
                  </div>
                ))}
              </div>

              <p className="columns-count">
                {selectedCount} dari {allColumns.length} kolom dipilih
              </p>
            </div>

            {/* Format Section */}
            <div className="format-section">
              <h2>📊 Format Export</h2>
              <div className="format-options">
                <div className="format-option">
                  <input
                    type="radio"
                    id="format-full"
                    name="format"
                    value="full"
                    checked={exportFormat === 'full'}
                    onChange={(e) => setExportFormat(e.target.value)}
                  />
                  <label htmlFor="format-full">
                    <span className="format-title">Excel (.xlsx)</span>
                    <span className="format-desc">Format Microsoft Excel dengan styling</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="preview-section">
              <h2>👁️ Preview Data</h2>
              <div className="preview-table">
                <table>
                  <thead>
                    <tr>
                      <th>No</th>
                      {allColumns.map(col => (
                        selectedColumns[col] && col !== 'no' && (
                          <th key={col}>{columnLabels[col]}</th>
                        )
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.slice(0, 5).map((row, idx) => (
                      <tr key={row.id}>
                        <td>{idx + 1}</td>
                        {allColumns.map(col => (
                          selectedColumns[col] && col !== 'no' && (
                            <td key={col}>{row[col] || '-'}</td>
                          )
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredData.length > 5 && (
                  <p className="preview-note">... dan {filteredData.length - 5} baris lainnya</p>
                )}
              </div>
            </div>

            {/* Export Button */}
            <div className="export-actions">
              <button
                className="btn btn-export"
                onClick={handleExport}
                disabled={selectedCount === 0 || filteredData.length === 0}
              >
                📥 Export ke Excel ({filteredData.length} baris)
              </button>
            </div>
          </div>
        )}

        {!loading && data.length === 0 && (
          <div className="empty-state">
            <p>📭 Belum ada data untuk di-export</p>
            <p>Tambahkan data shipment terlebih dahulu</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExportDataShipment
