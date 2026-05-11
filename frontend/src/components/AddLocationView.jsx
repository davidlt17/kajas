import LocationForm from './LocationForm';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';

const AddLocationView = () => {
  const navigate = useNavigate();
  return (
    <div className="px-6 pt-12 max-w-lg mx-auto animate-cozy">
      <div className="flex items-center gap-4 mb-10">
        <button 
          onClick={() => navigate(-1)} 
          className="p-4 bg-white rounded-2xl shadow-cozy text-stone-400 hover:text-orange-500 transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-stone-800 tracking-tight flex items-center gap-2">
            <MapPin className="text-orange-500" size={24} />
            Nuevo Lugar
          </h2>
          <p className="text-stone-400 font-medium text-sm">Añade un espacio para tus cajas</p>
        </div>
      </div>
      
      <LocationForm onCreated={() => navigate('/locations')} />
    </div>
  );
};

export default AddLocationView;
