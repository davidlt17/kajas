import { useState, useEffect } from 'react';
import { getBoxes, getItems } from '../api';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Package, Box, ChevronRight } from 'lucide-react';

const SearchView = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ boxes: [], items: [] });
  const [allData, setAllData] = useState({ boxes: [], items: [] });
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getBoxes(), getItems()]).then(([boxesRes, itemsRes]) => {
      setAllData({
        boxes: boxesRes.data || [],
        items: itemsRes.data || []
      });
    });
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ boxes: [], items: [] });
      return;
    }

    const q = query.toLowerCase();
    setResults({
      boxes: allData.boxes.filter(b => b.nombre.toLowerCase().includes(q) || b.descripcion?.toLowerCase().includes(q)),
      items: allData.items.filter(i => i.nombre.toLowerCase().includes(q))
    });
  }, [query, allData]);

  return (
    <div className="px-6 pt-12 max-w-2xl mx-auto animate-cozy">
      <div className="flex items-center gap-4 mb-10">
        <button 
          onClick={() => navigate(-1)} 
          className="p-4 bg-white rounded-2xl shadow-cozy text-stone-400 hover:text-orange-500 transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="flex-grow relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-orange-500 transition-colors" size={20} />
          <input 
            autoFocus
            type="text" 
            placeholder="Buscar cajas u objetos..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="cozy-input pl-14 font-medium"
          />
        </div>
      </div>

      {!query ? (
        <div className="text-center py-20">
          <p className="text-stone-300 font-bold uppercase tracking-[0.2em] text-xs">Escribe para empezar a buscar</p>
        </div>
      ) : results.boxes.length === 0 && results.items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-stone-400 font-medium">No se encontraron resultados para "{query}"</p>
        </div>
      ) : (
        <div className="space-y-10 pb-20">
          {results.boxes.length > 0 && (
            <section>
              <h2 className="text-xs font-black text-stone-400 uppercase tracking-widest ml-4 mb-4">Cajas</h2>
              <div className="grid gap-3">
                {results.boxes.map(box => (
                  <button 
                    key={box.id} 
                    onClick={() => navigate(`/boxes/${box.id}`)}
                    className="w-full bg-white p-4 rounded-3xl shadow-cozy border border-white flex items-center gap-4 hover:border-orange-100 transition-all text-left"
                  >
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                      <Package size={24} />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-extrabold text-stone-800">{box.nombre}</h4>
                      <p className="text-[11px] text-stone-400 font-bold uppercase">{box.ubicacion_nombre || 'General'}</p>
                    </div>
                    <ChevronRight size={18} className="text-stone-300" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {results.items.length > 0 && (
            <section>
              <h2 className="text-xs font-black text-stone-400 uppercase tracking-widest ml-4 mb-4">Objetos</h2>
              <div className="grid gap-3">
                {results.items.map(item => (
                  <div 
                    key={item.id} 
                    className="bg-white p-4 rounded-3xl shadow-cozy border border-white flex items-center gap-4 text-left"
                  >
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                      <Box size={24} />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-extrabold text-stone-800">{item.nombre}</h4>
                      <p className="text-[11px] text-stone-400 font-bold uppercase">En caja #{item.caja_id?.slice(0, 4)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchView;
