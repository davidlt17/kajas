import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { Home, Package, Scan, MapPin, Settings, LogOut, Search, Plus, Bell } from 'lucide-react';

const Layout = () => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/boxes', icon: Package, label: 'Mis Cajas' },
    { path: '/items', icon: Scan, label: 'Inventario' },
    { path: '/locations', icon: MapPin, label: 'Ubicaciones' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col lg:flex-row">
      
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-72 h-screen sticky top-0 bg-white border-r border-stone-100 flex-col p-8 z-50">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-100">
            <Package size={24} />
          </div>
          <h1 className="text-2xl font-black text-stone-800 tracking-tight">Kajas</h1>
        </div>

        <nav className="flex-grow space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${
                location.pathname === item.path 
                  ? 'bg-orange-50 text-orange-600 shadow-sm' 
                  : 'text-stone-400 hover:bg-stone-50 hover:text-stone-600'
              }`}
            >
              <item.icon size={22} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-4 pt-8 border-t border-stone-100">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-black">
              {user.nombre?.charAt(0) || 'U'}
            </div>
            <div className="flex-grow overflow-hidden">
              <p className="text-sm font-black text-stone-800 truncate">{user.nombre || 'Usuario'}</p>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest truncate">Plan Free</p>
            </div>
          </div>
          <Link to="/settings" className="flex items-center gap-4 p-4 text-stone-400 hover:text-stone-600 font-bold transition-colors">
            <Settings size={22} />
            <span>Ajustes</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow min-h-screen relative overflow-x-hidden">
        {/* Top Header Desktop */}
        <header className="hidden lg:flex sticky top-0 bg-white/80 backdrop-blur-md border-b border-stone-100 px-12 py-5 z-40 justify-between items-center">
          <div className="relative w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-orange-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Buscar en tu almacén..." 
              className="w-full bg-stone-50 border-none rounded-xl pl-12 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-4">
            <Link to="/notifications" className="p-3 bg-stone-50 rounded-xl text-stone-400 hover:text-orange-500 transition-colors">
              <Bell size={20} />
            </Link>
            <Link to="/add-box" className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-100">
              <Plus size={18} />
              <span>Nueva Caja</span>
            </Link>
          </div>
        </header>

        <div className="pb-28 lg:pb-12">
          <Outlet />
        </div>
      </main>

      {/* Navegación Inferior Flotante (Solo Mobile) */}
      <div className="fixed bottom-6 left-6 right-6 z-50 lg:hidden">
        <nav className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-3 flex justify-around items-center shadow-[0_20px_50px_rgba(120,53,15,0.15)]">
          {[
            { path: '/', icon: Home, label: 'Inicio' },
            { path: '/boxes', icon: Package, label: 'Cajas' },
            { path: '/scanner', icon: Scan, label: 'Escanear', primary: true },
            { path: '/locations', icon: MapPin, label: 'Lugares' },
            { path: '/settings', icon: Settings, label: 'Ajustes' },
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center justify-center transition-all duration-300 ${
                item.primary 
                  ? 'bg-gradient-to-br from-amber-400 to-orange-600 text-white p-5 rounded-full -translate-y-10 shadow-xl shadow-orange-200' 
                  : location.pathname === item.path 
                    ? 'text-orange-600 scale-110' 
                    : 'text-stone-400 hover:text-orange-300'
              }`}
            >
              <item.icon size={item.primary ? 30 : 24} strokeWidth={item.primary ? 2.5 : 2} />
              {!item.primary && (
                <span className="text-[10px] mt-1 font-extrabold tracking-tight uppercase opacity-80">
                  {item.label}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Layout;

