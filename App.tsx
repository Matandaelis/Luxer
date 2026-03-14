
import React from 'react';
import { HashRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, Video, LayoutDashboard, User as UserIcon, 
  Search, Bell, Compass
} from 'lucide-react';
import LiveFeed from './components/LiveFeed';
import SellerCenter from './components/SellerCenter';
import ProductMarketplace from './components/ProductMarketplace';
import ProfilePage from './components/ProfilePage';
import AuthPage from './components/AuthPage';
import ProductDetailPage from './components/ProductDetailPage';
import BroadcastStudio from './components/BroadcastStudio';
import { AuthProvider, useAuth } from './context/AuthContext';

// --- Shared Components ---

interface NavLinkProps {
  to: string;
  active: boolean;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, active, children }) => (
  <Link to={to} className={`text-[13px] font-semibold transition-all duration-300 px-4 py-2 rounded-full ${active ? 'bg-primary/10 text-primary' : 'text-foreground/60 hover:text-foreground hover:bg-muted'}`}>
    {children}
  </Link>
);

const MobileNavItem = ({ to, icon, active, label }: { to: string, icon: React.ReactNode, active: boolean, label: string }) => {
  const handleClick = () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  };

  return (
    <Link 
      to={to} 
      onClick={handleClick}
      className={`flex flex-col items-center justify-center gap-1 transition-colors duration-300 ${active ? 'text-primary' : 'text-foreground/40'}`}
    >
      {React.cloneElement(icon as React.ReactElement, { 
        size: 20, 
        strokeWidth: active ? 1.5 : 1 
      })}
      <span className="text-[9px] font-medium uppercase tracking-widest">{label}</span>
    </Link>
  );
};

// --- Layouts ---

const BuyerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const isImmersive = location.pathname.startsWith('/live');

  return (
    <div className="flex flex-col h-screen bg-background font-sans text-foreground">
      {!isImmersive && (
        <header className="h-20 border-b border-border/50 px-6 lg:px-12 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-xl z-50">
          <div className="flex items-center gap-12">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-500 group-hover:scale-110">
                <ShoppingBag size={20} strokeWidth={2} />
              </div>
              <span className="text-2xl font-bold tracking-tight text-foreground">
                Shoply<span className="text-primary">Live</span>
              </span>
            </Link>
            <div className="hidden lg:flex items-center gap-2">
              <NavLink to="/" active={location.pathname === '/'}>Discover</NavLink>
              <NavLink to="/marketplace" active={location.pathname === '/marketplace'}>Marketplace</NavLink>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-12 hidden md:block">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-primary transition-colors" size={18} strokeWidth={2} />
              <input 
                type="text" 
                placeholder="Search products, creators..." 
                className="w-full bg-muted/50 border-none rounded-full py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none placeholder:text-foreground/30"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
             {user?.role === 'host' && (
               <Link to="/seller" className="hidden md:flex items-center gap-2 text-[12px] font-bold bg-foreground text-background px-6 py-2.5 rounded-full hover:bg-primary transition-all shadow-lg shadow-black/5">
                 <LayoutDashboard size={14} strokeWidth={2} />
                 Studio
               </Link>
             )}
             <button className="p-2.5 text-foreground/60 hover:text-foreground hover:bg-muted rounded-full transition-all relative">
                <Bell size={20} strokeWidth={2} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-background rounded-full"></span>
             </button>
             <Link to="/profile" className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-primary transition-all shadow-sm">
               <img src={user?.avatar || "https://github.com/shadcn.png"} className="w-full h-full object-cover transition-all duration-500" />
             </Link>
          </div>
        </header>
      )}

      <main className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto no-scrollbar scroll-smooth">
          {children}
        </div>

        {/* Mobile Bottom Nav */}
        {!isImmersive && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border h-20 grid grid-cols-5 items-center px-4 z-50 pb-safe">
            <MobileNavItem to="/" icon={<Compass />} active={location.pathname === '/'} label="Home" />
            <MobileNavItem to="/marketplace" icon={<Search />} active={location.pathname === '/marketplace'} label="Shop" />
            
            <div className="relative flex justify-center h-full items-center">
               <Link 
                 to="/live" 
                 onClick={() => window.navigator.vibrate?.(10)}
                 className={`w-12 h-12 flex items-center justify-center transition-all duration-500 active:scale-95 border ${location.pathname === '/live' ? 'bg-foreground text-background border-foreground' : 'bg-primary text-background border-primary shadow-lg shadow-primary/20'}`}
               >
                 <Video size={24} strokeWidth={1.5} />
               </Link>
            </div>

            <MobileNavItem to="/notifications" icon={<Bell />} active={location.pathname === '/notifications'} label="Alerts" />
            <MobileNavItem to="/profile" icon={<UserIcon />} active={location.pathname === '/profile'} label="Profile" />
          </div>
        )}
      </main>
    </div>
  );
};

// --- Main App Logic ---

const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) return <AuthPage />;

  return (
    <Routes>
      {/* SELLER SILO ROUTES */}
      <Route path="/seller/*" element={
        user.role === 'host' ? <SellerCenter /> : <Navigate to="/" />
      } />
      <Route path="/broadcast" element={
        user.role === 'host' ? <BroadcastStudio /> : <Navigate to="/" />
      } />

      {/* BUYER SILO ROUTES */}
      <Route path="/*" element={
        <BuyerLayout>
          <Routes>
            <Route path="/" element={<ProductMarketplace />} />
            <Route path="/marketplace" element={<ProductMarketplace />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/live" element={<LiveFeed />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BuyerLayout>
      } />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
