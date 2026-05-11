import BoxForm from './BoxForm';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AddBoxView = () => {
  const navigate = useNavigate();
  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm text-gray-400">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Nueva Caja</h2>
      </div>
      <BoxForm onCreated={(newBox) => navigate(`/boxes/${newBox.id}?addItem=true`)} />
    </div>
  );
};
export default AddBoxView;

