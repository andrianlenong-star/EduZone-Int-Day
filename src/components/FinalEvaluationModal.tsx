import React, { useState, useEffect } from 'react';
import {
  X,
  Award,
  BookOpen,
  CheckCircle2,
  Lock,
  Printer,
  Sparkles,
  Check,
  AlertCircle,
  Edit3,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Shield,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CountryProfile } from '../types/encyclopedia';
import { andeanAudio } from '../utils/andeanAudio';
import {
  QuizQuestion,
  getCountryQuiz,
  saveCountryQuiz,
  resetCountryQuizToDefault,
} from '../data/quizRegistry';

interface FinalEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedScenes: Record<number, boolean>;
  country: CountryProfile;
  language: 'id' | 'en';
  isDarkMode: boolean;
}

export const FinalEvaluationModal: React.FC<FinalEvaluationModalProps> = ({
  isOpen,
  onClose,
  completedScenes,
  country,
  language,
  isDarkMode,
}) => {
  const [activeTab, setActiveTab] = useState<'progress' | 'quiz' | 'certificate'>('progress');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState<boolean>(false);
  const [studentName, setStudentName] = useState<string>('');

  // Admin Quiz Editor State
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [adminNotice, setAdminNotice] = useState<string | null>(null);

  const isEn = language === 'en';
  const countryNameDisplay = isEn ? (country.nameEn || country.name) : country.name;

  // Load questions for the active country (from localStorage if modified, or defaults)
  useEffect(() => {
    if (isOpen) {
      const loaded = getCountryQuiz(country.id || country.name);
      setQuestions(loaded);
      setQuizAnswers({});
      setIsQuizSubmitted(false);
      setAdminNotice(null);
    }
  }, [isOpen, country.id, country.name]);

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

  if (!isOpen) return null;

  const completedCount = Object.values(completedScenes).filter(Boolean).length;

  // Final Assessment score calculation (passing grade >= 75%)
  const calculateFinalScore = () => {
    if (questions.length === 0) {
      return { score: 0, total: 0, percentage: 0, passed: false };
    }
    let correct = 0;
    questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctAnswerIndex) {
        correct++;
      }
    });
    const percentage = Math.round((correct / questions.length) * 100);
    return {
      score: correct,
      total: questions.length,
      percentage,
      passed: percentage >= 75,
    };
  };

  const finalScore = calculateFinalScore();

  const handleSelectAnswer = (qIdx: number, optIdx: number) => {
    if (isQuizSubmitted || isAdminMode) return;
    setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmitQuiz = () => {
    setIsQuizSubmitted(true);
    const result = calculateFinalScore();
    if (result.passed) {
      andeanAudio.playCertificateSound();
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    } else {
      andeanAudio.playErrorSound();
    }
  };

  const handlePrintCertificate = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // =========================================================================
  // ADMIN QUIZ MUTATION HANDLERS
  // =========================================================================
  const handleUpdateQuestionText = (qIdx: number, text: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIdx] = { ...copy[qIdx], questionText: text };
      return copy;
    });
  };

  const handleUpdateSceneContext = (qIdx: number, ctx: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIdx] = { ...copy[qIdx], sceneContext: ctx };
      return copy;
    });
  };

  const handleUpdateOptionText = (qIdx: number, optIdx: number, text: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const newOptions = [...copy[qIdx].options];
      newOptions[optIdx] = text;
      copy[qIdx] = { ...copy[qIdx], options: newOptions };
      return copy;
    });
  };

  const handleSetCorrectAnswer = (qIdx: number, optIdx: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIdx] = { ...copy[qIdx], correctAnswerIndex: optIdx };
      return copy;
    });
  };

  const handleDeleteQuestion = (qIdx: number) => {
    if (questions.length <= 1) {
      alert(isEn ? 'At least one question is required.' : 'Minimal harus ada satu soal.');
      return;
    }
    setQuestions((prev) => prev.filter((_, idx) => idx !== qIdx));
    setQuizAnswers({});
  };

  const handleAddQuestion = () => {
    const newId = `${country.id || 'country'}-q${Date.now()}`;
    const newQ: QuizQuestion = {
      id: newId,
      sceneContext: `[Scene ${Math.min(questions.length + 1, 6)}]`,
      questionText: isEn ? 'New question text...' : 'Teks pertanyaan baru...',
      options: [
        isEn ? 'Option A' : 'Pilihan A',
        isEn ? 'Option B' : 'Pilihan B',
        isEn ? 'Option C' : 'Pilihan C',
        isEn ? 'Option D' : 'Pilihan D',
      ],
      correctAnswerIndex: 0,
    };
    setQuestions((prev) => [...prev, newQ]);
  };

  const handleSaveChanges = () => {
    saveCountryQuiz(country.id || country.name, questions);
    setAdminNotice(
      isEn
        ? 'Quiz changes saved successfully to application storage!'
        : 'Perubahan kuis berhasil disimpan ke penyimpanan aplikasi!'
    );
    setTimeout(() => setAdminNotice(null), 3500);
  };

  const handleResetToDefault = () => {
    if (
      confirm(
        isEn
          ? 'Reset this country’s quiz to curriculum defaults?'
          : 'Kembalikan kuis negara ini ke pengaturan standar kurikulum?'
      )
    ) {
      const defaults = resetCountryQuizToDefault(country.id || country.name);
      setQuestions(defaults);
      setQuizAnswers({});
      setIsQuizSubmitted(false);
      setAdminNotice(
        isEn
          ? 'Reset to default questions completed.'
          : 'Kuis berhasil dikembalikan ke standar awal.'
      );
      setTimeout(() => setAdminNotice(null), 3000);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 cursor-default"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors ${
          isDarkMode
            ? 'bg-stone-900 border-stone-800 text-stone-100'
            : 'bg-white border-stone-200 text-stone-900'
        }`}
      >
        {/* Header Banner */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDarkMode ? 'border-stone-800 bg-stone-950/70' : 'border-stone-200 bg-stone-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 text-white shadow">
              <Award className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block">
                {isEn ? 'ACADEMIC MASTERY PORTFOLIO' : 'PORTOFOLIO KELULUSAN AKADEMIK'}
              </span>
              <h3 className="text-base sm:text-xl font-bold text-stone-100 flex items-center gap-2">
                <span>
                  {isEn
                    ? `Final Assessment & Certificate: ${countryNameDisplay}`
                    : `Evaluasi Akhir & Sertifikat: ${countryNameDisplay}`}
                </span>
                <span className="text-lg">{country.flag}</span>
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label={isEn ? 'Close Modal' : 'Tutup Jendela'}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-800 px-6 pt-2 bg-stone-950/40 gap-2">
          <button
            onClick={() => setActiveTab('progress')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'progress'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            {isEn ? 'Scene Progress (6 Scenes)' : 'Kemajuan Scene (6 Scene)'}
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'quiz'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            {isEn ? 'Final Assessment (HOTS)' : 'Evaluasi Akhir (HOTS)'}
          </button>

          <button
            onClick={() => setActiveTab('certificate')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'certificate'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            {isEn ? 'Mastery Certificate' : 'Sertifikat Kelulusan'}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: SCENE PROGRESS */}
          {activeTab === 'progress' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs sm:text-sm text-stone-300">
                <p className="font-bold text-amber-400">
                  {isEn
                    ? 'Passing Criteria for Kurikulum Merdeka & Cambridge Primary:'
                    : 'Syarat Kelulusan Kurikulum Merdeka & Cambridge Primary:'}
                </p>
                <p className="mt-1 leading-relaxed">
                  {isEn
                    ? `Complete all 6 documentary scenes (total 6 minutes) for ${countryNameDisplay} and achieve at least 75% on the assessment to unlock the Certified Cultural Specialist Certificate.`
                    : `Selesaikan seluruh 6 scene dokumenter (total 6 menit) untuk negara ${countryNameDisplay} dan raih skor minimal 75% pada evaluasi akhir untuk membuka Sertifikat Penjelajah Kebudayaan.`}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {country.scenes.map((scene) => {
                  const isDone = !!completedScenes[scene.number];
                  return (
                    <div
                      key={scene.id}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                        isDone
                          ? 'border-emerald-500/50 bg-emerald-500/10 text-stone-200'
                          : 'border-stone-800 bg-stone-950/40 text-stone-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isDone ? 'bg-emerald-500 text-white' : 'bg-stone-800 text-stone-400'
                          }`}
                        >
                          S{scene.number}
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-stone-100">
                            {isEn ? scene.titleEn : scene.titleId}
                          </h4>
                          <span className="text-[11px] text-stone-400">
                            {isEn ? 'Duration: 01:00' : 'Durasi: 01:00'}
                          </span>
                        </div>
                      </div>

                      {isDone ? (
                        <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isEn ? 'Passed' : 'Lulus'}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-stone-500 text-xs font-semibold">
                          <Lock className="w-3.5 h-3.5" />
                          <span>{isEn ? 'Locked' : 'Belum Selesai'}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: FINAL HOTS ASSESSMENT WITH ADMIN QUIZ EDITOR */}
          {activeTab === 'quiz' && (
            <div className="space-y-4">
              {/* Header Bar with Admin Toggle */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-stone-950/70 border border-stone-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-stone-300">
                    {isEn
                      ? `${questions.length} Final Assessment Questions`
                      : `${questions.length} Soal Evaluasi Berbasis Kompetensi`}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {isEn ? 'Passing Grade: >= 75%' : 'Passing Grade: >= 75%'}
                  </span>
                </div>

                {/* Edit Quiz (Admin Mode) Toggle Button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsAdminMode((prev) => !prev);
                      setIsQuizSubmitted(false);
                      setQuizAnswers({});
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer ${
                      isAdminMode
                        ? 'bg-amber-400 text-stone-950 ring-2 ring-amber-300'
                        : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Edit Quiz (Admin Mode)' : 'Mode Edit Admin Kuis'}</span>
                  </button>
                </div>
              </div>

              {/* Admin Notice Banner */}
              {adminNotice && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 text-xs font-medium flex items-center justify-between gap-2 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{adminNotice}</span>
                  </div>
                  <button
                    onClick={() => setAdminNotice(null)}
                    className="text-stone-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* ADMIN MODE ACTIVE: Editable Question Inputs, Radio Selection & Action Buttons */}
              {isAdminMode ? (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
                    <span>
                      🛠️{' '}
                      {isEn
                        ? 'Admin Mode is active: edit question texts, update options, and select the correct answer via radio buttons.'
                        : 'Mode Admin aktif: ubah teks soal, perbaiki opsi jawaban, dan pilih kunci jawaban dengan radio button.'}
                    </span>
                    <button
                      onClick={handleResetToDefault}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition"
                      title={isEn ? 'Reset to Default Questions' : 'Kembalikan ke Soal Standar'}
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{isEn ? 'Reset Defaults' : 'Reset Standar'}</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {questions.map((q, qIdx) => (
                      <div
                        key={q.id || qIdx}
                        className="p-4 rounded-2xl border border-amber-500/40 bg-stone-950/80 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="w-6 h-6 rounded-lg bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center shrink-0">
                              {qIdx + 1}
                            </span>
                            <input
                              type="text"
                              value={q.sceneContext}
                              onChange={(e) => handleUpdateSceneContext(qIdx, e.target.value)}
                              placeholder="[Scene Context]"
                              className="px-2.5 py-1 rounded-lg border border-stone-700 bg-stone-900 text-xs text-amber-300 font-mono w-48 focus:outline-none focus:border-amber-400"
                            />
                          </div>

                          <button
                            onClick={() => handleDeleteQuestion(qIdx)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-400 hover:text-white bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 transition"
                            title={isEn ? 'Delete this question' : 'Hapus soal ini'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{isEn ? 'Delete' : 'Hapus Soal'}</span>
                          </button>
                        </div>

                        {/* Question Text Input */}
                        <div>
                          <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                            {isEn ? 'Question Prompt' : 'Teks Pertanyaan'}
                          </label>
                          <input
                            type="text"
                            value={q.questionText}
                            onChange={(e) => handleUpdateQuestionText(qIdx, e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-stone-700 bg-stone-900 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-amber-400"
                            placeholder={isEn ? 'Enter question prompt...' : 'Masukkan teks pertanyaan...'}
                          />
                        </div>

                        {/* Options List with Dynamic Radio Correct Answer Picker */}
                        <div className="space-y-2 pt-1">
                          <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                            {isEn ? 'Answer Options (Select correct radio button):' : 'Pilihan Jawaban (Pilih radio button untuk jawaban benar):'}
                          </label>
                          {q.options.map((opt, optIdx) => {
                            const isCorrect = optIdx === q.correctAnswerIndex;
                            return (
                              <div
                                key={optIdx}
                                className={`flex items-center gap-2.5 p-2 rounded-xl border transition ${
                                  isCorrect
                                    ? 'border-emerald-500/70 bg-emerald-500/10'
                                    : 'border-stone-800 bg-stone-900/60'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`correct-answer-${q.id || qIdx}`}
                                  checked={isCorrect}
                                  onChange={() => handleSetCorrectAnswer(qIdx, optIdx)}
                                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                                  id={`q-${qIdx}-opt-${optIdx}`}
                                />
                                <span className="text-xs font-mono font-bold text-stone-400 w-4">
                                  {String.fromCharCode(65 + optIdx)}.
                                </span>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => handleUpdateOptionText(qIdx, optIdx, e.target.value)}
                                  className="flex-1 px-2.5 py-1.5 rounded-lg border border-stone-700 bg-stone-950 text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                                  placeholder={`Pilihan ${String.fromCharCode(65 + optIdx)}`}
                                />
                                {isCorrect && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-stone-950">
                                    {isEn ? 'CORRECT' : 'KUNCI'}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Admin Bottom Controls: Add Question & Save Changes */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      onClick={handleAddQuestion}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-amber-300 bg-stone-900 hover:bg-stone-800 border border-amber-500/50 shadow transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-amber-400" />
                      <span>{isEn ? 'Add New Question' : 'Tambah Soal Baru'}</span>
                    </button>

                    <button
                      onClick={handleSaveChanges}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-xs font-bold text-stone-950 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 shadow-lg transition active:scale-95 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isEn ? 'Save Changes' : 'Simpan Perubahan'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* STUDENT MODE: Read-Only Taking Quiz */
                <div className="space-y-4">
                  <div className="space-y-4">
                    {questions.map((q, qIdx) => (
                      <div
                        key={q.id || qIdx}
                        className="p-4 rounded-2xl border border-stone-800 bg-stone-950/60 space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-amber-500">
                            {q.sceneContext || (isEn ? `Question ${qIdx + 1} of ${questions.length}` : `Soal ${qIdx + 1} dari ${questions.length}`)}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm font-semibold text-stone-100 leading-relaxed">
                          {q.questionText}
                        </p>

                        <div className="grid grid-cols-1 gap-2 pt-1">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = quizAnswers[qIdx] === optIdx;
                            const isCorrect = optIdx === q.correctAnswerIndex;
                            let optionStyle =
                              'border-stone-800 bg-stone-900/60 text-stone-300 hover:border-stone-700';

                            if (isSelected) {
                              optionStyle = 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold';
                            }
                            if (isQuizSubmitted) {
                              if (isCorrect) {
                                optionStyle = 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold';
                              } else if (isSelected && !isCorrect) {
                                optionStyle = 'border-rose-500 bg-rose-500/20 text-rose-300';
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleSelectAnswer(qIdx, optIdx)}
                                className={`p-3 rounded-xl border text-xs text-left transition flex items-center justify-between cursor-pointer ${optionStyle}`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-stone-400 font-bold">
                                    {String.fromCharCode(65 + optIdx)}.
                                  </span>
                                  <span>{opt}</span>
                                </div>
                                {isQuizSubmitted && isCorrect && (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {!isQuizSubmitted ? (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={Object.keys(quizAnswers).length < questions.length}
                      className="w-full py-3 rounded-2xl text-xs sm:text-sm font-bold text-stone-950 bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-400 hover:to-amber-400 disabled:opacity-40 transition shadow cursor-pointer"
                    >
                      {isEn ? 'Submit Final Assessment' : 'Kirim Lembar Evaluasi Akhir'}
                    </button>
                  ) : (
                    <div className="p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 text-center space-y-2">
                      <h4 className="text-sm font-bold text-amber-400">
                        {isEn
                          ? `Your Final Score: ${finalScore.percentage}% (${finalScore.score}/${finalScore.total})`
                          : `Skor Anda: ${finalScore.percentage}% (${finalScore.score}/${finalScore.total})`}
                      </h4>
                      <p className="text-xs text-stone-300">
                        {finalScore.passed
                          ? (isEn
                              ? 'Outstanding! You have met the minimum mastery threshold (>= 75%). Please proceed to print your certificate!'
                              : 'Luar biasa! Anda telah memenuhi kriteria ketuntasan minimal (>= 75%). Silakan unduh sertifikat kelulusan Anda!')
                          : (isEn
                              ? 'Score has not reached 75%. Review the module scenes and try again.'
                              : 'Skor belum mencapai 75%. Anda dapat mempelajari kembali materi dan mengulang kuis.')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CERTIFICATE GENERATOR */}
          {activeTab === 'certificate' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder={isEn ? 'Type Full Student Name' : 'Ketik Nama Lengkap Siswa'}
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-stone-700 bg-stone-950 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={handlePrintCertificate}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 shadow transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Print Certificate' : 'Cetak Sertifikat'}</span>
                </button>
              </div>

              {/* Printable Certificate Template */}
              <div className="p-6 sm:p-8 rounded-3xl border-4 border-amber-600/60 bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 text-center space-y-4 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="inline-flex p-3 rounded-full bg-gradient-to-br from-amber-500 to-red-600 text-white shadow-lg">
                  <Award className="w-10 h-10" />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-mono tracking-widest uppercase text-amber-500 font-bold">
                    EDUZONE MPI KURIKULUM MERDEKA SD & CAMBRIDGE CHECKPOINT
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-amber-300">
                    {isEn
                      ? `CERTIFICATE OF DOCUMENTARY MASTERY: ${countryNameDisplay.toUpperCase()}`
                      : `SERTIFIKAT KELULUSAN DOKUMENTER ${countryNameDisplay.toUpperCase()}`}
                  </h3>
                  <p className="text-xs text-stone-400">
                    {isEn
                      ? 'Proudly presented for outstanding completion of interactive digital learning:'
                      : 'Diberikan dengan bangga atas ketuntasan pembelajaran digital interaktif:'}
                  </p>
                </div>

                <div className="py-2">
                  <span className="text-2xl sm:text-3xl font-bold text-white tracking-wide border-b-2 border-amber-500/70 pb-1 px-6 inline-block">
                    {studentName || (isEn ? 'Distinguished Student' : 'Siswa Berprestasi')}
                  </span>
                </div>

                <p className="text-xs text-stone-300 max-w-lg mx-auto leading-relaxed">
                  {isEn
                    ? `Has successfully mastered all 6 Documentary Scenes of ${countryNameDisplay} (Geography, Civilizational Heritage, National Language, Traditional Attire, Music & Dance Culture, and Iconic Gastronomy) with honors as `
                    : `Telah berhasil menyelesaikan seluruh 6 Scene Dokumenter Negara ${countryNameDisplay} (Letak Geografis, Sejarah, Bahasa Nasional, Pakaian Tradisional, Budaya Musik & Tari, serta Makanan Khas) dengan predikat `}
                  <strong>
                    {isEn
                      ? `CERTIFIED CULTURAL SPECIALIST: ${countryNameDisplay.toUpperCase()}`
                      : `PENJELAJAH AHLI KEBUDAYAAN ${countryNameDisplay.toUpperCase()}`}
                  </strong>.
                </p>

                <div className="pt-4 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400 font-mono flex-wrap gap-2">
                  <span>ID: EDU-{country.id.toUpperCase()}-2026</span>
                  <span>
                    {isEn
                      ? 'Verification: Kemendikdasmen RI & Cambridge Primary'
                      : 'Verifikasi: Kemendikdasmen RI & Cambridge Primary'}
                  </span>
                  <span>{isEn ? 'Grade: >= 75%' : 'Nilai: >= 75%'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`px-5 py-3.5 border-t flex justify-end ${
            isDarkMode ? 'border-stone-800 bg-stone-950/60' : 'border-amber-100 bg-amber-50/70'
          }`}
        >
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 transition shadow cursor-pointer"
          >
            {isEn ? 'Close' : 'Tutup'}
          </button>
        </div>
      </div>
    </div>
  );
};
