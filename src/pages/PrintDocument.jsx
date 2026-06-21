import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const formatThaiDateFull = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    return `${d.getDate()} ${months[d.getMonth()]} พ.ศ. ${d.getFullYear() + 543}`;
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
      <div className="print-actions no-print" style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button className="btn btn-primary" onClick={() => window.print()} style={{ fontSize: '16px', padding: '10px 20px' }}>🖨️ พิมพ์หน้านี้ / บันทึกเป็น PDF</button>
        <button className="btn btn-outline" onClick={() => window.close()} style={{ marginLeft: '10px', fontSize: '16px', padding: '10px 20px', background: 'white' }}>❌ ปิดหน้าต่าง</button>
      </div>

      <div className="print-page" style={{
        backgroundColor: 'white',
        width: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
        padding: '12mm 15mm',
        boxSizing: 'border-box',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        fontFamily: "'Sarabun', 'Sarabun New', 'Kanit', sans-serif",
        color: 'black',
        fontSize: '15px',
        lineHeight: '1.5'
      }}>
        {/* Header */}
        <div className="text-center mb-4" style={{ textAlign: 'center', marginBottom: '15px' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>แบบขออนุญาตใช้รถราชการส่วนกลาง</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>โรงเรียนบางปลาม้า “สูงสุมารผดุงวิทย์”</div>
        </div>

        <div className="text-right mb-4" style={{ textAlign: 'right', marginBottom: '15px', paddingRight: '20px' }}>
          เขียน วันที่ <span style={{ padding: '0 10px' }}>{formatThaiDateFull(data.CreatedDate || new Date().toISOString())}</span>
        </div>

        <div style={{ textIndent: '40px', textAlign: 'justify', marginBottom: '15px' }}>
          ข้าพเจ้า <span style={{ borderBottom: '1px dotted #000', padding: '0 5px' }}>{data.BookerName || ''}</span> 
          &nbsp;ตำแหน่ง <span style={{ borderBottom: '1px dotted #000', padding: '0 5px' }}>{data.BookerPosition || '.................................'}</span> 
          &nbsp;ขออนุญาตใช้รถยนต์ไปราชการเรื่อง <span style={{ borderBottom: '1px dotted #000', padding: '0 5px' }}>{data.Subject || ''}</span>
          &nbsp;สถานที่ <span style={{ borderBottom: '1px dotted #000', padding: '0 5px' }}>{data.Destination || ''}</span> 
          &nbsp;อำเภอ <span style={{ borderBottom: '1px dotted #000', padding: '0 5px' }}>{data.Amphur || '.....................'}</span> 
          &nbsp;จังหวัด <span style={{ borderBottom: '1px dotted #000', padding: '0 5px' }}>{data.Province || '.....................'}</span>
          &nbsp;ตั้งแต่วันที่ <span style={{ borderBottom: '1px dotted #000', padding: '0 5px' }}>{formatThaiDateFull(data.StartDate)}</span> 
          &nbsp;เวลา <span style={{ borderBottom: '1px dotted #000', padding: '0 5px' }}>{formatThaiTime(data.StartTime)} น.</span> 
          &nbsp;และ/ถึง วันที่ <span style={{ borderBottom: '1px dotted #000', padding: '0 5px' }}>{formatThaiDateFull(data.EndDate)}</span> 
          &nbsp;เวลา <span style={{ borderBottom: '1px dotted #000', padding: '0 5px' }}>{formatThaiTime(data.EndTime)} น.</span> 
          &nbsp;รวมเวลาที่ขอใช้รถราชการจำนวน <span style={{ borderBottom: '1px dotted #000', padding: '0 5px' }}>{data.TotalDays !== undefined ? data.TotalDays : ''}</span> วัน
          &nbsp;โดยมีผู้โดยสาร ข้าพเจ้าและบุคลากรทางการศึกษา จำนวนรวม <span style={{ borderBottom: '1px dotted #000', padding: '0 5px' }}>{data.TeacherCount !== undefined ? data.TeacherCount : '0'}</span> คน 
          นักเรียนจำนวนรวม <span style={{ borderBottom: '1px dotted #000', padding: '0 5px' }}>{data.StudentCount !== undefined ? data.StudentCount : '0'}</span> คน มีรายชื่อดังต่อไปนี้
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 20px', paddingLeft: '40px', marginBottom: '15px' }}>
          {[...Array(10)].map((_, i) => (
            <div key={i}>{i + 1}. <span style={{ borderBottom: getPassengerName(i) ? '1px dotted #000' : 'none', display: 'inline-block', minWidth: '200px' }}>{getPassengerName(i)}</span></div>
          ))}
        </div>

        <div style={{ textIndent: '40px', marginBottom: '20px' }}>
          จึงเรียนมาเพื่อโปรดทราบและพิจารณา
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
          <div style={{ textAlign: 'center', width: '250px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <span>ลงชื่อ</span>
              <div style={{ height: '40px', width: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {data.SignatureBase64 ? (
                  <img src={data.SignatureBase64} alt="Signature" style={{ maxHeight: '40px', maxWidth: '120px', objectFit: 'contain' }} />
                ) : (
                  <span style={{ borderBottom: '1px dotted #000', width: '100%', display: 'inline-block' }}></span>
                )}
              </div>
            </div>
            <div style={{ marginTop: '5px' }}>( <span style={{ padding: '0 5px' }}>{data.BookerName || '.......................................'}</span> )</div>
            <div style={{ marginTop: '5px' }}>ผู้ขออนุญาติใช้รถ</div>
          </div>
        </div>

        {data.LessPassengerReason && (
          <div style={{ marginBottom: '15px' }}>
            กรณีมีผู้โดยสารไม่ถึง 3 คน มีความจำเป็นใช้รถเนื่องจาก <span style={{ borderBottom: '1px dotted #000', padding: '0 10px' }}>{data.LessPassengerReason}</span>
          </div>
        )}

        <div style={{ borderBottom: '1px solid #ddd', margin: '10px 0' }}></div>

        {/* Admin Section */}
        <div style={{ marginBottom: '10px' }}>
          <div>ความเห็นของหัวหน้างาน/เจ้าหน้าที่งานยานพาหนะ</div>
          <div style={{ margin: '5px 0' }}>
            (&nbsp;&nbsp;&nbsp;) เห็นสมควรอนุญาติ &nbsp;&nbsp;&nbsp; (&nbsp;&nbsp;&nbsp;) เพื่อโปรดพิจารณาสั่งการ &nbsp;&nbsp;&nbsp; (&nbsp;&nbsp;&nbsp;) อื่นๆ ........................................
          </div>
          <div style={{ marginBottom: '5px' }}>................................................................................................................................</div>
          <div>
            รถยนต์หมายเลขทะเบียน <span style={{ borderBottom: '1px dotted #000', padding: '0 10px' }}>{data.VehicleReg || '........................'}</span> &nbsp;
            โดยให้ผู้ขับคือ <span style={{ borderBottom: '1px dotted #000', padding: '0 10px' }}>{data.DriverName || '........................'}</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
          <div style={{ textAlign: 'center', width: '250px' }}>
            <div style={{ marginTop: '5px' }}>ลงชื่อ .......................................................</div>
            <div style={{ marginTop: '5px' }}>(นายชัยยุทธ สุขหาญ)</div>
            <div style={{ marginTop: '5px' }}>เจ้าหน้าที่งานยานพาหนะ</div>
          </div>
        </div>

        <div style={{ borderBottom: '1px solid #ddd', margin: '10px 0' }}></div>

        {/* Side-by-side Director Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
          <div style={{ width: '48%' }}>
            <div style={{ marginBottom: '5px' }}>ความเห็นของรองผู้อำนวยการกลุ่มบริหารทั่วไป</div>
            <div style={{ marginBottom: '5px' }}>1. ทราบ</div>
            <div style={{ marginBottom: '15px' }}>2. .........................................................................</div>
            
            <div style={{ textAlign: 'center' }}>
              <div>ลงชื่อ .......................................................</div>
              <div style={{ marginTop: '5px' }}>(นายกิตติ ชุ่มชื่นดี)</div>
              <div style={{ marginTop: '5px' }}>รองผู้อำนวยการกลุ่มบริหารทั่วไป</div>
            </div>
          </div>
          
          <div style={{ width: '48%' }}>
            <div style={{ marginBottom: '5px' }}>ความเห็นผู้อำนวยการโรงเรียน</div>
            <div style={{ marginBottom: '5px' }}>1. (&nbsp;&nbsp;&nbsp;) อนุญาต &nbsp;&nbsp;&nbsp; (&nbsp;&nbsp;&nbsp;) ไม่อนุญาต</div>
            <div style={{ marginBottom: '15px' }}>2. .........................................................................</div>
            
            <div style={{ textAlign: 'center' }}>
              <div>ลงชื่อ .......................................................</div>
              <div style={{ marginTop: '5px' }}>(นางสุคนธ์ ตีรวัฒนประภา)</div>
              <div style={{ marginTop: '5px' }}>ผู้อำนวยการโรงเรียนบางปลาม้า “สูงสุมารผดุงวิทย์”</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
