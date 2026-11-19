import { useEffect, useState } from 'react';
import { ArrowRight, BadgeCheck, CalendarCheck2, Clock3, HeartPulse, ShieldCheck, Stethoscope } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { homeForRole } from '../utils/format';
import { Button, DoctorCard, ServiceIcon } from '../components/ui';

const services = [
  { icon: Stethoscope, title: 'Find the right specialist', description: 'Explore verified doctors and choose care that fits your needs.' },
  { icon: CalendarCheck2, title: 'Book with confidence', description: 'Choose a time from the doctor’s availability and track every request.' },
  { icon: HeartPulse, title: 'Care that stays connected', description: 'Keep your appointments and doctor updates organized in one place.' }
];

export default function Home() {
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/doctors', { params: { limit: 3 } })
      .then(({ data }) => setDoctors(data.doctors || []))
      .catch(() => toast.error('Featured doctors are unavailable right now'))
      .finally(() => setLoadingDoctors(false));
  }, []);

  function startBooking(doctor) {
    if (user?.role === 'patient') navigate(`/patient/book/${doctor._id}`);
    else navigate(user ? homeForRole(user.role) : '/register');
  }

  return (
    <div className="space-y-20 pb-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-12 text-white shadow-soft sm:px-10 sm:py-16 lg:px-16 lg:py-20">
        <div className="absolute -right-20 -top-32 h-96 w-96 rounded-full bg-clinic-600/25 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 h-40 w-40 rounded-full bg-teal-300/10 blur-3xl" />
        <div className="relative grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-semibold tracking-wide text-teal-100">
              <span className="h-2 w-2 rounded-full bg-emerald-300" /> CARE THAT WORKS AROUND YOU
            </div>
            <h1 className="max-w-2xl text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
              Your next step to feeling <span className="text-teal-300">better</span> starts here.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              Find a trusted specialist, choose a time that works, and keep your care journey clear and organized.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to={user?.role === 'patient' ? '/patient/doctors' : user ? homeForRole(user.role) : '/register'}>
                <Button variant="secondary" className="w-full sm:w-auto">Find your doctor <ArrowRight size={17} /></Button>
              </Link>
              <Link to="/login" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
                I already have an account
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
              <span className="flex items-center gap-2"><ShieldCheck size={17} className="text-teal-300" /> Verified clinicians</span>
              <span className="flex items-center gap-2"><Clock3 size={17} className="text-teal-300" /> Simple scheduling</span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-sm">
            <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur">
              <div className="rounded-[1.5rem] bg-white p-5 text-ink">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-clinic-700">Your care, organized</p>
                    <p className="mt-1 text-xl font-bold">Appointment ready</p>
                  </div>
                  <span className="rounded-2xl bg-clinic-50 p-3 text-clinic-700"><CalendarCheck2 size={22} /></span>
                </div>
                <div className="my-5 flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                  <span className="rounded-xl bg-white p-2.5 text-clinic-700 shadow-sm"><Stethoscope size={20} /></span>
                  <div><p className="text-sm font-semibold">Care from trusted doctors</p><p className="mt-1 text-xs text-slate-500">A clearer way to book</p></div>
                  <BadgeCheck size={18} className="ml-auto shrink-0 text-emerald-600" />
                </div>
                <div className="space-y-3">
                  <div className="h-2.5 w-full rounded-full bg-slate-100"><div className="h-2.5 w-3/4 rounded-full bg-clinic-500" /></div>
                  <div className="flex justify-between text-xs text-slate-400"><span>Choose your specialist</span><span>3 simple steps</span></div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-7 hidden items-center gap-3 rounded-2xl bg-white px-4 py-3 text-ink shadow-xl sm:flex">
              <span className="rounded-xl bg-emerald-50 p-2 text-emerald-700"><BadgeCheck size={19} /></span>
              <div><p className="text-sm font-bold">Verified care</p><p className="text-xs text-slate-500">Doctors reviewed by our team</p></div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-clinic-700">How it works</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-ink">Care, made a little simpler.</h2></div>
          <p className="max-w-md text-sm leading-6 text-slate-500">From finding a specialist to managing your appointment, everything you need is in one place.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {services.map(({ icon: Icon, title, description }, index) => (
            <article key={title} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between"><ServiceIcon><Icon size={22} /></ServiceIcon><span className="text-sm font-bold text-slate-300">0{index + 1}</span></div>
              <h3 className="mt-5 text-lg font-bold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-7 flex items-end justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-clinic-700">Meet our clinicians</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-ink">Verified doctors, ready to help.</h2></div>
          <Link to={user?.role === 'patient' ? '/patient/doctors' : '/register'} className="hidden items-center gap-1 text-sm font-semibold text-clinic-700 hover:text-clinic-800 sm:flex">Explore doctors <ArrowRight size={16} /></Link>
        </div>
        {loadingDoctors ? (
          <div className="grid gap-4 md:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-56 animate-pulse rounded-3xl bg-slate-100" />)}</div>
        ) : doctors.length ? (
          <div className="grid gap-4 md:grid-cols-3">{doctors.map((doctor) => <DoctorCard key={doctor._id} doctor={doctor} onBook={startBooking} publicView />)}</div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">New verified doctors will appear here soon.</div>
        )}
        <Link to={user?.role === 'patient' ? '/patient/doctors' : '/register'} className="mt-5 flex items-center justify-center gap-1 text-sm font-semibold text-clinic-700 sm:hidden">Explore doctors <ArrowRight size={16} /></Link>
      </section>

      <section className="flex flex-col items-start justify-between gap-6 rounded-[2rem] bg-clinic-50 p-7 sm:flex-row sm:items-center sm:p-10">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-clinic-700">Take the next step</p><h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">A better care experience is within reach.</h2><p className="mt-2 text-sm text-slate-600">Create an account to find a doctor and manage your appointments.</p></div>
        <Link to={user ? homeForRole(user.role) : '/register'}><Button>Get started <ArrowRight size={17} /></Button></Link>
      </section>
    </div>
  );
}
