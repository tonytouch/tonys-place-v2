import { create } from 'zustand';

interface User {
  id: string;
  email?: string;
  name?: string;
  passkeyId?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email?: string) => Promise<void>;
  logout: () => void;
  verifyPasskey: (credential: any) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Load from localStorage on init
  const storedUser = localStorage.getItem('tonys_user');
  if (storedUser) {
    try {
      const user: User = JSON.parse(storedUser);
      set({ 
        user, 
        isAuthenticated: true,
        isLoading: false 
      });
    } catch (e) {
      console.error('Failed to load user:', e);
    }
  }

  return {
    user: null,
    isAuthenticated: !!storedUser,
    isLoading: true,
    error: null,

    login: async (email?: string) => {
      set({ isLoading: true, error: null });
      
      try {
        // Simulate API call - in production, connect to real auth endpoint
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const user: User = {
          id: 'user_' + Date.now(),
          email: email || 'guest@tonysplace.co.uk',
          name: email ? email.split('@')[0] : 'Guest'
        };

        // Save to localStorage
        localStorage.setItem('tonys_user', JSON.stringify(user));
        
        set({ user, isAuthenticated: true, isLoading: false });
      } catch (error) {
        console.error('Login failed:', error);
        set({ error: 'Failed to authenticate' });
      }
    },

    logout: () => {
      localStorage.removeItem('tonys_user');
      set({ user: null, isAuthenticated: false, isLoading: false });
    },

    verifyPasskey: async (credential: any): Promise<boolean> => {
      // In production, this would call the WebAuthn verification endpoint
      console.log('Verifying passkey:', credential);
      return true; // Placeholder - implement with real backend
    }
  };
});
