import { useNavigate } from 'react-router-dom';
import { LogOut, User, Bell, Shield, HelpCircle, ChevronRight, ArrowLeft } from 'lucide-react';

const SettingsView = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const settingsGroups = [
    {
      title: 'Cuenta',
      items: [
        { icon: User, label: 'Perfil', detail: user.nombre || 'Usuario' },
        { icon: Bell, label: 'Notificaciones', detail: 'Activadas' },
        { icon: Shield, label: 'Privacidad y Seguridad' },
      ]
    },
    {
      title: 'Soporte',
      items: [
        { icon: HelpCircle, label: 'Ayuda y Centro de Soporte' },
      ]
    }
  ];

  return (
    <div className="px-6 pt-12 max-w-lg mx-auto animate-cozy">
      <div className="flex items-center gap-4 mb-10">
        <button 
          onClick={() => navigate(-1)} 
          className="p-4 bg-white rounded-2xl shadow-cozy text-stone-400 hover:text-orange-500 transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-3xl font-extrabold text-stone-800 tracking-tight">Ajustes</h1>
      </div>

      <div className="space-y-8">
        {settingsGroups.map((group, idx) => (
          <div key={idx} className="space-y-3">
            <h2 className="text-[11px] font-black text-stone-400 uppercase tracking-[0.2em] ml-2">
              {group.title}
            </h2>
            <div className="bg-white rounded-[2.5rem] shadow-cozy border border-white overflow-hidden">
              {group.items.map((item, i) => (
                <button 
                  key={i} 
                  className={`w-full flex items-center justify-between p-5 hover:bg-stone-50 transition-colors ${i !== group.items.length - 1 ? 'border-bottom border-stone-50' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-stone-50 rounded-2xl text-stone-500">
                      <item.icon size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-stone-800 text-sm">{item.label}</p>
                      {item.detail && <p className="text-xs text-stone-400 font-medium">{item.detail}</p>}
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-stone-300" />
                </button>
              ))}
            </div>
          </div>
        ))}

        <button 
          onClick={handleLogout}
          className="w-full mt-10 p-5 bg-red-50 text-red-600 rounded-[2rem] font-bold flex items-center justify-center gap-3 hover:bg-red-100 transition-all border border-red-100"
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
        
        <p className="text-center text-[10px] text-stone-300 font-bold uppercase tracking-widest pb-10">
          Kajas v1.0.0
        </p>
      </div>
    </div>
  );
};

export default SettingsView;
