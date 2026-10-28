import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { Step } from './types';
import confetti from 'canvas-confetti';

interface PlayerContextType {
  steps: Step[];
  currentStepIndex: number;
  currentStep: Step | null;
  isPlaying: boolean;
  playbackSpeed: number;
  autoPauseAtKeyMoments: boolean;
  toggleAutoPause: () => void;
  theme: 'dark' | 'light';
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  toggleTheme: () => void;
  loadSteps: (newSteps: Step[], autoPlay?: boolean) => void;
  clearConfetti: () => void;
  totalSteps: number;
  progressPercent: number;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

const isKeyMoment = (type?: string): boolean => {
  if (!type) return false;
  return ['swap', 'partition', 'found', 'probe', 'rotate', 'relax', 'rehash', 'heapify'].includes(type);
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  // Rule 33: Default speed is 0.5x. Speed options: 0.25x, 0.5x, 1x, 2x
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.5);
  // Rule 37: Auto-pause at key moments toggle, ON by default
  const [autoPauseAtKeyMoments, setAutoPauseAtKeyMoments] = useState<boolean>(true);
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

  const toggleAutoPause = useCallback(() => {
    setAutoPauseAtKeyMoments(prev => !prev);
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

    // Rule 33: At 1x each step lasts about 2 seconds (2000ms)
    const baseDelayMs = 2000;
    // Rule 37: Auto-pause pauses for about 1 second (1000ms) on swaps, pivot, found, collisions
    const extraPauseMs = autoPauseAtKeyMoments && isKeyMoment(steps[currentStepIndex]?.type) ? 1000 : 0;
    const delay = Math.max(120, (baseDelayMs / playbackSpeed) + extraPauseMs);

    timerRef.current = setTimeout(() => {
      nextStep();
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStepIndex, steps, playbackSpeed, autoPauseAtKeyMoments, nextStep]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
        autoPauseAtKeyMoments,
        toggleAutoPause,
        theme,
        play,
        pause,
        togglePlay,
        nextStep,
        prevStep,
        goToStep,
        reset,
        setSpeed,
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
