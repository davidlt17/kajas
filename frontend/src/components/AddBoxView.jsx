import BoxForm from './BoxForm';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

const AddBoxView = () => {
  const navigate = useNavigate();

  const handleBoxCreated = (newBox) => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f97316', '#fb923c', '#fdba74', '#10b981', '#6366f1']
    });
    
    setTimeout(() => {
      navigate(`/boxes/${newBox.id}?addItem=true`);
    }, 1200);
  };

  return (
    <div className="p-6 max-w-lg mx-auto animate-cozy">
      <div className="flex items-center gap-4 mb-10">
        <button onClick={() => navigate(-1)} className="p-4 bg-white rounded-2xl shadow-cozy text-stone-400 hover:text-orange-500 transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h2 className="text-3xl font-extrabold text-stone-800 tracking-tight">Nueva Caja</h2>
      </div>
      <BoxForm onCreated={handleBoxCreated} />
    </div>
  );
};

export default AddBoxView;
