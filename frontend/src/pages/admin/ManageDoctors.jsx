import { useCallback, useEffect, useState } from 'react';
import { BadgeCheck, ExternalLink, FileCheck2, Stethoscope, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { Avatar, Button, EmptyState, PageTitle, SectionCard } from '../../components/ui';
import { formatDate, getErrorMessage } from '../../utils/format';

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const loadDoctors = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/doctors', { params: { approved: false, limit: 100 } });
      setDoctors(data.doctors || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not load doctor applications'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDoctors(); }, [loadDoctors]);

  async function approve(doctor) {
    setBusyId(doctor._id);
    try {
      await api.patch(`/admin/doctors/${doctor._id}/verification`, { approved: true });
      toast.success(`${doctor.userId?.name || 'Doctor'} is now verified`);
      await loadDoctors();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not verify this doctor'));
    } finally {
      setBusyId(null);
    }
  }

  async function rejectAndRemove(doctor) {
    const name = doctor.userId?.name || 'this doctor';
    if (!window.confirm(`The backend has no rejected application status. Rejecting will permanently remove ${name} and their clinic appointments. Continue?`)) return;
    setBusyId(doctor._id);
    try {
      await api.delete(`/admin/doctors/${doctor._id}`);
      toast.success('Doctor application and account removed');
      await loadDoctors();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not remove this doctor'));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <PageTitle eyebrow="Credential review" title="Doctor applications" description="Review each doctor's details and submitted certificate before granting verified status." />
      {loading ? <div className="space-y-4">{[1, 2].map((item) => <div key={item} className="h-48 animate-pulse rounded-3xl bg-slate-100" />)}</div>
        : doctors.length ? (
          <div className="space-y-4">
            {doctors.map((doctor) => (
              <SectionCard key={doctor._id}>
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar name={doctor.userId?.name || 'Doctor'} src={doctor.userId?.avatarUrl} />
                    <div className="min-w-0">
                      <h2 className="text-lg font-bold text-ink">{doctor.userId?.name || 'Doctor profile'}</h2>
                      <p className="mt-1 text-sm font-medium text-clinic-700">{doctor.specialization}</p>
                      <p className="mt-2 text-sm text-slate-500">{doctor.userId?.email || 'No email'} · {doctor.experience} years’ experience · ${doctor.fees} consultation</p>
                      <p className="mt-1 text-xs text-slate-400">Registered {formatDate(doctor.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {doctor.certificateUrl ? <a href={doctor.certificateUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><FileCheck2 size={16} /> View certificate <ExternalLink size={14} /></a> : <span className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-800">No certificate attached</span>}
                    <Button variant="secondary" disabled={busyId === doctor._id} onClick={() => rejectAndRemove(doctor)} className="text-rose-700 hover:border-rose-200 hover:bg-rose-50"><Trash2 size={15} /> Reject &amp; remove</Button>
                    <Button disabled={busyId === doctor._id} onClick={() => approve(doctor)}><BadgeCheck size={16} /> Verify doctor</Button>
                  </div>
                </div>
              </SectionCard>
            ))}
            <p className="text-xs leading-5 text-slate-400">This backend stores verification as a boolean, not a rejected state. “Reject &amp; remove” permanently deletes the doctor account and linked appointments.</p>
          </div>
        ) : <EmptyState icon={Stethoscope} title="No applications to review" description="New doctor registrations will appear here until they have been verified." />}
    </div>
  );
}
