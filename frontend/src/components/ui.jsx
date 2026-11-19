import { Link } from 'react-router-dom';
import { BadgeCheck, CalendarDays, ChevronRight, Stethoscope } from 'lucide-react';
import { initials } from '../utils/format';

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-clinic-700 text-white shadow-sm hover:bg-clinic-800 focus-visible:ring-clinic-500',
    secondary: 'border border-slate-200 bg-white text-slate-700 hover:border-clinic-200 hover:bg-clinic-50',
    subtle: 'text-clinic-700 hover:bg-clinic-50',
    danger: 'bg-rose-50 text-rose-700 hover:bg-rose-100'
  };
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function PageTitle({ eyebrow, title, description, action }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-clinic-700">{eyebrow}</p>}
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon: Icon = CalendarDays, title, description, action }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-clinic-50 text-clinic-700">
        <Icon size={25} />
      </div>
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 ring-rose-200',
    cancelled: 'bg-slate-100 text-slate-600 ring-slate-200'
  };
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${styles[status] || styles.pending}`}>
      {status || 'unknown'}
    </span>
  );
}

export function Avatar({ name, src, size = 'md' }) {
  const sizes = { sm: 'h-10 w-10 text-xs', md: 'h-14 w-14 text-base', lg: 'h-20 w-20 text-xl' };
  return src
    ? <img src={src} alt="" className={`${sizes[size]} rounded-2xl object-cover`} />
    : <div className={`${sizes[size]} flex shrink-0 items-center justify-center rounded-2xl bg-clinic-100 font-bold text-clinic-800`}>{initials(name)}</div>;
}

export function DoctorCard({ doctor, onBook, publicView = false }) {
  const name = doctor.userId?.name || 'Clinic doctor';
  return (
    <article className="group rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar name={name} src={doctor.userId?.avatarUrl} />
          <div>
            <h3 className="font-semibold text-ink">{name}</h3>
            <p className="mt-1 text-sm text-clinic-700">{doctor.specialization}</p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-50 p-1.5 text-emerald-700" title="Verified doctor">
          <BadgeCheck size={17} />
        </span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm">
        <div><p className="text-slate-400">Experience</p><p className="mt-1 font-semibold text-slate-700">{doctor.experience} years</p></div>
        <div><p className="text-slate-400">Consultation</p><p className="mt-1 font-semibold text-slate-700">${doctor.fees}</p></div>
      </div>
      {onBook && (
        <button onClick={() => onBook(doctor)} className="mt-5 flex w-full items-center justify-between rounded-xl bg-clinic-50 px-4 py-3 text-sm font-semibold text-clinic-800 transition group-hover:bg-clinic-100">
          {publicView ? 'View booking options' : 'Book appointment'} <ChevronRight size={17} />
        </button>
      )}
    </article>
  );
}

export function SectionCard({ children, className = '' }) {
  return <section className={`rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6 ${className}`}>{children}</section>;
}

export function ServiceIcon({ children }) {
  return <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-clinic-50 text-clinic-700">{children || <Stethoscope size={22} />}</div>;
}

export function TextLink({ to, children, className = '' }) {
  return <Link to={to} className={`font-semibold text-clinic-700 hover:text-clinic-800 ${className}`}>{children}</Link>;
}
