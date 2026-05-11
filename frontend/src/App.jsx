import { useState, useEffect } from 'react';
import { getLocations, getBoxes, getItems } from './api';
import { Search, Package, Box, MapPin, ChevronRight, Bell, Settings, Scan, QrCode } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { BoxPlaceholder } from './components/Placeholders';

function App() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const loadData = async () => {
    try {
      const [locs, bxs, itms] = await Promise.all([
        getLocations(),
        getBoxes(),
        getItems()
      ]);
      setLocations(locs.data || []);
      setBoxes(bxs.data || []);
      setItems(itms.data || []);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="px-6 pt-8 lg:pt-12 max-w-7xl mx-auto animate-cozy">
      {/* Header Superior (Solo Mobile) */}
      <header className="flex justify-between items-start mb-10 lg:hidden">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-800 tracking-tight">Kajas</h1>
          <p className="text-stone-400 font-medium mt-1">Hola, {user.nombre || 'Usuario'}</p>
        </div>
        <div className="flex gap-3">
          <Link to="/notifications" className="p-3 bg-white rounded-2xl shadow-cozy text-stone-400 hover:text-orange-500 transition-colors">
            <Bell size={22} />
          </Link>
          <Link to="/settings" className="p-3 bg-white rounded-2xl shadow-cozy text-stone-400 hover:text-orange-500 transition-colors">
            <Settings size={22} />
          </Link>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Left Column: Stats and Actions */}
        <div className="lg:w-1/3 space-y-10">
          <section>
            <h2 className="text-xl font-extrabold text-stone-800 mb-6 hidden lg:block">Tu Almacén</h2>
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-4">
              {[
                { label: 'Cajas', val: boxes.length, icon: Package, color: 'bg-blue-50 text-blue-500', path: '/boxes' },
                { label: 'Objetos', val: items.length, icon: Box, color: 'bg-indigo-50 text-indigo-500', path: '/items' },
                { label: 'Lugares', val: locations.length, icon: MapPin, color: 'bg-emerald-50 text-emerald-500', path: '/locations' },
              ].map((stat, i) => (
                <Link key={i} to={stat.path} className="bg-white p-5 rounded-[2rem] shadow-cozy flex lg:flex-row flex-col items-center gap-4 border border-white hover:border-orange-100 transition-all">
                  <div className={`p-4 ${stat.color} rounded-2xl`}>
                    <stat.icon size={28} />
                  </div>
                  <div className="flex flex-col items-center lg:items-start">
                    <span className="text-2xl font-black text-stone-800 leading-tight">{stat.val}</span>
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">{stat.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Quick Actions (Desktop Sidebar Style) */}
          <section className="hidden lg:block space-y-4">
            <h2 className="text-xl font-extrabold text-stone-800 mb-6">Acciones Rápidas</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/add-box" className="group p-6 rounded-[2.5rem] shadow-xl shadow-stone-200/50 aspect-square relative overflow-hidden flex flex-col justify-between bg-stone-800 hover:bg-stone-700 transition-all">
                <Package className="absolute -right-4 -top-4 text-white/10 group-hover:text-white/20 transition-colors" size={100} strokeWidth={1} />
                <div className="bg-white/10 backdrop-blur-md w-10 h-10 rounded-xl flex items-center justify-center text-white text-xl font-bold border border-white/20">+</div>
                <span className="relative z-10 text-sm font-black leading-tight text-white tracking-tight">Nueva<br/>Caja</span>
              </Link>
              <Link to="/scanner" className="group p-6 rounded-[2.5rem] shadow-xl shadow-orange-200/50 aspect-square relative overflow-hidden flex flex-col justify-between bg-orange-500 hover:bg-orange-600 transition-all">
                <QrCode className="absolute -right-4 -top-4 text-white/10 group-hover:text-white/20 transition-colors" size={100} strokeWidth={1} />
                <div className="bg-white/20 backdrop-blur-md w-10 h-10 rounded-xl flex items-center justify-center text-white border border-white/20">
                  <Scan size={20} strokeWidth={2.5} />
                </div>
                <span className="relative z-10 text-sm font-black leading-tight text-white tracking-tight">Escanear<br/>QR</span>
              </Link>
            </div>
          </section>
        </div>

        {/* Right Column: Main Feed */}
        <div className="lg:w-2/3 space-y-10">
          {/* Recent Boxes Section */}
          <section>
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-xl font-extrabold text-stone-800">Cajas recientes</h2>
              <Link to="/boxes" className="text-orange-600 text-sm font-bold hover:underline">
                Ver todas
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-44 bg-white/50 animate-pulse rounded-[2rem]"></div>
                ))}
              </div>
            ) : boxes.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {boxes.slice(0, 6).map(box => (
                  <Link to={`/boxes/${box.id}`} key={box.id} className="cozy-card group block">
                    <div className="aspect-square bg-amber-50 rounded-2xl mb-4 overflow-hidden relative">
                      {box.foto_url ? (
                        <img 
                          src={box.foto_url} 
                          alt={box.nombre}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <BoxPlaceholder />
                      )}
                      <div className="absolute top-2 right-2 px-2 py-1 bg-white/80 backdrop-blur-sm rounded-lg text-[10px] font-bold uppercase text-orange-700">
                        {box.ubicacion_nombre || 'General'}
                      </div>
                    </div>
                    <h3 className="font-extrabold text-stone-800 truncate">{box.nombre}</h3>
                    <p className="text-[11px] text-stone-400 font-bold mt-1 uppercase flex items-center gap-1">
                      <Package size={10} /> 4 objetos
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] p-12 text-center flex flex-col items-center border border-white shadow-cozy">
                <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6 text-orange-200">
                  <Package size={40} />
                </div>
                <h3 className="text-xl font-bold text-stone-800">Tu almacén está vacío</h3>
                <p className="text-stone-400 mt-2 max-w-[200px] mx-auto">Empieza creando tu primera caja inteligente.</p>
                <Link to="/add-box" className="btn-primary mt-8">Crear mi primera caja</Link>
              </div>
            )}
          </section>

          {/* Quick Actions (Solo Mobile) */}
          <div className="grid grid-cols-2 gap-4 pb-12 lg:hidden">
            <Link to="/add-box" className="group p-6 rounded-[2.5rem] shadow-xl shadow-stone-200/50 aspect-square relative overflow-hidden flex flex-col justify-between bg-stone-800">
              <Package className="absolute -right-4 -top-4 text-white/10" size={120} strokeWidth={1} />
              <div className="bg-white/10 backdrop-blur-md w-12 h-12 rounded-2xl flex items-center justify-center text-white text-2xl font-bold border border-white/20">+</div>
              <span className="relative z-10 text-lg font-black leading-tight text-white">Nueva<br/>Caja</span>
            </Link>
            <Link to="/scanner" className="group p-6 rounded-[2.5rem] shadow-xl shadow-orange-200/50 aspect-square relative overflow-hidden flex flex-col justify-between bg-orange-500">
              <QrCode className="absolute -right-4 -top-4 text-white/10" size={120} strokeWidth={1} />
              <div className="bg-white/20 backdrop-blur-md w-12 h-12 rounded-2xl flex items-center justify-center text-white border border-white/20">
                <Scan size={24} strokeWidth={2.5} />
              </div>
              <span className="relative z-10 text-lg font-black leading-tight text-white">Escanear<br/>QR</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;