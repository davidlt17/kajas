import { useState } from 'react';
import { login } from '../api';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Box, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useNotification } from './NotificationContext';

const LoginView = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();
  const message = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await login(email, password);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/');
    } catch (err) {
      setError('Credenciales incorrectas. Por favor, intenta de nuevo.');
      showNotification('Credenciales incorrectas. Por favor, intenta de nuevo.', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center px-6 animate-cozy">
      <div className="max-w-sm mx-auto w-full">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-orange-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-200">
            <Box size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-stone-800 tracking-tight">Kajas</h1>
          <p className="text-stone-400 font-medium mt-2">Gestiona tu inventario con inteligencia</p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-2xl text-center border border-emerald-100 animate-in fade-in slide-in-from-top-4">
            {message}
          </div>
        )}

        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-stone-200/50 border border-white">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-orange-500 transition-colors" size={20} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full pl-12 pr-4 py-4 bg-stone-50 border-none rounded-2xl text-stone-800 font-medium focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-orange-500 transition-colors" size={20} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-stone-50 border-none rounded-2xl text-stone-800 font-medium focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs font-bold text-center animate-shake">{error}</p>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-neutral-800 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-neutral-700 dark:bg-neutral-700 dark:hover:bg-neutral-600 transition-all shadow-lg shadow-stone-200 mt-4 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  <span>Entrar</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-10 text-stone-400 text-sm font-medium">
          ¿No tienes cuenta? <Link to="/register" className="text-orange-600 font-bold hover:underline">Regístrate</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginView;
