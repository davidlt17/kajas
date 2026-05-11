import { useState, useEffect } from 'react';
import { getItems } from '../api';
import { useNavigate } from 'react-router-dom';
import { Box, ArrowLeft, Search, Plus, Filter } from 'lucide-react';

const ItemsListView = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getItems()
      .then(res => setItems(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredItems = items.filter(item => 
    item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-6 pt-12 max-w-2xl mx-auto animate-cozy">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-4 bg-white rounded-2xl shadow-cozy text-stone-400 hover:text-orange-500 transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-stone-800 tracking-tight">Objetos</h1>
            <p className="text-stone-400 font-medium text-sm">{items.length} objetos totales</p>
          </div>
        </div>
      </div>

      <div className="relative mb-10 group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-orange-500 transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Buscar un objeto..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="cozy-input pl-14 font-medium"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 bg-white/50 animate-pulse rounded-[2rem]"></div>
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {filteredItems.map(item => (
            <div key={item.id} className="cozy-card group">
              <div className="aspect-square bg-indigo-50 rounded-2xl mb-4 overflow-hidden relative">
                <img 
                  src={item.foto_url || "https://images.unsplash.com/photo-1581557991964-125469da3b8a?w=400"} 
                  alt={item.nombre}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-xl text-[10px] font-black uppercase text-indigo-700">
                  x{item.cantidad}
                </div>
              </div>
              <h3 className="font-extrabold text-stone-800 truncate">{item.nombre}</h3>
              <p className="text-[10px] text-stone-400 font-bold mt-1 uppercase flex items-center gap-1">
                <Box size={10} /> En Caja #{item.caja_id?.slice(0, 4)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-[2.5rem] shadow-cozy text-center flex flex-col items-center border border-white">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
            <Box size={32} className="text-indigo-200" />
          </div>
          <h3 className="text-xl font-bold text-stone-800">No se encontraron objetos</h3>
          <p className="text-stone-400 mt-2 max-w-[220px]">Intenta con otra búsqueda o añade objetos a tus cajas.</p>
        </div>
      )}
    </div>
  );
};

export default ItemsListView;
