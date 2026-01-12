import './index.css'
import logoLocation from '../../assets/logo/logo_footer/location_on.png'
import logoEmail from '../../assets/logo/logo_footer/email Background Removed.png'
import logoPhone from '../../assets/logo/logo_footer/call Background Removed.png'
import logoGithub from '../../assets/logo/logo_footer/git logo.png'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-sections">
          {/* Left Section - PT Bukit Asam */}
          <div className="footer-section">
            <div className="footer-logo">
              <h3>PT. Bukit Asam</h3>
            </div>
            <p className="footer-description">
              Project ini dikerjakan dalam rangka melaksanakan Kerja Praktek yang diselenggarakan oleh Universitas Sriwijaya
            </p>
          </div>

          {/* Center Left - About Company */}
          <div className="footer-section">
            <h4>About Company</h4>
            <div className="footer-info">
              <div className="info-item">
                <img src={logoLocation} alt="location" className="info-icon" />
                <p>PT Bukit Asam Tbk.<br />Unit Dermaga Kertapati</p>
              </div>
              <div className="info-item">
                <img src={logoEmail} alt="email" className="info-icon" />
                <p>Ourstudio@hello.com</p>
              </div>
              <div className="info-item">
                <img src={logoPhone} alt="phone" className="info-icon" />
                <p>(0734) 451 096, 452 352</p>
              </div>
            </div>
          </div>

          {/* Center Right - Developers */}
          <div className="footer-section">
            <h4>Developers</h4>
            <ul className="developer-list">
              <li>Afratsin Wiradhiya Asaari</li>
              <li>Muhammad Rifqi Rizqullah</li>
              <li>Muhammad Hauzan Isyad</li>
            </ul>
          </div>

          {/* Right - Navigation */}
          <div className="footer-section">
            <h4>Navigation</h4>
            <ul className="nav-list">
              <li><a href="/dashboard">Dashboard</a></li>
              <li><a href="/data-shipment">Data Shipment</a></li>
              <li><a href="/input-data-shipment">Input Data Shipment</a></li>
              <li><a href="/export-data-shipment">Export Data Shipment</a></li>
            </ul>
          </div>

          {/* GitHub Link */}
          <div className="footer-github">
            <a href="https://github.com/YaBoyAri/Coal-Shipment-Monitoring-System" title="More about this Project" target="_blank">
              <img src={logoGithub} alt="GitHub" className="github-logo" />
            </a>
            <p>More about this Project</p>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="footer-bottom">
          <p>&copy; 2025 Coal Shipment Monitoring System. All rights reserved.</p>
          <p>PT Bukit Asam Tbk.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
