"use client";

import React, { useState, useEffect } from "react";
import { 
  BookOpen, Sparkles, ArrowRight, Search, 
  GraduationCap, LayoutGrid, List, Filter,
  ChevronRight, Bookmark, Clock, CheckCircle, Zap, Plus, Check, RefreshCw
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getStudentProfile, getStudentProgress, startLearningTopic, markTopicAsLearned } from "@/lib/db";
import { NCERT_DATA } from "@/lib/resources/ncert-data";
import { cn } from "@/lib/utils";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ResourcesPage() {
  const { user } = useAuth();
  const [grade, setGrade] = useState<number>(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [learningTopics, setLearningTopics] = useState<Set<string>>(new Set());
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshProgress = async () => {
    setIsRefreshing(true);
    try {
      if (!user) return;
      const progress = await getStudentProgress(user!.uid);
      if (progress) {
        const learning = new Set(progress.learningTopics?.map((t: any) => t.chapterId) || []);
        const completed = new Set(progress.completedTopics?.map((t: any) => t.chapterId) || []);
        setLearningTopics(learning);
        setCompletedTopics(completed);
        toast.success("✅ Progress updated!");
      }
    } catch (error) {
      console.error("Failed to refresh:", error);
      toast.error("Failed to refresh progress");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const uid = user.uid;

    async function load() {
      const profile = await getStudentProfile(uid);
      if (profile?.grade) setGrade(profile.grade);
      
      // Load current progress
      const progress = await getStudentProgress(uid);
      if (progress) {
        const learning = new Set(progress.learningTopics?.map((t: any) => t.chapterId) || []);
        const completed = new Set(progress.completedTopics?.map((t: any) => t.chapterId) || []);
        setLearningTopics(learning);
        setCompletedTopics(completed);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const handleStartLearning = async (chapter: any) => {
    if (!user) {
      toast.error("Please log in first");
      return;
    }

    if (completedTopics.has(chapter.id)) {
      toast.error("You've already completed this topic!");
      return;
    }

    if (learningTopics.has(chapter.id)) {
      toast.error("You're already learning this topic!");
      return;
    }
    
    setActionLoading(chapter.id);
    try {
      console.log("Starting learning for chapter:", chapter);
      await startLearningTopic(user!.uid, chapter.id, chapter);
      setLearningTopics(new Set([...learningTopics, chapter.id]));
      toast.success(`✅ Started learning "${chapter.title}"!`);
    } catch (error) {
      console.error("Failed to start learning:", error);
      toast.error("Failed to start learning. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAsLearned = async (chapter: any) => {
    if (!user) {
      toast.error("Please log in first");
      return;
    }

    if (!learningTopics.has(chapter.id)) {
      toast.error("This topic is not in your learning list!");
      return;
    }
    
    setActionLoading(chapter.id);
    try {
      console.log("Marking as learned for chapter:", chapter);
      await markTopicAsLearned(user!.uid, chapter.id);
      setLearningTopics(new Set([...learningTopics].filter(id => id !== chapter.id)));
      setCompletedTopics(new Set([...completedTopics, chapter.id]));
      toast.success(`🎉 Great! "${chapter.title}" marked as completed!`);
    } catch (error) {
      console.error("Failed to mark as learned:", error);
      toast.error("Failed to mark as completed. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const subjects = grade === 5 ? ["Telugu", "Hindi", "English", "Maths", "Science", "Social"] : ["Math", "Science", "English"];
  const allChapters = NCERT_DATA[grade] || {};
  
  const filteredChapters = Object.entries(allChapters).flatMap(([sub, chapters]) => 
    chapters.filter(ch => 
      (selectedSubject === "All" || ch.subject === selectedSubject) &&
      (ch.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
       ch.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  );

  if (loading) {
    return <div className="h-96 flex items-center justify-center animate-pulse text-foreground/20 font-black">PREPARING YOUR LIBRARY...</div>;
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Search & Filter Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
           <h1 className="text-4xl font-black tracking-tight text-foreground">NCERT <span className="text-primary italic">Library</span></h1>
           <p className="text-foreground/40 font-bold flex items-center gap-2">
             <GraduationCap className="w-5 h-5 text-primary" />
             Exploring Grade {grade} Curriculum
           </p>
        </div>

        <div className="flex items-center gap-4">
           <div className="relative group max-w-sm w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/30 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search all classes (5th, 10th...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 glass bg-white/40 rounded-2xl border-white focus:ring-2 ring-primary/20 transition-all font-bold placeholder:opacity-50"
              />
           </div>
           <button 
              onClick={() => {
                if (searchQuery) {
                  setGrade(grade === 5 ? 10 : 5);
                }
              }}
              className="p-4 glass bg-white/60 rounded-2xl text-primary hover:bg-white transition-all shadow-sm"
              title="Switch Grade"
            >
              <Filter className="w-5 h-5" />
           </button>
           <button
              onClick={refreshProgress}
              disabled={isRefreshing}
              className="p-4 glass bg-white/60 rounded-2xl text-primary hover:bg-white disabled:opacity-50 transition-all shadow-sm"
              title="Refresh Progress"
            >
              <RefreshCw className={cn("w-5 h-5", isRefreshing && "animate-spin")} />
           </button>
        </div>
      </header>

      {/* Subject Filter Pills & Grade Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-6">
         <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => setSelectedSubject("All")}
              className={cn("px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all", 
              selectedSubject === "All" ? "bg-primary text-white shadow-lg shadow-primary/20" : "glass bg-white/40 text-foreground/40 hover:bg-white/80")}
            >
              All Categories
            </button>
            {subjects.map(s => (
              <button 
                key={s}
                onClick={() => setSelectedSubject(s)}
                className={cn("px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all", 
                selectedSubject === s ? "bg-primary text-white shadow-lg shadow-primary/20" : "glass bg-white/40 text-foreground/40 hover:bg-white/80")}
              >
                {s}
              </button>
            ))}
         </div>

         <div className="flex items-center gap-2 glass bg-white/20 p-1.5 rounded-2xl border border-white/40">
            {[5, 10].map(g => (
               <button 
                  key={g}
                  onClick={() => setGrade(g)}
                  className={cn(
                    "px-4 py-1.5 rounded-xl text-[10px] font-black transition-all",
                     grade === g ? "bg-white text-primary shadow-sm" : "text-foreground/30 hover:bg-white/40"
                  )}
               >
                  Class {g}
               </button>
            ))}
         </div>
      </div>

      {/* NCERT Chapters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {filteredChapters.map((ch, idx) => (
           <div 
             key={ch.id} 
             className="group relative p-10 glass rounded-[3rem] border-white/60 hover:-translate-y-2 transition-all duration-500 shadow-xl overflow-hidden flex flex-col"
           >
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-transform duration-1000 group-hover:scale-150"></div>
              
              <div className="relative z-10 flex flex-col h-full flex-1">
                 <div className="flex items-center justify-between mb-8">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12", 
                      ch.subject === "Math" || ch.subject === "Maths" ? "bg-indigo-50 text-indigo-500" : ch.subject === "Science" || ch.subject === "EVS" ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"
                    )}>
                       <BookOpen className="w-7 h-7" />
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/40 rounded-full border border-white text-[10px] font-black italic opacity-60">
                       Grade {ch.grade} • Ch {idx + 1}
                    </div>
                 </div>

                 <h3 className="text-2xl font-black text-foreground mb-4 group-hover:text-primary transition-colors leading-tight">
                    {ch.title}
                 </h3>
                 <p className="text-foreground/40 font-bold text-sm leading-relaxed mb-6 flex-1">
                    {ch.description}
                 </p>

                 {/* Learning Status Indicator */}
                 <div className="flex items-center gap-2 mb-6 flex-wrap">
                    {ch.pdfUrl && (
                      <a href={ch.pdfUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-indigo-50/80 text-indigo-600 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-100 transition-colors border border-indigo-100/50">
                        <BookOpen className="w-3.5 h-3.5" />
                        PDF
                      </a>
                    )}
                    {completedTopics.has(ch.id) && (
                      <div className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-green-200">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Completed
                      </div>
                    )}
                    {learningTopics.has(ch.id) && !completedTopics.has(ch.id) && (
                      <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-blue-200 animate-pulse">
                        <Clock className="w-3.5 h-3.5" />
                        Learning
                      </div>
                    )}
                 </div>

                 {/* Learning Tracking Buttons */}
                 <div className="flex gap-3 mb-8">
                    {!learningTopics.has(ch.id) && !completedTopics.has(ch.id) && (
                      <button
                        onClick={() => handleStartLearning(ch)}
                        disabled={actionLoading === ch.id}
                        className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20 hover:shadow-lg hover:shadow-primary/40"
                      >
                        {actionLoading === ch.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Starting...
                          </>
                        ) : (
                          <>
                            <Plus className="w-5 h-5" />
                            Start Learning
                          </>
                        )}
                      </button>
                    )}
                    {learningTopics.has(ch.id) && !completedTopics.has(ch.id) && (
                      <button
                        onClick={() => handleMarkAsLearned(ch)}
                        disabled={actionLoading === ch.id}
                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-700 disabled:opacity-50 transition-all shadow-lg shadow-green-600/20 hover:shadow-lg hover:shadow-green-600/40"
                      >
                        {actionLoading === ch.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Marking...
                          </>
                        ) : (
                          <>
                            <Check className="w-5 h-5" />
                            Mark as Completed
                          </>
                        )}
                      </button>
                    )}
                    {completedTopics.has(ch.id) && (
                      <button
                        disabled
                        className="flex-1 px-4 py-3 bg-green-100 text-green-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Completed
                      </button>
                    )}
                 </div>

                 <Link 
                    href={`/dashboard/student/resources/${ch.grade}/${ch.subject}/${encodeURIComponent(ch.title)}`}
                    className="flex flex-col mt-auto"
                 >
                    <div className="flex items-center justify-between pt-8 border-t border-slate-100 group/link cursor-pointer">
                       <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-accent group-hover/link:text-primary transition-colors">AI Powered Guide</span>
                       </div>
                       <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover/link:bg-primary group-hover/link:text-white transition-all shadow-sm">
                          <ArrowRight className="w-6 h-6" />
                       </div>
                    </div>
                 </Link>
              </div>
           </div>
         ))}

         {filteredChapters.length === 0 && (
            <div className="col-span-full py-32 glass border-2 border-dashed border-slate-200 rounded-[3rem] text-center">
               <p className="text-2xl font-black text-foreground/20 italic tracking-tight mb-8">No chapters matched in Class {grade}...</p>
               <button 
                  onClick={() => setGrade(grade === 5 ? 10 : 5)}
                  className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20"
               >
                  Try Class {grade === 5 ? 10 : 5} Instead?
               </button>
            </div>
         )}
      </div>

      {/* Bottom Action Footer */}
      <section className="p-12 bg-slate-900 rounded-[3.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative group">
         <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/10 opacity-40 group-hover:opacity-60 transition-opacity"></div>
         <div className="relative z-10 space-y-4 text-center md:text-left max-w-xl">
            <h2 className="text-4xl font-black tracking-tight">Can't find a topic?</h2>
            <p className="text-white/60 font-bold text-lg leading-relaxed italic">
               "Type any topic from your school book, and I'll explain it simply with quizzes!"
            </p>
         </div>
         <div className="relative z-10 w-full md:w-auto">
            <Link 
               href={searchQuery ? `/dashboard/student/resources/Math/${encodeURIComponent(searchQuery)}` : "/dashboard/student/ai-buddy"}
               className="w-full md:w-auto px-12 py-5 bg-white text-slate-900 font-black text-xl rounded-[2rem] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
               Ask AI Buddy
               <Sparkles className="w-6 h-6 text-primary fill-primary" />
            </Link>
         </div>
         
         {/* Decorative Blur */}
         <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-primary rounded-full blur-[90px] opacity-20"></div>
      </section>
    </div>
  );
}
