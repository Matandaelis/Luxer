
import React, { useState } from 'react';
import { X, Sparkles, Image as ImageIcon, Plus, Loader2 } from 'lucide-react';
import { getProductAnalysis } from '../geminiService';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (product: any) => void;
}

const InventoryModal: React.FC<InventoryModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!isOpen) return null;

  const handleAIEnhance = async () => {
    if (!name) return;
    setIsAnalyzing(true);
    const analysis = await getProductAnalysis(name, desc);
    if (analysis) {
      setDesc(prev => `${analysis.pitch}\n\nKey Highlights:\n${analysis.sellingPoints.map((p: string) => `• ${p}`).join('\n')}`);
    }
    setIsAnalyzing(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 font-sans">
      <div className="bg-white w-full max-w-2xl border-8 border-black shadow-[16px_16px_0px_0px_rgba(204,255,0,1)] animate-in zoom-in-95 duration-300 relative">
        <div className="absolute top-0 left-0 w-full h-4 bg-[#CCFF00] border-b-4 border-black"></div>
        <div className="p-8 pt-12 border-b-4 border-black flex items-center justify-between bg-white">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">Add New Item</h2>
          <button onClick={onClose} className="w-10 h-10 border-4 border-black flex items-center justify-center hover:bg-[#CCFF00] transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar bg-[#FBFBFB]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-black bg-[#CCFF00] w-fit px-2 border-2 border-black block">Product Photos</label>
              <div className="aspect-square bg-white border-4 border-dashed border-black flex flex-col items-center justify-center text-black/40 hover:border-solid hover:bg-[#CCFF00] hover:text-black transition-all cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                 <ImageIcon size={48} strokeWidth={1.5} />
                 <span className="text-xs font-black mt-4 uppercase tracking-widest">Upload Image</span>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-black bg-[#CCFF00] w-fit px-2 border-2 border-black block">Item Title</label>
                <input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border-4 border-black px-5 py-4 font-black text-sm outline-none focus:bg-[#CCFF00] transition-colors uppercase tracking-wide placeholder:text-black/30 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  placeholder="e.g. 1999 Base Set Charizard"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-black bg-[#CCFF00] w-fit px-2 border-2 border-black block">Price ($)</label>
                  <input 
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-white border-4 border-black px-5 py-4 font-black text-sm outline-none focus:bg-[#CCFF00] transition-colors uppercase tracking-wide placeholder:text-black/30 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-black bg-[#CCFF00] w-fit px-2 border-2 border-black block">Quantity</label>
                  <input 
                    type="number"
                    defaultValue="1"
                    className="w-full bg-white border-4 border-black px-5 py-4 font-black text-sm outline-none focus:bg-[#CCFF00] transition-colors uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-black bg-[#CCFF00] w-fit px-2 border-2 border-black block">Description</label>
              <button 
                onClick={handleAIEnhance}
                disabled={isAnalyzing}
                className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-black bg-white border-2 border-black px-3 py-1 hover:bg-black hover:text-[#CCFF00] disabled:opacity-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors"
              >
                {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} className="fill-current" />}
                <span>AI Enhance</span>
              </button>
            </div>
            <textarea 
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={4}
              className="w-full bg-white border-4 border-black px-5 py-4 font-bold text-sm outline-none focus:bg-[#CCFF00] transition-colors no-scrollbar placeholder:text-black/30 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              placeholder="Tell your buyers why they need this..."
            />
          </div>
        </div>

        <div className="p-8 border-t-4 border-black flex items-center space-x-4 bg-white">
          <button onClick={onClose} className="flex-1 py-4 text-xs font-black uppercase tracking-[0.2em] text-black border-4 border-transparent hover:border-black transition-all">Cancel</button>
          <button 
            onClick={() => { onAdd({ name, desc, price }); onClose(); }}
            className="flex-2 w-full py-4 bg-black text-[#CCFF00] border-4 border-black font-black text-xl uppercase italic tracking-tighter shadow-[8px_8px_0px_0px_rgba(204,255,0,1)] hover:bg-white hover:text-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all"
          >
            List Item Live
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryModal;
