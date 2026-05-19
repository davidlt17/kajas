import { useState, useEffect } from 'react';
import { getLocations, getBoxes, getItems, getImageUrl, getStats, getActivity } from './api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, Package, Box, MapPin, ChevronRight, Bell, Settings, Scan, QrCode, Activity, Moon, Sun } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { BoxPlaceholder } from './components/Placeholders';
import GlobalSearch from './components/GlobalSearch';
import { useTheme } from './components/ThemeContext';

function App() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const loadData = async () => {
    try {
      const [locs, bxs, itms, statsRes, actRes] = await Promise.all([
        getLocations(),
        getBoxes(),
        getItems(),
        getStats(),
        getActivity()
      ]);
      setLocations(locs.data || []);
      setBoxes(bxs.data || []);
      setItems(itms.data || []);
      setStats(statsRes.data || null);
      setActivity(actRes.data || []);
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
    <div className="px-6 pt-8 lg:pt-12 max-w-7xl mx-auto animate-cozy pb-12 relative">
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Header Superior */}
      <header className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-800 tracking-tight">Kajas</h1>
          <p className="text-stone-400 font-medium mt-1">Hola, {user.nombre || 'Usuario'}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsSearchOpen(true)} 
            className="p-3 bg-stone-800 text-white rounded-2xl shadow-xl hover:bg-stone-700 transition-colors flex items-center gap-2 font-bold"
          >
            <Search size={22} /> <span className="hidden md:inline">Buscar</span>
          </button>
          <button 
            onClick={toggleTheme}
            className="p-3 bg-white dark:bg-stone-800 rounded-2xl shadow-cozy text-stone-400 hover:text-orange-500 transition-colors hidden md:flex"
            title="Cambiar tema"
          >
            {isDark ? <Sun size={22} /> : <Moon size={22} />}
          </button>
          <Link to="/notifications" className="p-3 bg-white rounded-2xl shadow-cozy text-stone-400 hover:text-orange-500 transition-colors hidden md:flex">
            <Bell size={22} />
          </Link>
          <Link to="/settings" className="p-3 bg-white rounded-2xl shadow-cozy text-stone-400 hover:text-orange-500 transition-colors hidden md:flex">
            <Settings size={22} />
          </Link>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Left Column: Stats and Actions */}
        <div className="lg:w-1/3 space-y-10">
          <section>
            <h2 className="text-xl font-extrabold text-stone-800 mb-6 hidden lg:block">Tu Almacén</h2>
              {stats && stats.totalValue > 0 && (
                <div className="bg-stone-800 text-white p-6 rounded-[2rem] shadow-xl mb-4 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-widest block mb-1">Valor Total</span>
                  <div className="text-3xl font-black">{stats.totalValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</div>
                </div>
              )}

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

              {stats && stats.itemsByLocation?.length > 0 && (
                <div className="bg-white p-5 rounded-[2rem] shadow-cozy border border-white mt-4 hidden lg:block">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest block mb-4 text-center">Distribución</span>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.itemsByLocation}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={55}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {stats.itemsByLocation.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#f97316', '#6366f1', '#10b981', '#f43f5e', '#8b5cf6', '#eab308'][index % 6]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                          itemStyle={{ color: '#292524', fontWeight: 'bold' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
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
                          src={getImageUrl(box.foto_url)} 
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

          {/* Activity Log Section */}
          <section className="mt-12">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-xl font-extrabold text-stone-800 flex items-center gap-2">
                <Activity size={24} className="text-orange-500" /> Historial de Actividad
              </h2>
            </div>
            
            <div className="bg-white rounded-[2.5rem] p-8 shadow-cozy border border-white">
              {activity.length > 0 ? (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-stone-200 before:to-transparent">
                  {activity.slice(0, 5).map((log, index) => (
                    <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-stone-100 text-stone-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors z-10">
                        <Bell size={16} />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-stone-100 bg-stone-50 shadow-sm group-hover:border-orange-200 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-stone-800 text-sm">{log.action.replace('_', ' ')}</span>
                          <span className="text-[10px] text-stone-400 font-bold uppercase">{new Date(log.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-stone-500">{log.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-stone-400 text-sm py-4">No hay actividad reciente.</p>
              )}
            </div>
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