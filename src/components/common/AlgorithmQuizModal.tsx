import React, { useState } from 'react';
import { HelpCircle, CheckCircle, XCircle, Award, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizQuestion {
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface AlgorithmQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleCategory: string;
}

export const AlgorithmQuizModal: React.FC<AlgorithmQuizModalProps> = ({
  isOpen,
  onClose,
  moduleCategory,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  if (!isOpen) return null;

  const quizBank: Record<string, QuizQuestion[]> = {
    sorting: [
      {
        question: 'In Quick Sort with Lomuto partitioning on [4, 7, 2, 5], what is the chosen pivot element?',
        options: ['4 (First element)', '5 (Last element)', '2 (Smallest element)', '7 (Largest element)'],
        correctIndex: 1,
        explanation: 'In Lomuto partition scheme, the pivot is conventionally chosen as the last element of the partition window (A[high] = 5).',
      },
      {
        question: 'What is the auxiliary memory space complexity required by Merge Sort?',
        options: ['O(1) in-place', 'O(n) auxiliary buffer', 'O(log n) stack space', 'O(n²)'],
        correctIndex: 1,
        explanation: 'Standard Merge Sort requires O(n) temporary buffer space to merge two sorted subarrays back together.',
      },
    ],
    searching: [
      {
        question: 'In Binary Search on [10, 20, 30, 40, 50, 60, 70], what index is inspected first?',
        options: ['Index 0 (val 10)', 'Index 3 (val 40)', 'Index 6 (val 70)', 'Index 2 (val 30)'],
        correctIndex: 1,
        explanation: 'mid = floor((0 + 6) / 2) = index 3 (value 40).',
      },
    ],
    trees: [
      {
        question: 'An AVL node has left subtree height 4 and right subtree height 2. What is its balance factor and is it balanced?',
        options: [
          'Balance factor = +2 (Unbalanced, requires rotation)',
          'Balance factor = -2 (Unbalanced)',
          'Balance factor = +1 (Balanced)',
          'Balance factor = 0 (Balanced)',
        ],
        correctIndex: 0,
        explanation: 'Balance factor = leftH - rightH = 4 - 2 = +2. Since |bf| > 1, the node is unbalanced and triggers an AVL rotation.',
      },
    ],
    graphs: [
      {
        question: 'What data structure does Breadth-First Search (BFS) use to store pending vertices?',
        options: ['LIFO Stack', 'FIFO Queue', 'Priority Queue', 'Binary Search Tree'],
        correctIndex: 1,
        explanation: 'BFS uses a FIFO (First-In First-Out) Queue to explore vertices in order of increasing distance from the start node.',
      },
    ],
    hashing: [
      {
        question: 'Why does open-addressing hash table deletion use a <TOMBSTONE> instead of setting the slot to null?',
        options: [
          'To save RAM memory',
          'So subsequent linear probe searches do not terminate prematurely',
          'Because null values are forbidden in arrays',
          'To automatically double the table size',
        ],
        correctIndex: 1,
        explanation: 'If a deleted slot were set to null, a search for a key that collided past this slot would stop early and falsely report "not found".',
      },
    ],
  };

  const questions = quizBank[moduleCategory] || quizBank['sorting'];
  const currentQ = questions[currentIdx];

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctIndex) {
      setScore(prev => prev + 1);
      try {
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
      } catch {}
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleResetQuiz = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quiz-modal-title"
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            <h2 id="quiz-modal-title" className="text-base font-bold text-white">
              DSA Quick Check: Predict the Step
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close quiz"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!quizFinished ? (
          <div className="my-5 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Question {currentIdx + 1} of {questions.length}</span>
              <span>Score: {score}</span>
            </div>

            <p className="text-sm font-semibold text-slate-200 leading-relaxed">
              {currentQ.question}
            </p>

            <div className="space-y-2 pt-2">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = isAnswered && idx === currentQ.correctIndex;
                const isWrong = isAnswered && isSelected && idx !== currentQ.correctIndex;

                let btnStyle = 'bg-slate-800/80 border-slate-700 hover:bg-slate-800 text-slate-300';
                if (isCorrect) {
                  btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold';
                } else if (isWrong) {
                  btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-200';
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelect(idx)}
                    className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{option}</span>
                    {isCorrect && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {isWrong && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed animate-in fade-in">
                <span className="font-semibold text-indigo-400">Explanation: </span>
                {currentQ.explanation}
              </div>
            )}
          </div>
        ) : (
          <div className="my-6 text-center space-y-3">
            <Award className="w-12 h-12 text-indigo-400 mx-auto" />
            <h3 className="text-xl font-bold text-white">Quiz Completed!</h3>
            <p className="text-sm text-slate-400">
              You scored <span className="font-bold text-indigo-400">{score}</span> out of{' '}
              <span className="font-bold text-slate-200">{questions.length}</span>!
            </p>
            <div className="flex justify-center gap-3 pt-3">
              <button
                onClick={handleResetQuiz}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
              >
                Retry Quiz
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {!quizFinished && isAnswered && (
          <div className="flex justify-end pt-3 border-t border-slate-800">
            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
            >
              {currentIdx < questions.length - 1 ? 'Next Question' : 'View Results'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
