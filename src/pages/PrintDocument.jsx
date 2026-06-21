import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const formatThaiDateFull = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    return `วันที่ ${d.getDate()} ${months[d.getMonth()]} พ.ศ. ${d.getFullYear() + 543}`;
  } catch(e) {
    return dateStr;
  }
};

const formatThaiTime = (timeStr) => {
  if (!timeStr) return '';
  if (timeStr.includes('T')) {
    const d = new Date(timeStr);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}.${m}`;
  }
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    return `${String(parts[0]).padStart(2, '0')}.${String(parts[1]).padStart(2, '0')}`;
  }
  return timeStr;
};

export default function PrintDocument() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedData = localStorage.getItem('printData');
    if (storedData) {
      setData(JSON.parse(storedData));
      // Optional: Auto-print after 500ms
      setTimeout(() => {
        window.print();
      }, 500);
    } else {
      navigate('/admin');
    }
  }, [navigate]);

  if (!data) return <div>Loading...</div>;

  let passengers = [];
  if (Array.isArray(data.Passengers)) {
    passengers = data.Passengers;
  } else if (typeof data.Passengers === 'string') {
    passengers = data.Passengers.split(',');
  }

  const getPassengerName = (index) => passengers[index] ? passengers[index].trim() : '';

  return (
    <div className="print-container" style={{ backgroundColor: '#e5e7eb', minHeight: '100vh', padding: '20px 0' }}>
      {/* Hide this print button when printing via CSS */}
      <div className="print-actions no-print" style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button className="btn btn-primary" onClick={() => window.print()} style={{ fontSize: '16px', padding: '10px 20px' }}>🖨️ พิมพ์หน้านี้ / บันทึกเป็น PDF</button>
        <button className="btn btn-outline" onClick={() => window.close()} style={{ marginLeft: '10px', fontSize: '16px', padding: '10px 20px', background: 'white' }}>❌ ปิดหน้าต่าง</button>
      </div>

      <div className="print-page" style={{
        backgroundColor: 'white',
        width: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
        padding: '20mm',
        boxSizing: 'border-box',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        fontFamily: "'Sarabun', 'Sarabun New', 'Kanit', sans-serif",
        color: 'black'
      }}>
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="font-bold" style={{ fontSize: '24px', marginBottom: '10px', textAlign: 'center' }}>บันทึกข้อความ</h1>
        </div>

        <div className="flex justify-between mb-2" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div><strong style={{fontSize: '18px'}}>ส่วนราชการ</strong> <span style={{ borderBottom: '1px dotted #000', padding: '0 10px' }}>โรงเรียน....................................................................</span></div>
        </div>
        <div className="flex justify-between mb-6" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div><strong style={{fontSize: '18px'}}>ที่</strong> .......................................................</div>
          <div><strong style={{fontSize: '18px'}}>วันที่</strong> <span style={{ borderBottom: '1px dotted #000', padding: '0 10px' }}>{formatThaiDateFull(data.CreatedDate || new Date().toISOString())}</span></div>
        </div>

        <div className="mb-6" style={{ marginBottom: '20px' }}>
          <strong style={{fontSize: '18px'}}>เรื่อง</strong> ขออนุญาตใช้รถยนต์ไปราชการ
        </div>

        <div className="mb-6" style={{ marginBottom: '20px' }}>
          <strong style={{fontSize: '18px'}}>เรียน</strong> ผู้อำนวยการโรงเรียน.................................................
        </div>

        <div className="mb-4" style={{ textIndent: '40px', lineHeight: '1.8', marginBottom: '10px', fontSize: '16px' }}>
          ข้าพเจ้า <span style={{ borderBottom: '1px dotted #000', padding: '0 10px' }}>{data.BookerName || ''}</span> 
          &nbsp;ตำแหน่ง <span style={{ borderBottom: '1px dotted #000', padding: '0 10px' }}>{data.BookerPosition || '.................................'}</span> 
          &nbsp;ขออนุญาตใช้รถยนต์ไปราชการเรื่อง <span style={{ borderBottom: '1px dotted #000', padding: '0 10px' }}>{data.Subject || ''}</span>
        </div>

        <div className="mb-4" style={{ lineHeight: '1.8', marginBottom: '10px', fontSize: '16px' }}>
          สถานที่ไปราชการ <span style={{ borderBottom: '1px dotted #000', padding: '0 10px' }}>{data.Destination || ''}</span> 
          &nbsp;อำเภอ <span style={{ borderBottom: '1px dotted #000', padding: '0 10px' }}>{data.Amphur || '.....................'}</span> 
          &nbsp;จังหวัด <span style={{ borderBottom: '1px dotted #000', padding: '0 10px' }}>{data.Province || '.....................'}</span>
        </div>

        <div className="mb-4" style={{ lineHeight: '1.8', marginBottom: '10px', fontSize: '16px' }}>
          ในวันที่ <span style={{ borderBottom: '1px dotted #000', padding: '0 10px' }}>{formatThaiDateFull(data.StartDate)}</span> 
          &nbsp;เวลา <span style={{ borderBottom: '1px dotted #000', padding: '0 10px' }}>{formatThaiTime(data.StartTime)} น.</span> 
          &nbsp;ถึงวันที่ <span style={{ borderBottom: '1px dotted #000', padding: '0 10px' }}>{formatThaiDateFull(data.EndDate)}</span> 
          &nbsp;เวลา <span style={{ borderBottom: '1px dotted #000', padding: '0 10px' }}>{formatThaiTime(data.EndTime)} น.</span> 
          &nbsp;รวมเวลาที่ขอใช้รถราชการ จำนวน <span style={{ borderBottom: '1px dotted #000', padding: '0 10px' }}>{data.TotalDays !== undefined ? data.TotalDays : ''}</span> วัน
        </div>

        <div className="mb-2" style={{ lineHeight: '1.8', marginBottom: '10px', fontSize: '16px' }}>
          โดยมีผู้โดยสาร ข้าพเจ้าและบุคลากรทางการศึกษา จำนวนรวม <span style={{ borderBottom: '1px dotted #000', padding: '0 10px' }}>{data.TeacherCount !== undefined ? data.TeacherCount : '0'}</span> คน 
          นักเรียนจำนวนรวม <span style={{ borderBottom: '1px dotted #000', padding: '0 10px' }}>{data.StudentCount !== undefined ? data.StudentCount : '0'}</span> คน มีรายชื่อดังต่อไปนี้
        </div>

        <div className="grid grid-cols-2 gap-x-8 mb-6 pl-10" style={{ lineHeight: '1.8', marginBottom: '20px', paddingLeft: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: '16px' }}>
          {[...Array(10)].map((_, i) => (
            <div key={i}>{i + 1}. <span style={{ borderBottom: getPassengerName(i) ? '1px dotted #000' : 'none', minWidth: '150px', display: 'inline-block' }}>{getPassengerName(i)}</span></div>
          ))}
        </div>

        {data.LessPassengerReason && (
          <div className="mb-6" style={{ lineHeight: '1.8', marginBottom: '20px', fontSize: '16px' }}>
            <strong>เหตุผลกรณีผู้โดยสารไม่ถึง 3 คน:</strong> <span style={{ borderBottom: '1px dotted #000', padding: '0 10px' }}>{data.LessPassengerReason}</span>
          </div>
        )}

        <div className="mb-8" style={{ textIndent: '40px', marginBottom: '30px', fontSize: '16px' }}>
          จึงเรียนมาเพื่อโปรดพิจารณา
        </div>

        <div className="flex flex-col items-center mb-8" style={{ marginLeft: '50%', textAlign: 'center', fontSize: '16px' }}>
          {data.SignatureBase64 ? (
            <img src={data.SignatureBase64} alt="Signature" style={{ height: '50px', marginBottom: '5px' }} />
          ) : (
            <div style={{ height: '50px' }}></div>
          )}
          <div>(ลงชื่อ) .......................................................</div>
          <div className="mt-2">( <span style={{ borderBottom: '1px dotted #000', padding: '0 10px' }}>{data.BookerName || ''}</span> )</div>
          <div className="mt-2">ตำแหน่ง <span style={{ borderBottom: '1px dotted #000', padding: '0 10px' }}>{data.BookerPosition || '.................................'}</span></div>
        </div>

        <hr style={{ borderTop: '1px dashed #000', margin: '20px 0' }} />

        <div className="mb-4" style={{ fontSize: '16px', marginBottom: '10px' }}>
          <strong>ความเห็นของเจ้าหน้าที่:</strong> เห็นควรจัดรถหมายเลขทะเบียน <span style={{ borderBottom: '1px dotted #000', padding: '0 10px' }}>{data.VehicleReg || ''}</span> 
          &nbsp;พนักงานขับรถ <span style={{ borderBottom: '1px dotted #000', padding: '0 10px' }}>{data.DriverName || ''}</span>
        </div>

        <div className="flex justify-end mb-8" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', fontSize: '16px' }}>
          <div className="text-center" style={{ textAlign: 'center' }}>
            <div style={{ height: '40px' }}></div>
            <div>(ลงชื่อ) ....................................................... เจ้าหน้าที่</div>
          </div>
        </div>

        <hr style={{ borderTop: '1px dashed #000', margin: '20px 0' }} />

        {/* Side-by-side signature blocks for Director and Deputy Director */}
        <div className="flex justify-between" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', fontSize: '16px' }}>
          <div className="text-center" style={{ width: '48%', textAlign: 'center' }}>
            <div className="text-left mb-6" style={{ textAlign: 'left', marginBottom: '20px' }}>ความเห็นรองผู้อำนวยการ: .......................................</div>
            <div style={{ height: '40px' }}></div>
            <div>(ลงชื่อ) .......................................................</div>
            <div className="mt-2">( ....................................................... )</div>
            <div className="mt-2">รองผู้อำนวยการ</div>
          </div>
          
          <div className="text-center" style={{ width: '48%', textAlign: 'center' }}>
            <div className="text-left mb-6" style={{ textAlign: 'left', marginBottom: '20px' }}>คำสั่งผู้อำนวยการ: &nbsp;&nbsp;[ &nbsp; ] อนุมัติ &nbsp;&nbsp;[ &nbsp; ] ไม่อนุมัติ</div>
            <div style={{ height: '40px' }}></div>
            <div>(ลงชื่อ) .......................................................</div>
            <div className="mt-2">( ....................................................... )</div>
            <div className="mt-2">ผู้อำนวยการโรงเรียน</div>
          </div>
        </div>

      </div>
    </div>
  );
}
