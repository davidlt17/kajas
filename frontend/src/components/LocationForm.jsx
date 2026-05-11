import { useState } from 'react';
import { createLocation } from '../api';
import { MapPin, Type, FileText, Camera, Loader2, Save } from 'lucide-react';

const LocationForm = ({ onCreated }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [foto_url, setFotoUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createLocation({ nombre, descripcion, foto_url });
      if (onCreated) onCreated();
    } catch (error) {
      console.error(error);
      alert("Error al crear el lugar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-[2.5rem] shadow-cozy animate-slide-up">
      <div className="space-y-2">
        <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1 flex items-center gap-2">
          <Type size={14} className="text-orange-500" /> Nombre del lugar
        </label>
        <input
          required
          type="text"
          placeholder="Ej: Trastero, Garaje, Buhardilla..."
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full px-5 py-4 bg-stone-50 border-none rounded-2xl text-stone-800 font-medium focus:ring-2 focus:ring-orange-100 outline-none transition-all"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1 flex items-center gap-2">
          <FileText size={14} className="text-orange-500" /> Descripción
        </label>
        <textarea
          placeholder="¿Qué sueles guardar aquí? (opcional)"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="w-full px-5 py-4 bg-stone-50 border-none rounded-2xl text-stone-800 font-medium focus:ring-2 focus:ring-orange-100 outline-none transition-all min-h-[120px] resize-none"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1 flex items-center gap-2">
          <Camera size={14} className="text-orange-500" /> URL de la foto
        </label>
        <input
          type="url"
          placeholder="https://ejemplo.com/foto.jpg"
          value={foto_url}
          onChange={(e) => setFotoUrl(e.target.value)}
          className="w-full px-5 py-4 bg-stone-50 border-none rounded-2xl text-stone-800 font-medium focus:ring-2 focus:ring-orange-100 outline-none transition-all"
        />
        <p className="text-[10px] text-stone-400 font-medium ml-1">Proximamente: subida de archivos directa.</p>
      </div>

      <button
        disabled={loading}
        type="submit"
        className="w-full py-5 bg-stone-800 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-stone-700 transition-all shadow-xl shadow-stone-200 mt-6 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="animate-spin" size={22} />
        ) : (
          <>
            <Save size={22} />
            <span>Guardar Lugar</span>
          </>
        )}
      </button>
    </form>
  );
};

export default LocationForm;
