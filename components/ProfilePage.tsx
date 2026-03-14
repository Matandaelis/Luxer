
import React, { useState } from 'react';
import { 
  Award, CreditCard, MapPin, 
  LogOut, Gavel, Eye, Bell, 
  ChevronRight, Heart, 
  ArrowUpRight, Crown, Diamond, ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';

type ProfileTab = 'history' | 'bids' | 'watchlist' | 'ratings' | 'settings';

interface Order {
  id: string;
  item: string;
  price: number;
  date: string;
  status: string;
  image: string;
  deliveryDate: string;
  seller: string;
}

interface Bid {
  id: string;
  item: string;
  currentBid: number;
  yourBid: number;
  endTime: number;
  status: string;
  image: string;
  host: string;
}

const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-7782',
    item: 'Charizard Base Set Unlimited PSA 8',
    price: 450,
    date: 'Oct 24, 2023',
    status: 'Delivered',
    image: 'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?auto=format&fit=crop&q=80&w=400',
    deliveryDate: 'Oct 28',
    seller: 'PokeMaster99'
  },
  {
    id: 'ORD-9921',
    item: 'Rolex Submariner Box Only',
    price: 210,
    date: 'Nov 02, 2023',
    status: 'Shipped',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=400',
    deliveryDate: 'Est. Nov 05',
    seller: 'WatchKing'
  },
  {
    id: 'ORD-1102',
    item: 'Jordan 1 Retro High OG "Chicago"',
    price: 1800,
    date: 'Nov 03, 2023',
    status: 'Processing',
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=400',
    deliveryDate: 'Pending',
    seller: 'SneakerVault'
  }
];

const MOCK_BIDS = [
  {
    id: 'BID-1',
    item: 'Pikachu Illustrator (Proxy)',
    currentBid: 1500,
    yourBid: 1500,
    endTime: Date.now() + 3600000, // 1 hr
    status: 'Winning',
    image: 'https://images.unsplash.com/photo-1638613067237-b1127ef06c00?auto=format&fit=crop&q=80&w=400',
    host: 'PokeKing'
  },
  {
    id: 'BID-2',
    item: 'Sealed Base Set Booster Box',
    currentBid: 12500,
    yourBid: 11000,
    endTime: Date.now() + 7200000, // 2 hrs
    status: 'Outbid',
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=400',
    host: 'VintageBreaks'
  },
  {
    id: 'BID-3',
    item: 'Signed Michael Jordan Jersey',
    currentBid: 4200,
    yourBid: 4200,
    endTime: Date.now() - 10000, // Ended
    status: 'Won',
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=400',
    host: 'SportsLegends'
  }
];

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('history');
  const now = 1710424523000; // Fixed timestamp for mock data to satisfy linter purity rules

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-primary selection:text-black">
      {/* Hero Section - Editorial Style */}
      <section className="relative h-[70vh] flex items-end overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover opacity-40 grayscale hover:grayscale-0 transition-all duration-[3000ms]"
            alt="Luxury Background"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent"></div>
        </div>

        <div className="container mx-auto px-6 lg:px-12 pb-20 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-12"
          >
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-primary italic">Member Since 2023</span>
                <div className="h-px w-12 bg-primary/30"></div>
                <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/40">Verified Patron</span>
              </div>
              <h1 className="text-7xl lg:text-[10rem] font-serif italic leading-[0.85] tracking-tighter">
                {user.name.split(' ')[0]}<br />
                <span className="ml-20 lg:ml-40 text-primary">{user.name.split(' ')[1] || ''}</span>
              </h1>
            </div>

            <div className="flex flex-col items-start lg:items-end space-y-8">
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-1">Current Tier</p>
                  <p className="text-2xl font-serif italic text-primary">{user.tier} Status</p>
                </div>
                <div className="w-16 h-16 rounded-full border border-primary/30 flex items-center justify-center p-1">
                  <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
                    <Crown size={24} className="text-primary fill-current" />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setActiveTab('settings')}
                  className="px-8 py-4 bg-white text-black text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-primary transition-all"
                >
                  Edit Profile
                </button>
                <button 
                  onClick={logout}
                  className="p-4 border border-white/10 hover:border-red-500/50 hover:text-red-500 transition-all"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content - Bento Style */}
      <main className="container mx-auto px-6 lg:px-12 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column - Stats & Presence */}
          <div className="lg:col-span-4 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 p-10 space-y-12"
            >
              <div className="space-y-8">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.4em] text-primary italic">Patron Metrics</h3>
                <div className="space-y-6">
                  <StatRow label="Acquisitions" value="42" icon={<ShoppingBag size={16} />} />
                  <StatRow label="Active Bids" value="03" icon={<Gavel size={16} />} />
                  <StatRow label="Watchlist" value="18" icon={<Eye size={16} />} />
                  <StatRow label="Points" value={user.points.toLocaleString()} icon={<Diamond size={16} />} />
                </div>
              </div>

              <div className="pt-10 border-t border-white/10 space-y-8">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.4em] text-primary italic">Security Vault</h3>
                <div className="space-y-4">
                  <SecurityRow label="Biometric Access" active />
                  <SecurityRow label="Hardware Key" active />
                  <SecurityRow label="Two-Factor" active={false} />
                </div>
              </div>
            </motion.div>

            <div className="bg-primary p-10 text-black group cursor-pointer overflow-hidden relative">
              <div className="relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Exclusive Access</p>
                <h4 className="text-3xl font-serif italic leading-tight mb-8">Join the Private Auction Showcase</h4>
                <button className="flex items-center space-x-4 text-[11px] font-bold uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform">
                  <span>Request Invite</span>
                  <ArrowUpRight size={16} />
                </button>
              </div>
              <Diamond size={120} className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-125 transition-transform duration-700" />
            </div>
          </div>

          {/* Right Column - Tabs & Content */}
          <div className="lg:col-span-8 space-y-12">
            <div className="flex items-center space-x-12 border-b border-white/10 overflow-x-auto no-scrollbar">
              <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} label="Acquisitions" />
              <TabButton active={activeTab === 'bids'} onClick={() => setActiveTab('bids')} label="Active Bids" />
              <TabButton active={activeTab === 'watchlist'} onClick={() => setActiveTab('watchlist')} label="Watchlist" />
              <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="Preferences" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {activeTab === 'history' && (
                  <div className="space-y-6">
                    {MOCK_ORDERS.map((order, idx) => (
                      <OrderCard key={order.id} order={order} index={idx} />
                    ))}
                  </div>
                )}

                {activeTab === 'bids' && (
                  <div className="space-y-6">
                    {MOCK_BIDS.map((bid, idx) => (
                      <BidItem key={bid.id} bid={bid} index={idx} now={now} />
                    ))}
                  </div>
                )}

                {activeTab === 'watchlist' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[1, 2, 3, 4].map(i => (
                      <WatchItem key={i} index={i} />
                    ))}
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <SettingsBlock title="Identity" desc="Manage your verified credentials and public persona." icon={<Award />} />
                    <SettingsBlock title="Logistics" desc="Global shipping preferences and vault locations." icon={<MapPin />} />
                    <SettingsBlock title="Financials" desc="Secure payment methods and transaction history." icon={<CreditCard />} />
                    <SettingsBlock title="Alerts" desc="Tailor your notifications for upcoming drops." icon={<Bell />} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </main>

      {/* Footer Decoration */}
      <footer className="py-20 border-t border-white/10">
        <div className="container mx-auto px-6 lg:px-12 flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="flex items-center space-x-4">
            <Diamond size={24} className="text-primary" />
            <span className="text-[11px] font-bold uppercase tracking-[0.5em] text-white/40">LuxeLive Concierge</span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">© 2026 Private Collection. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

// --- Sub-components ---

const StatRow = ({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) => (
  <div className="flex items-center justify-between group cursor-default">
    <div className="flex items-center space-x-4">
      <div className="text-primary/40 group-hover:text-primary transition-colors">{icon}</div>
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{label}</span>
    </div>
    <span className="text-2xl font-serif italic">{value}</span>
  </div>
);

const SecurityRow = ({ label, active }: { label: string, active: boolean }) => (
  <div className="flex items-center justify-between">
    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">{label}</span>
    <div className={`flex items-center space-x-2 ${active ? 'text-primary' : 'text-white/10'}`}>
      <span className="text-[9px] font-bold uppercase tracking-[0.1em]">{active ? 'Secure' : 'Inactive'}</span>
      <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-primary shadow-[0_0_8px_rgba(212,175,55,0.6)]' : 'bg-white/10'}`}></div>
    </div>
  </div>
);

const TabButton = ({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) => (
  <button 
    onClick={onClick}
    className={`py-6 text-[10px] font-bold uppercase tracking-[0.4em] transition-all border-b-2 whitespace-nowrap ${active ? 'text-primary border-primary' : 'text-white/30 border-transparent hover:text-white'}`}
  >
    {label}
  </button>
);

const OrderCard = ({ order, index }: { order: Order, index: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="group bg-white/5 border border-white/10 p-8 flex flex-col md:flex-row items-center gap-8 hover:bg-white/10 transition-all cursor-pointer"
  >
    <div className="w-24 h-24 lg:w-32 lg:h-32 overflow-hidden shrink-0 border border-white/10">
      <img src={order.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" alt={order.item} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center space-x-4 mb-2">
        <span className="text-[9px] font-bold text-primary uppercase tracking-[0.3em]">{order.status}</span>
        <div className="w-1 h-1 bg-white/20 rounded-full"></div>
        <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.3em]">{order.date}</span>
      </div>
      <h4 className="text-2xl lg:text-3xl font-serif italic truncate">{order.item}</h4>
      <p className="text-[10px] font-bold text-white/40 uppercase mt-4 tracking-[0.1em]">Seller: {order.seller}</p>
    </div>
    <div className="text-right">
      <p className="text-3xl font-serif italic text-primary">${order.price.toLocaleString()}</p>
      <button className="mt-4 text-[9px] font-bold uppercase tracking-[0.2em] text-white/30 hover:text-white transition-colors">View Details</button>
    </div>
  </motion.div>
);

const BidItem = ({ bid, index, now }: { bid: Bid, index: number, now: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className={`p-8 border flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group hover:-translate-y-1 transition-all ${bid.status === 'Winning' ? 'bg-primary text-black border-primary' : 'bg-white/5 text-white border-white/10'}`}
  >
    <div className="w-20 h-20 overflow-hidden shrink-0 border border-black/10">
      <img src={bid.image} className="w-full h-full object-cover" alt={bid.item} />
    </div>
    <div className="flex-1">
      <div className="flex items-center space-x-4 mb-2">
        <span className={`text-[9px] font-bold uppercase tracking-[0.3em] ${bid.status === 'Winning' ? 'text-black' : 'text-primary'}`}>{bid.status}</span>
        <div className={`w-1 h-1 rounded-full ${bid.status === 'Winning' ? 'bg-black/20' : 'bg-white/20'}`}></div>
        <span className={`text-[9px] font-bold uppercase tracking-[0.3em] ${bid.status === 'Winning' ? 'text-black/40' : 'text-white/40'}`}>
          {Math.ceil((bid.endTime - now) / 60000)}m left
        </span>
      </div>
      <h4 className="text-2xl font-serif italic">{bid.item}</h4>
    </div>
    <div className="text-right">
      <p className="text-3xl font-serif italic">${bid.currentBid.toLocaleString()}</p>
      <button className={`mt-4 text-[9px] font-bold uppercase tracking-[0.2em] ${bid.status === 'Winning' ? 'text-black/60 hover:text-black' : 'text-white/40 hover:text-white'} transition-colors`}>
        Increase Bid
      </button>
    </div>
  </motion.div>
);

const WatchItem = ({ index }: { index: number }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="bg-white/5 border border-white/10 group overflow-hidden"
  >
    <div className="aspect-[16/10] overflow-hidden relative">
      <img src={`https://picsum.photos/seed/watch-${index}/800/500`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" alt="Watchlist" />
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/0 transition-colors"></div>
      <button className="absolute top-4 right-4 p-3 bg-black/60 backdrop-blur-md text-primary hover:bg-primary hover:text-black transition-all">
        <Heart size={16} fill="currentColor" />
      </button>
    </div>
    <div className="p-6">
      <h4 className="text-xl font-serif italic mb-2">Curated Piece #{index}</h4>
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">Est. $2,400 - $3,000</span>
        <button className="text-primary"><ArrowUpRight size={18} /></button>
      </div>
    </div>
  </motion.div>
);

const SettingsBlock = ({ title, desc, icon }: { title: string, desc: string, icon: React.ReactNode }) => (
  <div className="bg-white/5 border border-white/10 p-8 hover:border-primary/50 transition-all group cursor-pointer">
    <div className="flex items-start justify-between mb-6">
      <div className="p-3 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-black transition-all">
        {React.cloneElement(icon as React.ReactElement, { size: 20 })}
      </div>
      <ChevronRight size={16} className="text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
    </div>
    <h4 className="text-xl font-serif italic mb-2">{title}</h4>
    <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
  </div>
);

export default ProfilePage;
