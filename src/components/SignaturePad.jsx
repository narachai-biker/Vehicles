import React, { useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';

function SignaturePad({ onEnd }) {
  const sigPad = useRef({});
  const wrapperRef = useRef(null);

  const resizeCanvas = () => {
    if (sigPad.current && wrapperRef.current) {
      const canvas = sigPad.current.getCanvas();
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = wrapperRef.current.offsetWidth * ratio;
      canvas.height = wrapperRef.current.offsetHeight * ratio;
      canvas.getContext("2d").scale(ratio, ratio);
      sigPad.current.clear();
      onEnd('');
    }
  };

  useEffect(() => {
    window.addEventListener("resize", resizeCanvas);
    setTimeout(resizeCanvas, 100); 
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

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
      onEnd('error-or-placeholder');
    }
  };

  return (
    <div className="signature-wrapper">
      <div 
        ref={wrapperRef}
        className="signature-container" 
        style={{ border: '2px dashed #cbd5e1', backgroundColor: '#f8fafc', borderRadius: '0.5rem', overflow: 'hidden', height: '200px', width: '100%' }}
      >
        <SignatureCanvas 
          ref={sigPad}
          penColor="black"
          canvasProps={{
            className: 'sigCanvas',
            style: { width: '100%', height: '100%', cursor: 'crosshair', display: 'block' }
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
