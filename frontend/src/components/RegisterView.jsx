import { useState } from 'react';
import { register } from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import { useNotification } from './NotificationContext';

const RegisterView = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(email, password, nombre);
      showNotification('Cuenta creada con éxito. Por favor, inicia sesión.', 'success');
      navigate('/login');
    } catch (err) {
      setError('Error al crear la cuenta. Es posible que el email ya esté en uso.');
      showNotification('Error al crear la cuenta. Inténtalo de nuevo.', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center px-6 animate-cozy">
      <div className="max-w-sm mx-auto w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-neutral-800 dark:bg-neutral-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Box size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-stone-800 tracking-tight">Crea tu cuenta</h1>
          <p className="text-stone-400 font-medium mt-2">Empieza a organizar tu hogar</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-stone-200/50 border border-white">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">Nombre Completo</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-orange-500 transition-colors" size={20} />
                <input 
                  type="text" 
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: David Lara"
                  className="w-full pl-12 pr-4 py-4 bg-stone-50 border-none rounded-2xl text-stone-800 font-medium focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                />
              </div>
            </div>

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
              <p className="text-red-500 text-xs font-bold text-center">{error}</p>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-orange-500 transition-all shadow-lg shadow-orange-200 mt-4 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  <span>Registrarme</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-10 text-stone-400 text-sm font-medium">
          ¿Ya tienes cuenta? <Link to="/login" className="text-orange-600 font-bold hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterView;
