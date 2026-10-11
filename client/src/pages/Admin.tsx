import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  api,
  getAdminKey,
  setAdminKey,
  clearAdminKey,
  type Enquiry,
  type EnquiryStatus,
} from '../api/client';
import '../css/Admin.css';

const STATUSES: EnquiryStatus[] = ['New', 'Contacted', 'In Progress', 'Closed'];
const TYPE_FILTERS = ['All', 'Student', 'Customer', 'Other'];

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function Admin() {
  const [unlocked, setUnlocked] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [verifying, setVerifying] = useState(true);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [actionMsg, setActionMsg] = useState('');

  // Verify any saved key on load; a wrong/expired key drops back to the login gate.
  useEffect(() => {
    (async () => {
      if (getAdminKey()) {
        try {
          await api.list();
          setUnlocked(true);
        } catch {
          clearAdminKey();
        }
      }
      setVerifying(false);
    })();
  }, []);

  const unlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const key = keyInput.trim();
    if (!key) {
      setLoginError('Please enter the admin key.');
      return;
    }
    setAdminKey(key);
    try {
      await api.list();
      setKeyInput('');
      setUnlocked(true);
    } catch (err) {
      clearAdminKey();
      setLoginError(
        err instanceof Error ? err.message : 'Could not verify the admin key.'
      );
    }
  };

  const lock = () => {
    clearAdminKey();
    setUnlocked(false);
    setEnquiries([]);
  };

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.list({
        search: search.trim() || undefined,
        userType: typeFilter === 'All' ? undefined : typeFilter,
        status: statusFilter === 'All' ? undefined : statusFilter,
      });
      setEnquiries(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load enquiries.');
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, statusFilter]);

  // Debounced search — only runs once the admin key is verified
  useEffect(() => {
    if (!unlocked) return;
    const t = setTimeout(fetchEnquiries, 350);
    return () => clearTimeout(t);
  }, [fetchEnquiries, unlocked]);

  const flash = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(''), 3000);
  };

  const changeStatus = async (id: string, status: string) => {
    try {
      await api.updateStatus(id, status);
      setEnquiries((list) =>
        list.map((e) => (e._id === id ? { ...e, status: status as EnquiryStatus } : e))
      );
      if (selected?._id === id) setSelected({ ...selected, status: status as EnquiryStatus });
      flash('Status updated.');
    } catch (e) {
      flash(e instanceof Error ? e.message : 'Status update failed.');
    }
  };

  const remove = async (id: string, name: string) => {
    if (!window.confirm(`Delete the enquiry from "${name}"? This cannot be undone.`)) return;
    try {
      await api.remove(id);
      setEnquiries((list) => list.filter((e) => e._id !== id));
      if (selected?._id === id) setSelected(null);
      flash('Enquiry deleted.');
    } catch (e) {
      flash(e instanceof Error ? e.message : 'Delete failed.');
    }
  };

  const counts = STATUSES.map((s) => ({
    status: s,
    count: enquiries.filter((e) => e.status === s).length,
  }));

  if (verifying) {
    return (
      <div className="admin-page">
        <main className="container admin-main">
          <p className="muted padded">Checking admin access…</p>
        </main>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="admin-page">
        <header className="admin-topbar">
          <div className="container admin-topbar-inner">
            <Link to="/" className="brand brand-light">
              DroneTV <em>Assistant</em>
            </Link>
            <h1>Enquiry Dashboard</h1>
          </div>
        </header>
        <main className="container admin-main">
          <div className="card login-card">
            <h2>Admin sign in</h2>
            <p className="muted">
              This dashboard is private. Enter the admin key from the server's{' '}
              <code>.env</code> file (<code>ADMIN_API_KEY</code>) to continue.
            </p>
            <form onSubmit={unlock} className="login-form">
              <label>
                Admin key
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Enter admin key"
                  autoComplete="off"
                />
              </label>
              {loginError && <p className="form-banner bad">{loginError}</p>}
              <button type="submit" className="btn btn-primary">
                Unlock dashboard
              </button>
            </form>
            <p className="muted small">
              Wrong key? The server answers with <code>401 Unauthorized</code> and nothing is
              shown.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-topbar">
        <div className="container admin-topbar-inner">
          <Link to="/" className="brand brand-light">
            DroneTV <em>Assistant</em>
          </Link>
          <h1>Enquiry Dashboard</h1>
          <button className="btn btn-small btn-ghost-light" onClick={lock}>
            Lock
          </button>
        </div>
      </header>

      <main className="container admin-main">
        <div className="stat-row">
          <div className="stat">
            <strong>{enquiries.length}</strong>
            <span>Total</span>
          </div>
          {counts.map((c) => (
            <div className="stat" key={c.status}>
              <strong>{c.count}</strong>
              <span>{c.status}</span>
            </div>
          ))}
        </div>

        <div className="admin-controls card">
          <div className="search-box">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone, interest…"
              aria-label="Search enquiries"
            />
          </div>
          <div className="filter-group">
            <label>
              Type
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                {TYPE_FILTERS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option>All</option>
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {actionMsg && <p className="form-banner ok admin-flash">{actionMsg}</p>}
        {error && <p className="form-banner bad">{error}</p>}

        <div className="card table-wrap">
          {loading ? (
            <p className="muted padded">Loading enquiries…</p>
          ) : enquiries.length === 0 ? (
            <p className="muted padded">No enquiries found. Try clearing the search or filters.</p>
          ) : (
            <table className="enquiry-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Type</th>
                  <th>Interest</th>
                  <th>Status</th>
                  <th>Received</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((e) => (
                  <tr key={e._id}>
                    <td data-label="Name">
                      <strong>{e.name}</strong>
                    </td>
                    <td data-label="Contact">
                      <span className="contact-cell">{e.email}</span>
                      <span className="contact-cell">{e.phone}</span>
                    </td>
                    <td data-label="Type">
                      <span className={`tag tag-${e.userType.toLowerCase()}`}>{e.userType}</span>
                    </td>
                    <td data-label="Interest">{e.interest}</td>
                    <td data-label="Status">
                      <select
                        className={`status-select status-${e.status.replace(/\s/g, '')}`}
                        value={e.status}
                        onChange={(ev) => changeStatus(e._id, ev.target.value)}
                        aria-label={`Change status for ${e.name}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td data-label="Received" className="muted small">
                      {formatDate(e.createdAt)}
                    </td>
                    <td data-label="Actions">
                      <div className="row-actions">
                        <button className="btn btn-small" onClick={() => setSelected(e)}>
                          View
                        </button>
                        <button
                          className="btn btn-small btn-danger"
                          onClick={() => remove(e._id, e.name)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal card" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Enquiry details">
            <div className="modal-head">
              <h3>Enquiry details</h3>
              <button className="modal-close" onClick={() => setSelected(null)} aria-label="Close">
                ✕
              </button>
            </div>
            <dl className="detail-list">
              <div>
                <dt>Name</dt>
                <dd>{selected.name}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{selected.email}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{selected.phone}</dd>
              </div>
              <div>
                <dt>User type</dt>
                <dd>{selected.userType}</dd>
              </div>
              <div>
                <dt>Interest</dt>
                <dd>{selected.interest}</dd>
              </div>
              <div>
                <dt>Message</dt>
                <dd className="pre-wrap">{selected.message}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  <select
                    className="status-select"
                    value={selected.status}
                    onChange={(e) => changeStatus(selected._id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </dd>
              </div>
              <div>
                <dt>Received</dt>
                <dd>{formatDate(selected.createdAt)}</dd>
              </div>
            </dl>
            <div className="modal-actions">
              <button
                className="btn btn-danger"
                onClick={() => remove(selected._id, selected.name)}
              >
                Delete enquiry
              </button>
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
