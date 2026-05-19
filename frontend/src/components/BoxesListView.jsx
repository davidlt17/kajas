import { useState, useEffect } from 'react';
import { getBoxes, getImageUrl } from '../api';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { BoxPlaceholder } from './Placeholders';
import { ArrowLeft, Search, Package, MapPin, Plus, Filter, X } from 'lucide-react';

const BoxesListView = () => {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const locationFilter = queryParams.get('location');

  useEffect(() => {
    const fetchBoxes = async () => {
      try {
        const response = await getBoxes();
        setBoxes(response.data || []);
      } catch (error) {
        console.error("Error fetching boxes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBoxes();
  }, []);

  const filteredBoxes = boxes.filter(box => {
    const matchesSearch = box.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (box.descripcion && box.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLocation = locationFilter ? box.ubicacion_id === locationFilter : true;
    
    return matchesSearch && matchesLocation;
  });

  const activeLocationName = locationFilter && boxes.find(b => b.ubicacion_id === locationFilter)?.ubicacion_nombre;

  return (
    <div className="min-h-screen bg-stone-50 p-6 animate-cozy">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')} 
            className="p-3 bg-white rounded-2xl shadow-cozy text-stone-400 hover:text-orange-500 transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-2xl font-black text-stone-800 tracking-tight">Mis Cajas</h1>
        </div>
        <Link 
          to="/add-box" 
          className="p-3 bg-orange-500 text-white rounded-2xl shadow-lg shadow-orange-200 hover:scale-105 transition-transform"
        >
          <Plus size={22} />
        </Link>
      </header>

      {/* Search and Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-grow group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-orange-400 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o contenido..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border-none rounded-2xl shadow-cozy text-stone-800 font-medium focus:ring-2 focus:ring-orange-100 outline-none transition-all"
          />
        </div>
        <button className="p-4 bg-white rounded-2xl shadow-cozy text-stone-400 hover:text-stone-600 transition-colors">
          <Filter size={20} />
        </button>
      </div>

      {/* Active Filter Badge */}
      {locationFilter && (
        <div className="flex items-center gap-2 mb-8 animate-fade-in">
          <div className="px-4 py-2 bg-orange-50 text-orange-600 rounded-full text-xs font-bold flex items-center gap-2 border border-orange-100">
            <MapPin size={12} />
            Lugar: {activeLocationName || 'Cargando...'}
            <button 
              onClick={() => navigate('/boxes')}
              className="ml-1 p-1 hover:bg-orange-100 rounded-full transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-36 bg-white/50 animate-pulse rounded-[1.5rem]"></div>
          ))}
        </div>
      ) : filteredBoxes.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {filteredBoxes.map(box => (
            <Link 
              key={box.id} 
              to={`/boxes/${box.id}`}
              className="bg-white p-3 rounded-[1.5rem] shadow-cozy border border-white hover:border-orange-200 transition-all group"
            >
              <div className="aspect-square bg-stone-100 rounded-xl mb-2 overflow-hidden relative">
                {box.foto_url ? (
                  <img 
                    src={getImageUrl(box.foto_url)} 
                    alt={box.nombre}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <BoxPlaceholder />
                )}
                <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-white/80 backdrop-blur-sm rounded-md text-[8px] font-black uppercase text-orange-700 truncate max-w-[85%]">
                  {box.ubicacion_nombre || 'General'}
                </div>
              </div>
              <h3 className="font-black text-stone-800 truncate text-xs">{box.nombre}</h3>
              <div className="flex items-center gap-1 mt-0.5">
                <Package size={8} className="text-stone-300" />
                <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wide">Objetos</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-300">
            <Package size={40} />
          </div>
          <h3 className="text-lg font-bold text-stone-800">No hay resultados</h3>
          <p className="text-stone-400 text-sm mt-2">Prueba con otros términos de búsqueda.</p>
        </div>
      )}
    </div>
  );
};

export default BoxesListView;
