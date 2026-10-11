import { useState } from 'react';
import '../css/Hero.css';

export default function Hero() {
  const openChat = () => window.dispatchEvent(new CustomEvent('open-chat'));

  // Interactive tilt: the drone leans slightly toward the visitor's cursor.
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const handleMove = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({
      x: (e.clientX - r.left) / r.width - 0.5,
      y: (e.clientY - r.top) / r.height - 0.5,
    });
  };

  return (
    <section className="hero" onMouseMove={handleMove} onMouseLeave={() => setTilt({ x: 0, y: 0 })}>
      <div className="container hero-inner">
        <div className="hero-copy">
          <span className="hero-badge">AI Support &amp; Lead Assistant</span>
          <h1>
            Drone services &amp; training,
            <br />
            <span className="accent">answered instantly.</span>
          </h1>
          <p>
            Chat with our assistant about DroneTV services, pilot training courses,
            or submit an enquiry in under a minute — our team will call you back.
          </p>
          <div className="hero-cta">
            <button className="btn btn-primary" onClick={openChat}>
              Chat with us
            </button>
            <a className="btn btn-ghost" href="#courses">
              Explore courses
            </a>
          </div>
          <div className="hero-stats">
            <div>
              <strong>6</strong>
              <span>Drone services</span>
            </div>
            <div>
              <strong>4</strong>
              <span>Training courses</span>
            </div>
            <div>
              <strong>1 min</strong>
              <span>Enquiry time</span>
            </div>
          </div>
        </div>
        <div
          className="hero-art"
          aria-hidden="true"
          style={{
            transform: `perspective(800px) rotateY(${tilt.x * 14}deg) rotateX(${-tilt.y * 10}deg)`,
          }}
        >
          <svg viewBox="0 0 320 220" className="drone-svg">
            <ellipse cx="160" cy="196" rx="110" ry="10" className="shadow" />
            <g stroke="currentColor" fill="none" strokeWidth="3">
              <path d="M70 60 L130 100 M250 60 L190 100 M70 160 L130 120 M250 160 L190 120" />
              <rect x="130" y="96" width="60" height="28" rx="8" className="body-fill" />
              <circle cx="160" cy="132" r="8" className="body-fill" />
              <path d="M160 140 v10" />
              <circle cx="182" cy="104" r="3" className="led" />
              <circle cx="70" cy="60" r="30" className="guard" />
              <circle cx="250" cy="60" r="30" className="guard" />
              <circle cx="70" cy="160" r="30" className="guard" />
              <circle cx="250" cy="160" r="30" className="guard" />
            </g>
            <g fill="currentColor" stroke="none">
              <g className="rotor">
                <ellipse cx="70" cy="60" rx="24" ry="4.5" />
                <ellipse cx="70" cy="60" rx="4.5" ry="24" />
              </g>
              <g className="rotor rotor-rev">
                <ellipse cx="250" cy="60" rx="24" ry="4.5" />
                <ellipse cx="250" cy="60" rx="4.5" ry="24" />
              </g>
              <g className="rotor rotor-rev">
                <ellipse cx="70" cy="160" rx="24" ry="4.5" />
                <ellipse cx="70" cy="160" rx="4.5" ry="24" />
              </g>
              <g className="rotor">
                <ellipse cx="250" cy="160" rx="24" ry="4.5" />
                <ellipse cx="250" cy="160" rx="4.5" ry="24" />
              </g>
            </g>
            <g className="signal" stroke="currentColor" fill="none" strokeWidth="2">
              <path d="M140 40 a28 28 0 0 1 40 0" />
              <path d="M130 30 a42 42 0 0 1 60 0" />
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
