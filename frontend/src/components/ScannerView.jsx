import { useState } from 'react';
import QRCodeScanner from './QRCodeScanner';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, ZapOff, Camera } from 'lucide-react';

const ScannerView = () => {
  const navigate = useNavigate();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);
  const [error, setError] = useState(null);

  const handleResult = (res) => {
    if (scanned) return;
    setScanned(true);
    // Vibrate if supported
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
    
    // Add a small delay for the success animation
    setTimeout(() => {
      navigate(`/boxes/${res}`);
    }, 1000);
  };

  const handleError = (err) => {
    setError(err);
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col p-6 animate-cozy relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-5%] left-[-10%] w-80 h-80 bg-orange-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white backdrop-blur-xl transition-all border border-white/10"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-black text-white tracking-tight">Escáner</h2>
        </div>
        
        <button 
          onClick={() => setTorch(!torch)}
          className={`p-3 rounded-2xl backdrop-blur-xl transition-all border ${torch ? 'bg-orange-500 text-white border-orange-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'bg-white/10 text-white/60 border-white/10'}`}
        >
          {torch ? <Zap size={20} /> : <ZapOff size={20} />}
        </button>
      </div>
      
      <div className="flex-grow flex flex-col items-center justify-center gap-12 relative z-10">
        {/* Scanner Container */}
        <div className="relative group">
          {/* Viewfinder Corners */}
          <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-orange-500 rounded-tl-2xl z-20" />
          <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-orange-500 rounded-tr-2xl z-20" />
          <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-orange-500 rounded-bl-2xl z-20" />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-orange-500 rounded-br-2xl z-20" />

          <div className={`relative w-72 h-72 rounded-[2.5rem] overflow-hidden transition-all duration-700 ease-out ${scanned ? 'scale-90 border-4 border-emerald-500 shadow-[0_0_60px_rgba(16,185,129,0.5)]' : 'border-2 border-white/20 shadow-2xl'}`}>
            <QRCodeScanner onResult={handleResult} onError={handleError} torch={torch} />
            
            {!scanned && (
              <>
                <div className="absolute inset-0 border-[30px] border-black/40 pointer-events-none backdrop-blur-[1px]"></div>
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-orange-400 to-transparent shadow-[0_0_15px_rgba(245,158,11,1)] animate-scan"></div>
              </>
            )}

            {scanned && (
              <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-md flex items-center justify-center animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl scale-110">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Status Text */}
        <div className="text-center max-w-[280px]">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 transition-all duration-500 ${scanned ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/10 text-orange-400'}`}>
            {scanned ? (
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            ) : (
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            )}
            <span className="text-xs font-bold uppercase tracking-widest">
              {scanned ? 'Código Detectado' : 'Escaneando...'}
            </span>
          </div>

          <h3 className="text-white text-xl font-extrabold mb-3">
            {scanned ? '¡Caja identificada!' : 'Encuentra el código QR'}
          </h3>
          <p className="text-stone-400 text-sm font-medium leading-relaxed">
            {scanned 
              ? 'Estamos recuperando toda la información de la caja para ti.' 
              : 'Coloca el código QR de la caja dentro del recuadro para escanearlo automáticamente.'}
          </p>
        </div>
      </div>

      {error && (
        <div className="absolute bottom-10 left-6 right-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl backdrop-blur-xl flex items-center gap-3">
          <div className="p-2 bg-red-500 rounded-xl text-white">
            <Camera size={18} />
          </div>
          <div className="flex-grow">
            <p className="text-red-200 text-xs font-bold uppercase">Error de Cámara</p>
            <p className="text-red-100/60 text-[11px]">No se pudo acceder a la cámara. Revisa los permisos.</p>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes scan {
          0%, 100% { top: 5%; opacity: 0.5; }
          50% { top: 95%; opacity: 1; }
        }
        .animate-scan {
          animation: scan 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default ScannerView;

