import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import '../input_data_shipment/index.css'

function EditDataShipment() {
  const navigate = useNavigate()
  const { id } = useParams()

  const initialFormState = {
    tug_barge_name: '',
    brand: '',
    tonnage: '',
    buyer: '',
    pod: '',
    jetty: '',
    status: '',
    est_commenced_loading: '',
    est_completed_loading: '',
    rata_rata_muat: '',
    si_spk: ''
  }

  const [formData, setFormData] = useState(initialFormState)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const jettyOptions = ['Enim', 'Ogan']
  const statusOptions = ['Loading', 'At Dolphin', 'ETA Keramasan']

  useEffect(() => {
    fetchItem()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function fetchItem() {
    try {
      setLoading(true)
      const sid = localStorage.getItem('ptba_sid')
      const res = await fetch(`http://localhost:3000/api/shipping/${id}`, {
        headers: { Authorization: `Bearer ${sid}` }
      })

      if (res.status === 401) {
        localStorage.removeItem('ptba_sid')
        localStorage.removeItem('ptba_user')
        navigate('/login', { replace: true })
        return
      }

      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      const json = await res.json()
      // Helper to convert DB datetime to input[type=datetime-local] value
      const toLocalDateTime = (val) => {
        if (!val) return ''
        // Try to create Date from various formats
        let d = new Date(val)
        if (isNaN(d.getTime())) {
          // convert space to T for 'YYYY-MM-DD HH:MM:SS'
          const alt = String(val).replace(' ', 'T')
          d = new Date(alt)
        }
        if (isNaN(d.getTime())) return ''
        const pad = (n) => String(n).padStart(2, '0')
        const yyyy = d.getFullYear()
        const mm = pad(d.getMonth() + 1)
        const dd = pad(d.getDate())
        const hh = pad(d.getHours())
        const min = pad(d.getMinutes())
        return `${yyyy}-${mm}-${dd}T${hh}:${min}`
      }

      const toTimeValue = (v) => {
        if (v == null) return ''
        const s = String(v)
        // If contains date-time like '2025-01-01T08:30:00' or '2025-01-01 08:30:00'
        const dtMatch = s.match(/(\d{2}:\d{2})(?::\d{2})?/)
        if (dtMatch) return dtMatch[1]
        // If matches H:MM or HH:MM:SS
        const timeMatch = s.match(/(\d{1,2}):(\d{2})/) 
        if (timeMatch) return `${timeMatch[1].padStart(2,'0')}:${timeMatch[2]}`
        return ''
      }

      setFormData({
        tug_barge_name: json.tug_barge_name ?? '',
        brand: json.brand ?? '',
        tonnage: json.tonnage ?? '',
        buyer: json.buyer ?? '',
        pod: json.pod ?? '',
        jetty: json.jetty ?? '',
        status: json.status ?? '',
        est_commenced_loading: toLocalDateTime(json.est_commenced_loading),
        est_completed_loading: toLocalDateTime(json.est_completed_loading),
        rata_rata_muat: toTimeValue(json.rata_rata_muat),
        si_spk: json.si_spk ?? ''
      })
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      const sid = localStorage.getItem('ptba_sid')
      const payload = {
        ...formData,
        tonnage: formData.tonnage === '' ? null : Number(formData.tonnage),
        rata_rata_muat: formData.rata_rata_muat === '' ? null : String(formData.rata_rata_muat)
      }
      const res = await fetch(`http://localhost:3000/api/shipping/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sid}`
        },
        body: JSON.stringify(payload)
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

      setSuccess('✓ Data berhasil diperbarui!')
      setTimeout(() => navigate('/data-shipment', { replace: true }), 1200)
    } catch (err) {
      setError('✗ ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  function handleCancel() {
    navigate('/data-shipment')
  }

  if (loading) return (
    <div className="input-data-container">
      <div className="input-data-card">
        <p>⏳ Memuat data...</p>
      </div>
    </div>
  )

  return (
    <div className="input-data-container">
      <div className="input-data-card">
        <div className="input-data-header">
          <h1>Edit Data Shipment</h1>
          <p>Ubah data shipment yang dipilih</p>
        </div>

        <form className="input-form" onSubmit={handleSubmit}>
          <div className="form-row full">
            <div className="form-group">
              <label htmlFor="tug_barge_name">Tug / Barge</label>
              <input
                id="tug_barge_name"
                name="tug_barge_name"
                type="text"
                value={formData.tug_barge_name}
                onChange={handleChange}
                placeholder="Masukkan nama tug / barge"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="brand">Brand</label>
              <input id="brand" name="brand" type="text" value={formData.brand} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="tonnage">Tonnage</label>
              <input id="tonnage" name="tonnage" type="number" value={formData.tonnage} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="buyer">Buyer</label>
              <input id="buyer" name="buyer" type="text" value={formData.buyer} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="pod">POD</label>
              <input id="pod" name="pod" type="text" value={formData.pod} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="jetty">Jetty</label>
              <select id="jetty" name="jetty" value={formData.jetty} onChange={handleChange}>
                <option value="">Pilih Jetty</option>
                {jettyOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" value={formData.status} onChange={handleChange}>
                <option value="">Pilih Status</option>
                {statusOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="est_commenced_loading">Est Commenced</label>
              <input id="est_commenced_loading" name="est_commenced_loading" type="datetime-local" value={formData.est_commenced_loading} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="est_completed_loading">Est Completed</label>
              <input id="est_completed_loading" name="est_completed_loading" type="datetime-local" value={formData.est_completed_loading} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
              <div className="form-group">
                <label htmlFor="rata_rata_muat">Rata - Rata Muat</label>
                <input id="rata_rata_muat" name="rata_rata_muat" type="time" step="1" value={formData.rata_rata_muat} onChange={handleChange} />
              </div>
            <div className="form-group">
              <label htmlFor="si_spk">SI/SPK</label>
              <input id="si_spk" name="si_spk" type="text" value={formData.si_spk} onChange={handleChange} />
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={handleCancel} disabled={submitting}>← Kembali</button>
            <div className="action-spacer" />
            <button type="submit" className="btn btn-submit" disabled={submitting}>{submitting ? '⏳ Menyimpan...' : '💾 Simpan Perubahan'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditDataShipment