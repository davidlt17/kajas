import { useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

const QRCodeScanner = ({ onResult, onError, torch = false }) => {
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const isScanning = useRef(true);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;
    let mounted = true;
    
    const startScanner = async () => {
      // Small delay to ensure previous instances are cleaned up
      await new Promise(resolve => setTimeout(resolve, 300));
      if (!mounted) return;

      try {
        const videoInputDevices = await codeReader.listVideoInputDevices();
        if (!mounted) return;

        if (videoInputDevices.length === 0) {
          throw new Error('No hay dispositivos de video disponibles');
        }

        // Try to find a back camera
        const backCamera = videoInputDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('trasera') ||
          device.label.toLowerCase().includes('environment')
        );
        
        const deviceId = backCamera ? backCamera.deviceId : videoInputDevices[0].deviceId;

        // Use standard constraints first for faster startup
        await codeReader.decodeFromVideoDevice(deviceId, videoRef.current, (result, err) => {
          if (result && isScanning.current && mounted) {
            isScanning.current = false;
            onResult(result.getText());
          }
        });
      } catch (err) {
        if (mounted) {
          console.error('Error al iniciar el escáner:', err);
          if (onError) onError(err);
        }
      }
    };

    startScanner();

    return () => {
      mounted = false;
      isScanning.current = false;
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, [onResult, onError]);

  // Handle Torch (Flashlight)
  useEffect(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const track = videoRef.current.srcObject.getVideoTracks()[0];
      if (track && track.getCapabilities && track.getCapabilities().torch) {
        track.applyConstraints({
          advanced: [{ torch: torch }]
        }).catch(err => console.error('Error al aplicar antorcha:', err));
      }
    }
  }, [torch]);

  return (
    <video 
      ref={videoRef} 
      className="w-full h-full object-cover rounded-3xl" 
      playsInline
      muted
    />
  );
};

export default QRCodeScanner;

