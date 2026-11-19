import { useEffect, useState } from 'react';
import { Activity, CalendarCheck2, ClipboardList, Stethoscope, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { PageTitle, SectionCard } from '../../components/ui';
import { getErrorMessage } from '../../utils/format';

export default function AdminDashboard() {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/statistics')
      .then(({ data }) => setStatistics(data.statistics))
      .catch((error) => toast.error(getErrorMessage(error, 'Could not load clinic statistics')))
      .finally(() => setLoading(false));
  }, []);

  const cards = statistics ? [
    { label: 'Patients', value: statistics.patients, icon: Users, tone: 'bg-sky-50 text-sky-700' },
    { label: 'Doctors', value: statistics.doctors, icon: Stethoscope, tone: 'bg-violet-50 text-violet-700' },
    { label: 'Awaiting verification', value: statistics.pendingDoctors, icon: ClipboardList, tone: 'bg-amber-50 text-amber-700' },
    { label: 'Appointments', value: Object.values(statistics.appointments || {}).reduce((sum, count) => sum + count, 0), icon: CalendarCheck2, tone: 'bg-emerald-50 text-emerald-700' }
  ] : [];

  return (
    <div>
      <PageTitle eyebrow="Clinic administration" title="System overview" description="A clear snapshot of your clinic and the work that needs attention." />
      {loading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-32 animate-pulse rounded-3xl bg-slate-100" />)}</div>
        : statistics && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {cards.map(({ label, value, icon: Icon, tone }) => <SectionCard key={label} className="flex items-center gap-4"><span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}><Icon size={21} /></span><div><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold text-ink">{value}</p></div></SectionCard>)}
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <SectionCard>
                <div className="flex items-center gap-3"><span className="rounded-2xl bg-clinic-50 p-3 text-clinic-700"><Activity size={21} /></span><div><h2 className="font-bold text-ink">Appointment activity</h2><p className="text-sm text-slate-500">Current status across the clinic</p></div></div>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {Object.entries(statistics.appointments || {}).map(([status, count]) => <div key={status} className="rounded-2xl bg-slate-50 p-4"><p className="text-xs capitalize text-slate-500">{status}</p><p className="mt-1 text-xl font-bold text-ink">{count}</p></div>)}
                </div>
              </SectionCard>
              <SectionCard className="flex flex-col justify-between">
                <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-clinic-700">Next action</p><h2 className="mt-2 text-xl font-bold text-ink">{statistics.pendingDoctors ? `${statistics.pendingDoctors} doctor profile${statistics.pendingDoctors === 1 ? '' : 's'} need review` : 'Doctor reviews are up to date'}</h2><p className="mt-2 text-sm leading-6 text-slate-500">Review uploaded credentials and verify the profiles that meet your clinic’s standards.</p></div>
                <Link to="/admin/doctors" className="mt-5 inline-flex w-fit items-center gap-2 rounded-xl bg-clinic-700 px-4 py-3 text-sm font-semibold text-white hover:bg-clinic-800">Review doctors <ClipboardList size={16} /></Link>
              </SectionCard>
            </div>
          </>
        )}
    </div>
  );
}
