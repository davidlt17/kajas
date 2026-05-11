import { Package, MapPin, Box } from 'lucide-react';

export const BoxPlaceholder = ({ className = "" }) => (
  <div className={`w-full h-full bg-stone-100 flex flex-col items-center justify-center gap-2 text-stone-300 ${className}`}>
    <Package size={48} strokeWidth={1.5} />
    <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Sin Foto</span>
  </div>
);

export const LocationPlaceholder = ({ className = "" }) => (
  <div className={`w-full h-full bg-stone-100 flex flex-col items-center justify-center gap-1 text-stone-300 ${className}`}>
    <MapPin size={24} strokeWidth={1.5} />
  </div>
);

export const ItemPlaceholder = ({ className = "" }) => (
  <div className={`w-full h-full bg-stone-100 flex flex-col items-center justify-center gap-1 text-stone-300 ${className}`}>
    <Box size={20} strokeWidth={1.5} />
  </div>
);
