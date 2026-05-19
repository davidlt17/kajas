import { useState, useEffect, useRef } from 'react';
import { getItems, getImageUrl, updateItem, getBoxes } from '../api';
import { useNavigate } from 'react-router-dom';
import { Box, ArrowLeft, Search, Plus, Filter, X, Camera, Package, Loader2 } from 'lucide-react';
import { useNotification } from './NotificationContext';

const ItemsListView = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // Edit states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editItemName, setEditItemName] = useState('');
  const [editItemQty, setEditItemQty] = useState(1);
  const [editItemPhoto, setEditItemPhoto] = useState('');
  const [editItemValue, setEditItemValue] = useState('');
  const [editItemCategory, setEditItemCategory] = useState('');
  const [editItemBoxId, setEditItemBoxId] = useState('');
  const [updatingItem, setUpdatingItem] = useState(false);
  const [boxes, setBoxes] = useState([]);

  // Camera states
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditItemName(item.nombre);
    setEditItemQty(item.cantidad);
    setEditItemPhoto(item.foto_url || '');
    setEditItemValue(item.valor_estimado || '');
    setEditItemCategory(item.categoria || '');
    setEditItemBoxId(item.caja_id || '');
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    stopCamera();
    setShowEditModal(false);
    setEditingItem(null);
    setEditItemName('');
    setEditItemQty(1);
    setEditItemPhoto('');
    setEditItemValue('');
    setEditItemCategory('');
    setEditItemBoxId('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      showNotification('Por favor selecciona una imagen válida', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditItemPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    setShowCamera(true);
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError('No se pudo acceder a la cámara. Verifica los permisos.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64Img = canvas.toDataURL('image/jpeg');
    setEditItemPhoto(base64Img);
    stopCamera();
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editItemName.trim()) return;
    
    setUpdatingItem(true);
    try {
      const res = await updateItem(editingItem.id, {
        nombre: editItemName,
        cantidad: editItemQty,
        foto_url: editItemPhoto,
        valor_estimado: editItemValue ? parseFloat(editItemValue) : null,
        categoria: editItemCategory,
        caja_id: editItemBoxId
      });
      setItems(items.map(i => i.id === editingItem.id ? res.data : i));
      showNotification('Objeto actualizado', 'success');
      closeEditModal();
    } catch (error) {
      console.error("Error al actualizar objeto:", error);
      showNotification('Error al actualizar objeto', 'error');
    } finally {
      setUpdatingItem(false);
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    Promise.all([getItems(), getBoxes()])
      .then(([itemsRes, boxesRes]) => {
        setItems(itemsRes.data);
        setBoxes(boxesRes.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredItems = items.filter(item => 
    item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-6 pt-12 max-w-2xl mx-auto animate-cozy">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-4 bg-white rounded-2xl shadow-cozy text-stone-400 hover:text-orange-500 transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-stone-800 tracking-tight">Objetos</h1>
            <p className="text-stone-400 font-medium text-sm">{items.length} objetos totales</p>
          </div>
        </div>
      </div>

      <div className="relative mb-10 group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-orange-500 transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Buscar un objeto..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="cozy-input pl-14 font-medium"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 bg-white/50 animate-pulse rounded-[2rem]"></div>
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {filteredItems.map(item => (
            <div 
              key={item.id} 
              onClick={() => openEditModal(item)}
              className="cozy-card cursor-pointer hover:scale-[1.01] hover:shadow-sm transition-all group"
            >
              <div className="aspect-square bg-indigo-50 rounded-2xl mb-4 overflow-hidden relative">
                <img 
                  src={getImageUrl(item.foto_url) || "https://images.unsplash.com/photo-1581557991964-125469da3b8a?w=400"} 
                  alt={item.nombre}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                  <div className="px-3 py-1 bg-white/80 backdrop-blur-sm rounded-xl text-[10px] font-black uppercase text-indigo-700 shadow-sm">
                    x{item.cantidad}
                  </div>
                  {item.categoria && (
                    <div className="px-2 py-0.5 bg-orange-100/90 backdrop-blur-sm rounded-lg text-[9px] font-bold uppercase text-orange-700 shadow-sm">
                      {item.categoria}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-extrabold text-stone-800 truncate flex-1">{item.nombre}</h3>
                {item.valor_estimado && (
                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md shrink-0">
                    {item.valor_estimado}€
                  </span>
                )}
              </div>
              <p className="text-[10px] text-stone-400 font-bold mt-1 uppercase flex items-center gap-1">
                <Box size={10} /> {item.caja_id ? `En Caja #${item.caja_id.slice(0, 4)}` : 'Sin caja asignada'}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-[2.5rem] shadow-cozy text-center flex flex-col items-center border border-white">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
            <Box size={32} className="text-indigo-200" />
          </div>
          <h3 className="text-xl font-bold text-stone-800">No se encontraron objetos</h3>
          <p className="text-stone-400 mt-2 max-w-[220px]">Intenta con otra búsqueda o añade objetos a tus cajas.</p>
        </div>
      )}
      {/* Edit Item Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={closeEditModal}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 bg-stone-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            {showCamera ? (
              <div className="space-y-4">
                <div className="mb-2">
                  <h3 className="text-xl font-black text-stone-800 flex items-center gap-2">
                    <Camera size={22} className="text-orange-500" /> Usar Cámara
                  </h3>
                  <p className="text-sm text-stone-500 font-medium mt-1">Apunta al producto para tomar la foto</p>
                </div>

                <div className="relative aspect-[4/3] bg-black rounded-2xl overflow-hidden shadow-inner border border-stone-200">
                  {cameraError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-red-500 font-medium text-xs">
                      <span>{cameraError}</span>
                    </div>
                  ) : (
                    <video 
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-2xl transition-all text-sm"
                  >
                    Cancelar
                  </button>
                  {!cameraError && (
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl transition-all shadow-lg shadow-orange-200 text-sm flex items-center justify-center gap-2"
                    >
                      <Camera size={16} /> Capturar
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="text-xl font-black text-stone-800">Editar Objeto</h3>
                  <p className="text-sm text-stone-500 font-medium mt-1">Modifica los detalles de este objeto</p>
                </div>
                
                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Nombre del objeto</label>
                    <input 
                      type="text" 
                      value={editItemName}
                      onChange={(e) => setEditItemName(e.target.value)}
                      className="cozy-input w-full"
                      placeholder="Ej. Cable USB tipo C"
                      required
                      autoFocus
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Cantidad</label>
                      <input 
                        type="number" 
                        min="1"
                        value={editItemQty}
                        onChange={(e) => setEditItemQty(Number(e.target.value))}
                        className="cozy-input w-full"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Valor Est. (€)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        min="0"
                        value={editItemValue}
                        onChange={(e) => setEditItemValue(e.target.value)}
                        className="cozy-input w-full"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Categoría</label>
                      <select
                        value={editItemCategory}
                        onChange={(e) => setEditItemCategory(e.target.value)}
                        className="cozy-input w-full cursor-pointer appearance-none"
                      >
                        <option value="">Sin categoría</option>
                        <option value="Electrónica">🔌 Electrónica</option>
                        <option value="Ropa">👕 Ropa</option>
                        <option value="Documentos">📄 Documentos</option>
                        <option value="Herramientas">🛠️ Herramientas</option>
                        <option value="Hogar">🏡 Hogar</option>
                        <option value="Frágil">📦 Frágil</option>
                        <option value="Otros">✨ Otros</option>
                      </select>
                    </div>

                    <div className="flex-1">
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Mover a caja</label>
                      <select
                        value={editItemBoxId}
                        onChange={(e) => setEditItemBoxId(e.target.value)}
                        className="cozy-input w-full cursor-pointer appearance-none"
                      >
                        <option value="">Seleccionar...</option>
                        {boxes.map(b => (
                          <option key={b.id} value={b.id}>{b.nombre}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Fotografía (Opcional)</label>
                    
                    {editItemPhoto ? (
                      <div className="relative w-32 h-32 mx-auto rounded-2xl overflow-hidden border border-stone-200 shadow-sm mb-2 animate-cozy">
                        <img src={getImageUrl(editItemPhoto)} alt="Vista previa" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setEditItemPhoto('')}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md hover:scale-105"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <label className="flex-1 flex flex-col items-center justify-center py-4 bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition-all group">
                          <Package className="text-stone-400 group-hover:text-orange-500 transition-colors" size={20} />
                          <span className="text-[10px] text-stone-500 group-hover:text-orange-500 transition-colors font-bold uppercase mt-1">Archivo</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                            className="hidden" 
                          />
                        </label>

                        <button
                          type="button"
                          onClick={startCamera}
                          className="flex-1 flex flex-col items-center justify-center py-4 bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition-all group"
                        >
                          <Camera className="text-stone-400 group-hover:text-orange-500 transition-colors" size={20} />
                          <span className="text-[10px] text-stone-500 group-hover:text-orange-500 transition-colors font-bold uppercase mt-1">Cámara</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <button 
                    type="submit"
                    disabled={updatingItem || !editItemName.trim()}
                    className="btn-primary w-full mt-4 flex justify-center items-center gap-2"
                  >
                    {updatingItem ? <Loader2 size={20} className="animate-spin" /> : 'Guardar Cambios'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemsListView;
