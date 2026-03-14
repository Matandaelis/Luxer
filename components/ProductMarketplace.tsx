
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, Calendar, 
  Users, 
  ChevronRight, ChevronLeft, ArrowUpRight,
  Play
} from 'lucide-react';
import { db, handleFirestoreError } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';

// --- MOCK DATA ---

const HERO_SLIDES = [
  {
    id: 1,
    type: 'live',
    title: 'Summer Collection Live Drop',
    subtitle: 'Exclusive early access to the 2024 resort wear collection.',
    host: 'sarah_style',
    viewers: '12.5k',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80',
    tags: ['Fashion', 'Live']
  },
  {
    id: 2,
    type: 'upcoming',
    title: 'The Tech Revolution',
    subtitle: 'Unboxing the latest gadgets and smart home innovations.',
    host: 'tech_guru',
    time: '8:00 PM EST',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80',
    tags: ['Tech', 'Drop']
  },
  {
    id: 3,
    type: 'live',
    title: 'Beauty Masterclass',
    subtitle: 'Professional makeup tips and exclusive product launches.',
    host: 'glam_expert',
    viewers: '3.2k',
    image: 'https://images.unsplash.com/photo-1522338228045-9b6c21597427?auto=format&fit=crop&q=80',
    tags: ['Beauty', 'Luxury']
  }
];

const CATEGORIES = [
  { name: 'Fashion', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80', color: 'from-pink-500/20 to-rose-500/20' },
  { name: 'Beauty', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80', color: 'from-purple-500/20 to-indigo-500/20' },
  { name: 'Tech', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80', color: 'from-blue-500/20 to-cyan-500/20' },
  { name: 'Home', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80', color: 'from-amber-500/20 to-orange-500/20' },
  { name: 'Luxury', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80', color: 'from-yellow-500/20 to-gold-500/20' },
];

const TOP_CREATORS = [
  { name: "PokeKing", avatar: "https://ui-avatars.com/api/?name=PK&background=facc15&color=000", live: true },
  { name: "SneakerHead", avatar: "https://ui-avatars.com/api/?name=SH&background=6366f1&color=fff", live: true },
  { name: "LuxeBags", avatar: "https://ui-avatars.com/api/?name=LB&background=ec4899&color=fff", live: false },
  { name: "GoldStandard", avatar: "https://ui-avatars.com/api/?name=GS&background=eab308&color=fff", live: true },
  { name: "ComicsDaily", avatar: "https://ui-avatars.com/api/?name=CD&background=ef4444&color=fff", live: false },
];

const INITIAL_STREAMS = [
  { id: '1', title: 'Mystery Slabs! 🔥 Floor $50', category: 'Pokemon', viewers: 1240, image: 'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?auto=format&fit=crop&q=80&w=800', host: 'AshKetchum' },
  { id: '2', title: 'Yeezy Slide $1 Starts', category: 'Sneakers', viewers: 850, image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=800', host: 'YeFan' },
  { id: '3', title: 'Omega Speedmaster 🚀', category: 'Watches', viewers: 3420, image: 'https://images.unsplash.com/photo-1622434641406-a158123450f9?auto=format&fit=crop&q=80&w=800', host: 'TimeLord' },
  { id: '4', title: 'CGC 9.8 Keys Only', category: 'Comics', viewers: 512, image: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&q=80&w=800', host: 'StanLee' },
];

const PULSE_DATA = [
  { user: 'CryptoKing', action: 'bought', item: 'Rolex Daytona', price: '$24,500' },
  { user: 'PokeFan99', action: 'won', item: 'Lugia Legend', price: '$850' },
  { user: 'HypeBeast', action: 'bid', item: 'Supreme Tee', price: '$120' },
];

const ProductMarketplace: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [streams, setStreams] = useState<any[]>(INITIAL_STREAMS);

  // Fetch active shows from Firestore
  useEffect(() => {
    const q = query(collection(db, 'shows'), where('isActive', '==', true), orderBy('createdAt', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activeShows = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          category: 'Live',
          viewers: data.viewers || Math.floor(Math.random() * 1000) + 100, // Mock viewers if 0
          image: data.thumbnail || 'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?auto=format&fit=crop&q=80&w=800',
          host: data.hostName
        };
      });
      
      if (activeShows.length > 0) {
        setStreams([...activeShows, ...INITIAL_STREAMS.slice(0, Math.max(0, 4 - activeShows.length))]);
      } else {
        setStreams(INITIAL_STREAMS);
      }
    }, (error) => {
      handleFirestoreError(error, 'list' as any, 'shows');
    });
    return () => unsubscribe();
  }, []);

  // Auto-advance hero slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Simulate Live Viewers fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setStreams(prevStreams => prevStreams.map(stream => ({
        ...stream,
        viewers: Math.max(100, stream.viewers + Math.floor(Math.random() * 31) - 15)
      })));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
  const prevSlide = () => setCurrentSlide(prev => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));

  const formatViewers = (count: number) => {
    return count >= 1000 ? (count / 1000).toFixed(1) + 'k' : count;
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-32 lg:pb-40 px-6 lg:px-8 bg-background">
      
      {/* 1. HERO CAROUSEL - Modern Shoply Style */}
      <section className="relative h-[500px] lg:h-[600px] w-full overflow-hidden rounded-[2.5rem] mt-8 shadow-2xl shadow-primary/5">
        {HERO_SLIDES.map((slide, idx) => (
          <div 
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'}`}
          >
            <img src={slide.image} className="w-full h-full object-cover transition-all duration-1000" alt={slide.title} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent"></div>
            
            <div className="absolute inset-0 flex flex-col items-start justify-center p-12 lg:p-20">
               <div className="flex items-center gap-3 mb-6">
                  {slide.type === 'live' ? (
                     <div className="bg-red-500 text-white px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center shadow-lg shadow-red-500/20">
                        <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div> Live Now
                     </div>
                  ) : (
                     <div className="bg-white/20 backdrop-blur-md text-white px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center border border-white/20">
                        <Calendar size={14} className="mr-2" /> Upcoming
                     </div>
                  )}
               </div>
               
               <h1 className="text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6 max-w-3xl">
                  {slide.title}
               </h1>
               <p className="text-lg text-white/80 font-medium max-w-xl mb-10">
                  {slide.subtitle} <span className="mx-2 text-primary">|</span> <span className="text-white">@{slide.host}</span>
               </p>

               <div className="flex items-center gap-4">
                  <Link 
                    to="/live" 
                    className="bg-primary text-white px-10 py-4 rounded-full text-[13px] font-bold hover:bg-primary/90 transition-all duration-300 flex items-center gap-2 shadow-xl shadow-primary/20"
                  >
                     Join Stream <ArrowUpRight size={18} />
                  </Link>
                  <button className="w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300">
                     <Heart size={22} />
                  </button>
               </div>
            </div>
          </div>
        ))}

        {/* Slider Controls - Modern Pill */}
        <div className="absolute bottom-10 right-10 z-20 flex gap-3 bg-black/20 backdrop-blur-md p-2 rounded-full border border-white/10">
           <button onClick={prevSlide} className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all">
              <ChevronLeft size={20} />
           </button>
           <button onClick={nextSlide} className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all">
              <ChevronRight size={20} />
           </button>
        </div>
      </section>

      {/* 2. CATEGORIES - Modern Cards */}
      <section className="mt-20">
         <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">Browse Categories</h2>
            <button className="text-sm font-bold text-primary hover:underline">See All</button>
         </div>
         <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4">
            {CATEGORIES.map((cat, i) => (
               <div key={i} className="flex flex-col items-center gap-4 shrink-0 group cursor-pointer">
                  <div className="w-36 h-44 rounded-[2rem] overflow-hidden relative group-hover:shadow-2xl transition-all duration-500">
                     <img src={cat.image} className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110" alt={cat.name} />
                     <div className={`absolute inset-0 bg-gradient-to-b ${cat.color} opacity-40 group-hover:opacity-60 transition-opacity`}></div>
                     <div className="absolute bottom-4 left-0 right-0 text-center">
                        <span className="text-white font-bold text-sm tracking-wide">{cat.name}</span>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </section>

      {/* 3. LIVE STREAMS - Shoply Cards */}
      <section className="mt-20">
         <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
               <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
               <h2 className="text-3xl font-bold text-foreground tracking-tight">Live Now</h2>
            </div>
            <button className="text-sm font-bold text-primary hover:underline">View All</button>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {streams.map((stream) => (
               <Link to="/live" key={stream.id} className="group bg-card rounded-[2rem] overflow-hidden border border-border/50 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img src={stream.image} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt={stream.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                       <div className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg shadow-red-500/20">LIVE</div>
                       <div className="bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/10">
                          <Users size={12} /> {formatViewers(stream.viewers)}
                       </div>
                    </div>

                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                       <div className="w-16 h-16 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-all">
                          <Play size={28} fill="currentColor" className="ml-1" />
                       </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <h3 className="text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">{stream.title}</h3>
                    <div className="flex items-center justify-between border-t border-border/50 pt-4">
                       <div className="flex items-center gap-2.5">
                          <img src={`https://ui-avatars.com/api/?name=${stream.host}&background=4f46e5&color=fff`} className="w-6 h-6 rounded-full" alt={stream.host} />
                          <span className="text-xs font-semibold text-foreground/60">@{stream.host}</span>
                       </div>
                       <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{stream.category}</span>
                    </div>
                  </div>
               </Link>
            ))}
         </div>
      </section>

      {/* 4. CALL TO ACTION - Modern Shoply Banner */}
      <section className="mt-32 mb-20 bg-primary rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl shadow-primary/20">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
         
         <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tight mb-6">Start Your Live Shop</h2>
            <p className="text-white/80 max-w-xl mx-auto mb-12 text-lg font-medium">Join thousands of creators who are building the future of social commerce. Apply today and start streaming.</p>
            <div className="flex flex-col sm:flex-row gap-6">
               <Link to="/seller" className="bg-white text-primary px-12 py-4 rounded-full text-sm font-bold hover:bg-opacity-90 transition-all shadow-xl shadow-black/10">
                  Become a Creator
               </Link>
               <Link to="/seller" className="bg-transparent border-2 border-white/30 text-white px-12 py-4 rounded-full text-sm font-bold hover:bg-white/10 transition-all">
                  Learn More
               </Link>
            </div>
         </div>
      </section>

    </div>
  );
};

export default ProductMarketplace;
