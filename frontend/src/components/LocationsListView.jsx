import { useState, useEffect } from 'react';
import { getLocations } from '../api';
import { Link } from 'react-router-dom';
import { LocationPlaceholder } from './Placeholders';
import { MapPin, Plus, ChevronRight, LayoutGrid, List } from 'lucide-react';

const LocationsListView = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLocations()
      .then(res => setLocations(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-6 pt-12 max-w-2xl mx-auto animate-cozy">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-800 tracking-tight">Mis Lugares</h1>
          <p className="text-stone-400 font-medium mt-1">{locations.length} ubicaciones configuradas</p>
        </div>
        <Link 
          to="/add-location" 
          className="p-4 bg-orange-500 text-white rounded-2xl shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all"
        >
          <Plus size={24} />
        </Link>
      </header>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-white/50 animate-pulse rounded-[2rem]"></div>
          ))}
        </div>
      ) : locations.length > 0 ? (
        <div className="grid gap-4">
          {locations.map(loc => (
            <Link 
              key={loc.id} 
              to={`/boxes?location=${loc.id}`}
              className="bg-white p-5 rounded-[2.5rem] shadow-cozy border border-white flex items-center gap-4 group hover:border-orange-100 transition-all cursor-pointer"
            >
              <div className="w-16 h-16 bg-stone-50 rounded-2xl overflow-hidden flex-shrink-0">
                {loc.foto_url ? (
                  <img 
                    src={loc.foto_url} 
                    alt={loc.nombre} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <LocationPlaceholder />
                )}
              </div>
              <div className="flex-grow">
                <h3 className="font-extrabold text-stone-800">{loc.nombre}</h3>
                <p className="text-stone-400 text-xs font-medium mt-1 line-clamp-1">{loc.descripcion || 'Sin descripción'}</p>
              </div>
              <div className="p-2 text-stone-300 group-hover:text-orange-500 transition-colors">
                <ChevronRight size={20} />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-[2.5rem] shadow-cozy border border-white text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6">
            <MapPin size={32} className="text-stone-200" />
          </div>
          <h3 className="text-xl font-bold text-stone-800">No hay lugares aún</h3>
          <p className="text-stone-400 mt-2 max-w-[220px]">Crea tu primer lugar (ej: Trastero) para empezar a organizar tus cajas.</p>
          <Link to="/add-location" className="mt-8 px-8 py-4 bg-stone-800 text-white rounded-2xl font-bold hover:bg-stone-700 transition-all">
            Añadir mi primer lugar
          </Link>
        </div>
      )}
    </div>
  );
};

export default LocationsListView;
