import { useNavigate } from 'react-router-dom';
import { Bell, ArrowLeft, Inbox } from 'lucide-react';

const NotificationsView = () => {
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
        <h1 className="text-3xl font-extrabold text-stone-800 tracking-tight">Notificaciones</h1>
      </div>

      <div className="bg-white p-12 rounded-[3rem] shadow-cozy border border-white text-center flex flex-col items-center">
        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6">
          <Bell size={40} className="text-orange-200" />
        </div>
        <h3 className="text-xl font-bold text-stone-800">Todo al día</h3>
        <p className="text-stone-400 mt-2 max-w-[200px] mx-auto">No tienes notificaciones nuevas en este momento.</p>
        <button 
          onClick={() => navigate(-1)}
          className="btn-primary mt-10 w-full"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
};

export default NotificationsView;
