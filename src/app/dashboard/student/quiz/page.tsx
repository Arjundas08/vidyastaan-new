"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, ArrowRight, CheckCircle2, BookOpen, Sparkles, 
  Loader2, Trophy, Zap, Star, ShieldCheck, Flag, BarChart
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { getStudentProfile, updateStudentProfile } from "@/lib/db";
import { getQuizForStudent, QuizQuestion } from "@/lib/quiz-generator";

export default function DiagnosticQuizPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [profile, setProfile] = useState<any>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [isFinishing, setIsFinishing] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function loadQuiz() {
      try {
        const studentProfile = await getStudentProfile(user!.uid);
        if (!studentProfile) {
          toast.error("Profile not found.");
          return;
        }
        setProfile(studentProfile);
        
        // Generate Quiz: Target Grade = Current Grade - 2 (Adaptive Logic)
        const quiz = getQuizForStudent(
          studentProfile.grade || 10, 
          studentProfile.subjects || ["Math", "Science"]
        );
        setQuestions(quiz);
      } catch (e) {
        console.error("Quiz load error:", e);
        toast.error("Failed to prepare your challenge.");
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, [user]);

  const handleSelect = (idx: number) => {
    setAnswers({ ...answers, [questions[currentIdx].id]: idx });
  };

  const next = () => {
    if (answers[questions[currentIdx].id] === undefined) {
      toast.error("Pick an answer to continue!");
      return;
    }
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setIsFinishing(true);
    try {
      // 1. Calculate Results
      const subjectScores: Record<string, { correct: number, total: number }> = {};
      
      questions.forEach(q => {
        if (!subjectScores[q.subject]) subjectScores[q.subject] = { correct: 0, total: 0 };
        subjectScores[q.subject].total++;
        if (answers[q.id] === q.correctAnswer) subjectScores[q.subject].correct++;
      });

      // 2. Prepare Assessment Record
      const assessmentData = {
        lastAttempt: new Date().toISOString(),
        scores: Object.entries(subjectScores).map(([sub, data]) => ({
          subject: sub,
          score: Math.round((data.correct / data.total) * 100),
          proficiency: data.correct / data.total > 0.7 ? "Master" : data.correct / data.total > 0.4 ? "Growing" : "Explorer"
        }))
      };

      // 3. Save to Profile
      await updateStudentProfile(user!.uid, {
        lastAssessment: assessmentData,
        assessmentComplete: true
      });

      setQuizComplete(true);
      toast.success("Assessment Complete! You're a star! 🌟");
    } catch (e) {
      console.error("Finish quiz error:", e);
      toast.error("Failed to save your progress.");
    } finally {
      setIsFinishing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50/10">
        <div className="text-center space-y-6">
           <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
           <p className="text-xl font-black text-foreground/40 animate-pulse">Personalizing your Discovery Quiz...</p>
        </div>
      </div>
    );
  }

  if (quizComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50/50">
         <div className="max-w-2xl w-full glass p-12 rounded-[4rem] border-white/80 shadow-3xl text-center space-y-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>
            
            <div className="w-24 h-24 bg-emerald-100 rounded-[2rem] flex items-center justify-center text-emerald-600 mx-auto shadow-xl ring-4 ring-white animate-bounce">
               <Trophy className="w-12 h-12" />
            </div>
            
            <div>
               <h1 className="text-4xl font-black tracking-tight mb-4">Discovery <span className="text-primary italic">Unlocked</span></h1>
               <p className="text-foreground/50 font-bold text-lg max-w-md mx-auto leading-relaxed">
                  Excellent work! We've mapped your skills. You're particularly strong in <span className="text-emerald-600">foundation topics</span>.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="p-6 bg-white/60 rounded-3xl border border-white flex items-center gap-4 hover:scale-[1.02] transition-transform shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                     <BarChart className="w-6 h-6" />
                  </div>
                  <div className="text-left font-black">
                     <p className="text-[10px] text-foreground/40 uppercase tracking-widest">Skill Level</p>
                     <p className="text-lg">Emerging Wizard</p>
                  </div>
               </div>
               <div className="p-6 bg-white/60 rounded-3xl border border-white flex items-center gap-4 hover:scale-[1.02] transition-transform shadow-sm">
                  <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                     <Zap className="w-6 h-6" />
                  </div>
                  <div className="text-left font-black">
                     <p className="text-[10px] text-foreground/40 uppercase tracking-widest">Profile Glow</p>
                     <p className="text-lg">+450 XP Awarded</p>
                  </div>
               </div>
            </div>

            <button 
               onClick={() => router.push("/dashboard/student")}
               className="w-full py-6 bg-primary text-white font-black text-xl rounded-[2.2rem] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
               Enter Your Dashboard
               <ArrowRight className="w-6 h-6" />
            </button>
         </div>
      </div>
    );
  }

  const q = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-[#FDFEFE] flex flex-col p-6 md:p-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-[120px]"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent/5 rounded-full blur-[120px]"></div>

      {/* Header Info */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between mb-12 relative z-10 font-black">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm ring-1 ring-slate-100">
               <BookOpen className="w-6 h-6" />
            </div>
            <div>
               <h4 className="text-foreground/40 text-[10px] uppercase tracking-widest">Assessment Mode</h4>
               <h2 className="text-xl tracking-tight">Discovery <span className="text-primary italic">Mode</span></h2>
            </div>
         </div>
         <div className="flex items-center gap-3 px-6 py-3 glass bg-white/40 border-white rounded-[1.5rem] shadow-sm">
            <Flag className="w-4 h-4 text-rose-500" />
            <span className="text-sm font-black text-foreground/60">{currentIdx + 1} / {questions.length}</span>
         </div>
      </div>

      {/* Main Quiz Flow */}
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col justify-center relative z-10">
         <div className="mb-10 space-y-4">
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
               <div 
                  className="h-full bg-primary transition-all duration-700 shadow-[0_0_15px_rgba(79,70,229,0.2)]" 
                  style={{ width: `${progress}%` }} 
               />
            </div>
         </div>

         <div className="space-y-12 transition-all">
            <div className="space-y-4">
               <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em] inline-block mb-2">
                  {q.subject} • Foundation Level
               </span>
               <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
                  {q.question}
               </h1>
            </div>

            <div className="grid grid-cols-1 gap-4">
               {q.options.map((opt, i) => (
                 <button
                   key={i}
                   onClick={() => handleSelect(i)}
                   className={cn(
                     "group relative p-8 glass rounded-[2.5rem] border-white/60 transition-all duration-300 text-left hover:-translate-y-1 active:scale-95 shadow-xl overflow-hidden",
                     answers[q.id] === i ? "bg-primary border-primary ring-4 ring-primary/10" : "bg-white/40 hover:bg-white"
                   )}
                 >
                    <div className="flex items-center gap-6 relative z-10">
                       <div className={cn(
                         "w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all",
                         answers[q.id] === i ? "bg-white text-primary" : "bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white"
                       )}>
                          {String.fromCharCode(65 + i)}
                       </div>
                       <span className={cn(
                         "text-xl font-bold transition-colors",
                         answers[q.id] === i ? "text-white" : "text-foreground/80"
                       )}>
                          {opt}
                       </span>
                    </div>
                    {answers[q.id] === i && (
                      <div className="absolute right-8 top-1/2 -translate-y-1/2 text-white">
                         <ShieldCheck className="w-8 h-8 opacity-40" />
                      </div>
                    )}
                 </button>
               ))}
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-slate-100">
               <p className="text-foreground/30 font-bold italic text-sm">Targeting Foundational Gap Detection</p>
               <button 
                  onClick={next}
                  disabled={isFinishing}
                  className="px-12 py-5 bg-primary text-white font-black text-lg rounded-[2rem] shadow-3xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
               >
                  {isFinishing ? <Loader2 className="w-5 h-5 animate-spin" /> : currentIdx === questions.length - 1 ? "Finish Journey" : "Next Discovery"}
                  <ArrowRight className="w-6 h-6" />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
