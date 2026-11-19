import { useCallback, useEffect, useState } from 'react';
import { BadgeCheck, CalendarDays, Check, Clock3, Inbox, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { Avatar, Button, EmptyState, PageTitle, SectionCard, StatusBadge } from '../../components/ui';
import { formatDate, getErrorMessage } from '../../utils/format';

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const loadAppointments = useCallback(async () => {
    try {
      const { data } = await api.get('/appointments/mine', { params: { limit: 100 } });
      setAppointments(data.appointments || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not load appointment requests'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAppointments(); }, [loadAppointments]);

  async function respond(appointment, status) {
    setBusyId(appointment._id);
    try {
      await api.patch(`/appointments/${appointment._id}/respond`, { status, notes: notes[appointment._id] || '' });
      toast.success(status === 'approved' ? 'Appointment approved' : 'Appointment rejected');
      setNotes((current) => { const next = { ...current }; delete next[appointment._id]; return next; });
      await loadAppointments();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not update this appointment'));
    } finally {
      setBusyId(null);
    }
  }

  const pending = appointments.filter((appointment) => appointment.status === 'pending');
  const approved = appointments.filter((appointment) => appointment.status === 'approved');

  return (
    <div>
      <PageTitle eyebrow="Doctor workspace" title="Good to see you" description="Review appointment requests and keep your day moving." />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total appointments', value: appointments.length, icon: CalendarDays, color: 'bg-sky-50 text-sky-700' },
          { label: 'Awaiting your review', value: pending.length, icon: Inbox, color: 'bg-amber-50 text-amber-700' },
          { label: 'Approved visits', value: approved.length, icon: BadgeCheck, color: 'bg-emerald-50 text-emerald-700' }
        ].map(({ label, value, icon: Icon, color }) => (
          <SectionCard key={label} className="flex items-center gap-4">
            <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}><Icon size={21} /></span>
            <div><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold text-ink">{value}</p></div>
          </SectionCard>
        ))}
      </div>

      <div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-bold text-ink">Appointment requests</h2><p className="mt-1 text-sm text-slate-500">Approve or reject pending visits. Notes are optional.</p></div></div>
      {loading ? <div className="space-y-4">{[1, 2].map((item) => <div key={item} className="h-52 animate-pulse rounded-3xl bg-slate-100" />)}</div>
        : appointments.length ? (
          <div className="space-y-4">
            {appointments.map((appointment) => {
              const patient = appointment.patientId;
              const isPending = appointment.status === 'pending';
              return (
                <SectionCard key={appointment._id}>
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar name={patient?.name || 'Patient'} src={patient?.avatarUrl} />
                      <div><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-ink">{patient?.name || 'Patient account'}</h3><StatusBadge status={appointment.status} /></div>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500"><span className="flex items-center gap-1.5"><CalendarDays size={14} />{formatDate(appointment.date)}</span><span className="flex items-center gap-1.5"><Clock3 size={14} />{appointment.timeSlot} UTC</span>{patient?.email && <span>{patient.email}</span>}</div>
                      </div>
                    </div>
                    {isPending && (
                      <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" disabled={busyId === appointment._id} onClick={() => respond(appointment, 'rejected')}><X size={16} /> Reject</Button>
                        <Button disabled={busyId === appointment._id} onClick={() => respond(appointment, 'approved')}><Check size={16} /> Approve</Button>
                      </div>
                    )}
                  </div>
                  {appointment.symptoms && <div className="mt-5 rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Reason for visit</p><p className="mt-2 text-sm leading-6 text-slate-700">{appointment.symptoms}</p></div>}
                  {isPending ? (
                    <label className="mt-4 block"><span className="label">Note to patient <span className="font-normal text-slate-400">· optional</span></span><textarea className="field mt-2 min-h-20 resize-y py-3" maxLength={2000} placeholder="Add a note about this request" value={notes[appointment._id] || ''} onChange={(event) => setNotes((current) => ({ ...current, [appointment._id]: event.target.value }))} /></label>
                  ) : appointment.notes ? <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600"><span className="font-semibold">Your note: </span>{appointment.notes}</p> : null}
                </SectionCard>
              );
            })}
          </div>
        ) : <EmptyState icon={Inbox} title="No appointments yet" description="New patient requests will appear here after a patient books an available time." />}
    </div>
  );
}
