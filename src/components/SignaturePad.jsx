import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

function SignaturePad({ onEnd }) {
  const sigPad = useRef({});

  const clear = () => {
    sigPad.current.clear();
    onEnd('');
  };

  const handleEnd = () => {
    try {
      if (sigPad.current.isEmpty()) {
        onEnd('');
        return;
      }
      const dataURL = sigPad.current.getCanvas().toDataURL('image/png');
      onEnd(dataURL);
    } catch (e) {
      console.error("Signature error:", e);
      // Fallback
      onEnd('error-or-placeholder');
    }
  };

  return (
    <div className="signature-wrapper">
      <div className="signature-container" style={{ border: '2px dashed #cbd5e1', backgroundColor: '#f8fafc', borderRadius: '0.5rem', overflow: 'hidden' }}>
        <SignatureCanvas 
          ref={sigPad}
          penColor="black"
          canvasProps={{
            width: 500, 
            height: 200, 
            className: 'sigCanvas',
            style: { width: '100%', height: '200px', cursor: 'crosshair' }
          }}
          onEnd={handleEnd}
        />
      </div>
      <button 
        type="button" 
        onClick={clear} 
        className="btn btn-outline mt-2 text-sm"
        style={{ padding: '0.25rem 0.5rem' }}
      >
        ล้างลายเซ็น
      </button>
    </div>
  );
}

export default SignaturePad;
