import { useState } from 'react';
import { api, type ApiError, type EnquiryInput } from '../api/client';
import { INTEREST_OPTIONS, CONTACT } from '../data/content';
import '../css/EnquiryForm.css';

const EMPTY: EnquiryInput = {
  name: '',
  email: '',
  phone: '',
  userType: '',
  interest: '',
  message: '',
};

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function EnquiryForm() {
  const [form, setForm] = useState<EnquiryInput>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [serverMessage, setServerMessage] = useState('');

  const set = (k: keyof EnquiryInput) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: '' }));
  };

  function validate(): Record<string, string> {
    const er: Record<string, string> = {};
    if (form.name.trim().length < 2) er.name = 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      er.email = 'Please enter a valid email address.';
    const digits = form.phone.replace(/\D/g, '').replace(/^91/, '').replace(/^0/, '');
    if (!/^[6-9]\d{9}$/.test(digits)) er.phone = 'Enter a valid 10-digit Indian mobile number.';
    if (!['Student', 'Customer', 'Other'].includes(form.userType))
      er.userType = 'Please select who you are.';
    if (form.interest.trim().length < 2) er.interest = 'Please pick a service or course.';
    if (form.message.trim().length < 10)
      er.message = 'Message must be at least 10 characters.';
    return er;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const er = validate();
    setErrors(er);
    if (Object.keys(er).length > 0) return;

    setStatus('submitting');
    setServerMessage('');
    try {
      await api.create(form);
      setStatus('success');
      setServerMessage('Thank you! Your enquiry has been submitted. Our team will contact you soon.');
      setForm(EMPTY);
    } catch (err) {
      setStatus('error');
      const apiErr = err as ApiError;
      if (apiErr.details?.length) {
        const mapped: Record<string, string> = {};
        for (const d of apiErr.details) mapped[d.field] = d.message;
        setErrors(mapped);
        setServerMessage('Please fix the highlighted fields and try again.');
      } else {
        setServerMessage(apiErr.message || 'Submission failed. Please try again.');
      }
    }
  }

  const field = (k: keyof EnquiryInput) =>
    `field ${errors[k] ? 'field-error' : ''}`;

  return (
    <section className="section" id="contact">
      <div className="container contact-grid">
        <div>
          <p className="section-kicker">Get in touch</p>
          <h2 className="section-title">Contact / Enquiry</h2>
          <p className="section-sub">
            Fill in the form and our team will call you back during working hours.
          </p>
          <ul className="contact-list">
            <li>
              <strong>Email:</strong> {CONTACT.email}
            </li>
            <li>
              <strong>Phone:</strong> {CONTACT.phone}
            </li>
            <li>
              <strong>Hours:</strong> {CONTACT.hours}
            </li>
          </ul>
        </div>

        <form className="enquiry-form card" onSubmit={onSubmit} noValidate>
          <div className="form-row">
            <div className={field('name')}>
              <label htmlFor="cf-name">Name *</label>
              <input
                id="cf-name"
                value={form.name}
                onChange={set('name')}
                placeholder="Your full name"
                autoComplete="name"
              />
              {errors.name && <span className="err">{errors.name}</span>}
            </div>
            <div className={field('email')}>
              <label htmlFor="cf-email">Email *</label>
              <input
                id="cf-email"
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email && <span className="err">{errors.email}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className={field('phone')}>
              <label htmlFor="cf-phone">Phone *</label>
              <input
                id="cf-phone"
                value={form.phone}
                onChange={set('phone')}
                placeholder="10-digit mobile number"
                inputMode="tel"
                autoComplete="tel"
              />
              {errors.phone && <span className="err">{errors.phone}</span>}
            </div>
            <div className={field('userType')}>
              <label htmlFor="cf-usertype">I am a *</label>
              <select id="cf-usertype" value={form.userType} onChange={set('userType')}>
                <option value="">Select…</option>
                <option>Student</option>
                <option>Customer</option>
                <option>Other</option>
              </select>
              {errors.userType && <span className="err">{errors.userType}</span>}
            </div>
          </div>

          <div className={field('interest')}>
            <label htmlFor="cf-interest">Service or course of interest *</label>
            <select id="cf-interest" value={form.interest} onChange={set('interest')}>
              <option value="">Select…</option>
              {INTEREST_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
            {errors.interest && <span className="err">{errors.interest}</span>}
          </div>

          <div className={field('message')}>
            <label htmlFor="cf-message">Message *</label>
            <textarea
              id="cf-message"
              value={form.message}
              onChange={set('message')}
              placeholder="Tell us what you need… (min 10 characters)"
              rows={4}
            />
            {errors.message && <span className="err">{errors.message}</span>}
          </div>

          {serverMessage && (
            <p className={`form-banner ${status === 'success' ? 'ok' : 'bad'}`}>{serverMessage}</p>
          )}

          <button className="btn btn-primary" type="submit" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Submitting…' : 'Submit enquiry'}
          </button>
        </form>
      </div>
    </section>
  );
}
