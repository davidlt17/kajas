import { useState, useEffect } from 'react';
import { createBox, getLocations } from '../api';
import { useNotification } from './NotificationContext';
import { Camera, MapPin, Box, Type, FileText, Loader2 } from 'lucide-react';

const BoxForm = ({ onCreated }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ubicacion_id, setUbicacionId] = useState('');
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getLocations().then(res => setLocations(res.data));
  }, []);

  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await createBox({ nombre, descripcion, ubicacion_id });
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

      <div className="relative group">
        <div className="w-full h-32 border-2 border-dashed border-orange-100 rounded-2xl flex flex-col items-center justify-center gap-2 bg-cozy-50 group-hover:bg-cozy-100 transition-colors cursor-pointer">
          <Camera size={32} className="text-cozy-400" />
          <span className="text-sm font-medium text-cozy-600">Añadir foto</span>
        </div>
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
