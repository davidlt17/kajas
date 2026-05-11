import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getBox, createItem, deleteItem } from '../api';
import { useNotification } from './NotificationContext';
import { ArrowLeft, Package, MapPin, Tag, Plus, Search, MoreVertical, QrCode, Download, X, Trash2, Loader2 } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { BoxPlaceholder, ItemPlaceholder } from './Placeholders';

const BoxDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();
  const [box, setBox] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [addingItem, setAddingItem] = useState(false);
  const qrRef = useRef();

  useEffect(() => {
    const fetchBoxData = async () => {
      try {
        const response = await getBox(id);
        setBox(response.data);
        setItems(response.data.items || []);
        
        // Auto-open add item modal if flag is present
        const params = new URLSearchParams(location.search);
        if (params.get('addItem') === 'true') {
          setShowAddItemModal(true);
        }
      } catch (error) {
        console.error("Error fetching box details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBoxData();
  }, [id, location.search]);

  const downloadQR = () => {
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;
    
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `QR_${box?.nombre || 'Caja'}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    
    setAddingItem(true);
    try {
      const res = await createItem({
        nombre: newItemName,
        cantidad: newItemQty,
        caja_id: box.id
      });
      setItems([...items, res.data]);
      showNotification('Objeto añadido', 'success');
      setShowAddItemModal(false);
      setNewItemName('');
      setNewItemQty(1);
    } catch (error) {
      console.error("Error al añadir objeto:", error);
      showNotification('Error al añadir objeto', 'error');
    } finally {
      setAddingItem(false);
    }
  };

  const handleDeleteItem = async (itemId, e) => {
    e.stopPropagation();
    if (!window.confirm("¿Seguro que quieres eliminar este objeto?")) return;
    
    try {
      await deleteItem(itemId);
      setItems(items.filter(i => i.id !== itemId));
      showNotification('Objeto eliminado', 'success');
    } catch (error) {
      console.error("Error al eliminar objeto:", error);
      showNotification('Error al eliminar objeto', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!box) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-gray-800">Caja no encontrada</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-orange-600 font-bold">Volver al inicio</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 animate-cozy relative">
      {/* Header with Image Background */}
      <div className="relative h-64 overflow-hidden">
        {box.foto_url ? (
          <img 
            src={box.foto_url} 
            alt={box.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <BoxPlaceholder className="!bg-stone-200" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-50 via-transparent to-black/20"></div>
        
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 p-3 bg-white/80 backdrop-blur-md rounded-2xl text-stone-800 shadow-lg hover:bg-white transition-all"
        >
          <ArrowLeft size={20} />
        </button>

        <button 
          className="absolute top-6 right-6 p-3 bg-white/80 backdrop-blur-md rounded-2xl text-stone-800 shadow-lg hover:bg-white transition-all"
        >
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Content Area */}
      <div className="px-6 -mt-12 relative z-10 max-w-2xl mx-auto">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-stone-200/50 border border-white">
          <div className="flex justify-between items-start mb-6">
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-wider rounded-full">
                    {box.ubicacion_nombre || 'General'}
                  </span>
                  <span className="px-3 py-1 bg-stone-100 text-stone-500 text-[10px] font-black uppercase tracking-wider rounded-full flex items-center gap-1">
                    <Tag size={10} /> {box.qr_code_id.slice(0, 8)}
                  </span>
                </div>
                <button 
                  onClick={() => setShowQRModal(true)}
                  className="p-2 bg-stone-100 text-stone-600 rounded-xl hover:bg-orange-100 hover:text-orange-600 transition-colors"
                  title="Ver QR"
                >
                  <QrCode size={18} />
                </button>
              </div>
              <h1 className="text-3xl font-black text-stone-800 leading-tight">{box.nombre}</h1>
              <p className="text-stone-400 font-medium mt-2 leading-relaxed">
                {box.descripcion || "Sin descripción disponible para esta caja."}
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100 mb-8">
            <div className="flex-1 flex flex-col items-center border-r border-stone-200">
              <span className="text-lg font-black text-stone-800">{items.length}</span>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Objetos</span>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <span className="text-lg font-black text-stone-800">-</span>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Peso Est.</span>
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-extrabold text-stone-800">Contenido</h2>
              <button onClick={() => setShowAddItemModal(true)} className="p-2 bg-orange-500 text-white rounded-xl shadow-lg shadow-orange-200 hover:scale-105 transition-transform">
                <Plus size={20} />
              </button>
            </div>

            {items.length > 0 ? (
              <div className="space-y-4">
                {items.map((item, i) => (
                  <div key={item.id || i} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-stone-100 hover:border-orange-200 transition-colors group">
                    <div className="w-16 h-16 bg-stone-100 rounded-xl overflow-hidden flex-shrink-0">
                      {item.foto_url ? (
                        <img 
                          src={item.foto_url} 
                          alt={item.nombre}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                      ) : (
                        <ItemPlaceholder />
                      )}
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-extrabold text-stone-800">{item.nombre}</h4>
                      <p className="text-xs text-stone-400 font-bold uppercase tracking-wide">Cantidad: {item.cantidad || 1}</p>
                    </div>
                    <button 
                      onClick={(e) => handleDeleteItem(item.id, e)}
                      className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      title="Eliminar objeto"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200 text-center px-8">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                  <Package size={32} className="text-stone-200" />
                </div>
                <h4 className="font-bold text-stone-800">Caja vacía</h4>
                <p className="text-stone-400 text-sm mt-1">Todavía no has añadido objetos a esta caja.</p>
                <button onClick={() => setShowAddItemModal(true)} className="btn-primary mt-6">Añadir Objeto</button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom Padding */}
      <div className="h-20"></div>

      {/* QR Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 bg-stone-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="text-center mb-6">
              <h3 className="text-xl font-black text-stone-800">Código de Caja</h3>
              <p className="text-sm text-stone-500 font-medium mt-1">{box.nombre}</p>
            </div>
            
            <div className="flex justify-center mb-8">
              <div ref={qrRef} className="p-4 bg-white rounded-2xl border-2 border-stone-100 shadow-sm">
                <QRCodeCanvas 
                  value={box.qr_code_id} 
                  size={200} 
                  level={"H"}
                  includeMargin={true}
                />
              </div>
            </div>
            
            <button 
              onClick={downloadQR}
              className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-orange-500 transition-all shadow-lg shadow-orange-200"
            >
              <Download size={20} /> Guardar Imagen
            </button>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowAddItemModal(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 bg-stone-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="mb-6">
              <h3 className="text-xl font-black text-stone-800">Añadir Objeto</h3>
              <p className="text-sm text-stone-500 font-medium mt-1">¿Qué quieres guardar en {box.nombre}?</p>
            </div>
            
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Nombre del objeto</label>
                <input 
                  type="text" 
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="cozy-input w-full"
                  placeholder="Ej. Cable USB tipo C"
                  required
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Cantidad</label>
                <input 
                  type="number" 
                  min="1"
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(Number(e.target.value))}
                  className="cozy-input w-full"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={addingItem || !newItemName.trim()}
                className="btn-primary w-full mt-4 flex justify-center items-center gap-2"
              >
                {addingItem ? <Loader2 size={20} className="animate-spin" /> : <><Plus size={20} /> Guardar Objeto</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoxDetailView;
