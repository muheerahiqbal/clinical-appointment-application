import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, Clock3, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { Avatar, Button, PageTitle, SectionCard } from '../../components/ui';
import { getErrorMessage } from '../../utils/format';

function timeToMinutes(value) {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function getAvailableTimes(doctor, date) {
  if (!doctor || !date) return [];
  const dayOfWeek = new Date(`${date}T00:00:00.000Z`).getUTCDay();
  const duration = doctor.slotDurationMinutes || 30;
  return (doctor.availableSlots || [])
    .filter((slot) => slot.dayOfWeek === dayOfWeek)
    .flatMap((slot) => {
      const start = timeToMinutes(slot.startTime);
      const end = timeToMinutes(slot.endTime);
      const times = [];
      for (let minute = start; minute + duration <= end; minute += duration) {
        times.push(`${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`);
      }
      return times;
    })
    .filter((time) => {
      if (date !== new Date().toISOString().slice(0, 10)) return true;
      const now = new Date();
      return timeToMinutes(time) > now.getUTCHours() * 60 + now.getUTCMinutes();
    });
}

export default function BookAppointment() {
  const { doctorId } = useParams();
  const [doctors, setDoctors] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    api.get('/doctors', { params: { limit: 100 } })
      .then(({ data }) => {
        if (!active) return;
        const items = data.doctors || [];
        setDoctors(items);
        const selected = doctorId ? items.find((item) => item._id === doctorId) : null;
        setDoctor(selected || null);
      })
      .catch((error) => { if (active) toast.error(getErrorMessage(error, 'Could not load verified doctors')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [doctorId]);

  const times = useMemo(() => getAvailableTimes(doctor, date), [doctor, date]);

  useEffect(() => {
    setTimeSlot((current) => times.includes(current) ? current : times[0] || '');
  }, [times]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!doctor) return toast.error('Choose a doctor before continuing');
    setSubmitting(true);
    try {
      await api.post('/appointments', { doctorId: doctor._id, date, timeSlot, symptoms: symptoms.trim() });
      toast.success('Appointment request sent to the doctor');
      navigate('/patient/appointments');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not book this appointment'));
    } finally {
      setSubmitting(false);
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-4xl">
      <PageTitle eyebrow="Schedule a visit" title="Book an appointment" description="Choose a verified doctor, then pick an available time from their weekly schedule." />
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionCard className="h-fit">
          <h2 className="mb-4 text-lg font-bold text-ink">Your doctor</h2>
          {doctor ? (
            <div className="flex items-center gap-3 rounded-2xl bg-clinic-50 p-4">
              <Avatar name={doctor.userId?.name} src={doctor.userId?.avatarUrl} />
              <div className="min-w-0"><p className="truncate font-semibold text-ink">{doctor.userId?.name || 'Clinic doctor'}</p><p className="mt-1 text-sm text-clinic-700">{doctor.specialization}</p><p className="mt-1 text-xs text-slate-500">${doctor.fees} · {doctor.experience} years’ experience</p></div>
            </div>
          ) : (
            <label className="block"><span className="label">Choose a verified doctor</span><select className="field mt-2" value="" onChange={(event) => setDoctor(doctors.find((item) => item._id === event.target.value) || null)} disabled={loading} required><option value="">Select a doctor</option>{doctors.map((item) => <option key={item._id} value={item._id}>{item.userId?.name || 'Doctor'} — {item.specialization}</option>)}</select></label>
          )}
          {doctor && <button className="mt-4 text-sm font-semibold text-clinic-700 hover:text-clinic-800" onClick={() => navigate('/patient/doctors')}>Choose a different doctor</button>}
          <div className="mt-6 border-t border-slate-100 pt-5 text-sm text-slate-500"><p className="flex items-center gap-2"><Stethoscope size={16} className="text-clinic-700" /> Appointment requests need doctor approval.</p></div>
        </SectionCard>

        <SectionCard>
          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block"><span className="label">Appointment date</span><span className="relative mt-2 block"><CalendarDays size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input className="field pl-10" type="date" min={today} value={date} onChange={(event) => setDate(event.target.value)} required /></span></label>
            <label className="block"><span className="label">Available time</span><span className="relative mt-2 block"><Clock3 size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><select className="field pl-10" value={timeSlot} onChange={(event) => setTimeSlot(event.target.value)} disabled={!date || !times.length} required><option value="">{!date ? 'Choose a date first' : times.length ? 'Select an available time' : 'No times available for this date'}</option>{times.map((time) => <option key={time} value={time}>{time}</option>)}</select></span></label>
            <label className="block"><span className="label">What would you like the doctor to know?</span><textarea className="field mt-2 min-h-32 resize-y py-3" maxLength={2000} placeholder="Briefly describe your symptoms or reason for the visit" value={symptoms} onChange={(event) => setSymptoms(event.target.value)} required /><span className="mt-1 block text-right text-xs text-slate-400">{symptoms.length}/2000</span></label>
            <Button className="w-full" type="submit" disabled={submitting || !doctor || !times.length}>{submitting ? 'Sending request…' : 'Request appointment'}</Button>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}
