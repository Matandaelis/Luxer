
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Award } from 'lucide-react';

interface SellerProfileProps {
  seller: {
    name: string;
    avatar: string;
    rating?: number;
    sales?: number;
    isLive?: boolean;
    isVerified?: boolean;
    tier?: string;
  };
  className?: string;
}

export default function SellerProfileCard({ seller, className = "" }: SellerProfileProps) {
  return (
    <div className={`bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group cursor-pointer transition-all ${className}`}>
      <div className="flex items-center justify-between mb-6 border-b-4 border-black pb-6">
        <div className="flex items-center space-x-5">
          <div className="relative">
            <img 
              src={seller.avatar} 
              className="w-16 h-16 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] object-cover grayscale group-hover:grayscale-0 transition-all" 
              alt={seller.name} 
            />
            {seller.isLive && (
              <div className="absolute -bottom-2 -right-2 bg-red-600 w-6 h-6 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span className="w-2 h-2 bg-white animate-pulse"></span>
              </div>
            )}
          </div>
          <div>
            <p className="text-[10px] font-black text-black uppercase tracking-widest bg-[#CCFF00] px-2 py-0.5 w-fit border-2 border-black mb-1">The Seller</p>
            <h4 className="text-lg font-black text-black uppercase italic">@{seller.name}</h4>
          </div>
        </div>
        {seller.isLive && (
          <Link 
            to="/" 
            className="bg-red-600 text-white px-4 py-2 text-[9px] font-black uppercase tracking-widest animate-pulse border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            Live Now
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 text-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:-translate-y-1 transition-transform">
          <p className="text-[9px] font-black uppercase text-black border-b-2 border-black pb-1 mb-2">Rating</p>
          <p className="text-xl font-black text-black italic">{seller.rating || 4.9}/5</p>
        </div>
        <div className="bg-white p-4 text-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:-translate-y-1 transition-transform">
          <p className="text-[9px] font-black uppercase text-black border-b-2 border-black pb-1 mb-2">Sales</p>
          <p className="text-xl font-black text-black italic">{(seller.sales || 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="flex items-center justify-center space-x-4 mb-6">
        <span className="flex items-center text-[9px] font-black text-black uppercase tracking-tight bg-[#CCFF00] px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <ShieldCheck size={14} className="mr-1" /> Trusted
        </span>
        {seller.tier && (
          <span className="flex items-center text-[9px] font-black text-black uppercase tracking-tight bg-yellow-400 px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Award size={14} className="mr-1" /> {seller.tier} Seller
          </span>
        )}
      </div>

      <button className="w-full py-4 bg-black text-[#CCFF00] border-4 border-black text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:scale-95">
        Visit Showroom
      </button>
    </div>
  );
}
