import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getBox, createItem, updateItem, deleteItem, getImageUrl, getBoxes } from '../api';
import { useNotification } from './NotificationContext';
import { ArrowLeft, Package, MapPin, Tag, Plus, Search, MoreVertical, QrCode, Download, X, Trash2, Loader2, Camera } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { BoxPlaceholder, ItemPlaceholder } from './Placeholders';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
  const [newItemPhoto, setNewItemPhoto] = useState('');
  const [newItemValue, setNewItemValue] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemBoxId, setNewItemBoxId] = useState('');
  const [boxes, setBoxes] = useState([]);
  const [addingItem, setAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const qrRef = useRef();

  const openAddModal = () => {
    setEditingItem(null);
    setNewItemName('');
    setNewItemQty(1);
    setNewItemPhoto('');
    setNewItemValue('');
    setNewItemCategory('');
    setNewItemBoxId('');
    setShowAddItemModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setNewItemName(item.nombre);
    setNewItemQty(item.cantidad);
    setNewItemPhoto(item.foto_url || '');
    setNewItemValue(item.valor_estimado || '');
    setNewItemCategory(item.categoria || '');
    setNewItemBoxId(item.caja_id || '');
    setShowAddItemModal(true);
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
      setNewItemPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

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
    setNewItemPhoto(base64Img);
    stopCamera();
  };

  const closeAddItemModal = () => {
    stopCamera();
    setShowAddItemModal(false);
    setNewItemName('');
    setNewItemQty(1);
    setNewItemPhoto('');
    setNewItemValue('');
    setNewItemCategory('');
    setNewItemBoxId('');
    setEditingItem(null);
  };

  useEffect(() => {
    const fetchBoxData = async () => {
      try {
        const [response, boxesRes] = await Promise.all([getBox(id), getBoxes()]);
        setBox(response.data);
        setItems(response.data.items || []);
        setBoxes(boxesRes.data || []);
        
        // Auto-open add item modal if flag is present
        const params = new URLSearchParams(location.search);
        if (params.get('addItem') === 'true') {
          openAddModal();
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

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(`Inventario: ${box.nombre}`, 14, 20);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Ubicación: ${box.ubicacion_nombre || 'General'}`, 14, 30);
    if (box.descripcion) {
      doc.text(`Descripción: ${box.descripcion}`, 14, 38);
    }
    
    doc.text(`Total Objetos: ${items.length}`, 14, 46);

    const tableData = items.map(item => [
      item.nombre,
      item.cantidad,
      item.categoria || '-',
      item.valor_estimado ? `${item.valor_estimado} €` : '-'
    ]);

    doc.autoTable({
      startY: 55,
      head: [['Nombre', 'Cantidad', 'Categoría', 'Valor Est.']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [249, 115, 22] }, // orange-500
    });

    doc.save(`kajas_inventario_${box.nombre.replace(/\s+/g, '_')}.pdf`);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    
    setAddingItem(true);
    try {
      const payload = {
        nombre: newItemName,
        cantidad: newItemQty,
        foto_url: newItemPhoto || '',
        valor_estimado: newItemValue ? parseFloat(newItemValue) : null,
        categoria: newItemCategory || null,
        caja_id: newItemBoxId || box.id
      };

      if (editingItem) {
        // Edit mode
        const res = await updateItem(editingItem.id, payload);
        if (newItemBoxId && newItemBoxId !== box.id) {
          // Moved out of this box
          setItems(items.filter(i => i.id !== editingItem.id));
        } else {
          setItems(items.map(item => item.id === editingItem.id ? res.data : item));
        }
        showNotification('Objeto actualizado', 'success');
      } else {
        // Add mode
        const res = await createItem(payload);
        if (!newItemBoxId || newItemBoxId === box.id) {
          setItems([...items, res.data]);
        }
        showNotification('Objeto añadido', 'success');
      }
      closeAddItemModal();
    } catch (error) {
      console.error("Error al guardar objeto:", error);
      showNotification('Error al guardar objeto', 'error');
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
            src={getImageUrl(box.foto_url)} 
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
                <div className="flex gap-2">
                  <button 
                    onClick={exportPDF}
                    className="p-2 bg-stone-100 text-stone-600 rounded-xl hover:bg-emerald-100 hover:text-emerald-600 transition-colors"
                    title="Exportar a PDF"
                  >
                    <Download size={18} />
                  </button>
                  <button 
                    onClick={() => setShowQRModal(true)}
                    className="p-2 bg-stone-100 text-stone-600 rounded-xl hover:bg-orange-100 hover:text-orange-600 transition-colors"
                    title="Ver QR"
                  >
                    <QrCode size={18} />
                  </button>
                </div>
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
              <button onClick={openAddModal} className="p-2 bg-orange-500 text-white rounded-xl shadow-lg shadow-orange-200 hover:scale-105 transition-transform">
                <Plus size={20} />
              </button>
            </div>

            {items.length > 0 ? (
              <div className="space-y-4">
                {items.map((item, i) => (
                  <div 
                    key={item.id || i} 
                    onClick={() => openEditModal(item)}
                    className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-stone-100 hover:border-orange-200 transition-all hover:scale-[1.01] hover:shadow-sm cursor-pointer group"
                  >
                    <div className="w-16 h-16 bg-stone-100 rounded-xl overflow-hidden flex-shrink-0">
                      {item.foto_url ? (
                        <img 
                          src={getImageUrl(item.foto_url)} 
                          alt={item.nombre}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                      ) : (
                        <ItemPlaceholder />
                      )}
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-extrabold text-stone-800">{item.nombre}</h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-stone-400 font-bold uppercase tracking-wide">Cant: {item.cantidad || 1}</span>
                        {item.categoria && (
                          <span className="px-2 py-0.5 bg-orange-100/90 rounded-lg text-[9px] font-bold uppercase text-orange-700 shadow-sm">
                            {item.categoria}
                          </span>
                        )}
                        {item.valor_estimado && (
                          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                            {item.valor_estimado}€
                          </span>
                        )}
                      </div>
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
                <button onClick={openAddModal} className="btn-primary mt-6">Añadir Objeto</button>
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
              onClick={closeAddItemModal}
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
                  <h3 className="text-xl font-black text-stone-800">{editingItem ? 'Editar Objeto' : 'Añadir Objeto'}</h3>
                  <p className="text-sm text-stone-500 font-medium mt-1">{editingItem ? 'Modifica los detalles de este objeto' : `¿Qué quieres guardar en ${box.nombre}?`}</p>
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
                  
                  <div className="flex gap-4">
                    <div className="flex-1">
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
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Valor Est. (€)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        min="0"
                        value={newItemValue}
                        onChange={(e) => setNewItemValue(e.target.value)}
                        className="cozy-input w-full"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Categoría</label>
                      <select
                        value={newItemCategory}
                        onChange={(e) => setNewItemCategory(e.target.value)}
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
                        value={newItemBoxId}
                        onChange={(e) => setNewItemBoxId(e.target.value)}
                        className="cozy-input w-full cursor-pointer appearance-none"
                      >
                        <option value="">Actual (Caja {box.nombre})</option>
                        {boxes.filter(b => b.id !== box.id).map(b => (
                          <option key={b.id} value={b.id}>{b.nombre}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Fotografía (Opcional)</label>
                    
                    {newItemPhoto ? (
                      <div className="relative w-32 h-32 mx-auto rounded-2xl overflow-hidden border border-stone-200 shadow-sm mb-2 animate-cozy">
                        <img src={getImageUrl(newItemPhoto)} alt="Vista previa" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setNewItemPhoto('')}
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
                    disabled={addingItem || !newItemName.trim()}
                    className="btn-primary w-full mt-4 flex justify-center items-center gap-2"
                  >
                    {addingItem ? <Loader2 size={20} className="animate-spin" /> : (editingItem ? 'Guardar Cambios' : <><Plus size={20} /> Guardar Objeto</>)}
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

export default BoxDetailView;
