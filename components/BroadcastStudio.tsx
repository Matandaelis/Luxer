
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, MicOff, Video, VideoOff, Settings, ShoppingBag, 
  MessageSquare, Users, BarChart2, X, MonitorUp, Gavel, Timer,
  ArrowRight, CheckCircle2, ImagePlus, Gift, Sparkles, PartyPopper,
  Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LiveKitStream from './LiveKitStream';
import { db, handleFirestoreError } from '../firebase';
import { collection, doc, setDoc, updateDoc, onSnapshot, query, orderBy, serverTimestamp, addDoc, getDoc } from 'firebase/firestore';

const TOKEN_SERVER_URL = '/api/getToken';
const LIVEKIT_WS_URL = import.meta.env.VITE_LIVEKIT_WS_URL || 'wss://your-project-id.livekit.cloud';

const MOCK_INVENTORY = [
  { id: '1', name: 'Vintage Charizard', price: 25000, image: 'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?auto=format&fit=crop&q=80&w=200' },
  { id: '2', name: 'Booster Box Base Set', price: 12500, image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=200' },
  { id: '3', name: 'Lugia PSA 10', price: 4200, image: 'https://images.unsplash.com/photo-1620327429699-a864d2621454?auto=format&fit=crop&q=80&w=200' },
];

const BroadcastStudio: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // App States
  const [step, setStep] = useState<'setup' | 'live'>('setup');
  
  // Setup States
  const [streamTitle, setStreamTitle] = useState('');
  const [setupVideoEnabled, setSetupVideoEnabled] = useState(true);
  const [setupAudioEnabled, setSetupAudioEnabled] = useState(true);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const previewStreamRef = useRef<MediaStream | null>(null);
  
  // Live States
  const [isLive, setIsLive] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // Host mute (output)
  const [activeTab, setActiveTab] = useState<'products' | 'chat'>('chat');
  const [token, setToken] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [inputText, setInputText] = useState('');
  const [showId, setShowId] = useState<string | null>(null);
  
  // Messages
  const [messages, setMessages] = useState<any[]>([]);

  // --- SETUP PHASE: Local Media Preview Logic ---
  
  useEffect(() => {
    if (step !== 'setup') return;

    const initStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true,
          audio: true
        });
        previewStreamRef.current = stream;
        
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
          videoPreviewRef.current.muted = true; // Prevent feedback in setup
        }
      } catch (err) {
        console.error("Error accessing media devices:", err);
      }
    };

    initStream();

    return () => {
      if (previewStreamRef.current) {
        previewStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [step]);

  useEffect(() => {
    if (previewStreamRef.current) {
      previewStreamRef.current.getVideoTracks().forEach(t => t.enabled = setupVideoEnabled);
      previewStreamRef.current.getAudioTracks().forEach(t => t.enabled = setupAudioEnabled);
    }
  }, [setupVideoEnabled, setupAudioEnabled]);

  // Listen to messages when live
  useEffect(() => {
    if (!isLive || !showId) return;
    
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((msg: any) => msg.showId === showId);
      setMessages(newMessages);
    }, (error) => {
      handleFirestoreError(error, 'list' as any, 'messages');
    });
    
    return () => unsubscribe();
  }, [isLive, showId]);

  const handleGoLive = async () => {
    if (!streamTitle.trim()) return alert('Please enter a stream title');
    if (!user) return alert('You must be logged in to go live');
    
    // Stop preview stream before switching to LiveKit
    if (previewStreamRef.current) {
      previewStreamRef.current.getTracks().forEach(track => track.stop());
    }

    const newShowId = `show-${Date.now()}`;
    setShowId(newShowId);

    // Create Show in Firestore
    try {
      await setDoc(doc(db, 'shows', newShowId), {
        title: streamTitle,
        hostId: user.id,
        hostName: user.name,
        hostAvatar: user.avatar || '',
        viewers: 0,
        thumbnail: 'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?auto=format&fit=crop&q=80&w=2000',
        isActive: true,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, 'create' as any, `shows/${newShowId}`);
      return;
    }

    // Fetch Token
    try {
        const username = user?.name || 'Host';
        const response = await fetch(`${TOKEN_SERVER_URL}?room=${newShowId}&username=${username}&role=host`);
        if (!response.ok) throw new Error('Failed to get token');
        const data = await response.json();
        setToken(data.token);
        setDemoMode(false);
    } catch (e) {
        console.warn("Server offline, using demo mode");
        setDemoMode(true);
    }

    setStep('live');
    setIsLive(true);
  };

  const handleEndStream = async () => {
    if (confirm("End Stream?")) {
      if (showId) {
        try {
          await updateDoc(doc(db, 'shows', showId), {
            isActive: false
          });
        } catch (error) {
          handleFirestoreError(error, 'update' as any, `shows/${showId}`);
        }
      }
      navigate('/seller');
    }
  };

  const handleSendMessage = async () => {
      if (!inputText.trim() || !user || !showId) return;
      
      try {
        await addDoc(collection(db, 'messages'), {
          showId: showId,
          userId: user.id,
          userName: user.name,
          text: inputText,
          createdAt: serverTimestamp()
        });
        setInputText('');
      } catch (error) {
        handleFirestoreError(error, 'create' as any, 'messages');
      }
  };

  const startAuction = (item: any) => {
     // Auction logic placeholder
     alert(`Starting auction for ${item.name}`);
  };

  if (step === 'setup') {
    return (
      <div className="min-h-screen bg-[#CCFF00] text-black flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md space-y-8 bg-white border-8 border-black p-8 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] relative">
          
          <div className="absolute -top-6 -left-6 w-12 h-12 bg-black text-[#CCFF00] flex items-center justify-center font-black text-2xl border-4 border-white transform -rotate-12">
            !
          </div>

          <div className="text-center space-y-4">
             <div className="w-20 h-20 bg-black text-[#CCFF00] border-4 border-black flex items-center justify-center mx-auto mb-6 shadow-[8px_8px_0px_0px_rgba(204,255,0,1)]">
                <Video size={40} />
             </div>
             <h1 className="text-4xl font-black uppercase italic tracking-tighter">Studio Setup</h1>
             <p className="text-black/60 font-bold uppercase tracking-widest text-xs">Configure your stream before going live.</p>
          </div>

          <div className="bg-white p-2 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden relative">
             <div className="aspect-[9/16] md:aspect-video bg-black relative border-4 border-black">
                <video 
                   ref={videoPreviewRef} 
                   autoPlay 
                   playsInline 
                   muted 
                   className={`w-full h-full object-cover transform scale-x-[-1] ${!setupVideoEnabled ? 'opacity-0' : 'opacity-100'}`} 
                />
                {!setupVideoEnabled && (
                   <div className="absolute inset-0 flex items-center justify-center bg-[#CCFF00]">
                      <div className="w-24 h-24 bg-black border-4 border-black flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
                         <VideoOff size={40} className="text-[#CCFF00]" />
                      </div>
                   </div>
                )}
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-4">
                   <button 
                    onClick={() => setSetupAudioEnabled(!setupAudioEnabled)}
                    className={`p-4 border-4 border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 ${setupAudioEnabled ? 'bg-[#CCFF00] text-black' : 'bg-red-500 text-white'}`}
                   >
                      {setupAudioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
                   </button>
                   <button 
                    onClick={() => setSetupVideoEnabled(!setupVideoEnabled)}
                    className={`p-4 border-4 border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 ${setupVideoEnabled ? 'bg-[#CCFF00] text-black' : 'bg-red-500 text-white'}`}
                   >
                      {setupVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
                   </button>
                </div>
             </div>
          </div>

          <div className="space-y-6">
             <div>
                <label className="text-xs font-black uppercase tracking-[0.2em] text-black mb-2 block bg-[#CCFF00] w-fit px-2 border-2 border-black">Stream Title</label>
                <input 
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                  placeholder="e.g. Saturday Night Card Breaks!" 
                  className="w-full bg-white border-4 border-black px-4 py-4 text-black placeholder:text-black/40 focus:outline-none focus:bg-[#CCFF00] font-black uppercase tracking-wide transition-colors"
                />
             </div>
             <button 
                onClick={handleGoLive}
                className="w-full bg-black text-[#CCFF00] py-4 border-4 border-black font-black text-xl uppercase italic tracking-tighter transition-all hover:bg-white hover:text-black shadow-[8px_8px_0px_0px_rgba(204,255,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1"
             >
                Go Live
             </button>
             <button onClick={() => navigate('/seller')} className="w-full py-4 text-black font-black uppercase tracking-widest hover:bg-black hover:text-white border-4 border-transparent hover:border-black transition-colors">
                Cancel
             </button>
          </div>
        </div>
      </div>
    );
  }

  // --- LIVE PHASE ---
  return (
    <div className="fixed inset-0 bg-zinc-950 flex flex-col md:flex-row overflow-hidden">
       {/* 1. STREAM AREA - 40% height on mobile, full height on desktop */}
       <div className="relative w-full h-[40vh] md:h-full md:flex-1 bg-black shrink-0">
          <LiveKitStream 
             token={token} 
             serverUrl={LIVEKIT_WS_URL} 
             isMuted={false}
             onToggleMute={() => {}} 
             role="host"
             demoMode={demoMode}
          />
          
          <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
             <div className="bg-red-600 px-3 py-1 rounded-lg flex items-center space-x-2 animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">LIVE</span>
             </div>
             <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 flex items-center space-x-2">
                <Users size={12} className="text-white" />
                <span className="text-[10px] font-black text-white">1.2k</span>
             </div>
          </div>

          <button 
             onClick={handleEndStream}
             className="absolute top-4 right-4 z-10 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-red-600 transition-colors border border-white/10"
          >
             <X size={20} />
          </button>
       </div>

       {/* 2. MANAGEMENT CONSOLE - Fills remaining height on mobile */}
       <div className="flex-1 md:w-[400px] md:flex-none bg-white flex flex-col overflow-hidden border-l-4 border-black z-20 font-sans">
          <div className="flex items-center border-b-4 border-black bg-[#CCFF00] shrink-0">
             <button 
               onClick={() => setActiveTab('chat')}
               className={`flex-1 py-4 text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center space-x-2 border-r-4 border-black transition-colors ${activeTab === 'chat' ? 'bg-black text-[#CCFF00]' : 'bg-transparent text-black hover:bg-white'}`}
             >
                <MessageSquare size={16} /> <span>Chat</span>
             </button>
             <button 
               onClick={() => setActiveTab('products')}
               className={`flex-1 py-4 text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center space-x-2 transition-colors ${activeTab === 'products' ? 'bg-black text-[#CCFF00]' : 'bg-transparent text-black hover:bg-white'}`}
             >
                <ShoppingBag size={16} /> <span>Products</span>
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-white relative">
             {activeTab === 'chat' ? (
                <div className="space-y-4">
                   {messages.map((msg, i) => (
                      <div key={msg.id || i} className="flex items-start space-x-3">
                         <div className={`w-10 h-10 border-2 border-black flex items-center justify-center font-black text-xs shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${msg.userName === 'Whatnot Bot' ? 'bg-[#CCFF00] text-black' : msg.userId === user?.id ? 'bg-black text-white' : 'bg-white text-black'}`}>
                            {msg.userName === 'Whatnot Bot' ? '🤖' : msg.userName?.[0] || '?'}
                         </div>
                         <div className={`px-4 py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-[80%] ${msg.userName === 'Whatnot Bot' ? 'bg-black text-white' : 'bg-white'}`}>
                            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${msg.userName === 'Whatnot Bot' ? 'text-[#CCFF00]' : 'text-black/50'}`}>{msg.userName}</p>
                            <p className={`text-sm font-bold break-words ${msg.userName === 'Whatnot Bot' ? 'text-white italic' : 'text-black'}`}>{msg.text}</p>
                         </div>
                      </div>
                   ))}
                </div>
             ) : (
                <div className="space-y-4">
                   {MOCK_INVENTORY.map((item) => (
                      <div key={item.id} className="bg-white p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center space-x-4 hover:bg-[#CCFF00] transition-colors group">
                         <img src={item.image} className="w-16 h-16 object-cover border-2 border-black" alt={item.name} />
                         <div className="flex-1 min-w-0">
                            <h4 className="font-black text-sm text-black uppercase truncate">{item.name}</h4>
                            <p className="text-black font-bold text-xs bg-white w-fit px-1 border-2 border-black mt-1">${item.price}</p>
                         </div>
                         <button 
                           onClick={() => startAuction(item)}
                           className="bg-black text-white p-3 border-2 border-black hover:bg-white hover:text-black transition-colors shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                         >
                            <Gavel size={18} />
                         </button>
                      </div>
                   ))}
                </div>
             )}
          </div>

          <div className="p-4 bg-[#CCFF00] border-t-4 border-black shrink-0 pb-safe md:pb-4">
             {activeTab === 'chat' ? (
                <div className="flex items-center space-x-2">
                   <input 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Send a message..."
                      className="flex-1 bg-white border-4 border-black px-4 py-3 text-sm font-bold focus:outline-none focus:bg-black focus:text-white transition-colors"
                   />
                   <button onClick={handleSendMessage} className="p-3 bg-black text-[#CCFF00] border-4 border-black hover:bg-white hover:text-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none">
                      <Send size={20} />
                   </button>
                </div>
             ) : (
                <div className="grid grid-cols-2 gap-4">
                   <button className="py-3 bg-black text-white border-4 border-black font-black text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none">
                      Start Giveaway
                   </button>
                   <button className="py-3 bg-white text-black border-4 border-black font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none">
                      Create Poll
                   </button>
                </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default BroadcastStudio;
