import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Inbox, Car, Users, Check, X, FileDown, RefreshCw, Wrench, UserX, Edit, Trash2, Search } from 'lucide-react';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyc2ztHJk2OrY6miuLOzAHlOvPZRnWEoGEzBsxJJkmsrHPqm-A8O0eS3v1xgeGPJLOQCQ/exec';

const formatTime = (timeStr) => {
  if (!timeStr) return '00:00';
  if (timeStr.includes('T')) {
    const date = new Date(timeStr);
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    const h = String(parts[0]).padStart(2, '0');
    const m = String(parts[1]).padStart(2, '0');
    return `${h}:${m}`;
  }
  return timeStr;
};

const formatThaiDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  } catch {
    return dateString;
  }
};

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inbox');
  const [loading, setLoading] = useState(true);
  
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (localStorage.getItem('isAdmin') !== 'true') {
      navigate('/admin/login');
    } else {
      fetchData();
    }
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vehRes, drvRes, bkgRes] = await Promise.all([
        fetch(`${SCRIPT_URL}?action=getVehicles`).then(r => r.json()),
        fetch(`${SCRIPT_URL}?action=getDrivers`).then(r => r.json()),
        fetch(`${SCRIPT_URL}?action=getBookings`).then(r => r.json())
      ]);
      
      if(vehRes.status === 'success') setVehicles(vehRes.data || []);
      if(drvRes.status === 'success') setDrivers(drvRes.data || []);
      if(bkgRes.status === 'success') setBookings(bkgRes.data || []);
    } catch (e) {
      console.error('Error fetching data:', e);
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/');
  };

  const pendingBookings = bookings.filter(b => b.Status === 'Pending' || !b.Status);

  const handleApprove = async (booking, e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const vehicle = formData.get('vehicle');
    const driver = formData.get('driver');
    const endDate = formData.get('endDate') || booking.EndDate;
    const endTime = formData.get('endTime') || booking.EndTime;
    
    if(!window.confirm(`ยืนยันการจัดสรรรถให้ ${booking.BookerName} ?`)) return;

    const selectedDriver = drivers.find(d => d.Name === driver);
    const driverPhone = selectedDriver ? selectedDriver.Phone : '';

    setBookings(prev => prev.map(b => b.BookingID === booking.BookingID ? {...b, Status: 'Approved', VehicleReg: vehicle, DriverName: driver, DriverPhone: driverPhone, EndDate: endDate, EndTime: endTime} : b));
    setEditingId(null);
    
    try {
      const updatedData = { ...booking, Status: 'Approved', VehicleReg: vehicle, DriverName: driver, DriverPhone: driverPhone, ApprovedBy: 'Admin', EndDate: endDate, EndTime: endTime };
      await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'updateBookingStatus', data: updatedData })
      });
      alert(`บันทึกข้อมูลเรียบร้อยแล้ว!`);
    } catch(err) {
      alert('เกิดข้อผิดพลาดในการบันทึก กรุณารีเฟรชหน้าเว็บ');
      fetchData(); 
    }
  };

  const handleReject = async (booking) => {
    const reason = window.prompt("กรุณาระบุเหตุผลที่ไม่อนุมัติ:");
    if (reason !== null) {
      setBookings(prev => prev.map(b => b.BookingID === booking.BookingID ? {...b, Status: 'Rejected', RejectReason: reason} : b));
      try {
        const updatedData = { ...booking, Status: 'Rejected', RejectReason: reason };
        await fetch(SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'updateBookingStatus', data: updatedData })
        });
        alert(`ปฏิเสธการจองเรียบร้อยแล้ว`);
      } catch(err) {
        alert('เกิดข้อผิดพลาดในการบันทึก');
        fetchData();
      }
    }
  };

  const handleCancel = async (booking) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ที่จะยกเลิกคำขอของ ${booking.BookerName}? (การยกเลิกจะปลดล็อกคิวรถให้ว่างทันที)`)) {
      setBookings(prev => prev.map(b => b.BookingID === booking.BookingID ? {...b, Status: 'Cancelled'} : b));
      try {
        const updatedData = { ...booking, Status: 'Cancelled' };
        await fetch(SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'updateBookingStatus', data: updatedData })
        });
      } catch(err) {
        alert('เกิดข้อผิดพลาดในการบันทึก');
        fetchData();
      }
    }
  };

  const handleDownloadPdf = async (booking) => {
    try {
      alert('กำลังสร้างไฟล์ PDF กรุณารอสักครู่ (อาจใช้เวลาประมาณ 5-10 วินาที)...');
      const res = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'exportPdf', data: booking })
      }).then(r => r.json());
      
      if (res.status === 'success' && res.data && res.data.pdfUrl) {
        window.open(res.data.pdfUrl, '_blank');
      } else {
        alert('เกิดข้อผิดพลาดในการสร้าง PDF: ' + (res.message || JSON.stringify(res)));
      }
    } catch (err) {
      alert('ไม่สามารถติดต่อเซิร์ฟเวอร์ได้');
    }
  };

  const handleToggleVehicle = async (vehicle) => {
    const newStatus = vehicle.Status === 'Active' ? 'Maintenance' : 'Active';
    setVehicles(prev => prev.map(v => v.RegNumber === vehicle.RegNumber ? {...v, Status: newStatus} : v));
    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'updateVehicle', data: { ...vehicle, Status: newStatus } })
      });
    } catch(err) {
      alert('เกิดข้อผิดพลาดในการบันทึก');
      fetchData();
    }
  };

  const handleToggleDriver = async (driver) => {
    const newStatus = driver.Status === 'Active' ? 'On Leave' : 'Active';
    setDrivers(prev => prev.map(d => d.Name === driver.Name ? {...d, Status: newStatus} : d));
    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'updateDriver', data: { ...driver, Status: newStatus } })
      });
    } catch(err) {
      alert('เกิดข้อผิดพลาดในการบันทึก');
      fetchData();
    }
  };

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '1rem' }}>
      <div className="flex justify-between items-center mb-6">
        <h2>Dashboard การจัดการยานพาหนะ</h2>
        <div className="flex gap-2">
          <button onClick={fetchData} className="btn btn-outline text-sm flex items-center gap-2" style={{ padding: '0.25rem 0.75rem' }}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> รีเฟรชข้อมูล
          </button>
          <button onClick={logout} className="btn btn-outline text-sm" style={{ padding: '0.25rem 0.75rem' }}>ออกจากระบบ</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card text-center" style={{ padding: '1.5rem 1rem' }}>
          <div className="text-muted mb-2"><Inbox size={24} style={{ margin: '0 auto' }} /></div>
          <h3 style={{ fontSize: '2rem', margin: 0 }}>{pendingBookings.length}</h3>
          <p className="text-muted text-sm">รอการอนุมัติ</p>
        </div>
        <div className="card text-center" style={{ padding: '1.5rem 1rem' }}>
          <div className="text-muted mb-2"><Car size={24} style={{ margin: '0 auto' }} /></div>
          <h3 style={{ fontSize: '2rem', margin: 0 }}>{vehicles.length}</h3>
          <p className="text-muted text-sm">รถตู้ในระบบ</p>
        </div>
        <div className="card text-center" style={{ padding: '1.5rem 1rem' }}>
          <div className="text-muted mb-2"><Users size={24} style={{ margin: '0 auto' }} /></div>
          <h3 style={{ fontSize: '2rem', margin: 0 }}>{drivers.length}</h3>
          <p className="text-muted text-sm">พนักงานขับรถ</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        <button className={`btn ${activeTab === 'inbox' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('inbox')} style={{ border: 'none', whiteSpace: 'nowrap' }}>รออนุมัติ</button>
        <button className={`btn ${activeTab === 'approved' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('approved')} style={{ border: 'none', whiteSpace: 'nowrap' }}>ประวัติการจอง</button>
        <button className={`btn ${activeTab === 'vehicles' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('vehicles')} style={{ border: 'none', whiteSpace: 'nowrap' }}>จัดการรถ</button>
        <button className={`btn ${activeTab === 'drivers' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('drivers')} style={{ border: 'none', whiteSpace: 'nowrap' }}>จัดการคนขับ</button>
      </div>

      {activeTab === 'inbox' && (
        <div className="grid gap-4">
          {loading ? (
             <div className="card text-center text-muted" style={{ padding: '3rem' }}>กำลังโหลดข้อมูล...</div>
          ) : pendingBookings.length === 0 ? (
            <div className="card text-center text-muted" style={{ padding: '3rem' }}>ไม่มีรายการรออนุมัติ</div>
          ) : (
            pendingBookings.map(b => {
              const reqStartStr = `${b.StartDate}T${formatTime(b.StartTime)}`;
              const reqEndStr = `${b.EndDate}T${formatTime(b.EndTime)}`;
              const approvedBookings = bookings.filter(bk => bk.Status === 'Approved');
              const sameDayBookings = approvedBookings.filter(ab => ab.StartDate === b.StartDate);

              const isVehicleBusy = (regNum) => approvedBookings.some(ab => {
                if (ab.VehicleReg !== regNum) return false;
                const abStartStr = `${ab.StartDate}T${formatTime(ab.StartTime)}`;
                const abEndStr = `${ab.EndDate}T${formatTime(ab.EndTime)}`;
                return reqStartStr < abEndStr && reqEndStr > abStartStr;
              });
              const isDriverBusy = (driverName) => approvedBookings.some(ab => {
                if (ab.DriverName !== driverName) return false;
                const abStartStr = `${ab.StartDate}T${formatTime(ab.StartTime)}`;
                const abEndStr = `${ab.EndDate}T${formatTime(ab.EndTime)}`;
                return reqStartStr < abEndStr && reqEndStr > abStartStr;
              });

              return (
                <div key={b.BookingID} className="card" style={{ borderLeft: '4px solid var(--warning)', marginBottom: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="mb-2" style={{ color: 'var(--primary)' }}>{b.Destination} ({b.Province})</h3>
                      <p className="text-muted mb-1">
                        <strong>วันที่:</strong> {formatThaiDate(b.StartDate)} {formatTime(b.StartTime)} น. ถึง {formatThaiDate(b.EndDate)} {formatTime(b.EndTime)} น.
                      </p>
                      <p className="text-muted mb-1"><strong>ผู้จอง:</strong> {b.BookerName} (โทร: {b.BookerPhone || '-'})</p>
                      <p className="text-muted mb-1"><strong>เรื่อง:</strong> {b.Subject}</p>
                      {b.LessPassengerReason && <p className="text-danger mb-1"><strong>เหตุผลคนไม่ถึง 3 คน:</strong> {b.LessPassengerReason}</p>}
                      {b.RefDocUrl && <p className="mb-1"><a href={b.RefDocUrl} target="_blank" rel="noreferrer" style={{ color: '#3B82F6', textDecoration: 'underline' }}>📄 ดูเอกสารต้นเรื่อง/แนบ</a></p>}
                    </div>
                    <button type="button" onClick={() => handleDownloadPdf(b)} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', borderColor: '#3B82F6', color: '#3B82F6' }}>
                      <FileDown size={14} className="inline mr-1"/> ดราฟท์แบบฟอร์ม PDF
                    </button>
                  </div>

                  {/* Daily Summary */}
                  <div style={{ backgroundColor: '#F3F4F6', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                    <h4 className="text-sm mb-2" style={{ color: '#4B5563' }}>🗓️ คิวรถที่ถูกจองไปแล้วในวันที่ {formatThaiDate(b.StartDate)}</h4>
                    {sameDayBookings.length > 0 ? (
                      <ul className="text-sm" style={{ paddingLeft: '1rem', color: '#4B5563', margin: 0 }}>
                        {sameDayBookings.map(ab => (
                          <li key={ab.BookingID} style={{ marginBottom: '0.25rem' }}>
                            <strong>{ab.VehicleReg}</strong>: {formatTime(ab.StartTime)} - {formatTime(ab.EndTime)} น. ไป {ab.Destination} ({ab.DriverName})
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted mb-0">-- ว่างทุกคัน ไม่มีคิวรถในวันนี้ --</p>
                    )}
                  </div>
                  
                  <form onSubmit={(e) => handleApprove(b, e)} className="p-4" style={{ backgroundColor: '#F9FAFB', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                    <h4 className="mb-3">การจัดสรรรถและคนขับ</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="form-group mb-0">
                        <label className="form-label text-sm">เลือกรถตู้</label>
                        <select name="vehicle" className="form-control" required>
                          <option value="">-- กรุณาเลือก --</option>
                          {vehicles.filter(v => v.Status !== 'Maintenance').map(v => {
                            const busy = isVehicleBusy(v.RegNumber);
                            return (
                              <option key={v.RegNumber} value={v.RegNumber} disabled={busy}>
                                {v.RegNumber} ({v.Brand}) {busy ? '(ติดคิว)' : '✅ ว่าง'}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      <div className="form-group mb-0">
                        <label className="form-label text-sm">เลือกคนขับ</label>
                        <select name="driver" className="form-control" required>
                          <option value="">-- กรุณาเลือก --</option>
                          {drivers.filter(d => d.Status !== 'On Leave').map(d => {
                            const busy = isDriverBusy(d.Name);
                            return (
                              <option key={d.Name} value={d.Name} disabled={busy}>
                                {d.Name} {busy ? '(ติดคิว)' : '✅ ว่าง'}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end mt-4">
                      <button type="button" onClick={() => handleCancel(b)} className="btn btn-outline text-danger" style={{ borderColor: 'var(--danger)', marginRight: 'auto' }}><Trash2 size={16}/> ลบคำขอ/ยกเลิก</button>
                      <button type="button" onClick={() => handleReject(b)} className="btn btn-outline text-danger" style={{ borderColor: 'var(--danger)' }}><X size={16}/> ไม่อนุมัติ</button>
                      <button type="submit" className="btn btn-primary"><Check size={16}/> อนุมัติการจอง</button>
                    </div>
                  </form>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'approved' && (
        <div className="grid gap-4">
          <div className="relative mb-2">
            <Search className="absolute text-muted" size={18} style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อผู้จอง, สถานที่, ทะเบียนรถ, คนขับ หรือเดือน (เช่น มิ.ย.)..." 
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

           {bookings
             .filter(b => b.Status !== 'Pending' && b.Status)
             .filter(b => {
                if (!searchTerm) return true;
                const search = searchTerm.toLowerCase();
                const formattedDate = formatThaiDate(b.StartDate);
                return (
                  (b.BookerName && b.BookerName.toLowerCase().includes(search)) ||
                  (b.Destination && b.Destination.toLowerCase().includes(search)) ||
                  (b.VehicleReg && b.VehicleReg.toLowerCase().includes(search)) ||
                  (b.DriverName && b.DriverName.toLowerCase().includes(search)) ||
                  (formattedDate && formattedDate.includes(search)) ||
                  (b.Status && b.Status.toLowerCase().includes(search))
                );
             })
             .sort((a, b) => new Date(b.StartDate) - new Date(a.StartDate))
             .map(b => (
              <div key={b.BookingID} className="card" style={{ borderLeft: `4px solid ${b.Status === 'Approved' ? 'var(--success)' : b.Status === 'Cancelled' ? '#9ca3af' : 'var(--danger)'}` }}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="mb-2" style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>{b.Destination}</h4>
                    <p className="text-muted text-sm mb-1"><strong>ผู้จอง:</strong> {b.BookerName}</p>
                    <p className="text-muted text-sm mb-1">
                      <strong>วันที่:</strong> {formatThaiDate(b.StartDate)} {formatTime(b.StartTime)} - {formatThaiDate(b.EndDate)} {formatTime(b.EndTime)}
                    </p>
                    <p className="text-muted text-sm mb-1">สถานะ: <strong className={b.Status === 'Approved' ? 'text-success' : b.Status === 'Cancelled' ? 'text-muted' : 'text-danger'}>{b.Status}</strong></p>
                    {b.Status === 'Approved' && <p className="text-muted text-sm mb-1"><strong>รถ:</strong> {b.VehicleReg} | <strong>คนขับ:</strong> {b.DriverName}</p>}
                    {b.Status === 'Rejected' && <p className="text-muted text-sm mb-1"><strong>เหตุผลที่ปฏิเสธ:</strong> {b.RejectReason}</p>}
                    {b.RefDocUrl && <p className="text-sm mb-1"><a href={b.RefDocUrl} target="_blank" rel="noreferrer" style={{ color: '#3B82F6', textDecoration: 'underline' }}>📄 ดูเอกสารแนบ</a></p>}
                  </div>
                  {(b.Status === 'Approved' || b.Status === 'Rejected') && (
                    <div className="flex gap-2 flex-col items-end">
                      <button onClick={() => handleDownloadPdf(b)} className="btn btn-primary text-sm" style={{ padding: '0.25rem 0.5rem' }}><FileDown size={14} className="inline mr-1"/> พิมพ์ใบขออนุญาต (PDF)</button>
                      {b.Status === 'Approved' && (
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => setEditingId(editingId === b.BookingID ? null : b.BookingID)} className="btn btn-outline text-sm" style={{ padding: '0.25rem 0.5rem' }}><Edit size={14}/> แก้ไข/คืนรถ</button>
                          <button onClick={() => handleCancel(b)} className="btn btn-outline text-danger text-sm" style={{ padding: '0.25rem 0.5rem', borderColor: 'var(--danger)' }}><Trash2 size={14}/> ยกเลิก</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {editingId === b.BookingID && b.Status === 'Approved' && (
                  <form onSubmit={(e) => handleApprove(b, e)} className="mt-4 p-4" style={{ backgroundColor: '#F9FAFB', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                    <h5 className="mb-3 text-sm">แก้ไขการจัดสรรรถ หรือ คืนรถก่อนเวลา</h5>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="form-group mb-0">
                        <label className="form-label text-sm">เลือกรถตู้</label>
                        <select name="vehicle" className="form-control" defaultValue={b.VehicleReg} required>
                          {vehicles.map(v => (
                            <option key={v.RegNumber} value={v.RegNumber}>{v.RegNumber}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group mb-0">
                        <label className="form-label text-sm">เลือกคนขับ</label>
                        <select name="driver" className="form-control" defaultValue={b.DriverName} required>
                          {drivers.map(d => (
                            <option key={d.Name} value={d.Name}>{d.Name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="form-group mb-0">
                        <label className="form-label text-sm">วันสิ้นสุด</label>
                        <input type="date" name="endDate" className="form-control" defaultValue={b.EndDate} required />
                      </div>
                      <div className="form-group mb-0">
                        <label className="form-label text-sm">เวลาสิ้นสุด</label>
                        <input type="time" name="endTime" className="form-control" defaultValue={formatTime(b.EndTime)} required />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end mt-4">
                      <button type="button" onClick={() => setEditingId(null)} className="btn btn-outline">ยกเลิก</button>
                      <button type="submit" className="btn btn-primary"><Check size={16}/> บันทึกการแก้ไข</button>
                    </div>
                  </form>
                )}
              </div>
           ))}
        </div>
      )}

      {activeTab === 'vehicles' && (
        <div className="grid gap-4">
           {vehicles.map(v => (
              <div key={v.RegNumber} className="card flex justify-between items-center" style={{ borderLeft: `4px solid ${v.Status === 'Active' ? 'var(--success)' : 'var(--danger)'}` }}>
                <div>
                  <h4 className="mb-1 flex items-center gap-2"><Car size={18}/> {v.RegNumber} ({v.Brand})</h4>
                  <p className="text-muted text-sm">สถานะปัจจุบัน: <strong className={v.Status === 'Active' ? 'text-success' : 'text-danger'}>{v.Status === 'Active' ? 'พร้อมใช้งาน' : 'ซ่อมบำรุง'}</strong></p>
                </div>
                <button onClick={() => handleToggleVehicle(v)} className={`btn ${v.Status === 'Active' ? 'btn-outline text-danger' : 'btn-primary'}`} style={{ borderColor: v.Status === 'Active' ? 'var(--danger)' : '' }}>
                  {v.Status === 'Active' ? <><Wrench size={16} className="inline mr-1"/> แจ้งซ่อม</> : <><Check size={16} className="inline mr-1"/> พร้อมใช้งาน</>}
                </button>
              </div>
           ))}
        </div>
      )}

      {activeTab === 'drivers' && (
        <div className="grid gap-4">
           {drivers.map(d => (
              <div key={d.Name} className="card flex justify-between items-center" style={{ borderLeft: `4px solid ${d.Status === 'Active' ? 'var(--success)' : 'var(--danger)'}` }}>
                <div>
                  <h4 className="mb-1 flex items-center gap-2"><Users size={18}/> {d.Name}</h4>
                  <p className="text-muted text-sm">เบอร์โทร: {d.Phone || '-'}</p>
                  <p className="text-muted text-sm">สถานะปัจจุบัน: <strong className={d.Status === 'Active' ? 'text-success' : 'text-danger'}>{d.Status === 'Active' ? 'ทำงานปกติ' : 'ลางาน'}</strong></p>
                </div>
                <button onClick={() => handleToggleDriver(d)} className={`btn ${d.Status === 'Active' ? 'btn-outline text-danger' : 'btn-primary'}`} style={{ borderColor: d.Status === 'Active' ? 'var(--danger)' : '' }}>
                  {d.Status === 'Active' ? <><UserX size={16} className="inline mr-1"/> แจ้งลา</> : <><Check size={16} className="inline mr-1"/> กลับมาทำงาน</>}
                </button>
              </div>
           ))}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
