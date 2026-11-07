import React, { useState, useEffect } from 'react';
import {
  X,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  RotateCcw,
  Award,
  Sparkles,
  Lightbulb,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DocumentaryScene } from '../data/peruScenesData';
import { evaluateQuizScore, checkProgressLock } from '../utils/quizRules';
import { andeanAudio } from '../utils/andeanAudio';

interface TriviaQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  scene: DocumentaryScene;
  language: 'id' | 'en';
  isDarkMode: boolean;
  onPassScene: (sceneNumber: number) => void;
  onNextScene: () => void;
  onRewatchScene?: () => void;
}

export const TriviaQuizModal: React.FC<TriviaQuizModalProps> = ({
  isOpen,
  onClose,
  scene,
  language,
  isDarkMode,
  onPassScene,
  onNextScene,
  onRewatchScene,
}) => {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset quiz state whenever scene changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentQuestionIdx(0);
      setSelectedAnswers({});
      setHasSubmitted(false);
      setShowHint(false);
    }
  }, [isOpen, scene.id]);

  if (!isOpen) return null;

  const questions = scene.triviaQuestions;
  const currentQ = questions[currentQuestionIdx];
  const isLastQuestion = currentQuestionIdx === questions.length - 1;
  const isAnswered = selectedAnswers[currentQuestionIdx] !== undefined;

  const handleSelectOption = (optionIdx: number) => {
    if (selectedAnswers[currentQuestionIdx] !== undefined) return; // prevent changing once chosen

    const nextAnswers = { ...selectedAnswers, [currentQuestionIdx]: optionIdx };
    setSelectedAnswers(nextAnswers);

    // Audio cue
    if (optionIdx === currentQ.correctIndex) {
      andeanAudio.playSuccessSound();
    } else {
      andeanAudio.playErrorSound();
    }
  };

  const handleNextQuestion = () => {
    setShowHint(false);
    if (!isLastQuestion) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      setHasSubmitted(true);
      const evalResult = evaluateQuizScore(
        selectedAnswers,
        questions.map((q) => ({ correctIndex: q.correctIndex }))
      );

      if (evalResult.passed) {
        onPassScene(scene.number);
        andeanAudio.playCertificateSound();
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
      }
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setCurrentQuestionIdx(0);
    setHasSubmitted(false);
    setShowHint(false);
  };

  const evalResult = evaluateQuizScore(
    selectedAnswers,
    questions.map((q) => ({ correctIndex: q.correctIndex }))
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 cursor-default"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors ${
          isDarkMode
            ? 'bg-stone-900 border-stone-800 text-stone-100'
            : 'bg-white border-amber-200 text-stone-900'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${
            isDarkMode ? 'border-stone-800 bg-stone-950/60' : 'border-amber-100 bg-amber-50/70'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 text-white shadow">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                Trivia Quiz • Scene {scene.number}
              </span>
              <h3 className="text-base sm:text-lg font-bold line-clamp-1">
                {language === 'id' ? scene.titleId : scene.titleEn}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Quiz"
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {!hasSubmitted ? (
            <>
              {/* Progress counter & bar */}
              <div className="flex items-center justify-between text-xs font-semibold text-stone-500 dark:text-stone-400">
                <span>
                  {language === 'id' ? 'Pertanyaan' : 'Question'} {currentQuestionIdx + 1} / {questions.length}
                </span>
                <span className="font-mono text-amber-500 font-bold">
                  {language === 'id' ? 'Target Kelulusan: >= 75%' : 'Passing Grade: >= 75%'}
                </span>
              </div>
              <div className="w-full h-1.5 bg-stone-700/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-amber-500 transition-all duration-300"
                  style={{
                    width: `${((currentQuestionIdx + (isAnswered ? 1 : 0)) / questions.length) * 100}%`,
                  }}
                />
              </div>

              {/* Question Text */}
              <div
                className={`p-4 rounded-xl border text-sm sm:text-base font-semibold leading-relaxed ${
                  isDarkMode
                    ? 'bg-stone-950/80 border-stone-800 text-stone-100'
                    : 'bg-amber-50/50 border-amber-200/70 text-stone-900'
                }`}
              >
                {language === 'id' ? currentQ.questionId : currentQ.questionEn}
              </div>

              {/* Options List */}
              <div className="space-y-2.5">
                {(language === 'id' ? currentQ.optionsId : currentQ.optionsEn).map((optText, optIdx) => {
                  const isSelected = selectedAnswers[currentQuestionIdx] === optIdx;
                  const isCorrect = optIdx === currentQ.correctIndex;
                  const answered = selectedAnswers[currentQuestionIdx] !== undefined;

                  let optionStyle = isDarkMode
                    ? 'border-stone-800 bg-stone-950/50 hover:border-amber-500/50 hover:bg-stone-800/40 text-stone-200'
                    : 'border-stone-200 bg-stone-50 hover:border-amber-400 hover:bg-amber-50/40 text-stone-800';

                  if (answered) {
                    if (isCorrect) {
                      optionStyle = 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 font-bold ring-1 ring-emerald-500';
                    } else if (isSelected) {
                      optionStyle = 'border-rose-500 bg-rose-500/15 text-rose-600 dark:text-rose-300 font-bold ring-1 ring-rose-500';
                    } else {
                      optionStyle = 'opacity-40 border-stone-800 bg-stone-950/30';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={answered}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full p-3 sm:p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-3 ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${
                            answered && isCorrect
                              ? 'bg-emerald-500 text-white'
                              : answered && isSelected
                              ? 'bg-rose-500 text-white'
                              : 'bg-stone-700/30 text-stone-400'
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{optText}</span>
                      </div>

                      {answered && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      )}
                      {answered && isSelected && !isCorrect && (
                        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Immediate Feedback & Explanation Box */}
              {isAnswered && (
                <div
                  className={`p-3.5 rounded-xl border text-xs sm:text-sm animate-in fade-in duration-300 ${
                    selectedAnswers[currentQuestionIdx] === currentQ.correctIndex
                      ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                      : 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                  }`}
                >
                  <p className="font-semibold mb-1 flex items-center gap-1.5">
                    {selectedAnswers[currentQuestionIdx] === currentQ.correctIndex ? (
                      <>
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span>{language === 'id' ? 'Jawaban Benar! Luar Biasa.' : 'Correct! Excellent deduction.'}</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                        <span>{language === 'id' ? 'Kurang Tepat.' : 'Incorrect.'}</span>
                      </>
                    )}
                  </p>
                  <p className="text-stone-300 dark:text-stone-300 leading-relaxed">
                    {language === 'id' ? currentQ.explanationId : currentQ.explanationEn}
                  </p>
                </div>
              )}

              {/* Hint Toggle if user wants guidance */}
              {!isAnswered && (
                <div className="pt-1">
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="text-xs font-semibold text-amber-500 hover:text-amber-400 flex items-center gap-1 transition"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>{showHint ? (language === 'id' ? 'Sembunyikan Petunjuk' : 'Hide Hint') : (language === 'id' ? 'Buka Petunjuk' : 'Show Hint')}</span>
                  </button>
                  {showHint && (
                    <p className="mt-1.5 text-xs text-amber-300/80 bg-amber-950/20 p-2 rounded-lg border border-amber-900/30">
                      💡 {language === 'id' ? currentQ.hintId : currentQ.hintEn}
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Quiz Completion Results Screen */
            <div className="text-center py-4 space-y-4">
              <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-amber-500/30 shadow-inner">
                {evalResult.passed ? (
                  <Award className="w-16 h-16 text-amber-500 animate-bounce" />
                ) : (
                  <RotateCcw className="w-16 h-16 text-stone-400" />
                )}
              </div>

              <div>
                <h4 className="text-xl font-bold">
                  {evalResult.passed
                    ? language === 'id'
                      ? 'Selamat! Anda Lulus Kuis Scene Ini!'
                      : 'Congratulations! You Passed This Scene Quiz!'
                    : language === 'id'
                    ? 'Skor Belum Mencapai Syarat Kelulusan'
                    : 'Passing Threshold Not Reached'}
                </h4>
                <p className="text-sm text-stone-400 mt-1">
                  {evalResult.passed
                    ? language === 'id'
                      ? `Anda menjawab ${evalResult.score} dari ${evalResult.total} soal dengan benar (${evalResult.percentage}%). Lencana Scene ${scene.number} terbuka!`
                      : `You answered ${evalResult.score} out of ${evalResult.total} questions correctly (${evalResult.percentage}%). Scene ${scene.number} Badge unlocked!`
                    : language === 'id'
                    ? `Skor Anda: ${evalResult.percentage}% (Minimal kelulusan: 75%). Silakan tonton ulang scene atau ulangi kuis.`
                    : `Your score: ${evalResult.percentage}% (Minimum required: 75%). Feel free to rewatch or retry.`}
                </p>
              </div>

              <div className="max-w-xs mx-auto p-3 rounded-xl bg-stone-950/60 border border-stone-800 text-xs font-mono flex items-center justify-around">
                <div>
                  <span className="block text-stone-500 uppercase">{language === 'id' ? 'Benar' : 'Score'}</span>
                  <span className="text-base font-bold text-amber-400">{evalResult.score}/{evalResult.total}</span>
                </div>
                <div>
                  <span className="block text-stone-500 uppercase">{language === 'id' ? 'Akurasi' : 'Accuracy'}</span>
                  <span className="text-base font-bold text-emerald-400">{evalResult.percentage}%</span>
                </div>
                <div>
                  <span className="block text-stone-500 uppercase">{language === 'id' ? 'Status' : 'Status'}</span>
                  <span className={`text-base font-bold ${evalResult.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {evalResult.passed ? (language === 'id' ? 'LULUS' : 'PASSED') : (language === 'id' ? 'REMIDI' : 'RETRY')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div
          className={`px-5 py-3.5 border-t flex items-center justify-between gap-3 ${
            isDarkMode ? 'border-stone-800 bg-stone-950/60' : 'border-amber-100 bg-amber-50/70'
          }`}
        >
          {!hasSubmitted ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-stone-200 transition cursor-pointer"
              >
                {language === 'id' ? 'Tutup Sementara' : 'Close'}
              </button>

              <button
                type="button"
                onClick={handleNextQuestion}
                disabled={!isAnswered}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed shadow transition active:scale-95 cursor-pointer"
              >
                <span>
                  {isLastQuestion
                    ? language === 'id'
                      ? 'Lihat Hasil Akhir'
                      : 'View Final Result'
                    : language === 'id'
                    ? 'Pertanyaan Selanjutnya'
                    : 'Next Question'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleRetry}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border border-stone-700 hover:bg-stone-800 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'id' ? 'Ulangi Kuis' : 'Retry Quiz'}</span>
              </button>

              {evalResult.passed ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNextScene();
                  }}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 shadow-md transition active:scale-95 cursor-pointer"
                >
                  <span>{language === 'id' ? 'Lanjut ke Scene Berikutnya' : 'Advance to Next Scene'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onRewatchScene) {
                      onRewatchScene();
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition cursor-pointer"
                >
                  {language === 'id' ? 'Tonton Ulang Video Scene' : 'Rewatch Scene Video'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
