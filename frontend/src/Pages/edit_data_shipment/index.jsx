import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './index.css'

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
  const [showConfirm, setShowConfirm] = useState(false)

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
        localStorage.clear()
        navigate('/login', { replace: true })
        return
      }

      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      const json = await res.json()

      const toLocalDateTime = (val) => {
        if (!val) return ''
        let d = new Date(val)
        if (isNaN(d)) d = new Date(String(val).replace(' ', 'T'))
        if (isNaN(d)) return ''
        return d.toISOString().slice(0, 16)
      }

      const toTimeValue = (v) => {
        if (!v) return ''
        const m = String(v).match(/(\d{1,2}):(\d{2})/)
        return m ? `${m[1].padStart(2, '0')}:${m[2]}` : ''
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
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const sid = localStorage.getItem('ptba_sid')
      const payload = {
        ...formData,
        tonnage: formData.tonnage === '' ? null : Number(formData.tonnage),
        rata_rata_muat: formData.rata_rata_muat || null
      }

      const res = await fetch(`http://localhost:3000/api/shipping/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sid}`
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Gagal memperbarui data')

      setSuccess('✓ Data berhasil diperbarui!')
      setTimeout(() => navigate('/data-shipment', { replace: true }), 1200)
    } catch (err) {
      setError('✗ ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="edit-data-container">
        <div className="edit-data-card">
          <p>⏳ Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="edit-data-container">
      <div className="edit-data-card">
        <div className="edit-data-header">
          <h1>✏️ Edit Data Shipment</h1>
          <p>Ubah informasi shipment</p>
        </div>

        <form className="edit-form" onSubmit={handleSubmit}>
          {/* form fields – sama seperti sebelumnya */}
          {/* Rata-rata muat pakai TIME */}
          <input type="time" name="rata_rata_muat" value={formData.rata_rata_muat} onChange={handleChange} />

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="form-actions">
            <button type="button" onClick={() => setShowConfirm(true)}>← Kembali</button>
            <button type="submit" disabled={submitting}>
              {submitting ? '⏳ Menyimpan...' : '💾 Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>Perubahan belum disimpan. Kembali?</p>
            <button onClick={() => setShowConfirm(false)}>Batal</button>
            <button onClick={() => navigate('/data-shipment')}>Kembali</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default EditDataShipment