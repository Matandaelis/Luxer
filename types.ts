
export interface User {
  id: string;
  name: string;
  avatar: string;
  points: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  isVerified: boolean;
  role: 'host' | 'viewer';
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  stock: number;
}

export interface Auction {
  id: string;
  productId: string;
  currentBid: number;
  highestBidder?: string;
  endTime: number;
  isActive: boolean;
}

export interface Giveaway {
  id: string;
  product: Product;
  endTime: number;
  isActive: boolean;
  participants: number;
  winner?: string;
}

export interface LiveShow {
  id: string;
  title: string;
  host: User;
  viewers: number;
  thumbnail: string;
  products: Product[];
  currentAuction?: Auction;
  currentGiveaway?: Giveaway;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
}
