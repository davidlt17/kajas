import { useState, useEffect, useRef } from 'react';
import { Search, Package, MapPin, Box, X, Loader2 } from 'lucide-react';
import { searchGlobal } from '../api';
import { useNavigate } from 'react-router-dom';

const GlobalSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    } else {
      setQuery('');
      setResults(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        setLoading(true);
        searchGlobal(query)
          .then(res => setResults(res.data))
          .catch(err => console.error(err))
          .finally(() => setLoading(false));
      } else {
        setResults(null);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  if (!isOpen) return null;

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 animate-cozy">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-white overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-stone-100 flex items-center gap-3">
          <Search className="text-stone-400" size={24} />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-xl font-bold text-stone-800 placeholder:text-stone-300 focus:outline-none"
            placeholder="Buscar cajas, objetos, lugares..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-500 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 flex-1 bg-stone-50/50">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-stone-400">
              <Loader2 className="animate-spin" size={32} />
            </div>
          ) : results ? (
            <div className="space-y-6">
              {results.locations?.length > 0 && (
                <div>
                  <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <MapPin size={12} /> Lugares
                  </h3>
                  <div className="grid gap-2">
                    {results.locations.map(loc => (
                      <div key={loc.id} onClick={() => handleNavigate(`/locations`)} className="bg-white p-3 rounded-xl shadow-sm border border-stone-100 cursor-pointer hover:border-emerald-200 hover:shadow-md transition-all">
                        <span className="font-bold text-stone-800">{loc.nombre}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.boxes?.length > 0 && (
                <div>
                  <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Package size={12} /> Cajas
                  </h3>
                  <div className="grid gap-2">
                    {results.boxes.map(box => (
                      <div key={box.id} onClick={() => handleNavigate(`/boxes/${box.id}`)} className="bg-white p-3 rounded-xl shadow-sm border border-stone-100 cursor-pointer hover:border-blue-200 hover:shadow-md transition-all flex justify-between items-center">
                        <span className="font-bold text-stone-800">{box.nombre}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.items?.length > 0 && (
                <div>
                  <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Box size={12} /> Objetos
                  </h3>
                  <div className="grid gap-2">
                    {results.items.map(item => (
                      <div key={item.id} onClick={() => handleNavigate(item.caja_id ? `/boxes/${item.caja_id}` : '/items')} className="bg-white p-3 rounded-xl shadow-sm border border-stone-100 cursor-pointer hover:border-indigo-200 hover:shadow-md transition-all flex justify-between items-center">
                        <div>
                          <div className="font-bold text-stone-800">{item.nombre}</div>
                          {item.categoria && <div className="text-[10px] text-orange-600 uppercase font-black">{item.categoria}</div>}
                        </div>
                        <span className="text-xs font-bold text-stone-400">Cant: {item.cantidad}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.locations?.length === 0 && results.boxes?.length === 0 && results.items?.length === 0 && (
                <div className="text-center py-12 text-stone-400">
                  <Search size={32} className="mx-auto mb-3 opacity-20" />
                  <p className="font-medium">No se encontraron resultados para "{query}"</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-stone-400">
              <Search size={32} className="mx-auto mb-3 opacity-20" />
              <p className="font-medium">Empieza a escribir para buscar en tu almacén</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
