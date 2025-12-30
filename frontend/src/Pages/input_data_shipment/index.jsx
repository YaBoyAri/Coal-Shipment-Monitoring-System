import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './index.css'

function InputDataShipment() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
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
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const jettyOptions = ['Enim', 'Ogan']
  const statusOptions = ['Loading', 'At Dolphin', 'ETA Keramasan']

  function handleChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      const sid = localStorage.getItem('ptba_sid')
      const res = await fetch('http://localhost:3000/api/shipping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sid}`
        },
        body: JSON.stringify(formData)
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

      setSuccess('Data berhasil ditambahkan!')
      setFormData({
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
      })

      setTimeout(() => {
        navigate('/data-shipment', { replace: true })
      }, 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  function handleCancel() {
    navigate('/data-shipment', { replace: true })
  }

  return (
    <div className="input-data-container">
      <div className="input-data-card">
        <div className="input-data-header">
          <h1>Input Data Shipment</h1>
          <p>Silahkan masukkan data shipment baru</p>
        </div>

        <form className="input-form" onSubmit={handleSubmit}>
          {/* Row 1: Tug/Barge */}
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
                required
              />
            </div>
          </div>

          {/* Row 2: Brand & Tonnage */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="brand">Brand</label>
              <input
                id="brand"
                name="brand"
                type="text"
                value={formData.brand}
                onChange={handleChange}
                placeholder="Masukkan brand"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="tonnage">Tonnage</label>
              <input
                id="tonnage"
                name="tonnage"
                type="number"
                value={formData.tonnage}
                onChange={handleChange}
                placeholder="Masukkan tonnage"
                required
              />
            </div>
          </div>

          {/* Row 3: Buyer & POD */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="buyer">Buyer</label>
              <input
                id="buyer"
                name="buyer"
                type="text"
                value={formData.buyer}
                onChange={handleChange}
                placeholder="Masukkan buyer"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="pod">POD</label>
              <input
                id="pod"
                name="pod"
                type="text"
                value={formData.pod}
                onChange={handleChange}
                placeholder="Masukkan POD"
                required
              />
            </div>
          </div>

          {/* Row 4: Jetty & Status */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="jetty">Jetty</label>
              <select
                id="jetty"
                name="jetty"
                value={formData.jetty}
                onChange={handleChange}
                required
              >
                <option value="">Pilih Jetty</option>
                {jettyOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="">Pilih Status</option>
                {statusOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 5: Est Commenced & Est Completed */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="est_commenced_loading">Est Commenced</label>
              <input
                id="est_commenced_loading"
                name="est_commenced_loading"
                type="datetime-local"
                value={formData.est_commenced_loading}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="est_completed_loading">Est Completed</label>
              <input
                id="est_completed_loading"
                name="est_completed_loading"
                type="datetime-local"
                value={formData.est_completed_loading}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 6: Rata-Rata Muat & SI/SPK */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="rata_rata_muat">Rata - Rata Muat</label>
              <input
                id="rata_rata_muat"
                name="rata_rata_muat"
                type="number"
                step="0.01"
                value={formData.rata_rata_muat}
                onChange={handleChange}
                placeholder="Masukkan rata-rata"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="si_spk">SI/SPK</label>
              <input
                id="si_spk"
                name="si_spk"
                type="text"
                value={formData.si_spk}
                onChange={handleChange}
                placeholder="Masukkan SI/SPK"
                required
              />
            </div>
          </div>

          {/* Alerts */}
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-cancel"
              onClick={handleCancel}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-submit"
              disabled={submitting}
            >
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default InputDataShipment
