import { create } from 'zustand';

interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  audioUrl: string;
  duration?: number;
}

interface AudioState {
  isPlaying: boolean;
  currentTrack: Track | null;
  volume: number;
  error: string | null;
  setVolume: (vol: number) => void;
  playTrack: (track: Track) => Promise<void>;
  pause: () => void;
  togglePlay: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => {
  let audioElement: HTMLAudioElement | null = null;

  return {
    isPlaying: false,
    currentTrack: null,
    volume: 0.8,
    error: null,

    setVolume: (vol) => set({ volume: Math.max(0, Math.min(1, vol)) }),

    playTrack: async (track) => {
      try {
        const { isPlaying } = get();
        
        if (isPlaying || !track.audioUrl) return;

        if (!audioElement) {
          audioElement = new Audio();
          audioElement.crossOrigin = 'anonymous';
          audioElement.preload = 'auto';
        }

        const fullUrl = track.audioUrl.startsWith('http') 
          ? track.audioUrl 
          : `${window.location.origin}${track.audioUrl}`;

        console.log(`▶️ Playing: ${track.title} by ${track.artist}`);
        audioElement.src = fullUrl;

        audioElement.onloadedmetadata = () => {
          if (track.duration && audioElement) {
            // Don't overwrite, just log
            console.log('Track duration:', audioElement.duration);
          }
        };

        await audioElement.play().catch(err => {
          console.error('Play failed:', err);
          set({ error: 'Playback failed. Please try again.' });
        });

        set({ isPlaying: true, currentTrack: track, error: null });
      } catch (error) {
        console.error('PlayTrack error:', error);
      }
    },

    pause: () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      set({ isPlaying: false, error: null });
    },

    togglePlay: () => {
      const { isPlaying } = get();
      if (isPlaying) {
        get().pause();
      } else {
        const { currentTrack } = get();
        if (currentTrack?.audioUrl) {
          get().playTrack(currentTrack);
        }
      }
    },
  };
});
