import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BriefcaseMedical, FileCheck2, ImagePlus, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage, homeForRole } from '../utils/format';
import { Button } from '../components/ui';

export default function Register() {
  const [role, setRole] = useState('patient');
  const [form, setForm] = useState({ name: '', email: '', password: '', specialization: '', experience: '', fees: '' });
  const [avatar, setAvatar] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { register, updateUser } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    if (new TextEncoder().encode(form.password).length > 72) {
      toast.error('Password must be no more than 72 UTF-8 bytes');
      return;
    }
    setSubmitting(true);
    const body = new FormData();
    body.append('name', form.name.trim());
    body.append('email', form.email.trim());
    body.append('password', form.password);
    body.append('role', role);
    if (role === 'doctor') {
      body.append('specialization', form.specialization.trim());
      body.append('experience', form.experience);
      body.append('fees', form.fees);
      if (certificate) body.append('certificate', certificate);
    }
    try {
      const user = await register(body);
      if (role === 'patient' && avatar) {
        const avatarBody = new FormData();
        avatarBody.append('avatar', avatar);
        try {
          const { data } = await api.post('/patients/me/avatar', avatarBody);
          updateUser(data.user);
        } catch {
          toast.error('Your account is ready, but the avatar could not be uploaded.');
        }
      }
      toast.success(role === 'doctor' ? 'Account created. Your profile is awaiting clinic verification.' : 'Your patient account is ready.');
      navigate(homeForRole(user.role), { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to create your account'));
    } finally {
      setSubmitting(false);
    }
  }

  function changeRole(nextRole) {
    setRole(nextRole);
    setAvatar(null);
    setCertificate(null);
  }

  return (
    <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-soft md:grid-cols-[0.8fr_1.2fr]">
      <aside className="hidden flex-col justify-between bg-clinic-800 p-10 text-white md:flex">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10"><UserRound size={23} className="text-teal-100" /></div>
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200">Join ClinicCare</p><h1 className="mt-3 text-3xl font-bold leading-tight">Good care starts with a simple connection.</h1><p className="mt-4 text-sm leading-6 text-teal-50/80">Create a secure account to make appointments or bring your practice to our clinic.</p></div>
        <p className="text-xs text-teal-100/70">Your information is protected by secure sign-in.</p>
      </aside>
      <div className="p-6 sm:p-10">
        <div className="mb-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-clinic-700">Create your account</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-ink">Get started</h2></div>
        <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5" role="tablist" aria-label="Account type">
          {[['patient', 'Patient', UserRound], ['doctor', 'Doctor', BriefcaseMedical]].map(([value, label, Icon]) => (
            <button key={value} type="button" role="tab" aria-selected={role === value} onClick={() => changeRole(value)} className={`flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition ${role === value ? 'bg-white text-clinic-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Icon size={16} /> {label}</button>
          ))}
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block"><span className="label">Full name</span><input className="field mt-2" autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} minLength={2} maxLength={100} required /></label>
          <label className="block"><span className="label">Email address</span><input className="field mt-2" type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
          <label className="block"><span className="label">Password <span className="font-normal text-slate-400">(12+ characters)</span></span><input className="field mt-2" type="password" autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} minLength={12} required /></label>

          {role === 'patient' ? (
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-slate-200 p-4 transition hover:border-clinic-300 hover:bg-clinic-50">
              <span className="rounded-xl bg-clinic-50 p-2.5 text-clinic-700"><ImagePlus size={19} /></span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-700">Profile photo <span className="font-normal text-slate-400">· optional</span></span><span className="mt-1 block truncate text-xs text-slate-400">{avatar?.name || 'JPEG, PNG or WebP; up to 5 MB'}</span></span>
              <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setAvatar(event.target.files?.[0] || null)} />
            </label>
          ) : (
            <>
              <label className="block"><span className="label">Specialization</span><input className="field mt-2" placeholder="e.g. Cardiology" value={form.specialization} onChange={(event) => setForm({ ...form, specialization: event.target.value })} maxLength={100} required /></label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block"><span className="label">Years of experience</span><input className="field mt-2" type="number" min="0" max="80" step="1" value={form.experience} onChange={(event) => setForm({ ...form, experience: event.target.value })} required /></label>
                <label className="block"><span className="label">Consultation fee ($)</span><input className="field mt-2" type="number" min="0" max="100000" step="0.01" value={form.fees} onChange={(event) => setForm({ ...form, fees: event.target.value })} required /></label>
              </div>
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-slate-200 p-4 transition hover:border-clinic-300 hover:bg-clinic-50">
                <span className="rounded-xl bg-clinic-50 p-2.5 text-clinic-700"><FileCheck2 size={19} /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-700">Medical certificate <span className="font-normal text-slate-400">· optional</span></span><span className="mt-1 block truncate text-xs text-slate-400">{certificate?.name || 'PDF, JPEG, PNG or WebP; up to 5 MB'}</span></span>
                <input className="sr-only" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={(event) => setCertificate(event.target.files?.[0] || null)} />
              </label>
              <p className="text-xs leading-5 text-slate-500">Doctor profiles stay hidden from patients until a clinic administrator verifies them.</p>
            </>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>{submitting ? 'Creating account…' : 'Create account'} {!submitting && <ArrowRight size={17} />}</Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link to="/login" className="font-semibold text-clinic-700 hover:text-clinic-800">Sign in</Link></p>
      </div>
    </div>
  );
}
