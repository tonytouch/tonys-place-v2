import { create } from 'zustand';

interface Track {
  title: string;
  artist: string;
  audioUrl?: string;
}

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface Message {
  user: string;
  msg: string;
  time: string;
}

interface AppState {
  // Audio
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  currentTrack: Track;
  setCurrentTrack: (title: string, artist: string, audioUrl?: string) => void;
  isLive: boolean;
  setIsLive: (live: boolean) => void;

  // Shop / Bag
  bag: Product[];
  addToBag: (product: Product) => void;
  removeFromBag: (id: number) => void;
  isBagOpen: boolean;
  setIsBagOpen: (open: boolean) => void;

  // Chat
  messages: Message[];
  addMessage: (user: string, msg: string) => void;

  // Admin / Station OS
  activeStationTab: string;
  setActiveStationTab: (tab: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Audio
  isPlaying: false,
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  currentTrack: {
    title: 'OFFLINE',
    artist: 'STATION IDLE',
  },
  setCurrentTrack: (title, artist, audioUrl) => set({ currentTrack: { title, artist, audioUrl } }),
  isLive: false,
  setIsLive: (live) => set({ isLive: live }),

  // Shop
  bag: [],
  addToBag: (product) => set((state) => ({ bag: [...state.bag, product] })),
  removeFromBag: (id) => set((state) => ({ bag: state.bag.filter(p => p.id !== id) })),
  isBagOpen: false,
  setIsBagOpen: (open) => set({ isBagOpen: open }),

  // Chat
  messages: [
    { user: 'DJ_NEON', msg: 'Loving the vibes tonight!', time: '14:20' },
    { user: 'TONY', msg: 'Next track is a world premiere 🔥', time: '14:22' },
  ],
  addMessage: (user, msg) => set((state) => ({ 
    messages: [...state.messages, { user, msg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }] 
  })),

  // Admin
  activeStationTab: 'media',
  setActiveStationTab: (tab) => set({ activeStationTab: tab }),
}));
