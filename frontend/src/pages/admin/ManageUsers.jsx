import { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Stethoscope, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { Avatar, Button, EmptyState, PageTitle, SectionCard, StatusBadge } from '../../components/ui';
import { formatDate, getErrorMessage } from '../../utils/format';

const tabs = [
  { id: 'patients', label: 'Patients', icon: Users },
  { id: 'doctors', label: 'Doctors', icon: Stethoscope },
  { id: 'appointments', label: 'Appointments', icon: CalendarDays }
];

export default function ManageUsers() {
  const [tab, setTab] = useState('patients');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const loadRows = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = { patients: '/admin/patients', doctors: '/admin/doctors', appointments: '/admin/appointments' }[tab];
      const { data } = await api.get(endpoint, { params: { limit: 100 } });
      const listKey = { patients: 'patients', doctors: 'doctors', appointments: 'appointments' }[tab];
      setRows(data[listKey] || []);
    } catch (error) {
      toast.error(getErrorMessage(error, `Could not load ${tab}`));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { loadRows(); }, [loadRows]);

  async function remove(row) {
    const doctor = tab === 'doctors';
    const name = doctor ? row.userId?.name : row.name;
    const message = doctor
      ? `Permanently delete ${name || 'this doctor'}, their account, and all their appointments?`
      : `Permanently delete ${name || 'this patient'} and their appointment history?`;
    if (!window.confirm(message)) return;
    setBusyId(row._id);
    try {
      await api.delete(`/admin/${tab}/${row._id}`);
      toast.success(`${doctor ? 'Doctor' : 'Patient'} removed`);
      await loadRows();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not delete this account'));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <PageTitle eyebrow="Clinic directory" title="Manage the clinic" description="View patient and doctor accounts or monitor appointments across the clinic." />
      <div className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-slate-100 bg-white p-2 shadow-sm" role="tablist" aria-label="Clinic records">
        {tabs.map(({ id, label, icon: Icon }) => <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`inline-flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition ${tab === id ? 'bg-clinic-700 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-ink'}`}><Icon size={16} />{label}</button>)}
      </div>
      {loading ? <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-24 animate-pulse rounded-3xl bg-slate-100" />)}</div>
        : rows.length ? (
          <div className="space-y-3">
            {tab === 'patients' && rows.map((patient) => (
              <SectionCard key={patient._id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3"><Avatar name={patient.name} src={patient.avatarUrl} size="sm" /><div><h2 className="font-semibold text-ink">{patient.name}</h2><p className="mt-1 text-sm text-slate-500">{patient.email} · joined {formatDate(patient.createdAt)}</p></div></div>
                <Button variant="danger" disabled={busyId === patient._id} onClick={() => remove(patient)}><Trash2 size={15} /> Delete patient</Button>
              </SectionCard>
            ))}
            {tab === 'doctors' && rows.map((doctor) => (
              <SectionCard key={doctor._id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3"><Avatar name={doctor.userId?.name || 'Doctor'} src={doctor.userId?.avatarUrl} size="sm" /><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-ink">{doctor.userId?.name || 'Doctor'}</h2><StatusBadge status={doctor.isApproved ? 'approved' : 'pending'} /></div><p className="mt-1 text-sm text-slate-500">{doctor.specialization} · {doctor.userId?.email}</p></div></div>
                <Button variant="danger" disabled={busyId === doctor._id} onClick={() => remove(doctor)}><Trash2 size={15} /> Delete doctor</Button>
              </SectionCard>
            ))}
            {tab === 'appointments' && rows.map((appointment) => (
              <SectionCard key={appointment._id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-ink">{appointment.patientId?.name || 'Patient'} <span className="font-normal text-slate-400">with</span> {appointment.doctorId?.userId?.name || 'Doctor'}</h2><StatusBadge status={appointment.status} /></div><p className="mt-1 text-sm text-slate-500">{appointment.doctorId?.specialization || 'Specialty unavailable'} · {formatDate(appointment.date)} at {appointment.timeSlot} UTC</p></div>
                <p className="text-xs text-slate-400">{appointment.patientId?.email || ''}</p>
              </SectionCard>
            ))}
          </div>
        ) : <EmptyState icon={tab === 'patients' ? Users : tab === 'doctors' ? Stethoscope : CalendarDays} title={`No ${tab} found`} description="There are no records in this view yet." />}
    </div>
  );
}
