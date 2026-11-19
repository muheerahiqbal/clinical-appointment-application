import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage, homeForRole } from '../utils/format';
import { Button } from '../components/ui';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}`);
      navigate(location.state?.from?.pathname || homeForRole(user.role), { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to sign in'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-soft md:grid-cols-[0.9fr_1.1fr]">
      <aside className="hidden flex-col justify-between bg-ink p-10 text-white md:flex">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10"><ShieldCheck size={24} className="text-teal-300" /></div>
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">Welcome back</p><h1 className="mt-3 text-3xl font-bold leading-tight">Your care journey, right where you left it.</h1><p className="mt-4 text-sm leading-6 text-slate-300">Sign in to manage visits, connect with your care team, and stay on top of what comes next.</p></div>
        <p className="text-xs text-slate-400">Secure access for patients, doctors, and clinic administrators.</p>
      </aside>
      <div className="p-6 sm:p-10 lg:p-12">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-clinic-700">ClinicCare account</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink">Sign in</h2>
          <p className="mt-2 text-sm text-slate-500">Use your email and password to continue.</p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="label">Email address</span>
            <span className="relative mt-2 block"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input className="field pl-11" type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></span>
          </label>
          <label className="block">
            <span className="label">Password</span>
            <span className="relative mt-2 block"><LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input className="field pl-11" type="password" autoComplete="current-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /></span>
          </label>
          <Button type="submit" className="w-full" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign in'} {!submitting && <ArrowRight size={17} />}</Button>
        </form>
        <p className="mt-7 text-center text-sm text-slate-500">New to ClinicCare? <Link to="/register" className="font-semibold text-clinic-700 hover:text-clinic-800">Create an account</Link></p>
      </div>
    </div>
  );
}
