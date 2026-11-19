import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { DoctorCard, EmptyState, PageTitle } from '../../components/ui';
import { getErrorMessage } from '../../utils/format';

export default function BrowseDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [specialization, setSpecialization] = useState('');
  const [nameSearch, setNameSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      setLoading(true);
      api.get('/doctors', { params: { specialization: specialization.trim() || undefined, limit: 100 } })
        .then(({ data }) => { if (active) setDoctors(data.doctors || []); })
        .catch((error) => { if (active) toast.error(getErrorMessage(error, 'Could not load doctors')); })
        .finally(() => { if (active) setLoading(false); });
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [specialization]);

  const filteredDoctors = useMemo(() => doctors.filter((doctor) => (
    (doctor.userId?.name || '').toLowerCase().includes(nameSearch.trim().toLowerCase())
  )), [doctors, nameSearch]);

  return (
    <div>
      <PageTitle eyebrow="Find your care team" title="Browse verified doctors" description="Explore clinic-approved specialists and choose a time that works for you." />
      <div className="mb-7 grid gap-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:grid-cols-[1fr_0.8fr] sm:p-5">
        <label className="relative block">
          <span className="sr-only">Search doctors by name</span>
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="field pl-10" placeholder="Search by doctor name" value={nameSearch} onChange={(event) => setNameSearch(event.target.value)} />
        </label>
        <label className="relative block">
          <span className="sr-only">Filter by specialization</span>
          <SlidersHorizontal size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="field pl-10" placeholder="Filter by specialization" value={specialization} onChange={(event) => setSpecialization(event.target.value)} />
        </label>
      </div>
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-56 animate-pulse rounded-3xl bg-slate-100" />)}</div>
      ) : filteredDoctors.length ? (
        <>
          <p className="mb-4 text-sm text-slate-500">{filteredDoctors.length} verified {filteredDoctors.length === 1 ? 'doctor' : 'doctors'}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDoctors.map((doctor) => <DoctorCard key={doctor._id} doctor={doctor} onBook={(item) => navigate(`/patient/book/${item._id}`)} />)}
          </div>
        </>
      ) : (
        <EmptyState icon={Stethoscope} title="No doctors found" description="Only clinic-approved doctors appear in search. Doctors awaiting admin verification won't be listed yet; try another name or specialization." />
      )}
    </div>
  );
}
