import { create } from "zustand";

interface AudioTrack {
  id: string;
  title: string;
  subtitle?: string;
  src: string;
  reciter?: string;
}

interface AudioStore {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  volume: number;
  playTrack: (track: AudioTrack) => void;
  play: () => void;
  pause: () => void;
  setVolume: (volume: number) => void;
  stop: () => void;
}

export const useAudioStore = create<AudioStore>((set) => ({
  currentTrack: null,
  isPlaying: false,
  volume: 1,
  playTrack: (track) => set({ currentTrack: track, isPlaying: true }),
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  setVolume: (volume) => set({ volume }),
  stop: () => set({ currentTrack: null, isPlaying: false }),
}));
