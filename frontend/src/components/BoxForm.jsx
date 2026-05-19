import { useState, useEffect, useRef } from 'react';
import { createBox, getLocations } from '../api';
import { useNotification } from './NotificationContext';
import { Camera, MapPin, Box, Type, FileText, Loader2, X, Package } from 'lucide-react';

const BoxForm = ({ onCreated }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ubicacion_id, setUbicacionId] = useState('');
  const [foto_url, setFotoUrl] = useState('');
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      showNotification('Por favor selecciona una imagen válida', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFotoUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    setShowCamera(true);
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError('No se pudo acceder a la cámara. Verifica los permisos.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64Img = canvas.toDataURL('image/jpeg');
    setFotoUrl(base64Img);
    stopCamera();
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    getLocations().then(res => setLocations(res.data));
  }, []);

  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await createBox({ nombre, descripcion, ubicacion_id, foto_url });
      showNotification('Caja creada correctamente', 'success');
      onCreated(response.data);
    } catch (error) {
      console.error(error);
      showNotification('Error al crear la caja', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-3xl shadow-cozy animate-slide-up">
      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
          <Type size={16} className="text-cozy-500" /> Nombre de la caja
        </label>
        <input
          required
          type="text"
          placeholder="Ej: Ropa de verano, Herramientas..."
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="input-cozy"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
          <MapPin size={16} className="text-cozy-500" /> Ubicación
        </label>
        <select
          value={ubicacion_id}
          onChange={(e) => setUbicacionId(e.target.value)}
          className="input-cozy appearance-none cursor-pointer"
        >
          <option value="">Selecciona un lugar...</option>
          {locations.map(loc => (
            <option key={loc.id} value={loc.id}>{loc.nombre}</option>
          ))}
          {locations.length === 0 && <option disabled>Cargando ubicaciones...</option>}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
          <FileText size={16} className="text-cozy-500" /> Descripción
        </label>
        <textarea
          placeholder="¿Qué hay dentro? (opcional)"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="input-cozy min-h-[100px] resize-none"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
          <Camera size={16} className="text-cozy-500" /> Portada de la caja (Opcional)
        </label>
        
        {showCamera ? (
          <div className="space-y-4 bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <div className="relative aspect-[4/3] bg-black rounded-2xl overflow-hidden shadow-inner border border-stone-200">
              {cameraError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-red-500 font-medium text-xs">
                  <span>{cameraError}</span>
                </div>
              ) : (
                <video 
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={stopCamera}
                className="flex-1 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded-xl transition-all text-xs"
              >
                Cancelar
              </button>
              {!cameraError && (
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-50/50 text-white font-black rounded-xl transition-all shadow-md shadow-orange-200 text-xs flex items-center justify-center gap-1"
                >
                  <Camera size={14} /> Capturar
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            {foto_url ? (
              <div className="relative w-32 h-32 mx-auto rounded-2xl overflow-hidden border border-stone-200 shadow-sm mb-2 animate-cozy">
                <img src={foto_url} alt="Portada vista previa" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setFotoUrl('')}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md hover:scale-105"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <label className="flex-1 flex flex-col items-center justify-center py-4 bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition-all group">
                  <Package className="text-stone-400 group-hover:text-orange-500 transition-colors" size={20} />
                  <span className="text-[10px] text-stone-500 group-hover:text-orange-500 transition-colors font-bold uppercase mt-1">Archivo</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />
                </label>

                <button
                  type="button"
                  onClick={startCamera}
                  className="flex-1 flex flex-col items-center justify-center py-4 bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition-all group"
                >
                  <Camera className="text-stone-400 group-hover:text-orange-500 transition-colors" size={20} />
                  <span className="text-[10px] text-stone-500 group-hover:text-orange-500 transition-colors font-bold uppercase mt-1">Cámara</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Remove the QR Code Preview Section */}

      <button
        disabled={loading}
        type="submit"
        className="btn-cozy w-full flex items-center justify-center gap-2 mt-4"
      >
        {loading ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <>
            <Box size={20} />
            <span>Crear Caja</span>
          </>
        )}
      </button>
    </form>
  );
};

export default BoxForm;
