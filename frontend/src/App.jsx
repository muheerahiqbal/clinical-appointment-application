import { Link, Route, Routes } from 'react-router-dom';
import { ArrowLeft, HeartPulse } from 'lucide-react';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { Button } from './components/ui';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BrowseDoctors from './pages/patient/BrowseDoctors';
import BookAppointment from './pages/patient/BookAppointment';
import MyAppointments from './pages/patient/MyAppointments';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorProfile from './pages/doctor/DoctorProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageDoctors from './pages/admin/ManageDoctors';
import ManageUsers from './pages/admin/ManageUsers';

function NotFound() {
  return (
    <div className="mx-auto flex min-h-[55vh] max-w-lg flex-col items-center justify-center text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-clinic-50 text-clinic-700"><HeartPulse size={28} /></span>
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-clinic-700">Page not found</p>
      <h1 className="mt-2 text-3xl font-bold text-ink">This page took a wrong turn.</h1>
      <p className="mt-3 text-sm leading-6 text-slate-500">The link may have changed, or the page may no longer be here.</p>
      <Link to="/" className="mt-6"><Button variant="secondary"><ArrowLeft size={16} /> Return home</Button></Link>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        <Route element={<ProtectedRoute roles={['patient']} />}>
          <Route path="patient/doctors" element={<BrowseDoctors />} />
          <Route path="patient/book/:doctorId?" element={<BookAppointment />} />
          <Route path="patient/appointments" element={<MyAppointments />} />
        </Route>

        <Route element={<ProtectedRoute roles={['doctor']} />}>
          <Route path="doctor" element={<DoctorDashboard />} />
          <Route path="doctor/profile" element={<DoctorProfile />} />
        </Route>

        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/doctors" element={<ManageDoctors />} />
          <Route path="admin/users" element={<ManageUsers />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
