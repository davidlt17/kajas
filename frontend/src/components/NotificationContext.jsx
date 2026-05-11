import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification: addNotification }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xs space-y-3 px-4">
        {notifications.map((n) => (
          <div 
            key={n.id} 
            className={`
              flex items-center gap-3 p-4 rounded-2xl shadow-xl border animate-cozy
              ${n.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 
                n.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-800' : 
                'bg-white border-stone-100 text-stone-800'}
            `}
          >
            <div className="flex-shrink-0">
              {n.type === 'success' && <CheckCircle size={20} />}
              {n.type === 'error' && <AlertCircle size={20} />}
              {n.type === 'info' && <Info size={20} className="text-orange-500" />}
            </div>
            <p className="text-sm font-bold flex-grow">{n.message}</p>
            <button onClick={() => removeNotification(n.id)} className="text-stone-400 hover:text-stone-600">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
