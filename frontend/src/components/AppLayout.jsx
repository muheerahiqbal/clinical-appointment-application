import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Activity, CalendarDays, LayoutDashboard, LogOut, Menu, ShieldCheck, Stethoscope, UserRound, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui';

const navigation = {
  patient: [
    { to: '/patient/doctors', label: 'Find a doctor', icon: Stethoscope },
    { to: '/patient/appointments', label: 'My appointments', icon: CalendarDays }
  ],
  doctor: [
    { to: '/doctor', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/doctor/profile', label: 'My profile', icon: UserRound }
  ],
  admin: [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/doctors', label: 'Doctor review', icon: ShieldCheck },
    { to: '/admin/users', label: 'Manage clinic', icon: Activity }
  ]
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      toast.success('You are signed out');
      navigate('/');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to sign out right now');
    }
  }

  const links = user ? navigation[user.role] || [] : [];
  const linkClass = ({ isActive }) => `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-clinic-50 text-clinic-800' : 'text-slate-500 hover:bg-slate-50 hover:text-ink'}`;

  return (
    <div className="min-h-screen bg-[#f7faf9]">
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5" aria-label="ClinicCare home">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-clinic-700 text-white"><Activity size={21} /></span>
            <span className="text-lg font-bold tracking-tight text-ink">Clinic<span className="text-clinic-700">Care</span></span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            {!user && <NavLink to="/" end className={linkClass}>Home</NavLink>}
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} end={to === '/doctor' || to === '/admin'} className={linkClass}>
                <Icon size={16} /> {label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <span className="max-w-36 truncate text-sm font-medium text-slate-600">{user.name}</span>
                <Button variant="secondary" onClick={handleLogout}><LogOut size={16} /> Sign out</Button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 text-sm font-semibold text-slate-600 hover:text-ink">Sign in</Link>
                <Link to="/register"><Button>Get started</Button></Link>
              </>
            )}
          </div>

          <button className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 md:hidden" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-1" aria-label="Mobile navigation">
              {!user && <NavLink to="/" end onClick={() => setMenuOpen(false)} className={linkClass}>Home</NavLink>}
              {links.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} onClick={() => setMenuOpen(false)} className={linkClass}><Icon size={16} /> {label}</NavLink>
              ))}
              {user ? (
                <button onClick={handleLogout} className="mt-2 flex items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50"><LogOut size={16} /> Sign out</button>
              ) : (
                <div className="mt-3 flex gap-2">
                  <Link onClick={() => setMenuOpen(false)} to="/login" className="flex-1"><Button variant="secondary" className="w-full">Sign in</Button></Link>
                  <Link onClick={() => setMenuOpen(false)} to="/register" className="flex-1"><Button className="w-full">Get started</Button></Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="mx-auto min-h-[calc(100vh-160px)] max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <Outlet />
      </main>
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} ClinicCare. Care that fits your life.</p>
          <p>Appointments are subject to doctor confirmation.</p>
        </div>
      </footer>
    </div>
  );
}
