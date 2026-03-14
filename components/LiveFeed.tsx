
import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, Send, Users, MessageCircle, Gavel, Award, 
  Maximize, PictureInPicture, Share2, ShoppingCart,
  ChevronLeft, ChevronRight, X, MoreHorizontal, Search, ShoppingBag,
  Timer, TrendingUp, Volume2, VolumeX, Flame, Zap, Trophy, ShieldCheck,
  Gift, Star, Info, Plus, History, Sparkles, Loader2, CheckCircle,
  ThumbsUp, Smile, Laugh, PartyPopper, Crown, Medal, Activity, Target, Check, EyeOff, Eye, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LiveShow, ChatMessage, Product, Auction, Giveaway } from '../types';
import { getSmartChatReply, getProductAnalysis } from '../geminiService';
import LiveKitStream from './LiveKitStream';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError } from '../firebase';
import { collection, query, where, limit, onSnapshot, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';

const TOKEN_SERVER_URL = '/api/getToken';
const LIVEKIT_WS_URL = import.meta.env.VITE_LIVEKIT_WS_URL || 'wss://your-project-id.livekit.cloud';

const MOCK_SHOW: LiveShow = {
  id: 'ls-001',
  title: 'POKEMON PULL GAME & BOOSTER BREAKS! ⚡ 1st ED CHASE! 🔥',
  host: {
    id: 'h-01',
    name: 'PokeMaster99',
    avatar: 'https://ui-avatars.com/api/?name=Poke+Master&background=000&color=facc15&bold=true',
    points: 125000,
    tier: 'Platinum',
    isVerified: true,
    role: 'host'
  },
  viewers: 1542,
  thumbnail: 'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?auto=format&fit=crop&q=80&w=2000',
  products: [
    { id: 'p1', name: '1st Ed Shadowless Charizard PSA 10', price: 25000, originalPrice: 30000, image: 'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?auto=format&fit=crop&q=80&w=400', description: 'The holy grail of Pokemon cards.', stock: 1 },
    { id: 'p2', name: 'Base Set Booster Pack Sealed', price: 450, originalPrice: 600, image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=400', description: 'Sealed vintage goodness.', stock: 5 },
  ],
};

const INITIAL_BIDDERS = [
  { name: 'CardKing_92', total: 12450, avatar: 'https://ui-avatars.com/api/?name=CK&background=000&color=fff' },
  { name: 'PokeWhale', total: 8200, avatar: 'https://ui-avatars.com/api/?name=PW&background=000&color=fff' },
  { name: 'CharizardLover', total: 5100, avatar: 'https://ui-avatars.com/api/?name=CL&background=000&color=fff' },
  { name: 'AshKetchum_Real', total: 2400, avatar: 'https://ui-avatars.com/api/?name=AK&background=000&color=fff' },
  { name: 'MistyWater', total: 1100, avatar: 'https://ui-avatars.com/api/?name=MW&background=000&color=fff' },
];

const LiveFeed: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [bidHistory, setBidHistory] = useState<{name: string, amount: number, time: number}[]>([]);
  const [leaderboard, setLeaderboard] = useState(INITIAL_BIDDERS);
  const [input, setInput] = useState('');
  const [isMuted, setIsMuted] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'shop' | 'copilot' | 'stats'>('chat');
  const [heartAnimations, setHeartAnimations] = useState<{id: number, left: number, emoji: string}[]>([]);
  const [activeAuction, setActiveAuction] = useState<Auction | null>(null);
  const [auctionTimeLeft, setAuctionTimeLeft] = useState<number>(0);
  const [isFlashBid, setIsFlashBid] = useState(false);
  const [aiTalkingPoints, setAiTalkingPoints] = useState<{sellingPoints: string[], pitch: string} | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [checkedPoints, setCheckedPoints] = useState<number[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showWheel, setShowWheel] = useState(false);
  const [hypeLevel, setHypeLevel] = useState(65);
  const [showMobileChat, setShowMobileChat] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [activeShow, setActiveShow] = useState<any>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch Active Show
  useEffect(() => {
    const q = query(collection(db, 'shows'), where('isActive', '==', true), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setActiveShow({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      } else {
        setActiveShow(null);
      }
    }, (error) => {
      handleFirestoreError(error, 'list' as any, 'shows');
    });
    return () => unsubscribe();
  }, []);

  // Fetch Messages
  useEffect(() => {
    if (!activeShow) return;
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as any))
        .filter((msg: any) => msg.showId === activeShow.id);
      setMessages(newMessages);
    }, (error) => {
      handleFirestoreError(error, 'list' as any, 'messages');
    });
    return () => unsubscribe();
  }, [activeShow]);

  // Fetch LiveKit Token
  useEffect(() => {
    const fetchToken = async () => {
      if (!user || !activeShow) return;
      try {
        setDemoMode(false);
        const roomId = activeShow.id;
        const username = user.name;
        const role = user.role;
        
        const response = await fetch(`${TOKEN_SERVER_URL}?room=${roomId}&username=${username}&role=${role}`);
        
        if (!response.ok) {
           throw new Error('Server offline');
        }

        const data = await response.json();
        if (data.token) {
          setToken(data.token);
        } else {
          throw new Error('No token returned');
        }
      } catch (error) {
        console.warn("Failed to fetch LiveKit token (Server might be offline). Switching to Demo Mode.", error);
        setDemoMode(true);
      }
    };
    fetchToken();
  }, [user, activeShow]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showMobileChat]);

  useEffect(() => {
    if (!activeAuction || !activeAuction.isActive) return;
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((activeAuction.endTime - Date.now()) / 1000));
      setAuctionTimeLeft(remaining);
      if (remaining === 0) {
        setActiveAuction(prev => prev ? { ...prev, isActive: false } : null);
        addSystemMessage(`SOLD! ${activeAuction.highestBidder || 'No one'} for $${activeAuction.currentBid}! 🔨`);
        setHypeLevel(prev => Math.min(100, prev + 15));
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [activeAuction]);

  const addSystemMessage = async (text: string) => {
    if (!activeShow || !user) return;
    try {
      await addDoc(collection(db, 'messages'), {
        showId: activeShow.id,
        userId: user.id,
        userName: 'Whatnot Bot',
        text,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Failed to send system message", error);
    }
  };

  const updateLeaderboard = (bidderName: string, amount: number, avatar: string) => {
    setLeaderboard(prev => {
      const existing = prev.find(p => p.name === bidderName);
      let newList;
      if (existing) {
        newList = prev.map(p => p.name === bidderName ? { ...p, total: p.total + amount } : p);
      } else {
        newList = [...prev, { name: bidderName, total: amount, avatar }];
      }
      return newList.sort((a, b) => b.total - a.total).slice(0, 10);
    });
  };

  const handleBid = (amount: number) => {
    if (!activeAuction || !user) return;
    const newBid = activeAuction.currentBid + amount;
    
    // Update active auction state
    setActiveAuction({ ...activeAuction, currentBid: newBid, highestBidder: user.name });
    
    // Update histories
    setBidHistory(prev => [{name: user.name, amount: newBid, time: Date.now()}, ...prev]);
    updateLeaderboard(user.name, amount, user.avatar);

    setIsFlashBid(true);
    setHypeLevel(prev => Math.min(100, prev + 5));
    setTimeout(() => setIsFlashBid(false), 800);
    addSystemMessage(`${user.name} bid $${newBid}! 🔥`);
    triggerReaction('🔥');
  };

  const startAuction = async (product: Product) => {
    const endTime = Date.now() + 15000;
    setActiveAuction({
      id: `auc-${Date.now()}`,
      productId: product.id,
      currentBid: product.price,
      highestBidder: undefined,
      endTime,
      isActive: true
    });
    setBidHistory([{name: 'Opening Bid', amount: product.price, time: Date.now()}]);
    setAuctionTimeLeft(15);
    setActiveTab('copilot'); // Switch to copilot for the host
    setCheckedPoints([]); // Reset checklist
    
    // AI Insights Generation
    setAiTalkingPoints(null); 
    setIsAiLoading(true);
    const insights = await getProductAnalysis(product.name, product.description);
    setAiTalkingPoints(insights);
    setIsAiLoading(false);
    
    addSystemMessage(`AI COPILOT: Insights ready for ${product.name}! 🤖`);
  };

  const runGiveawaySpin = () => {
    setShowWheel(true);
    setIsSpinning(true);
    setTimeout(() => {
      setIsSpinning(false);
      setTimeout(() => {
        setShowWheel(false);
        addSystemMessage(`GIVEAWAY WINNER: @CardCollector_92! 🎁`);
      }, 2000);
    }, 3000);
  };

  const triggerReaction = (emoji: string = '❤️') => {
    const id = Date.now();
    const left = Math.random() * 80 - 40;
    setHeartAnimations(prev => [...prev, { id, left, emoji }]);
    setTimeout(() => {
      setHeartAnimations(prev => prev.filter(h => h.id !== id));
    }, 1200);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !user || !activeShow) return;
    
    try {
      await addDoc(collection(db, 'messages'), {
        showId: activeShow.id,
        userId: user.id,
        userName: user.name,
        text: input,
        createdAt: serverTimestamp()
      });
      setHypeLevel(prev => Math.min(100, prev + 2));
      setInput('');
      
      if (Math.random() > 0.8) {
         setTimeout(async () => {
            const reply = await getSmartChatReply(activeShow.title, input);
            addSystemMessage(`AI ASSISTANT: ${reply}`);
         }, 1500);
      }
    } catch (error) {
      handleFirestoreError(error, 'create' as any, 'messages');
    }
  };

  const togglePoint = (index: number) => {
    if (checkedPoints.includes(index)) {
      setCheckedPoints(prev => prev.filter(i => i !== index));
    } else {
      setCheckedPoints(prev => [...prev, index]);
    }
  };

  const isSuddenDeath = auctionTimeLeft > 0 && auctionTimeLeft <= 5;
  const pinnedProduct = MOCK_SHOW.products[0];

  return (
    <div className="h-full flex flex-col lg:flex-row bg-background overflow-hidden">
      
      {/* 1. Immersive Stream Section */}
      <div className="flex-1 flex items-center justify-center p-0 lg:p-8 bg-background relative h-[100dvh] lg:h-auto">
        <div className="relative h-full w-full lg:h-full lg:aspect-[9/16] bg-black overflow-hidden rounded-none lg:rounded-[3rem] shadow-2xl shadow-primary/10">
          
          {/* Header Overlay */}
          <div className="absolute top-6 lg:top-8 left-6 z-50">
             <button 
               onClick={() => navigate('/')} 
               className="bg-black/20 backdrop-blur-xl text-white p-3 rounded-full border border-white/10 hover:bg-black/40 transition-all"
             >
                <X size={20} />
             </button>
          </div>

          <LiveKitStream 
             token={token}
             serverUrl={LIVEKIT_WS_URL}
             isMuted={isMuted} 
             onToggleMute={() => setIsMuted(!isMuted)} 
             role={user?.role || 'viewer'}
             demoMode={demoMode}
          />

          {/* Top Badges */}
          <div className="absolute top-6 lg:top-8 left-20 right-6 lg:left-24 lg:right-8 z-40 flex items-center gap-3">
             <div className="bg-red-500 text-white px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center shadow-lg shadow-red-500/20">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div> LIVE
             </div>

             <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000"
                  style={{ width: `${hypeLevel}%` }}
                ></div>
             </div>
             
             <div className="bg-black/40 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center border border-white/10">
                <Flame size={14} className="mr-2 text-primary" />
                <span>x{Math.floor(hypeLevel / 20) + 1}</span>
             </div>
          </div>

          {/* Mobile Overlay Chat */}
          {showMobileChat && (
            <div className="lg:hidden absolute bottom-48 left-6 right-20 z-30 max-h-48 overflow-y-auto no-scrollbar">
               <div className="space-y-2">
                  {messages.slice(-6).map((msg) => (
                    <div key={msg.id} className="animate-in slide-in-from-left-4 fade-in duration-500">
                      <div className="bg-black/30 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl inline-flex items-start gap-2 max-w-full">
                        <span className="text-[10px] font-bold text-primary shrink-0">@{msg.userName}</span>
                        <span className="text-[12px] text-white/90 font-medium">{msg.text}</span>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* Social Interactions */}
          <div className="absolute bottom-32 lg:bottom-12 right-6 lg:right-8 z-40 flex flex-col items-center gap-4">
            <div className="relative">
              {heartAnimations.map(h => (
                <div key={h.id} className="animate-heart text-3xl" style={{ '--random-x': `${h.left}px`, left: '0' } as any}>
                  {h.emoji}
                </div>
              ))}
              <button onClick={() => triggerReaction('❤️')} className="w-14 h-14 bg-black/30 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-black/50 active:scale-95 transition-all">
                <Heart size={22} className="fill-current" />
              </button>
            </div>
            
            <button onClick={runGiveawaySpin} className="w-14 h-14 bg-black/30 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-black/50 active:scale-95 transition-all">
              <Gift size={22} />
            </button>

            <button onClick={() => setShowMobileChat(!showMobileChat)} className="lg:hidden w-14 h-14 bg-black/30 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-black/50 active:scale-95 transition-all">
               {showMobileChat ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </div>

          {/* Bottom Card Holder */}
          <div className="absolute bottom-6 lg:bottom-12 left-6 right-6 lg:left-8 lg:right-28 z-30 pointer-events-none">
            {activeAuction && activeAuction.isActive ? (
              <div className={`bg-white/10 backdrop-blur-2xl border border-white/20 p-6 rounded-[2rem] pointer-events-auto transition-all ${isSuddenDeath ? 'sudden-death scale-105 border-primary/50' : ''} ${isFlashBid ? 'flash-bid' : ''}`}>
                <div className="flex items-center justify-between mb-6">
                  <span className={`px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${isSuddenDeath ? 'bg-red-500 text-white animate-pulse' : 'bg-white/20 text-white'}`}>
                    {isSuddenDeath ? 'Final Call' : 'Live Auction'}
                  </span>
                  <div className={`flex items-center gap-2 font-bold tabular-nums transition-all ${isSuddenDeath ? 'text-red-500 scale-110' : 'text-white'}`}>
                    <Timer size={18} />
                    <span className="text-2xl">{auctionTimeLeft}s</span>
                  </div>
                </div>
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/20">
                    <img src={pinnedProduct.image} className="w-full h-full object-cover" alt="Product" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-4xl font-black transition-all ${isFlashBid ? 'text-primary' : 'text-white'}`}>
                      ${activeAuction.currentBid}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                       <Crown size={14} className="text-primary" />
                       <span className="text-[11px] font-bold text-white/60 uppercase tracking-wide truncate">{activeAuction.highestBidder || 'No bids yet'}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => handleBid(5)} className="py-4 bg-white/10 rounded-2xl text-white font-bold text-sm hover:bg-white/20 transition-all">+$5</button>
                  <button onClick={() => handleBid(25)} className="py-4 bg-primary rounded-2xl text-white font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">+$25</button>
                </div>
              </div>
            ) : (
              <div onClick={() => startAuction(pinnedProduct)} className="bg-black/30 backdrop-blur-xl border border-white/10 p-4 rounded-[2rem] flex items-center gap-4 pointer-events-auto hover:bg-black/40 transition-all cursor-pointer group">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10">
                  <img src={pinnedProduct.image} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" alt="Product" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-[11px] font-bold text-white/60 uppercase tracking-wide truncate mb-1">{pinnedProduct.name}</h5>
                  <p className="text-white font-black text-xl">${pinnedProduct.price}</p>
                </div>
                <button className="bg-primary text-white text-[11px] font-bold px-6 py-3 rounded-full uppercase tracking-wider hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">Bid Now</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Desktop Sidebar Console */}
      <aside className="hidden lg:flex w-[450px] flex-col bg-card h-full border-l border-border z-40">
        <div className="flex items-center p-4 gap-2 border-b border-border">
          <TabButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} label="Chat" count={messages.length} />
          <TabButton active={activeTab === 'shop'} onClick={() => setActiveTab('shop')} label="Store" />
          <TabButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} label="Patrons" />
          <TabButton active={activeTab === 'copilot'} onClick={() => setActiveTab('copilot')} label="AI" />
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar p-6">
          {activeTab === 'chat' ? (
            <div className="space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex items-start gap-4 animate-in slide-in-from-bottom-2 duration-500 ${msg.userName === 'Whatnot Bot' ? 'bg-primary/5 p-4 rounded-3xl border border-primary/10' : ''}`}>
                  {msg.userName !== 'Whatnot Bot' && (
                     <img src={`https://ui-avatars.com/api/?name=${msg.userName}&background=4f46e5&color=fff&bold=true`} className="w-10 h-10 rounded-full" alt="Avatar" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                       <span className={`text-[11px] font-bold ${msg.userName === 'Whatnot Bot' ? 'text-primary' : 'text-foreground/60'}`}>{msg.userName}</span>
                       <span className="text-[10px] text-foreground/30">Now</span>
                    </div>
                    <p className={`text-sm leading-relaxed ${msg.userName === 'Whatnot Bot' ? 'text-foreground font-semibold italic' : 'text-foreground/80'}`}>
                      {msg.text}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          ) : activeTab === 'shop' ? (
            <div className="space-y-4">
              {MOCK_SHOW.products.map(product => (
                 <div key={product.id} className="bg-background rounded-3xl border border-border p-4 flex items-center gap-4 hover:border-primary/30 transition-all group cursor-pointer">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border border-border">
                      <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" alt={product.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[12px] font-bold text-foreground/60 truncate mb-1">{product.name}</h4>
                      <p className="text-xl font-black text-foreground">${product.price}</p>
                      <button onClick={() => startAuction(product)} className="mt-3 w-full py-2 bg-primary/10 text-primary rounded-xl text-[11px] font-bold hover:bg-primary hover:text-white transition-all">Start Auction</button>
                    </div>
                 </div>
              ))}
            </div>
          ) : activeTab === 'stats' ? (
             <div className="space-y-8">
                <div className="bg-primary rounded-3xl p-8 text-center relative overflow-hidden shadow-xl shadow-primary/10">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-white/70 mb-2">Total Sales</p>
                    <p className="text-4xl font-black text-white">
                      ${leaderboard.reduce((acc, curr) => acc + curr.total, 0).toLocaleString()}
                    </p>
                </div>
                
                <div className="space-y-4">
                    <h4 className="text-[12px] font-bold text-foreground/40 uppercase tracking-wider">Top Bidders</h4>
                    {leaderboard.map((bidder, idx) => (
                        <div key={idx} className="flex items-center gap-4 bg-background p-4 rounded-3xl border border-border hover:border-primary/30 transition-all">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-primary text-white' : 'bg-muted text-foreground/40'}`}>
                                {idx + 1}
                            </div>
                            <img src={bidder.avatar} className="w-10 h-10 rounded-full" alt={bidder.name} />
                            <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-bold text-foreground/80 truncate">@{bidder.name}</p>
                                <div className="w-full bg-muted h-1.5 mt-2 rounded-full overflow-hidden">
                                    <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${(bidder.total / Math.max(...leaderboard.map(l => l.total))) * 100}%` }}></div>
                                </div>
                            </div>
                            <p className="text-sm font-bold text-foreground">${bidder.total.toLocaleString()}</p>
                        </div>
                    ))}
                </div>
             </div>
          ) : (
            <div className="space-y-8">
               {isAiLoading ? (
                 <div className="h-full flex flex-col items-center justify-center text-center p-10 gap-4">
                    <Loader2 size={32} className="text-primary animate-spin" />
                    <p className="text-[12px] font-bold text-foreground/40">AI is analyzing the product...</p>
                 </div>
               ) : aiTalkingPoints ? (
                   <>
                       <div className="bg-muted/20 p-8 border border-border relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-8 opacity-5"><Zap size={80} strokeWidth={1} className="text-foreground" /></div>
                           <div className="flex items-center space-x-3 mb-6">
                               <Sparkles size={16} strokeWidth={1.5} className="text-primary" />
                               <span className="text-[10px] font-bold uppercase text-primary tracking-[0.3em]">Curator's Pitch</span>
                           </div>
                           <p className="text-2xl font-light text-foreground italic leading-relaxed serif">"{aiTalkingPoints.pitch}"</p>
                       </div>
                       
                       <div className="space-y-6">
                           <p className="text-[10px] font-bold uppercase text-foreground/40 tracking-[0.3em] border-b border-border pb-4">Provenance & Details</p>
                           <div className="space-y-6">
                               {aiTalkingPoints.sellingPoints.map((point, i) => (
                                   <div 
                                     key={i} 
                                     onClick={() => togglePoint(i)}
                                     className={`flex items-start space-x-6 p-6 cursor-pointer transition-all border ${checkedPoints.includes(i) ? 'bg-foreground text-background border-foreground' : 'bg-background hover:border-primary/30 border-border'}`}
                                   >
                                       <div className={`w-5 h-5 border flex items-center justify-center shrink-0 transition-colors ${checkedPoints.includes(i) ? 'bg-primary border-primary text-background' : 'border-border text-transparent bg-background'}`}>
                                           <Check size={12} strokeWidth={3} />
                                       </div>
                                       <p className={`text-sm font-medium leading-relaxed ${checkedPoints.includes(i) ? 'text-background/60 line-through' : 'text-foreground/80'}`}>{point}</p>
                                   </div>
                               ))}
                           </div>
                       </div>
                   </>
               ) : (
                   <div className="h-full flex flex-col items-center justify-center text-center p-10">
                       <Target size={40} className="mb-6 text-foreground/10" />
                       <h4 className="text-lg font-bold text-foreground mb-2">AI Copilot Ready</h4>
                       <p className="text-[12px] text-foreground/40 leading-relaxed">Start an auction to get real-time selling points and market insights.</p>
                   </div>
               )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border bg-card">
          <div className="flex items-center gap-3 bg-background px-4 py-2 rounded-2xl border border-border focus-within:border-primary/30 transition-all">
             <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-transparent py-3 text-sm font-medium outline-none text-foreground placeholder:text-foreground/30"
            />
            <button 
               onClick={handleSendMessage}
               className={`p-2 rounded-xl transition-all ${input.trim() ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground/10'}`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};

const TabButton = ({ active, onClick, label, count, icon }: { active: boolean, onClick: () => void, label: string, count?: number, icon?: React.ReactNode }) => (
  <button onClick={onClick} className={`flex-1 py-6 text-[10px] font-bold uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 border-b-2 ${active ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-foreground/30 hover:text-foreground/60'}`}>
    {icon && <span className="shrink-0">{icon}</span>}
    <span>{label}</span>
    {count !== undefined && count > 0 && <span className={`flex items-center justify-center text-[9px] w-5 h-5 rounded-full ${active ? 'bg-primary text-background' : 'bg-muted text-foreground/40'}`}>{count}</span>}
  </button>
);

export default LiveFeed;
