import React from 'react';
import { usePlayer } from '../../engine/PlayerContext';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  FastForward,
} from 'lucide-react';

export const PlaybackBar: React.FC = () => {
  const {
    steps,
    currentStepIndex,
    currentStep,
    isPlaying,
    playbackSpeed,
    togglePlay,
    nextStep,
    prevStep,
    goToStep,
    reset,
    setSpeed,
    totalSteps,
  } = usePlayer();

  const speeds = [0.25, 0.5, 1, 2, 4];

  if (totalSteps === 0) {
    return null;
  }

  const isUnrun = Boolean(currentStep?.auxiliary && (currentStep.auxiliary as any).isUnrun);
  const isAtStart = currentStepIndex === 0;
  const isAtEnd = currentStepIndex >= totalSteps - 1;

  return (
    <footer
      aria-label="Algorithm playback controls"
      className="sticky bottom-0 z-30 w-full bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-4 py-2.5 shadow-xl"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-3 sm:gap-6 justify-between">
        {/* Playback Action Buttons with visible text & icons */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Reset */}
          <button
            onClick={reset}
            disabled={isUnrun || (isAtStart && !isPlaying)}
            title="Reset to beginning (Shortcut: R)"
            aria-label="Reset algorithm to beginning"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>

          {/* Previous Step */}
          <button
            onClick={prevStep}
            disabled={isUnrun || isAtStart || isPlaying}
            title="Step backward 1 step (Shortcut: ←)"
            aria-label="Step backward"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden md:inline">Prev</span>
          </button>

          {/* Play / Pause Primary Button */}
          <button
            onClick={togglePlay}
            disabled={isUnrun}
            title={isPlaying ? 'Pause playback (Shortcut: Space)' : 'Play simulation (Shortcut: Space)'}
            aria-label={isPlaying ? 'Pause algorithm' : 'Play algorithm'}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 active:scale-95 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
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

          {/* Next Step */}
          <button
            onClick={nextStep}
            disabled={isUnrun || isAtEnd || isPlaying}
            title="Step forward 1 step (Shortcut: →)"
            aria-label="Step forward"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <span className="hidden md:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Timeline Slider with Step Counter */}
        <div className="flex-1 w-full flex items-center gap-3">
          <span className="text-xs font-mono tabular-nums text-slate-400 whitespace-nowrap min-w-[70px] text-right">
            {isUnrun ? 'Press Run to start' : `Step ${currentStepIndex + 1} / ${totalSteps}`}
          </span>
          <div className="relative flex-1 flex items-center group">
            <input
              type="range"
              min={0}
              max={totalSteps - 1}
              value={currentStepIndex}
              disabled={isUnrun}
              onChange={e => goToStep(parseInt(e.target.value, 10))}
              aria-label="Timeline scrubber"
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-40"
            />
          </div>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1.5 shrink-0">
          <FastForward className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Speed:</span>
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700/60">
            {speeds.map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                aria-label={`Set speed to ${s}x`}
                className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
                  playbackSpeed === s
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
