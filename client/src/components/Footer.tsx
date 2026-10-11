import '../css/Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <strong>DroneTV Assistant</strong>
          <p>AI Support &amp; Lead Assistant — demo build for the IPAGE technical assessment.</p>
        </div>
        <div className="footer-links">
          <a href="#services">Services</a>
          <a href="#courses">Courses</a>
          <a href="#contact">Contact</a>
          <a href="/admin">Admin</a>
        </div>
      </div>
      <p className="footer-note">Original UI created for assessment purposes. Not affiliated with dronetv.in.</p>
    </footer>
  );
}
