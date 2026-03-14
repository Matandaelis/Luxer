
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, Heart, Share2, ShieldCheck, Star, 
  Gavel, Clock, Truck, RefreshCcw, Sparkles, 
  ArrowRight, Users, MessageSquare, Info,
  TrendingUp, Award, Zap, Package, ShoppingCart,
  Video, FileCheck, CheckCircle2
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { getProductDeepDive } from '../geminiService';
import SellerProfileCard from './SellerProfileCard';

const MOCK_PRODUCT = {
  id: 'p-charizard',
  name: '1st Edition Shadowless Charizard PSA 10',
  price: 25000,
  condition: 'PSA 10 (Gem Mint)',
  category: 'Pokemon Cards',
  description: 'The holy grail of Pokemon cards. This 1999 Base Set 1st Edition Shadowless Charizard is in pristine PSA 10 Gem Mint condition. A true piece of history.',
  images: [
    'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1550000000000?auto=format&fit=crop&q=80&w=1200'
  ],
  seller: {
    name: 'PokeMaster99',
    avatar: 'https://ui-avatars.com/api/?name=Poke+Master&background=facc15&color=000&bold=true',
    rating: 4.9,
    sales: 12400,
    isLive: true
  }
};

const PRICE_HISTORY = [
  { date: 'Jan', price: 18500 },
  { date: 'Feb', price: 19200 },
  { date: 'Mar', price: 21000 },
  { date: 'Apr', price: 20500 },
  { date: 'May', price: 22800 },
  { date: 'Jun', price: 25000 },
];

export default function ProductDetailPage() {
  const { id } = useParams();
  const [activeImage, setActiveImage] = useState(MOCK_PRODUCT.images[0]);
  const [deepDive, setDeepDive] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchDeepDive = async () => {
      const data = await getProductDeepDive(MOCK_PRODUCT.name);
      setDeepDive(data);
    };
    fetchDeepDive();
    window.scrollTo(0, 0);
  }, [id]);

  return (
    <div className="bg-background min-h-screen pb-40 font-sans">
      {/* 1. Refined Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border px-6 lg:px-12 h-16 lg:h-20 flex items-center justify-between">
        <Link to="/marketplace" className="flex items-center space-x-3 text-foreground/60 hover:text-foreground transition-colors group">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Back to Collection</span>
        </Link>
        <div className="flex items-center space-x-6">
          <button className="text-foreground/60 hover:text-foreground transition-colors"><Share2 size={20} strokeWidth={1.5} /></button>
          <button 
            onClick={() => setIsFollowing(!isFollowing)}
            className={`transition-all ${isFollowing ? 'text-primary' : 'text-foreground/60 hover:text-foreground'}`}
          >
            <Heart size={20} strokeWidth={1.5} fill={isFollowing ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-8 lg:py-16">
        <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-24">
          
          {/* 2. Elegant Gallery */}
          <div className="lg:col-span-7 space-y-8 lg:space-y-12">
            <div className="relative aspect-[4/5] bg-muted/10 overflow-hidden group border border-border/50">
               <img src={activeImage} className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-105" alt="Product" />
               <div className="absolute top-8 left-8 flex flex-col space-y-3">
                  <span className="bg-background/80 backdrop-blur-md text-foreground px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] border border-border/50">
                    PSA 10 GEM MINT
                  </span>
                  <span className="bg-primary text-background px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center">
                    <ShieldCheck size={14} className="mr-2" /> Authenticated
                  </span>
               </div>
            </div>
            
            <div className="flex space-x-6 overflow-x-auto no-scrollbar pb-4">
               {MOCK_PRODUCT.images.map((img, idx) => (
                 <button 
                  key={idx} 
                  onClick={() => setActiveImage(img)}
                  className={`min-w-[120px] aspect-square overflow-hidden border transition-all relative ${activeImage === img ? 'border-primary scale-95' : 'border-border/30 opacity-60 hover:opacity-100'}`}
                 >
                    <img src={img} className="w-full h-full object-cover" alt={`Thumb ${idx}`} />
                 </button>
               ))}
            </div>

            {/* Price History Chart */}
            <div className="bg-background border border-border p-12 shadow-sm">
               <div className="flex items-center justify-between mb-12 border-b border-border pb-6">
                  <div>
                    <h3 className="text-2xl font-serif italic text-foreground">Market Value</h3>
                    <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-[0.2em] mt-2">6 Month Performance</p>
                  </div>
                  <div className="flex items-center space-x-3 text-primary bg-primary/5 px-4 py-2 border border-primary/20">
                     <TrendingUp size={16} />
                     <span className="text-[10px] font-bold uppercase tracking-widest">+35.1%</span>
                  </div>
               </div>
               <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={PRICE_HISTORY}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: 'rgba(0,0,0,0.4)'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: 'rgba(0,0,0,0.4)'}} tickFormatter={(value) => `$${value/1000}k`} />
                      <Tooltip 
                        contentStyle={{borderRadius: '0px', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', backgroundColor: '#fff'}}
                        itemStyle={{color: 'var(--foreground)', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase'}}
                      />
                      <Area type="monotone" dataKey="price" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>
          </div>

          {/* 3. Refined Action Panel */}
          <div className="lg:col-span-5 py-12 space-y-12 lg:space-y-16">
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                 <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">
                    {MOCK_PRODUCT.category}
                 </span>
                 <div className="w-1 h-1 rounded-full bg-primary/40" />
                 <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                    {MOCK_PRODUCT.condition}
                 </span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-serif italic tracking-tight text-foreground leading-[1.1]">
                {MOCK_PRODUCT.name}
              </h1>
              <p className="text-foreground/70 text-base leading-relaxed font-medium max-w-lg border-l border-primary/30 pl-6">
                {MOCK_PRODUCT.description}
              </p>
            </div>

            {/* Pricing Card */}
            <div className="bg-foreground p-10 lg:p-16 text-background relative overflow-hidden">
               <div className="absolute -top-10 -right-10 opacity-5 text-primary">
                  <Sparkles size={240} />
               </div>
               
               <div className="flex items-end justify-between mb-12 relative z-10 border-b border-background/10 pb-8">
                  <div>
                     <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-4">Immediate Acquisition</p>
                     <p className="text-6xl font-serif italic tracking-tight">${MOCK_PRODUCT.price.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-bold text-background/30 uppercase tracking-[0.2em] mb-2">Market Value</p>
                     <p className="text-xl font-medium text-background/20 line-through">$28,500</p>
                  </div>
               </div>

               <div className="space-y-6 relative z-10">
                  <button className="w-full bg-primary text-background py-6 font-bold text-[11px] uppercase tracking-[0.3em] hover:bg-primary/90 transition-all flex items-center justify-center space-x-4">
                     <ShoppingCart size={18} strokeWidth={1.5} />
                     <span>Secure Purchase</span>
                  </button>
                  <button className="w-full bg-transparent text-background border border-background/20 py-6 font-bold text-[11px] uppercase tracking-[0.3em] hover:bg-background hover:text-foreground transition-all flex items-center justify-center space-x-4">
                     <Gavel size={18} strokeWidth={1.5} />
                     <span>Place Private Offer</span>
                  </button>
               </div>
            </div>

            {/* Live Context Banner */}
            {MOCK_PRODUCT.seller.isLive && (
              <div className="bg-primary/5 border border-primary/20 p-8 flex items-center justify-between group">
                <div className="flex items-center space-x-6">
                   <div className="relative">
                      <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20" />
                      <div className="bg-red-500 p-4 rounded-full relative">
                         <Video size={20} className="text-white" />
                      </div>
                   </div>
                   <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">Live Presentation</p>
                      <p className="text-xl font-serif italic text-foreground">Join the Showcase</p>
                   </div>
                </div>
                <Link to="/live" className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:tracking-[0.3em] transition-all flex items-center">
                   Enter Room <ArrowRight size={14} className="ml-2" />
                </Link>
              </div>
            )}

            {/* Seller Info */}
            <SellerProfileCard seller={MOCK_PRODUCT.seller} className="border border-border p-8" />

            {/* AI Curator's Insight */}
            {deepDive && (
               <div className="bg-muted/5 border border-border p-10 lg:p-16 relative overflow-hidden">
                  <div className="flex items-center space-x-4 mb-10 border-b border-border pb-6">
                    <Sparkles size={18} className="text-primary" />
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-foreground/60 italic">Curator's Insight</h3>
                  </div>
                  <div className="space-y-12">
                     <section>
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-4">Historical Provenance</h4>
                        <p className="text-foreground/80 text-base leading-relaxed font-medium border-l border-primary/30 pl-8 italic">{deepDive.history}</p>
                     </section>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                           <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">Rarity Assessment</h4>
                           <p className="text-foreground font-serif text-lg italic">{deepDive.rarityReport}</p>
                        </div>
                        <div className="space-y-3">
                           <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">Investment Outlook</h4>
                           <p className="text-foreground font-serif text-lg italic">"{deepDive.investmentPotential}"</p>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* Provenance Timeline */}
            <div className="bg-background border border-border p-10">
               <h3 className="text-2xl font-serif italic text-foreground mb-10 border-b border-border pb-6">Provenance Timeline</h3>
               <div className="space-y-10 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-border">
                  <ProvenanceItem 
                     icon={<FileCheck size={14} />} 
                     title="Authenticated by PSA" 
                     date="Oct 12, 2023" 
                     active 
                  />
                  <ProvenanceItem 
                     icon={<Package size={14} />} 
                     title="Vault Depository Entry" 
                     date="Oct 10, 2023" 
                  />
                  <ProvenanceItem 
                     icon={<CheckCircle2 size={14} />} 
                     title="Blockchain Verification" 
                     date="Oct 09, 2023" 
                  />
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

const ProvenanceItem = ({ icon, title, date, active = false }: { icon: React.ReactNode, title: string, date: string, active?: boolean }) => (
   <div className="flex items-center space-x-6 relative z-10 group">
      <div className={`w-10 h-10 border flex items-center justify-center shrink-0 transition-all duration-500 ${active ? 'bg-primary border-primary text-background' : 'bg-background border-border text-foreground/40 group-hover:border-foreground/20'}`}>
         {icon}
      </div>
      <div>
         <p className={`text-sm font-bold uppercase tracking-[0.1em] ${active ? 'text-foreground' : 'text-foreground/40'}`}>{title}</p>
         <p className="text-[10px] font-medium text-foreground/30 uppercase tracking-[0.2em] mt-1">{date}</p>
      </div>
   </div>
);
