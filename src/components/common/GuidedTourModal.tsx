import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, X, Check } from 'lucide-react';

interface GuidedTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuidedTourModal: React.FC<GuidedTourModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const tourSteps = [
    {
      title: 'Welcome to DSA Explorer!',
      content:
        'DSA Explorer turns complex data structures and algorithms into interactive step-by-step visualizations. You do not need any prior background to start exploring.',
      highlight: 'Interactive, beginner-friendly learning platform',
    },
    {
      title: '1. The Interactive Stage (Center)',
      content:
        'Watch elements animate in real time! You can click to add nodes to graphs, balance AVL trees, push items onto stacks, and re-order sorting bars.',
      highlight: 'Directly manipulate the data structure or load presets',
    },
    {
      title: '2. The Playback Engine (Bottom Bar)',
      content:
        'Because all algorithm steps are precomputed snapshots, you can pause, step backward, or drag the timeline scrubber to see what happened at any point in time.',
      highlight: 'Full bidirectional time travel with speed control (0.25x - 4x)',
    },
    {
      title: '3. The Live Insight Panel (Right)',
      content:
        'Read plain-English step narrations, track real-time comparison counters, see the active pseudocode line highlighted, and compare actual operations against theoretical Big-O.',
      highlight: 'Understand the "why" behind every swap, split, and rotation',
    },
    {
      title: 'You are all set!',
      content:
        'Select any module from the top navigation bar or press "Start with a Demo" to watch Quick Sort in action. Use the Space bar to Play/Pause at any time.',
      highlight: 'Keyboard shortcuts: Space (Play), Arrow Keys (Step), R (Reset)',
    },
  ];

  const current = tourSteps[step];
  const isLast = step === tourSteps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setStep(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-modal-title"
        className="w-full max-w-lg bg-slate-900 border border-indigo-500/40 rounded-2xl p-6 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">
              Step {step + 1} of {tourSteps.length}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Skip tour"
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-5 space-y-3">
          <h2 id="tour-modal-title" className="text-xl font-bold text-white">
            {current.title}
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            {current.content}
          </p>
          <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-900/50 text-indigo-300 text-xs font-medium">
            💡 {current.highlight}
          </div>
        </div>

        {/* Progress dots & actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="flex items-center gap-1.5">
            {tourSteps.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === step ? 'bg-indigo-500 w-5' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30"
            >
              <span>{isLast ? 'Get Started' : 'Next'}</span>
              {isLast ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
