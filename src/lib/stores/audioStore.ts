import { create } from "zustand";

export interface AudioTrack {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  duration?: string;
  reciter?: string;
  cover_image?: string;
  src: string;
}

interface AudioStore {
  currentTrack: AudioTrack | null;
  playlist: AudioTrack[];
  isPlaying: boolean;
  volume: number;
  previousVolume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  isLoop: boolean;
  isShuffle: boolean;
  seekTarget: number | null;

  // Actions
  playTrack: (track: AudioTrack, playlist?: AudioTrack[]) => void;
  setPlaylist: (tracks: AudioTrack[]) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  seek: (time: number) => void;
  clearSeekTarget: () => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  updateTime: (current: number, dur: number) => void;
}

export const useAudioStore = create<AudioStore>((set, get) => ({
  currentTrack: null,
  playlist: [],
  isPlaying: false,
  volume: 0.85,
  previousVolume: 0.85,
  isMuted: false,
  currentTime: 0,
  duration: 0,
  isLoop: false,
  isShuffle: false,
  seekTarget: null,

  playTrack: (track, playlist) => {
    const nextPlaylist = playlist && playlist.length > 0 ? playlist : get().playlist;
    set({
      currentTrack: track,
      playlist: nextPlaylist.length > 0 ? nextPlaylist : [track],
      isPlaying: true,
      currentTime: 0,
    });
  },

  setPlaylist: (tracks) => set({ playlist: tracks }),

  play: () => set({ isPlaying: true }),

  pause: () => set({ isPlaying: false }),

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  stop: () => set({ isPlaying: false, currentTime: 0, seekTarget: 0 }),

  setVolume: (volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume));
    set({
      volume: clamped,
      isMuted: clamped === 0,
      previousVolume: clamped > 0 ? clamped : get().previousVolume,
    });
  },

  toggleMute: () => {
    const state = get();
    if (state.isMuted || state.volume === 0) {
      const restored = state.previousVolume > 0 ? state.previousVolume : 0.85;
      set({ isMuted: false, volume: restored });
    } else {
      set({ isMuted: true, previousVolume: state.volume, volume: 0 });
    }
  },

  seek: (time: number) => {
    const target = Math.max(0, Math.min(time, get().duration || time));
    set({ currentTime: target, seekTarget: target });
  },

  clearSeekTarget: () => set({ seekTarget: null }),

  skipForward: (seconds = 10) => {
    const state = get();
    const nextTime = Math.min((state.duration || 0), state.currentTime + seconds);
    set({ currentTime: nextTime, seekTarget: nextTime });
  },

  skipBackward: (seconds = 10) => {
    const state = get();
    const nextTime = Math.max(0, state.currentTime - seconds);
    set({ currentTime: nextTime, seekTarget: nextTime });
  },

  nextTrack: () => {
    const { playlist, currentTrack, isShuffle, isLoop } = get();
    if (playlist.length === 0) return;
    if (isLoop && currentTrack) {
      set({ currentTime: 0, seekTarget: 0, isPlaying: true });
      return;
    }
    const currentIndex = playlist.findIndex((t) => t.id === currentTrack?.id);
    let nextIndex = 0;
    if (isShuffle && playlist.length > 1) {
      do {
        nextIndex = Math.floor(Math.random() * playlist.length);
      } while (nextIndex === currentIndex);
    } else {
      nextIndex = (currentIndex + 1) % playlist.length;
    }
    const next = playlist[nextIndex];
    if (next) {
      set({ currentTrack: next, isPlaying: true, currentTime: 0, seekTarget: 0 });
    }
  },

  prevTrack: () => {
    const { playlist, currentTrack, currentTime } = get();
    if (playlist.length === 0) return;
    // If track has been playing for more than 3 seconds, restart current track first
    if (currentTime > 3) {
      set({ currentTime: 0, seekTarget: 0 });
      return;
    }
    const currentIndex = playlist.findIndex((t) => t.id === currentTrack?.id);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    const prev = playlist[prevIndex];
    if (prev) {
      set({ currentTrack: prev, isPlaying: true, currentTime: 0, seekTarget: 0 });
    }
  },

  toggleLoop: () => set((state) => ({ isLoop: !state.isLoop })),

  toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),

  updateTime: (current: number, dur: number) => {
    set({ currentTime: current, duration: dur });
  },
}));
