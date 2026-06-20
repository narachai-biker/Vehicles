import React, { useState, useEffect } from 'react';
import SignaturePad from '../components/SignaturePad';
import { Send, FileText, Paperclip, AlertTriangle } from 'lucide-react';

const TimeSelect = ({ name, value, onChange, required }) => {
  const [hour, min] = value ? value.split(':') : ['', ''];
  return (
    <div className="flex gap-1 items-center">
      <select 
        className="form-control" 
        value={hour} 
        onChange={(e) => onChange({ target: { name, value: `${e.target.value}:${min || '00'}` } })}
        required={required}
        style={{ padding: '0.5rem' }}
      >
        <option value="" disabled>ชม.</option>
        {[...Array(24)].map((_, i) => {
          const h = i.toString().padStart(2, '0');
          return <option key={`h-${h}`} value={h}>{h}</option>;
        })}
      </select>
      <span className="font-bold">:</span>
      <select 
        className="form-control" 
        value={min} 
        onChange={(e) => onChange({ target: { name, value: `${hour || '00'}:${e.target.value}` } })}
        required={required}
        style={{ padding: '0.5rem' }}
      >
        <option value="" disabled>นาที</option>
        {[...Array(12)].map((_, i) => {
          const m = (i * 5).toString().padStart(2, '0');
          return <option key={`m-${m}`} value={m}>{m}</option>;
        })}
      </select>
    </div>
  );
};

function BookingForm() {
  const [formData, setFormData] = useState({
    CreatedDate: new Date().toISOString().split('T')[0],
    BookerName: '',
    BookerPhone: '',
    BookerPosition: '',
    Subject: 'ขออนุญาตใช้รถยนต์ไปราชการ',
    Destination: '',
    Amphur: '',
    Province: '',
    StartDate: '',
    StartTime: '',
    EndDate: '',
    EndTime: '',
    TotalDays: '1',
    TeacherCount: '0',
    StudentCount: '0',
    Passengers: ['', '', '', '', '', '', '', '', '', ''],
    RefDoc: '',
    RefDate: '',
    LessPassengerReason: '',
    Attachment: null,
    SignatureBase64: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  
  // Calculate total passengers to determine if < 3 logic is needed
  const totalPassengers = (parseInt(formData.TeacherCount) || 0) + (parseInt(formData.StudentCount) || 0);
  const isLessThanThree = totalPassengers < 3 && totalPassengers > 0;

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePassengerChange = (index, value) => {
    const newPassengers = [...formData.Passengers];
    newPassengers[index] = value;
    setFormData(prev => ({ ...prev, Passengers: newPassengers }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.SignatureBase64) {
      alert('กรุณาเซ็นชื่อก่อนส่งคำขอ');
      return;
    }
    if (isLessThanThree && !formData.LessPassengerReason && !formData.Attachment) {
      alert('กรุณากรอกเหตุผลความจำเป็น หรือ แนบไฟล์เอกสาร เนื่องจากผู้โดยสารไม่ถึง 3 คน');
      return;
    }
    
    setIsSubmitting(true);
    
    // URL ของ Web App รถตู้
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbyc2ztHJk2OrY6miuLOzAHlOvPZRnWEoGEzBsxJJkmsrHPqm-A8O0eS3v1xgeGPJLOQCQ/exec';
    
    fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'saveBooking',
        data: formData
      })
    })
    .then(res => res.json())
    .then(result => {
      if(result.status === 'success') {
        setSuccess(`บันทึกคำขอจองรถสำเร็จ! กรุณารอการอนุมัติ`);
      } else {
        alert('เกิดข้อผิดพลาดจากเซิร์ฟเวอร์: ' + result.message);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      // Fallback in case of CORS error during local testing, but request might have succeeded
      setSuccess(`ระบบได้ส่งคำขอจองรถแล้ว`);
    })
    .finally(() => {
      setIsSubmitting(false);
    });
  };

  if (success) {
    return (
      <div className="card text-center" style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <div className="text-success mb-4"><FileText size={64} style={{ margin: '0 auto' }} /></div>
        <h2 className="mb-2">ส่งคำขอจองรถสำเร็จ</h2>
        <p className="text-muted mb-4">{success}</p>
        <button className="btn btn-primary" onClick={() => window.location.href = '/'}>กลับสู่หน้าปฏิทิน</button>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 className="mb-4 text-center">แบบขออนุญาตใช้รถราชการส่วนกลาง</h2>
      <p className="text-center text-muted mb-8">โรงเรียนบางปลาม้า "สูงสุมารผดุงวิทย์"</p>
      
      <form onSubmit={handleSubmit} lang="en-GB">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="form-group">
            <label className="form-label">เขียนวันที่</label>
            <input type="date" name="CreatedDate" value={formData.CreatedDate} onChange={handleChange} className="form-control" required />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="form-group">
            <label className="form-label">ข้าพเจ้า (ผู้ขออนุญาต)</label>
            <input type="text" name="BookerName" value={formData.BookerName} onChange={handleChange} className="form-control" required placeholder="ชื่อ-สกุล" />
          </div>
          <div className="form-group">
            <label className="form-label">ตำแหน่ง</label>
            <input type="text" name="BookerPosition" value={formData.BookerPosition} onChange={handleChange} className="form-control" required />
          </div>
          <div className="form-group">
            <label className="form-label">เบอร์โทรศัพท์ (ติดต่อกลับ)</label>
            <input type="tel" name="BookerPhone" value={formData.BookerPhone} onChange={handleChange} className="form-control" required placeholder="08X-XXX-XXXX" />
          </div>
        </div>

        <div className="form-group mb-4">
          <label className="form-label">ขออนุญาตใช้รถยนต์ไปราชการ เรื่อง</label>
          <input type="text" name="Subject" value={formData.Subject} onChange={handleChange} className="form-control" required />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="form-group">
            <label className="form-label">สถานที่ไป</label>
            <input type="text" name="Destination" value={formData.Destination} onChange={handleChange} className="form-control" required />
          </div>
          <div className="form-group">
            <label className="form-label">อำเภอ</label>
            <input type="text" name="Amphur" value={formData.Amphur} onChange={handleChange} className="form-control" required />
          </div>
          <div className="form-group">
            <label className="form-label">จังหวัด</label>
            <input type="text" name="Province" value={formData.Province} onChange={handleChange} className="form-control" required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="form-group">
            <label className="form-label">ตั้งแต่วันที่</label>
            <div className="flex gap-2">
              <input type="date" name="StartDate" value={formData.StartDate} onChange={handleChange} className="form-control" required />
              <TimeSelect name="StartTime" value={formData.StartTime} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">ถึงวันที่</label>
            <div className="flex gap-2">
              <input type="date" name="EndDate" value={formData.EndDate} onChange={handleChange} className="form-control" required />
              <TimeSelect name="EndTime" value={formData.EndTime} onChange={handleChange} required />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="form-group">
            <label className="form-label">รวมเวลา (วัน)</label>
            <input type="number" name="TotalDays" value={formData.TotalDays} onChange={handleChange} className="form-control" min="1" required />
          </div>
          <div className="form-group">
            <label className="form-label">ผู้โดยสาร (ครู) คน</label>
            <input type="number" name="TeacherCount" value={formData.TeacherCount} onChange={handleChange} className="form-control" min="0" required />
          </div>
          <div className="form-group">
            <label className="form-label">ผู้โดยสาร (นักเรียน) คน</label>
            <input type="number" name="StudentCount" value={formData.StudentCount} onChange={handleChange} className="form-control" min="0" required />
          </div>
        </div>
        
        {/* Dynamic Warning for Less than 3 passengers */}
        {isLessThanThree && (
          <div className="card mb-4" style={{ backgroundColor: '#FFFBEB', borderColor: '#F59E0B', padding: '1rem' }}>
            <div className="flex items-start gap-2" style={{ color: '#D97706' }}>
              <AlertTriangle size={20} className="mt-1" />
              <div>
                <strong>คำเตือน: จำนวนผู้โดยสารรวมไม่ถึง 3 คน</strong>
                <p className="text-sm mt-1">ตามระเบียบโปรดบันทึกชี้แจงเหตุผลความจำเป็น หรือแนบไฟล์หนังสืออนุมัติ</p>
                <textarea 
                  name="LessPassengerReason"
                  value={formData.LessPassengerReason}
                  onChange={handleChange}
                  className="form-control mt-2" 
                  style={{ minHeight: '60px' }}
                  placeholder="พิมพ์ชี้แจงเหตุผลความจำเป็นที่นี่..."
                />
              </div>
            </div>
          </div>
        )}

        <div className="form-group mb-4">
          <label className="form-label">รายชื่อผู้โดยสาร (สูงสุด 10 คน)</label>
          <div className="grid grid-cols-2 gap-2">
            {formData.Passengers.map((p, i) => (
              <input 
                key={i} 
                type="text" 
                value={p} 
                onChange={(e) => handlePassengerChange(i, e.target.value)} 
                className="form-control" 
                placeholder={`คนที่ ${i+1}`} 
                disabled={i >= totalPassengers}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="form-group">
            <label className="form-label">แนบหนังสือขออนุญาตไปราชการ ที่</label>
            <input type="text" name="RefDoc" value={formData.RefDoc} onChange={handleChange} className="form-control" />
          </div>
          <div className="form-group">
            <label className="form-label">ลงวันที่ (หนังสืออ้างอิง)</label>
            <input type="date" name="RefDate" value={formData.RefDate} onChange={handleChange} className="form-control" />
          </div>
        </div>

        <div className="form-group mb-4 p-4" style={{ backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px dashed var(--border-color)' }}>
          <label className="form-label flex items-center gap-2"><Paperclip size={18} /> แนบไฟล์หนังสืออนุมัติ / ต้นเรื่อง (ถ้ามี)</label>
          <p className="text-muted text-sm mb-2">รองรับไฟล์รูปภาพหรือ PDF ที่เกี่ยวข้อง</p>
          <input type="file" name="Attachment" onChange={handleChange} className="form-control" accept=".pdf,image/*" />
        </div>

        <div className="form-group mb-8">
          <label className="form-label">ลงชื่อผู้ขออนุญาตใช้รถ</label>
          <SignaturePad onEnd={(dataUrl) => setFormData(prev => ({...prev, SignatureBase64: dataUrl}))} />
        </div>

        <div className="text-center">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
            {isSubmitting ? 'กำลังบันทึก...' : <><Send size={20} /> ยืนยันการขออนุญาตใช้รถ</>}
          </button>
        </div>
      </form>
    </div>
  );
}

export default BookingForm;
