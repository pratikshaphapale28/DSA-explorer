import React from 'react';
import { usePlayer } from '../../engine/PlayerContext';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  FastForward,
  PauseCircle,
} from 'lucide-react';

export const ModulePlaybackControls: React.FC = () => {
  const {
    steps,
    currentStepIndex,
    currentStep,
    isPlaying,
    playbackSpeed,
    autoPauseAtKeyMoments,
    toggleAutoPause,
    togglePlay,
    nextStep,
    prevStep,
    goToStep,
    reset,
    setSpeed,
    totalSteps,
  } = usePlayer();

  // Rule 33: Speed options: 0.25x, 0.5x, 1x, 2x
  const speeds = [0.25, 0.5, 1, 2];

  if (totalSteps === 0) {
    return null;
  }

  const isUnrun = Boolean(currentStep?.auxiliary && (currentStep.auxiliary as any).isUnrun);
  const isAtStart = currentStepIndex === 0;
  const isAtEnd = currentStepIndex >= totalSteps - 1;

  return (
    <div
      aria-label="Algorithm playback controls"
      className="w-full rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 px-3 py-1.5 shadow-xs flex flex-wrap items-center justify-between gap-2 shrink-0 select-none"
    >
      {/* 1. Action Buttons */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={reset}
          disabled={isUnrun || (isAtStart && !isPlaying)}
          title="Reset to beginning (Shortcut: R)"
          aria-label="Reset algorithm to beginning"
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>

        <button
          onClick={prevStep}
          disabled={isUnrun || isAtStart || isPlaying}
          title="Previous step (Shortcut: ←)"
          aria-label="Step backward"
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        <button
          onClick={togglePlay}
          disabled={isUnrun}
          title={isPlaying ? 'Pause (Shortcut: Space)' : 'Play (Shortcut: Space)'}
          aria-label={isPlaying ? 'Pause algorithm' : 'Play algorithm'}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isAtEnd ? 'Replay' : 'Play'}</span>
            </>
          )}
        </button>

        <button
          onClick={nextStep}
          disabled={isUnrun || isAtEnd || isPlaying}
          title="Next step (Shortcut: →)"
          aria-label="Step forward"
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Timeline scrubber slider with Step N / TOTAL */}
      <div className="flex-1 min-w-[140px] max-w-sm flex items-center gap-2">
        <input
          type="range"
          min={0}
          max={totalSteps - 1}
          value={currentStepIndex}
          disabled={isUnrun}
          onChange={e => goToStep(parseInt(e.target.value, 10))}
          aria-label="Timeline scrubber"
          className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-hidden disabled:opacity-40"
        />
        <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">
          {isUnrun ? 'Press Run' : `Step ${currentStepIndex + 1} / ${totalSteps}`}
        </span>
      </div>

      {/* 3. Speed selector buttons */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden md:inline">Speed:</span>
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-md p-0.5 border border-slate-200 dark:border-slate-700">
          {speeds.map(s => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              aria-label={`Set speed ${s}x`}
              className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition-colors ${
                playbackSpeed === s
                  ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* 4. Auto-pause toggle */}
      <button
        onClick={toggleAutoPause}
        type="button"
        className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border transition-colors shrink-0 ${
          autoPauseAtKeyMoments
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
        }`}
        title="Pauses 1s on swaps, pivots, rotations, collisions"
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            autoPauseAtKeyMoments ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'
          }`}
        />
        <span className="hidden sm:inline">Auto-pause</span>
      </button>
    </div>
  );
};
