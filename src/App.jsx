import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Car, Calendar, Search, ShieldCheck } from 'lucide-react';

import BookingForm from './pages/BookingForm';
import CalendarView from './pages/CalendarView';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import PrintDocument from './pages/PrintDocument';

function Header() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');
  const isPrintPath = location.pathname.startsWith('/print');

  if (isPrintPath) return null;

  return (
    <header className="header-glass">
      <div className="header-content">
        <Link to="/" className="brand">
          <Car size={28} />
          <span>ระบบงานยานพาหนะ</span>
        </Link>
        <nav className="flex gap-4 items-center">
          {!isAdminPath ? (
            <>
              <Link to="/admin" className="btn btn-outline" style={{ border: 'none', opacity: 0.7 }}>
                <ShieldCheck size={18} /> แอดมิน
              </Link>
              <Link to="/" className="btn btn-outline" style={{ border: 'none' }}>
                <Calendar size={18} /> ปฏิทินรถ
              </Link>
              <Link to="/book" className="btn btn-primary">จองรถ</Link>
            </>
          ) : (
            <>
              <Link to="/" className="btn btn-outline" style={{ border: 'none', fontSize: '0.9rem' }}>
                กลับหน้าหลัก
              </Link>
              <span className="badge badge-approved" style={{ display: 'flex', gap: '4px' }}>
                <ShieldCheck size={16} /> Admin Mode
              </span>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<CalendarView />} />
            <Route path="/book" element={<BookingForm />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/print" element={<PrintDocument />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
