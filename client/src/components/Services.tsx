import { SERVICES, type Service } from '../data/content';

function Icon({ name }: { name: Service['icon'] }) {
  const paths: Record<Service['icon'], React.ReactNode> = {
    map: (
      <>
        <path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" />
        <path d="M9 4v14M15 6v14" />
      </>
    ),
    spray: <path d="M12 3c3 4 6 7 6 11a6 6 0 1 1-12 0c0-4 3-7 6-11z" />,
    inspect: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
      </>
    ),
    camera: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <circle cx="12" cy="13" r="4" />
        <path d="M8 7l1.5-3h5L16 7" />
      </>
    ),
    estate: (
      <>
        <path d="M3 11l9-8 9 8" />
        <path d="M5 10v10h14V10" />
      </>
    ),
    rescue: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" />
        <path d="M12 3v5M12 16v5M3 12h5M16 12h5" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

export default function Services() {
  return (
    <section className="section" id="services">
      <div className="container">
        <p className="section-kicker">What we do</p>
        <h2 className="section-title">Drone services</h2>
        <p className="section-sub">
          Professional drone operations for businesses, farms and events — executed by trained,
          certified pilots.
        </p>
        <div className="grid cards-3">
          {SERVICES.map((s) => (
            <article className="card" key={s.title}>
              <div className="card-icon">
                <Icon name={s.icon} />
              </div>
              <h3>{s.title}</h3>
              <p>{s.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
