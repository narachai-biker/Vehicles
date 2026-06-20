import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, MapPin, Users, ChevronLeft, ChevronRight, Car, Info } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO } from 'date-fns';
import { th } from 'date-fns/locale';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyc2ztHJk2OrY6miuLOzAHlOvPZRnWEoGEzBsxJJkmsrHPqm-A8O0eS3v1xgeGPJLOQCQ/exec';

const vehicleColors = {
  'นข 750 สุพรรณบุรี': '#10B981',  // Green
  'นข 5678 สุพรรณบุรี': '#3B82F6', // Blue
  'นข 4334 สุพรรณบุรี': '#F59E0B', // Orange
  'default': '#6B7280'
};

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;
  try {
    const d = new Date(timeStr);
    if (!isNaN(d)) return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' });
  } catch (e) {}
  return timeStr;
};

const isMatchDate = (dateString, targetDateObj) => {
  if (!dateString) return false;
  
  let d;
  const str = String(dateString);
  if (str.includes('T')) {
    d = new Date(str);
  } else {
    d = new Date(str.replace(/-/g, '/'));
  }
  
  if (isNaN(d)) return false;
  
  return d.getFullYear() === targetDateObj.getFullYear() &&
         d.getMonth() === targetDateObj.getMonth() &&
         d.getDate() === targetDateObj.getDate();
};

function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetch(`${SCRIPT_URL}?action=getBookings`)
      .then(r => r.json())
      .then(res => {
        if (res.status === 'success' && res.data) {
          // Fetch all bookings to show in the side panel
          const trips = res.data.map(b => ({
            id: b.BookingID,
            date: b.StartDate,
            time: `${formatTime(b.StartTime)} - ${formatTime(b.EndTime)}`,
            dest: b.Destination,
            van: b.VehicleReg || 'ไม่ระบุรถ',
            driver: b.DriverName || 'ไม่ระบุคนขับ',
            driverPhone: b.DriverPhone || '',
            bookerName: b.BookerName || 'ไม่ระบุ',
            bookerPhone: b.BookerPhone || '',
            status: b.Status || 'Pending',
            rejectReason: b.RejectReason || ''
          }));
          setUpcomingTrips(trips);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Calendar fetch error:", err);
        setLoading(false);
      });
  }, []);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="btn btn-outline" style={{ padding: '0.5rem', border: 'none' }}>
          <ChevronLeft size={24} />
        </button>
        <h3 className="m-0 text-xl font-bold">
          {format(currentDate, 'MMMM yyyy', { locale: th })}
        </h3>
        <button onClick={nextMonth} className="btn btn-outline" style={{ padding: '0.5rem', border: 'none' }}>
          <ChevronRight size={24} />
        </button>
      </div>
    );
  };

  const renderDaysOfWeek = () => {
    const days = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
        {days.map((day, i) => (
          <div key={i} className="text-center font-bold text-sm text-muted py-2">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        
        // Find trips for this day to show dot indicators
        const dayTrips = upcomingTrips.filter(t => isMatchDate(t.date, cloneDay));
        // Show car dots for all trips. Pending trips will use the default color.
        const uniqueVans = [...new Set(dayTrips.map(t => t.van))];

        const isSelected = isSameDay(day, selectedDate);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());

        days.push(
          <div
            key={day.toISOString()}
            onClick={() => setSelectedDate(cloneDay)}
            style={{
              aspectRatio: '1 / 1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingTop: '4px',
              cursor: 'pointer',
              borderRadius: '0.5rem',
              backgroundColor: !isSelected && isToday ? 'var(--primary-light)' : 'transparent',
              color: !isCurrentMonth ? '#9ca3af' : 'var(--text-main)',
              border: '1px solid transparent',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.backgroundColor = isToday ? 'var(--primary-light)' : 'transparent';
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '28px', height: '28px', borderRadius: '50%',
              backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
              color: isSelected ? '#fff' : (isToday ? 'var(--primary)' : 'inherit'),
              fontSize: '1.1rem', fontWeight: isToday || isSelected ? 'bold' : 'normal'
            }}>
              {formattedDate}
            </div>
            {/* Icons indicator for trips */}
            {uniqueVans.length > 0 && (
              <div style={{ display: 'flex', gap: '2px', marginTop: '2px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {uniqueVans.map((van, idx) => (
                  <Car 
                    key={idx} 
                    size={14}
                    color={vehicleColors[van] || vehicleColors['default']} 
                  />
                ))}
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toISOString()} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  const selectedDayTrips = upcomingTrips.filter(t => isMatchDate(t.date, selectedDate));
  selectedDayTrips.sort((a, b) => a.time.localeCompare(b.time)); // Sort by time

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div className="flex justify-between items-center">
        <h2><CalendarIcon className="inline mr-2" /> ดูตารางการเดินรถ</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: '1.5rem', alignItems: 'start' }} className="calendar-layout">
        
        {/* Left Side: Interactive Calendar */}
        <div className="card" style={{ padding: '2rem' }}>
          {renderHeader()}
          {renderDaysOfWeek()}
          {renderCells()}
          
          <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
            <p className="text-sm text-muted mb-2"><Info size={14} className="inline mr-1" /> สัญลักษณ์สีของรถตู้:</p>
            <div className="flex gap-4 text-sm justify-center flex-wrap">
              {Object.keys(vehicleColors).filter(k => k !== 'default').map(van => (
                <span key={van} className="flex items-center gap-1">
                  <Car size={16} color={vehicleColors[van]} />
                  {van.split(' ')[1]} {van.split(' ')[2]}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Details for Selected Day */}
        <div className="card" style={{ padding: '2rem', backgroundColor: 'var(--bg-main)', border: 'none', boxShadow: 'none' }}>
          <h3 className="mb-4 flex items-center gap-2 text-xl">
            <Clock size={20} className="text-primary" /> 
            คิวรถวันที่ {format(selectedDate, 'd MMMM yyyy', { locale: th })}
          </h3>
          
          <div style={{ display: selectedDayTrips.length === 0 ? 'block' : 'none' }}>
            <div className="card text-center" style={{ padding: '3rem 1rem', border: '1px dashed var(--border-color)', boxShadow: 'none' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                <Car size={48} style={{ margin: '0 auto', opacity: 0.3 }} />
              </div>
              <p className="text-muted">ไม่มีคิวจองรถในวันนี้</p>
              <p className="text-sm mt-2 text-primary">รถตู้ทุกคันว่างสำหรับจอง!</p>
            </div>
          </div>

          <div style={{ display: selectedDayTrips.length > 0 ? 'block' : 'none' }}>
            <div className="grid gap-4">
              {selectedDayTrips.map((trip, index) => {
                let borderColor = vehicleColors[trip.van] || vehicleColors['default'];
                let statusBadge = '';
                
                if (trip.status === 'Pending') {
                  borderColor = '#F59E0B'; // Yellow/Orange
                  statusBadge = <span className="badge badge-warning text-xs">รอพิจารณา</span>;
                } else if (trip.status === 'Rejected') {
                  borderColor = '#DC2626'; // Red
                  statusBadge = <span className="badge badge-danger text-xs">ไม่อนุมัติ</span>;
                } else {
                  statusBadge = <span className="badge badge-approved text-xs">อนุมัติแล้ว</span>;
                }

                return (
                <div key={`${trip.id}-${index}`} className="card" draggable={false} style={{ padding: '1.5rem', border: `2px solid ${borderColor}`, userSelect: 'text' }}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 style={{ margin: 0, color: borderColor, fontSize: '1.1rem' }}>
                       {trip.time} น.
                    </h4>
                    {statusBadge}
                  </div>
                  
                  {trip.status === 'Approved' && (
                    <div className="mb-3 font-bold" style={{ color: vehicleColors[trip.van] }}>{trip.van}</div>
                  )}

                  <div className="grid gap-2 text-sm text-muted">
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="mt-0.5" /> 
                      <span><strong>ไปที่:</strong> {trip.dest}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users size={16} className="mt-0.5" /> 
                      <span><strong>ผู้จอง:</strong> {trip.bookerName} {trip.bookerPhone ? `(โทร: ${trip.bookerPhone})` : ''}</span>
                    </div>
                    {trip.status === 'Approved' ? (
                      <div className="flex items-start gap-2">
                        <Users size={16} className="mt-0.5" /> 
                        <span><strong>คนขับ:</strong> {trip.driver} {trip.driverPhone ? `(โทร: ${trip.driverPhone})` : ''}</span>
                      </div>
                    ) : trip.status === 'Rejected' ? (
                      <div className="flex items-start gap-2 text-danger">
                        <Info size={16} className="mt-0.5" /> 
                        <span><strong>เหตุผล:</strong> {trip.rejectReason}</span>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 text-warning">
                        <Info size={16} className="mt-0.5" /> 
                        <span>รอแอดมินจัดสรรรถและคนขับ</span>
                      </div>
                    )}
                  </div>
                </div>
              )})}
            </div>
          </div>
        </div>
      </div>
      
      {/* Add a style tag for responsive grid collapse if needed */}
      <style>{`
        @media (max-width: 768px) {
          .calendar-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default CalendarView;
