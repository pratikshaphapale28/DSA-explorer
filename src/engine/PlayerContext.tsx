import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { Step } from './types';
import confetti from 'canvas-confetti';

interface PlayerContextType {
  steps: Step[];
  currentStepIndex: number;
  currentStep: Step | null;
  isPlaying: boolean;
  playbackSpeed: number;
  mode: 'beginner' | 'advanced';
  theme: 'dark' | 'light';
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  setMode: (mode: 'beginner' | 'advanced') => void;
  toggleTheme: () => void;
  loadSteps: (newSteps: Step[], autoPlay?: boolean) => void;
  clearConfetti: () => void;
  totalSteps: number;
  progressPercent: number;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [mode, setMode] = useState<'beginner' | 'advanced'>('beginner');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync theme with document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const totalSteps = steps.length;
  const currentStep = steps[currentStepIndex] || null;
  const progressPercent = totalSteps > 1 ? (currentStepIndex / (totalSteps - 1)) * 100 : 0;

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const play = useCallback(() => {
    if (steps.length === 0) return;
    if (currentStepIndex >= steps.length - 1) {
      setCurrentStepIndex(0);
    }
    setIsPlaying(true);
  }, [steps.length, currentStepIndex]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  const nextStep = useCallback(() => {
    setCurrentStepIndex(prev => {
      if (prev < steps.length - 1) {
        const next = prev + 1;
        if (next === steps.length - 1 && steps[next]?.type === 'complete') {
          // Fire subtle confetti on successful completion
          try {
            confetti({
              particleCount: 40,
              spread: 60,
              origin: { y: 0.8 },
              colors: ['#6366F1', '#10B981', '#F59E0B']
            });
          } catch {
            // ignore in headless environments
          }
        }
        return next;
      }
      setIsPlaying(false);
      return prev;
    });
  }, [steps]);

  const prevStep = useCallback(() => {
    pause();
    setCurrentStepIndex(prev => Math.max(0, prev - 1));
  }, [pause]);

  const goToStep = useCallback((index: number) => {
    pause();
    const bounded = Math.max(0, Math.min(index, steps.length - 1));
    setCurrentStepIndex(bounded);
  }, [steps.length, pause]);

  const clearConfetti = useCallback(() => {
    try {
      (confetti as any).reset?.();
    } catch {}
  }, []);

  const reset = useCallback(() => {
    pause();
    clearConfetti();
    setCurrentStepIndex(0);
  }, [pause, clearConfetti]);

  const setSpeed = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
  }, []);

  const loadSteps = useCallback((newSteps: Step[], autoPlay = false) => {
    pause();
    clearConfetti();
    setSteps(newSteps);
    setCurrentStepIndex(0);
    if (autoPlay && newSteps.length > 0) {
      setIsPlaying(true);
    }
  }, [pause, clearConfetti]);

  // Main playback timer loop
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    if (currentStepIndex >= steps.length - 1) {
      setIsPlaying(false);
      return;
    }

    const baseDelayMs = 700; // standard 1x step duration
    const delay = Math.max(80, baseDelayMs / playbackSpeed);

    timerRef.current = setTimeout(() => {
      nextStep();
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStepIndex, steps.length, playbackSpeed, nextStep]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        nextStep();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        prevStep();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        reset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, nextStep, prevStep, reset]);

  return (
    <PlayerContext.Provider
      value={{
        steps,
        currentStepIndex,
        currentStep,
        isPlaying,
        playbackSpeed,
        mode,
        theme,
        play,
        pause,
        togglePlay,
        nextStep,
        prevStep,
        goToStep,
        reset,
        setSpeed,
        setMode,
        toggleTheme,
        loadSteps,
        clearConfetti,
        totalSteps,
        progressPercent,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
