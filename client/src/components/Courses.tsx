import { COURSES } from '../data/content';
import '../css/Courses.css';

export default function Courses() {
  const openChat = () => window.dispatchEvent(new CustomEvent('open-chat'));

  return (
    <section className="section section-alt" id="courses">
      <div className="container">
        <p className="section-kicker">Learn to fly</p>
        <h2 className="section-title">Training courses</h2>
        <p className="section-sub">
          Hands-on drone training programmes for students, professionals and hobbyists —
          from first flight to certified pilot.
        </p>
        <div className="grid cards-2">
          {COURSES.map((c) => (
            <article className="card course-card" key={c.title}>
              <div className="course-meta">
                <span className="pill">{c.duration}</span>
                <span className="pill pill-outline">{c.level}</span>
              </div>
              <h3>{c.title}</h3>
              <p className="course-mode">{c.mode}</p>
              <p>{c.description}</p>
              <button className="btn btn-small" onClick={openChat}>
                Ask about this course
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
