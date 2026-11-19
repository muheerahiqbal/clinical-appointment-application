import { useEffect, useState } from 'react';
import { CalendarClock, FileCheck2, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Avatar, Button, PageTitle, SectionCard } from '../../components/ui';
import { getErrorMessage } from '../../utils/format';

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const emptySlot = () => ({ dayOfWeek: 1, startTime: '09:00', endTime: '12:00' });

export default function DoctorProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', specialization: '', experience: 0, fees: 0, slotDurationMinutes: 30, availableSlots: [] });
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { updateUser } = useAuth();

  useEffect(() => {
    let active = true;
    api.get('/doctors/me/profile')
      .then(({ data }) => {
        if (!active) return;
        const doctor = data.doctor;
        setProfile(doctor);
        setForm({
          name: doctor.userId?.name || '',
          specialization: doctor.specialization || '',
          experience: doctor.experience ?? 0,
          fees: doctor.fees ?? 0,
          slotDurationMinutes: doctor.slotDurationMinutes || 30,
          availableSlots: doctor.availableSlots || []
        });
      })
      .catch((error) => { if (active) toast.error(getErrorMessage(error, 'Could not load your doctor profile')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  function updateSlot(index, key, value) {
    setForm((current) => ({
      ...current,
      availableSlots: current.availableSlots.map((slot, position) => position === index ? { ...slot, [key]: value } : slot)
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    const values = {
      name: form.name.trim(),
      specialization: form.specialization.trim(),
      experience: Number(form.experience),
      fees: Number(form.fees),
      slotDurationMinutes: Number(form.slotDurationMinutes),
      availableSlots: form.availableSlots.map((slot) => ({
        dayOfWeek: Number(slot.dayOfWeek),
        startTime: slot.startTime,
        endTime: slot.endTime
      }))
    };
    try {
      const { data } = await api.patch('/doctors/me/profile', values);
      setProfile(data.doctor);
      updateUser((current) => current ? { ...current, name: values.name } : current);
      if (certificate) {
        const body = new FormData();
        body.append('certificate', certificate);
        try {
          const result = await api.patch('/doctors/me/profile', body);
          setProfile(result.data.doctor);
          setCertificate(null);
          toast.success('Profile and certificate updated');
          return;
        } catch (error) {
          toast.error(`Profile saved, but certificate upload failed: ${getErrorMessage(error)}`);
          return;
        }
      }
      toast.success('Your doctor profile was updated');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not update your profile'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="h-64 animate-pulse rounded-3xl bg-slate-100" />;

  return (
    <div className="mx-auto max-w-4xl">
      <PageTitle eyebrow="Practice details" title="Doctor profile" description="Keep your public profile accurate and manage your weekly appointment availability." />
      <form className="space-y-6" onSubmit={handleSubmit}>
        <SectionCard>
          <div className="mb-6 flex items-center gap-4 border-b border-slate-100 pb-5">
            <Avatar size="lg" name={profile?.userId?.name || form.name} src={profile?.userId?.avatarUrl} />
            <div><h2 className="font-bold text-ink">{form.name || 'Your profile'}</h2><p className="mt-1 text-sm text-slate-500">{form.specialization || 'Add your specialization'}</p><p className="mt-2 text-xs text-amber-700">Profile photo uploads are currently available to patient accounts only.</p></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2"><span className="label">Display name</span><input className="field mt-2" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} minLength={2} maxLength={100} required /></label>
            <label className="block"><span className="label">Specialization</span><input className="field mt-2" value={form.specialization} onChange={(event) => setForm({ ...form, specialization: event.target.value })} maxLength={100} required /></label>
            <label className="block"><span className="label">Years of experience</span><input className="field mt-2" type="number" min="0" max="80" step="1" value={form.experience} onChange={(event) => setForm({ ...form, experience: event.target.value })} required /></label>
            <label className="block"><span className="label">Consultation fee ($)</span><input className="field mt-2" type="number" min="0" max="100000" step="0.01" value={form.fees} onChange={(event) => setForm({ ...form, fees: event.target.value })} required /></label>
            <label className="block"><span className="label">Appointment length (minutes)</span><input className="field mt-2" type="number" min="10" max="240" step="5" value={form.slotDurationMinutes} onChange={(event) => setForm({ ...form, slotDurationMinutes: event.target.value })} required /></label>
          </div>
          <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-slate-200 p-4 transition hover:border-clinic-300 hover:bg-clinic-50">
            <span className="rounded-xl bg-clinic-50 p-2.5 text-clinic-700"><FileCheck2 size={19} /></span>
            <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-700">Update medical certificate <span className="font-normal text-slate-400">· optional</span></span><span className="mt-1 block truncate text-xs text-slate-400">{certificate?.name || (profile?.certificateUrl ? 'A certificate has been uploaded' : 'PDF, JPEG, PNG or WebP; up to 5 MB')}</span></span>
            <input className="sr-only" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={(event) => setCertificate(event.target.files?.[0] || null)} />
          </label>
        </SectionCard>

        <SectionCard>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="flex items-center gap-2 text-lg font-bold text-ink"><CalendarClock size={20} className="text-clinic-700" /> Weekly availability</h2><p className="mt-1 text-sm text-slate-500">Times are interpreted as UTC by the appointment API.</p></div>
            <Button type="button" variant="secondary" onClick={() => setForm((current) => ({ ...current, availableSlots: [...current.availableSlots, emptySlot()] }))}><Plus size={16} /> Add time block</Button>
          </div>
          {form.availableSlots.length ? (
            <div className="space-y-3">
              {form.availableSlots.map((slot, index) => (
                <div key={`${index}-${slot.dayOfWeek}`} className="grid gap-3 rounded-2xl bg-slate-50 p-3 sm:grid-cols-[1.1fr_1fr_1fr_auto] sm:items-end">
                  <label><span className="label text-xs">Day</span><select className="field mt-1.5 bg-white" value={slot.dayOfWeek} onChange={(event) => updateSlot(index, 'dayOfWeek', Number(event.target.value))}>{weekdays.map((day, value) => <option key={day} value={value}>{day}</option>)}</select></label>
                  <label><span className="label text-xs">Start</span><input className="field mt-1.5 bg-white" type="time" value={slot.startTime} onChange={(event) => updateSlot(index, 'startTime', event.target.value)} required /></label>
                  <label><span className="label text-xs">End</span><input className="field mt-1.5 bg-white" type="time" value={slot.endTime} onChange={(event) => updateSlot(index, 'endTime', event.target.value)} required /></label>
                  <button type="button" aria-label="Remove availability block" onClick={() => setForm((current) => ({ ...current, availableSlots: current.availableSlots.filter((_, position) => position !== index) }))} className="flex h-11 items-center justify-center rounded-xl px-3 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={17} /></button>
                </div>
              ))}
            </div>
          ) : <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">No weekly availability yet. Add a time block so patients can request appointments.</p>}
        </SectionCard>
        <div className="flex justify-end"><Button type="submit" disabled={saving}>{saving ? 'Saving changes…' : 'Save profile'}</Button></div>
      </form>
    </div>
  );
}
