
import React, { useState } from 'react';
import { 
  LayoutDashboard, Package, Video, ShoppingCart, 
  BarChart3, Settings, Plus, Search, MoreVertical,
  Users, DollarSign, ArrowUpRight,
  ChevronRight, Sparkles, Loader2,
  Clock, Zap, Handshake, Mail, CheckCircle,
  Printer, Scale, Wallet, CreditCard, ArrowDownLeft,
  Banknote, History, Shield, UserMinus, UserCheck,
  MapPin
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import InventoryModal from './InventoryModal';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { getShowPlanner } from '../geminiService';

// --- MOCK DATA ---

const SALES_DATA = [
  { name: 'Mon', total: 1200 },
  { name: 'Tue', total: 2100 },
  { name: 'Wed', total: 1800 },
  { name: 'Thu', total: 2400 },
  { name: 'Fri', total: 3200 },
  { name: 'Sat', total: 4500 },
  { name: 'Sun', total: 3800 },
];

const VIEWER_RETENTION_DATA = [
  { time: '0m', viewers: 100 },
  { time: '5m', viewers: 450 },
  { time: '10m', viewers: 800 },
  { time: '15m', viewers: 750 },
  { time: '20m', viewers: 1200 },
  { time: '25m', viewers: 1100 },
  { time: '30m', viewers: 950 },
];

const DEMOGRAPHICS_DATA = [
  { name: 'Gen Z', value: 45 },
  { name: 'Millennials', value: 35 },
  { name: 'Gen X', value: 15 },
  { name: 'Boomers', value: 5 },
];

const FUNNEL_DATA = [
  { name: 'Impressions', value: 12000 },
  { name: 'Views', value: 4500 },
  { name: 'Clicks', value: 1200 },
  { name: 'Bids', value: 450 },
  { name: 'Purchases', value: 120 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const INITIAL_INVENTORY = [
  { id: '1', name: 'Vintage Charizard', price: 25000, stock: 1, status: 'Active', image: 'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?auto=format&fit=crop&q=80&w=200' },
  { id: '2', name: 'Booster Box Base Set', price: 12500, stock: 4, status: 'Active', image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=200' },
  { id: '3', name: 'PSA 10 Lugia', price: 4200, stock: 0, status: 'Draft', image: 'https://images.unsplash.com/photo-1620327429699-a864d2621454?auto=format&fit=crop&q=80&w=200' },
];

const TRANSACTIONS = [
  { id: 'tx-1', type: 'Sale', amount: 450.00, status: 'Cleared', date: 'Oct 24, 2:30 PM', desc: 'Order #8821 - Vintage Charizard' },
  { id: 'tx-2', type: 'Sale', amount: 1250.00, status: 'Pending', date: 'Oct 24, 4:15 PM', desc: 'Order #8822 - Booster Box' },
  { id: 'tx-3', type: 'Payout', amount: -2500.00, status: 'Processed', date: 'Oct 22, 9:00 AM', desc: 'Transfer to Chase Bank ...8842' },
];

const MODERATORS = [
  { id: 1, name: 'Mod_Steve', role: 'Head Mod', active: true },
  { id: 2, name: 'Safety_Bot', role: 'Automated', active: true },
];

const BANNED_USERS = [
  { id: 1, name: 'Troll_123', reason: 'Spamming', date: '2 days ago' },
  { id: 2, name: 'Scam_Alert', reason: 'Phishing links', date: '1 week ago' },
];

const SellerCenter: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'shows' | 'orders' | 'strategy' | 'finance' | 'analytics' | 'community' | 'settings'>('overview');
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [isInventoryModalOpen, setInventoryModalOpen] = useState(false);
  
  // Planner State
  const [isPlanning, setIsPlanning] = useState(false);
  const [plannedShow, setPlannedShow] = useState<any>(null);

  // Handlers
  const handleAddItem = (item: any) => {
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: item.name,
      price: parseFloat(item.price),
      stock: 1,
      status: 'Active',
      image: 'https://images.unsplash.com/photo-1620327429699-a864d2621454?auto=format&fit=crop&q=80&w=200'
    };
    setInventory([newItem, ...inventory]);
  };

  const handlePlanShow = async () => {
    setIsPlanning(true);
    const itemNames = inventory.slice(0, 3).map(i => i.name);
    const plan = await getShowPlanner(itemNames.length > 0 ? itemNames : ['Charizard', 'Booster Box']);
    setPlannedShow(plan);
    setIsPlanning(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden md:flex flex-col z-20 shadow-sm">
        <div className="h-20 flex items-center px-8 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <Zap size={20} fill="currentColor" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              Seller<span className="text-primary">Hub</span>
            </span>
          </Link>
        </div>
        
        <nav className="flex-1 p-6 space-y-8 overflow-y-auto no-scrollbar">
          <div>
            <div className="text-[11px] font-bold text-slate-400 px-4 mb-4 uppercase tracking-widest">Operations</div>
            <div className="space-y-1">
              <NavItem icon={<LayoutDashboard size={20} />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
              <NavItem icon={<Video size={20} />} label="Live Shows" active={activeTab === 'shows'} onClick={() => setActiveTab('shows')} />
              <NavItem icon={<Package size={20} />} label="Products" active={activeTab === 'products'} onClick={() => setActiveTab('products')} />
              <NavItem icon={<ShoppingCart size={20} />} label="Orders" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
            </div>
          </div>
          
          <div>
            <div className="text-[11px] font-bold text-slate-400 px-4 mb-4 uppercase tracking-widest">Growth</div>
            <div className="space-y-1">
              <NavItem icon={<BarChart3 size={20} />} label="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
              <NavItem icon={<Sparkles size={20} />} label="AI Strategy" active={activeTab === 'strategy'} onClick={() => setActiveTab('strategy')} />
              <NavItem icon={<Wallet size={20} />} label="Finance" active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} />
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold text-slate-400 px-4 mb-4 uppercase tracking-widest">Admin</div>
            <div className="space-y-1">
              <NavItem icon={<Users size={20} />} label="Community" active={activeTab === 'community'} onClick={() => setActiveTab('community')} />
              <NavItem icon={<Settings size={20} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
            </div>
          </div>
        </nav>

        <div className="p-6 border-t border-slate-100">
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              SC
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">Seller Corp.</p>
              <p className="text-xs font-medium text-slate-500 truncate">Platinum Tier</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {activeTab === 'strategy' ? 'AI Show Planner' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h1>
          <div className="flex items-center gap-4">
             <button 
                onClick={() => navigate('/broadcast')}
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary/90 hover:scale-105 transition-all shadow-lg shadow-primary/20"
              >
                <Video size={18} className="mr-2" />
                Go Live
             </button>
          </div>
        </header>

        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <KPICard title="Total Revenue" value="$12,450" change="+12%" icon={<DollarSign size={24} />} />
                <KPICard title="Live Viewers (Avg)" value="840" change="+5%" icon={<Users size={24} />} />
                <KPICard title="Trust Score" value="4.9/5" change="Top 1%" icon={<CheckCircle size={24} />} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Revenue Trend</h3>
                    <select className="bg-slate-50 border-none text-sm font-bold text-slate-500 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20">
                      <option>Last 7 Days</option>
                      <option>Last 30 Days</option>
                    </select>
                  </div>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={SALES_DATA}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0066FF" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#0066FF" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: '600', fill: '#64748B'}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: '600', fill: '#64748B'}} tickFormatter={(val) => `$${val}`} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#fff', 
                            border: 'none', 
                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', 
                            borderRadius: '1rem', 
                            padding: '1rem' 
                          }} 
                        />
                        <Area type="monotone" dataKey="total" stroke="#0066FF" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-[2.5rem] p-10 shadow-xl shadow-slate-950/20 flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                  <h3 className="text-xl font-bold text-white tracking-tight mb-8 relative z-10">Pending Actions</h3>
                  <div className="space-y-4 flex-1 relative z-10">
                    <ActionItem icon={<Package size={20} />} label="4 Orders to ship" urgent />
                    <ActionItem icon={<Mail size={20} />} label="2 Unread messages" />
                    <ActionItem icon={<Handshake size={20} />} label="1 Partnership request" />
                  </div>
                  <button className="w-full mt-10 py-4 bg-white text-slate-900 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all relative z-10">
                    View All Tasks
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="space-y-10 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <KPICard title="Conversion Rate" value="4.2%" change="+0.5%" icon={<TrendingUp size={24} />} />
                  <KPICard title="Avg. Watch Time" value="18m 42s" change="+2m" icon={<Clock size={24} />} />
                  <KPICard title="Repeat Buyers" value="45%" change="+2%" icon={<Users size={24} />} />
                  <KPICard title="Refund Rate" value="0.2%" change="-0.1%" icon={<ArrowDownLeft size={24} />} />
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Retention Chart */}
                  <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
                     <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-8">Viewer Retention</h3>
                     <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                           <LineChart data={VIEWER_RETENTION_DATA}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: '600', fill: '#64748B'}} dy={10} />
                              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: '600', fill: '#64748B'}} />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#fff', 
                                  border: 'none', 
                                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', 
                                  borderRadius: '1rem', 
                                  padding: '1rem' 
                                }} 
                              />
                              <Line type="monotone" dataKey="viewers" stroke="#0066FF" strokeWidth={4} dot={{ r: 4, fill: '#0066FF', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                           </LineChart>
                        </ResponsiveContainer>
                     </div>
                  </div>

                  {/* Funnel Chart */}
                  <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
                     <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-8">Sales Funnel</h3>
                     <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={FUNNEL_DATA} layout="vertical" margin={{ left: 20 }}>
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                              <XAxis type="number" hide />
                              <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: '600', fill: '#64748B'}} />
                              <Tooltip 
                                cursor={{fill: 'rgba(0, 102, 255, 0.05)'}} 
                                contentStyle={{ 
                                  backgroundColor: '#fff', 
                                  border: 'none', 
                                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', 
                                  borderRadius: '1rem', 
                                  padding: '1rem' 
                                }} 
                              />
                              <Bar dataKey="value" fill="#0066FF" radius={[0, 12, 12, 0]} barSize={32} />
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  {/* Demographics */}
                  <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
                     <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-8">Viewer Demographics</h3>
                     <div className="h-[300px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                              <Pie data={DEMOGRAPHICS_DATA} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value" stroke="none">
                                 {DEMOGRAPHICS_DATA.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0066FF' : '#F1F5F9'} />
                                 ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#fff', 
                                  border: 'none', 
                                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', 
                                  borderRadius: '1rem', 
                                  padding: '1rem' 
                                }} 
                              />
                              <Legend verticalAlign="bottom" height={36} iconType="circle" />
                           </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                           <div className="text-center">
                              <p className="text-3xl font-black text-slate-900 tracking-tight">4.8k</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Top Products */}
                  <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
                     <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-8">Top Performing Products</h3>
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                           <thead>
                              <tr className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                 <th className="pb-6">Product</th>
                                 <th className="pb-6 text-right">Units</th>
                                 <th className="pb-6 text-right">Revenue</th>
                                 <th className="pb-6 text-right">Conversion</th>
                              </tr>
                           </thead>
                           <tbody className="font-medium text-slate-900">
                              <tr className="border-t border-slate-50 group hover:bg-slate-50 transition-colors">
                                 <td className="py-5 font-bold">Base Set Booster Box</td>
                                 <td className="py-5 text-right">4</td>
                                 <td className="py-5 text-right font-black text-primary">$50,000</td>
                                 <td className="py-5 text-right">
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold">8.5%</span>
                                 </td>
                              </tr>
                              <tr className="border-t border-slate-50 group hover:bg-slate-50 transition-colors">
                                 <td className="py-5 font-bold">Vintage Charizard PSA 8</td>
                                 <td className="py-5 text-right">1</td>
                                 <td className="py-5 text-right font-black text-primary">$450</td>
                                 <td className="py-5 text-right">
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold">12.0%</span>
                                 </td>
                              </tr>
                           </tbody>
                        </table>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* COMMUNITY TAB */}
          {activeTab === 'community' && (
             <div className="space-y-10 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                   {/* Moderators */}
                   <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
                      <div className="flex items-center justify-between mb-8">
                         <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            <Shield size={24} className="text-primary" /> Moderators
                         </h3>
                         <button className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">Add Mod</button>
                      </div>
                      <div className="space-y-4">
                         {MODERATORS.map(mod => (
                            <div key={mod.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-md transition-all">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-sm">
                                     {mod.name.substring(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                     <p className="font-bold text-slate-900">{mod.name}</p>
                                     <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{mod.role}</p>
                                  </div>
                               </div>
                               <button className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-lg transition-colors">Remove</button>
                            </div>
                         ))}
                      </div>
                   </div>

                   {/* Banned Users */}
                   <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
                      <div className="flex items-center justify-between mb-8">
                         <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            <UserMinus size={24} className="text-red-500" /> Banned Users
                         </h3>
                      </div>
                      <div className="space-y-4">
                         {BANNED_USERS.map(user => (
                            <div key={user.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-md transition-all">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center font-bold text-sm">
                                     {user.name.substring(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                     <p className="font-bold text-slate-900">{user.name}</p>
                                     <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Reason: {user.reason}</p>
                                  </div>
                               </div>
                               <button className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5 rounded-lg transition-colors flex items-center gap-1">
                                  <UserCheck size={14} /> Unban
                               </button>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>

                {/* VIP List */}
                <div className="bg-slate-900 rounded-[2.5rem] p-10 shadow-xl shadow-slate-950/20 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                   <div className="relative z-10">
                      <h3 className="text-xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
                        <Sparkles size={24} className="text-primary" /> VIP Customers
                      </h3>
                      <p className="text-sm font-medium text-slate-400 mb-8">Users who have spent over $1,000 in your streams.</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         {['Whale_Watcher', 'Collector_Dave', 'PokeFan_99'].map(vip => (
                            <div key={vip} className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer group">
                               <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                  <Sparkles size={16} />
                               </div>
                               <span className="font-bold text-white/90">{vip}</span>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
             <div className="max-w-4xl space-y-10 animate-in fade-in duration-500">
                <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-10">
                   <div>
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">Store Profile</h3>
                      <p className="text-sm font-medium text-slate-500 mb-8">Manage how your store appears to buyers.</p>
                      
                      <div className="space-y-8">
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="col-span-1">
                               <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Avatar</label>
                               <div className="w-32 h-32 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center hover:bg-slate-100 hover:border-primary transition-all cursor-pointer group">
                                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform mb-2">
                                     <Plus size={20} className="text-slate-400" />
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upload</span>
                               </div>
                            </div>
                            <div className="col-span-2 space-y-6">
                               <div>
                                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Store Name</label>
                                  <input defaultValue="Seller Corp." className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                               </div>
                               <div>
                                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Bio</label>
                                  <textarea rows={3} defaultValue="Premium collectibles and rare finds." className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="pt-10 border-t border-slate-100">
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">Shipping Configuration</h3>
                      <p className="text-sm font-medium text-slate-500 mb-8">Set your default shipping preferences.</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Default Carrier</label>
                            <select className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer appearance-none">
                               <option>USPS Priority Mail</option>
                               <option>UPS Ground</option>
                               <option>FedEx 2Day</option>
                            </select>
                         </div>
                         <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Handling Time</label>
                            <select className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer appearance-none">
                               <option>Same Day</option>
                               <option>1 Business Day</option>
                               <option>2 Business Days</option>
                            </select>
                         </div>
                         <div className="md:col-span-2">
                              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Return Address</label>
                              <div className="flex items-center gap-4 px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all group">
                                 <MapPin size={20} className="text-slate-400 group-focus-within:text-primary" />
                                 <input defaultValue="123 Commerce St, New York, NY 10001" className="bg-transparent w-full text-sm font-bold text-slate-900 outline-none" />
                              </div>
                         </div>
                      </div>
                   </div>

                   <div className="pt-10 border-t border-slate-100">
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">API Keys & Integrations</h3>
                      <p className="text-sm font-medium text-slate-500 mb-8">Manage external connections.</p>
                      <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                               <Zap size={24} className="text-primary" />
                            </div>
                            <div>
                               <p className="font-bold text-slate-900">Shopify Integration</p>
                               <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sync inventory automatically.</p>
                            </div>
                         </div>
                         <span className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-[10px] uppercase tracking-widest">Connected</span>
                      </div>
                   </div>
                </div>
                
                <div className="flex justify-end gap-4">
                   <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all border border-slate-200">Cancel</button>
                   <button className="px-10 py-4 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">Save Changes</button>
                </div>
             </div>
          )}

          {/* AI STRATEGY TAB */}
          {activeTab === 'strategy' && (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
               {!plannedShow ? (
                  <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 text-center relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-12 opacity-5"><Sparkles size={160} className="text-primary" /></div>
                     <div className="w-24 h-24 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mb-8 shadow-lg shadow-primary/10">
                        <Sparkles size={48} />
                     </div>
                     <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">AI Show Planner</h2>
                     <p className="text-base font-medium text-slate-500 max-w-md mb-10 leading-relaxed">
                        Let Gemini analyze your inventory to generate a high-conversion run of show, including hype triggers and pricing strategies.
                     </p>
                     <button 
                       onClick={handlePlanShow} 
                       disabled={isPlanning}
                       className="px-10 py-5 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary/90 disabled:opacity-50 flex items-center gap-3 transition-all shadow-xl shadow-primary/20 hover:scale-105"
                     >
                        {isPlanning ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} fill="currentColor" />}
                        {isPlanning ? 'Analyzing Inventory...' : 'Generate Strategy'}
                     </button>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                     {/* Itinerary */}
                     <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
                        <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
                           <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                              <Clock size={24} className="text-primary" />
                              Generated Run of Show
                           </h3>
                           <button onClick={() => setPlannedShow(null)} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Reset</button>
                        </div>
                        <div className="space-y-6">
                           {plannedShow.segments.map((seg: any, i: number) => (
                             <div key={i} className="flex items-start gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                                <div className="w-16 h-16 bg-white text-primary rounded-2xl flex items-center justify-center font-black text-sm shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                                   {seg.time}
                                </div>
                                <div className="flex-1">
                                   <h4 className="font-bold text-slate-900 text-lg mb-2">{seg.topic}</h4>
                                   <div className="flex items-center gap-2">
                                     <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-primary/10 text-primary rounded-full">Trigger: {seg.hypeTrigger}</span>
                                   </div>
                                </div>
                                <div className="text-right">
                                   <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Start Bid</p>
                                   <p className="font-black text-2xl text-slate-900 tracking-tight">{seg.suggestedBid}</p>
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>

                     {/* Vibe Check */}
                     <div className="bg-slate-900 rounded-[2.5rem] p-10 shadow-xl shadow-slate-950/20 relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                        <div className="relative z-10 flex-1">
                           <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center mb-8">
                              <Zap size={24} fill="currentColor" />
                           </div>
                           <h3 className="text-[11px] font-bold uppercase tracking-widest text-primary mb-4">Gemini Strategy</h3>
                           <p className="text-2xl font-bold text-white leading-tight mb-10 italic">
                              "{plannedShow.overallVibe}"
                           </p>
                           <div className="space-y-6 pt-10 border-t border-white/10">
                              <StrategyTip label="Scarcity" text="Only 1 left in stock" />
                              <StrategyTip label="Bundle" text="Free pack > $1k bids" />
                           </div>
                        </div>
                     </div>
                  </div>
               )}
            </div>
          )}

          {/* FINANCE TAB */}
          {activeTab === 'finance' && (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {/* Available Balance */}
                  <div className="bg-primary rounded-[2.5rem] p-10 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                     <div className="relative z-10">
                        <p className="text-[11px] font-bold uppercase tracking-widest opacity-70 mb-4">Available Balance</p>
                        <h3 className="text-5xl font-black tracking-tight mb-10">$8,450.00</h3>
                        <button className="w-full py-5 bg-white text-primary rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all shadow-lg flex items-center justify-center gap-2">
                           <Banknote size={20} /> Request Payout
                        </button>
                        <p className="text-[10px] font-bold opacity-60 mt-6 text-center uppercase tracking-widest">Funds typically arrive in 1-2 business days.</p>
                     </div>
                  </div>

                  {/* Pending Balance */}
                  <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                     <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">Pending Balance</p>
                     <h3 className="text-4xl font-black text-slate-900 tracking-tight mb-10">$1,250.00</h3>
                     <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                           <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Order #8822</span>
                           <span className="font-black text-slate-900">$850.00</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                           <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Order #8823</span>
                           <span className="font-black text-slate-900">$400.00</span>
                        </div>
                     </div>
                     <div className="mt-8 pt-6 border-t border-slate-100">
                        <p className="text-[10px] font-bold text-slate-500 flex items-center gap-2 uppercase tracking-widest">
                           <CheckCircle size={14} className="text-emerald-500" /> Auto-clears on delivery + 24h
                        </p>
                     </div>
                  </div>

                  {/* Payout Method */}
                  <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
                     <div>
                        <div className="flex items-center justify-between mb-8">
                           <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Payout Method</p>
                           <button className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">Edit</button>
                        </div>
                        <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                           <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                              <CreditCard size={24} className="text-primary" />
                           </div>
                           <div>
                              <p className="font-bold text-slate-900">Chase Bank</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Checking •••• 8842</p>
                           </div>
                        </div>
                     </div>
                     <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 mt-6">
                        <div className="flex items-center gap-2 mb-2">
                           <Sparkles size={16} className="text-primary" />
                           <span className="text-[11px] font-bold uppercase tracking-widest text-primary">Instant Pay Available</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Get funds in minutes for a 1.5% fee.</p>
                     </div>
                  </div>
               </div>

               {/* Transaction History */}
               <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                  <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                     <h3 className="font-bold text-xl text-slate-900 tracking-tight flex items-center gap-3">
                        <History size={24} className="text-primary" /> Recent Transactions
                     </h3>
                     <button className="px-6 py-3 bg-slate-50 text-slate-900 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100">Download CSV</button>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                           <tr>
                              <th className="px-10 py-6">Transaction</th>
                              <th className="px-10 py-6">Date</th>
                              <th className="px-10 py-6">Status</th>
                              <th className="px-10 py-6 text-right">Amount</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {TRANSACTIONS.map((tx) => (
                              <tr key={tx.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                                 <td className="px-10 py-6">
                                    <div className="flex items-center gap-4">
                                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${tx.amount > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-900 text-white'}`}>
                                          {tx.amount > 0 ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                       </div>
                                       <div>
                                          <p className="font-bold text-slate-900">{tx.type}</p>
                                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tx.desc}</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-10 py-6 font-bold text-slate-500">{tx.date}</td>
                                 <td className="px-10 py-6">
                                    <span className={`inline-flex items-center px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full ${
                                       tx.status === 'Cleared' || tx.status === 'Processed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                    }`}>
                                       {tx.status}
                                    </span>
                                 </td>
                                 <td className={`px-10 py-6 text-right font-black text-xl tracking-tight ${tx.amount > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                                    {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
               <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="relative w-full md:w-96">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                     <input placeholder="Search inventory..." className="w-full h-14 bg-white border border-slate-100 rounded-2xl px-12 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" />
                  </div>
                  <button 
                    onClick={() => setInventoryModalOpen(true)}
                    className="w-full md:w-auto px-8 py-4 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                  >
                     <Plus size={18} /> Add Product
                  </button>
               </div>

               <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                  <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                           <tr>
                              <th className="px-10 py-6">Product</th>
                              <th className="px-10 py-6">Status</th>
                              <th className="px-10 py-6 text-right">Price</th>
                              <th className="px-10 py-6 text-right">Stock</th>
                              <th className="px-10 py-6 w-[80px]"></th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {inventory.map((item) => (
                              <tr key={item.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                                 <td className="px-10 py-6">
                                    <div className="flex items-center gap-4">
                                       <img src={item.image} className="w-12 h-12 object-cover rounded-xl shadow-sm" />
                                       <p className="font-bold text-slate-900">{item.name}</p>
                                    </div>
                                 </td>
                                 <td className="px-10 py-6">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                       item.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                       {item.status}
                                    </span>
                                 </td>
                                 <td className="px-10 py-6 text-right font-black text-slate-900 tracking-tight text-lg">${item.price.toLocaleString()}</td>
                                 <td className="px-10 py-6 text-right font-bold text-slate-500">{item.stock}</td>
                                 <td className="px-10 py-6 text-right">
                                    <button className="p-2 text-slate-400 hover:text-primary transition-colors"><MoreVertical size={18} /></button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
               <div className="bg-primary/5 border border-primary/10 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <Scale size={32} />
                     </div>
                     <div>
                        <h3 className="font-bold text-xl text-slate-900 tracking-tight">Shipping Station</h3>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Connected to Scale • Ready to Weigh</p>
                     </div>
                  </div>
                  <button className="w-full md:w-auto px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all border border-slate-200 shadow-sm">Calibrate</button>
               </div>
               
               <div className="grid grid-cols-1 gap-6">
                  {[1, 2].map(i => (
                     <div key={i} className="flex flex-col md:flex-row items-center justify-between p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all group">
                        <div className="flex items-center gap-6 mb-6 md:mb-0">
                           <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm group-hover:bg-primary/5 transition-colors">
                              <Package size={28} className="text-primary" />
                           </div>
                           <div>
                              <p className="font-bold text-xl text-slate-900 tracking-tight">Order #882{i}</p>
                              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Vintage Charizard • Sold for $450</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                           <button className="flex-1 md:flex-none p-4 bg-slate-50 text-slate-900 rounded-2xl hover:bg-slate-100 transition-all border border-slate-100"><Printer size={20} /></button>
                           <button className="flex-2 md:flex-none px-10 py-4 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">Print Label</button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
          )}
        </div>
      </main>

      <InventoryModal 
        isOpen={isInventoryModalOpen} 
        onClose={() => setInventoryModalOpen(false)} 
        onAdd={handleAddItem} 
      />
    </div>
  );
};

// Sub-components
const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
      active 
        ? 'bg-primary/10 text-primary' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    {icon}
    {label}
  </button>
);

const KPICard = ({ title, value, change, icon }: any) => (
  <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:scale-[1.02] transition-all">
    <div className="flex items-center justify-between mb-6">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
        {icon}
      </div>
      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
        change.includes('+') || change.includes('Top') 
          ? 'bg-emerald-50 text-emerald-600' 
          : 'bg-red-50 text-red-600'
      }`}>
        {change}
      </span>
    </div>
    <div>
      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <div className="text-4xl font-black text-slate-900 tracking-tight">{value}</div>
    </div>
  </div>
);

const ActionItem = ({ icon, label, urgent }: any) => (
  <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group">
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
        urgent ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white'
      }`}>
        {icon}
      </div>
      <span className="text-sm font-bold text-white/90">{label}</span>
    </div>
    <ChevronRight size={18} className="text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
  </div>
);

const StrategyTip = ({ label, text }: { label: string, text: string }) => (
  <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10">
     <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0 shadow-lg shadow-primary/50"></div>
     <div>
        <p className="text-[10px] font-bold uppercase text-primary tracking-widest mb-1">{label}</p>
        <p className="text-sm font-medium text-white/80 leading-relaxed">{text}</p>
     </div>
  </div>
);

export default SellerCenter;
