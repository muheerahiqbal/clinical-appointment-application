import { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Clock3, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { Avatar, Button, EmptyState, PageTitle, SectionCard, StatusBadge } from '../../components/ui';
import { formatDate, getErrorMessage } from '../../utils/format';

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAppointments = useCallback(async () => {
    try {
      const { data } = await api.get('/appointments/mine', { params: { limit: 100 } });
      setAppointments(data.appointments || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not load your appointments'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAppointments(); }, [loadAppointments]);

  async function cancel(appointment) {
    if (!window.confirm('Cancel this appointment request?')) return;
    try {
      await api.patch(`/appointments/${appointment._id}/cancel`);
      toast.success('Appointment cancelled');
      await loadAppointments();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not cancel this appointment'));
    }
  }

  return (
    <div>
      <PageTitle eyebrow="Your care plan" title="My appointments" description="Review appointment requests and keep track of their status." action={<Link to="/patient/doctors"><Button>Find a doctor</Button></Link>} />
      {loading ? <div className="space-y-4">{[1, 2, 3].map((item) => <div key={item} className="h-36 animate-pulse rounded-3xl bg-slate-100" />)}</div>
        : appointments.length ? (
          <div className="space-y-4">
            {appointments.map((appointment) => {
              const doctor = appointment.doctorId;
              const name = doctor?.userId?.name || 'Clinic doctor';
              const canCancel = ['pending', 'approved'].includes(appointment.status);
              return (
                <SectionCard key={appointment._id} className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar name={name} src={doctor?.userId?.avatarUrl} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2"><h2 className="font-bold text-ink">{name}</h2><StatusBadge status={appointment.status} /></div>
                      <p className="mt-1 text-sm text-clinic-700">{doctor?.specialization || 'Doctor profile unavailable'}</p>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500"><span className="flex items-center gap-1.5"><CalendarDays size={14} />{formatDate(appointment.date)}</span><span className="flex items-center gap-1.5"><Clock3 size={14} />{appointment.timeSlot} UTC</span></div>
                      {appointment.symptoms && <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">{appointment.symptoms}</p>}
                      {appointment.notes && <p className="mt-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-600"><span className="font-semibold">Doctor’s note: </span>{appointment.notes}</p>}
                    </div>
                  </div>
                  {canCancel && <Button variant="secondary" className="shrink-0 text-rose-700 hover:border-rose-200 hover:bg-rose-50" onClick={() => cancel(appointment)}>Cancel appointment</Button>}
                </SectionCard>
              );
            })}
          </div>
        ) : <EmptyState icon={UserRound} title="No appointments yet" description="Once you book a visit, your appointment requests and their updates will appear here." action={<Link to="/patient/doctors"><Button>Browse doctors</Button></Link>} />}
    </div>
  );
}
