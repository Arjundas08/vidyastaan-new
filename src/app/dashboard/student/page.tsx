"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Calendar, Award, Zap, TrendingUp, Play, 
  ArrowRight, BookOpen, Star, Sparkles, Loader2, Bot, Target, Clock, MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getStudentProfile, getSessionsForUser, getUpcomingWorkshops } from "@/lib/db";

export default function StudentDashboardHome() {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      if (!user) return;
      try {
        const [profile, sessions, upcomingWorkshops] = await Promise.all([
          getStudentProfile(user.uid),
          getSessionsForUser(user.uid, "student"),
          getUpcomingWorkshops()
        ]);

        setStudentData(profile);
        const upcoming = sessions.find((s: any) => s.status === "scheduled");
        setSession(upcoming);
        setWorkshops(upcomingWorkshops.slice(0, 3));
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse"></div>
        </div>
      </div>
    );
  }

  const STATS = [
    { label: "Sessions", value: studentData?.sessionCount || "0", icon: Calendar, color: "text-indigo-600", bg: "bg-indigo-50", glow: "shadow-indigo-500/10" },
    { label: "Skills", value: studentData?.curiosities?.length || "0", icon: Award, color: "text-cyan-600", bg: "bg-cyan-50", glow: "shadow-cyan-500/10" },
    { label: "Streak", value: studentData?.streak || "0", suffix: " days", icon: Zap, color: "text-rose-600", bg: "bg-rose-50", glow: "shadow-rose-500/10" },
    { label: "Badges", value: studentData?.badges?.length || "0", icon: Star, color: "text-violet-600", bg: "bg-violet-50", glow: "shadow-violet-500/10" },
  ];

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto">
      {/* Header with Glass Greeting */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 p-10 glass rounded-[3rem] border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-primary/20 ring-4 ring-white rotate-3">
             {user?.name?.[0] || "S"}
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground">
              Hello, <span className="text-primary">{user?.name?.split(' ')[0]}</span>!
            </h1>
            <p className="text-foreground/50 mt-2 font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent animate-pulse" />
              {studentData?.status === "unassigned" 
                ? "Perfecting your mentor match..." 
                : "You're making incredible progress. Keep it up!"}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
           <div className="px-6 py-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                 <Zap className="w-5 h-5 text-rose-500 fill-rose-500" />
              </div>
              <div>
                 <p className="text-[10px] text-foreground/40 font-black uppercase tracking-widest">Active Streak</p>
                 <p className="text-lg font-black">{studentData?.streak || 0} Days</p>
              </div>
           </div>
           
           <div className="px-6 py-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                 <Target className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                 <p className="text-[10px] text-foreground/40 font-black uppercase tracking-widest">Goal Progress</p>
                 <p className="text-lg font-black">78%</p>
              </div>
           </div>
        </div>
      </header>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat, idx) => (
          <div key={idx} className={cn(
            "p-8 glass rounded-[2.5rem] border-white/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group",
            stat.glow
          )}>
             <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-6", stat.bg)}>
                <stat.icon className={cn("w-7 h-7", stat.color)} />
             </div>
             <p className="text-foreground/40 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
             <h3 className="text-3xl font-black mt-1 text-foreground">
                {stat.value}
                <span className="text-base font-bold text-foreground/20 ml-1">{stat.suffix}</span>
             </h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content (Left) */}
        <div className="lg:col-span-2 space-y-10">
          {/* Diagnostic Quiz Prompt (If Pending) */}
          {!studentData?.assessmentComplete && (
            <section className="p-10 glass border-white/60 rounded-[3rem] shadow-2xl bg-primary/5 relative overflow-hidden group border-2 border-primary/20">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000"></div>
               
               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                  <div className="flex-1">
                     <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-primary/20 text-primary">
                        <Zap className="w-3.5 h-3.5 fill-primary" />
                        First Step
                     </div>
                     <h3 className="text-3xl font-black mb-4 tracking-tight leading-tight text-foreground">
                        Ready to find your <span className="text-primary italic">Strengths</span>?
                     </h3>
                     <p className="text-foreground/50 font-bold mb-8 italic">
                        Take a quick discovery quiz to map your skills and get matched with the perfect mentor! 🚀
                     </p>
                     <Link href="/dashboard/student/quiz" className="px-10 py-5 bg-primary text-white rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-3">
                        Start Discovery Quiz
                        <ArrowRight className="w-5 h-5" />
                     </Link>
                  </div>
                  <div className="w-48 h-48 bg-white/40 rounded-[3rem] flex items-center justify-center text-primary shadow-inner border-white">
                     <Sparkles className="w-24 h-24 stroke-[1.5]" />
                  </div>
               </div>
            </section>
          )}

          {/* Hero Action Section */}
          {session ? (
            <section className="p-10 bg-gradient-to-br from-indigo-600 via-primary to-violet-600 rounded-[3rem] text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
               {/* Animated Background Polish */}
               <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000"></div>
               
               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                  <div className="flex-1">
                     <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-white/20">
                        <Clock className="w-3.5 h-3.5" />
                        Next Live Session
                     </div>
                     <h3 className="text-4xl font-black mb-4 tracking-tight leading-tight">
                        {session.title || "Ready to Level Up?"}
                     </h3>
                     <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl font-black border border-white/30">
                           {session.mentorName?.[0] || "M"}
                        </div>
                        <div>
                           <p className="font-black text-lg">{session.mentorName}</p>
                           <p className="text-white/70 font-bold">{session.subject} • Advanced Level</p>
                        </div>
                     </div>
                     <button className="px-10 py-4 bg-white text-primary rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-3">
                        Join Classroom
                        <Play className="w-5 h-5 fill-primary" />
                     </button>
                  </div>
                  
                  <div className="w-full md:w-56 glass bg-white/10 p-6 rounded-[2.5rem] flex flex-col items-center justify-center text-center border-white/20">
                     <div className="text-4xl font-black mb-2 antialiased">
                        {new Date(session.scheduledAt?.seconds * 1000).getHours()}:{new Date(session.scheduledAt?.seconds * 1000).getMinutes().toString().padStart(2, '0')}
                     </div>
                     <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-4">Today</p>
                     <div className="w-full h-1 bg-white/20 rounded-full relative overflow-hidden">
                        <div className="absolute inset-y-0 left-0 w-2/3 bg-white animate-pulse"></div>
                     </div>
                  </div>
               </div>
            </section>
          ) : (
            <section className={cn(
              "p-12 glass border-2 border-dashed border-primary/20 rounded-[3rem] text-center flex flex-col items-center justify-center group overflow-hidden relative",
              !studentData?.assessmentComplete && "opacity-60 grayscale-[0.5]"
            )}>
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
               <div className="w-24 h-24 bg-primary/5 rounded-[2rem] flex items-center justify-center mb-8 rotate-3 transition-transform group-hover:rotate-12 group-hover:scale-110">
                  <Calendar className="w-12 h-12 text-primary/40" />
               </div>
               <h3 className="text-3xl font-black mb-4">You're all caught up!</h3>
               <p className="text-foreground/50 max-w-sm mx-auto mb-10 text-lg font-medium leading-relaxed">
                 {studentData?.assignedVolunteerId 
                  ? "Take some time to review your previous session notes or chat with your AI buddy!"
                  : "We're currently selecting the perfect mentor for your learning profile. Check back shortly!"}
               </p>
               <Link href="/dashboard/student/sessions" className="px-10 py-4 bg-primary text-white rounded-3xl font-black text-lg hover:scale-105 transition-all shadow-2xl shadow-primary/20">
                  Explore Sessions
               </Link>
            </section>
          )}

          {/* Premium Workshops Grid */}
          <section>
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent/10 rounded-2xl">
                     <Sparkles className="w-8 h-8 text-accent" />
                  </div>
                  <div>
                     <h2 className="text-3xl font-black tracking-tighter">Live Workshops</h2>
                     <p className="text-foreground/40 font-bold text-xs uppercase tracking-[0.2em]">Curated for your grade</p>
                  </div>
               </div>
               <Link href="/dashboard/student/workshops" className="glass px-6 py-3 rounded-2xl text-primary font-black hover:bg-white/80 transition-all">
                  See Everything
               </Link>
            </div>
            {workshops.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {workshops.map((w, idx) => (
                   <div key={idx} className="group relative p-8 glass rounded-[2.5rem] border-white/60 hover:-translate-y-3 transition-all duration-500 shadow-xl overflow-hidden active:scale-95">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-6 group-hover:scale-110 group-hover:rotate-12 transition-transform">
                         <Zap className="w-6 h-6" />
                      </div>
                      <h4 className="font-black text-xl mb-2 group-hover:text-primary transition-colors">{w.title}</h4>
                      <p className="text-sm text-foreground/50 font-bold mb-6 italic">by {w.mentorName}</p>
                      
                      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                         <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                            <span className="text-xs font-black text-accent uppercase tracking-widest">{w.maxStudents - (w.registeredStudents?.length || 0)} left</span>
                         </div>
                         <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                            <ArrowRight className="w-5 h-5" />
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
            ) : (
              <div className="p-20 glass rounded-[3rem] text-center bg-white/20 border-dashed border-2 border-slate-200">
                 <p className="text-foreground/30 font-black italic tracking-tight text-xl">New adventures coming soon!</p>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar Status (Right) */}
        <div className="space-y-10">
           {/* Detailed Progress Glass Card */}
           <section className="p-10 glass border-white/60 rounded-[3rem] shadow-2xl shadow-indigo-500/5">
              <div className="flex items-center gap-4 mb-10">
                 <div className="p-3 bg-primary/10 rounded-2xl">
                    <TrendingUp className="w-6 h-6 text-primary" />
                 </div>
                 <h2 className="text-2xl font-black tracking-tight">Growth</h2>
              </div>
              
              <div className="space-y-8">
                 {studentData?.assessmentComplete && studentData?.lastAssessment?.scores ? (
                   studentData.lastAssessment.scores.map((score: any, idx: number) => (
                      <div key={idx} className="space-y-3">
                         <div className="flex items-center justify-between">
                            <span className="text-sm font-black text-foreground/70 uppercase tracking-widest">{score.subject}</span>
                            <span className={cn(
                              "text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tighter shadow-sm",
                              score.proficiency === "Master" ? "bg-emerald-500 text-white" : score.proficiency === "Growing" ? "bg-primary text-white" : "bg-warning text-white"
                            )}>{score.proficiency}</span>
                         </div>
                         <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                            <div 
                               className={cn(
                                 "absolute inset-y-0 left-0 rounded-full transition-all duration-[2000ms] shadow-lg", 
                                 score.proficiency === "Master" ? "bg-emerald-500" : score.proficiency === "Growing" ? "bg-primary" : "bg-warning"
                               )} 
                               style={{ width: `${score.score}%` }} 
                            />
                         </div>
                      </div>
                   ))
                 ) : (
                    <div className="p-8 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 group hover:border-primary/40 transition-all">
                       <p className="text-sm text-foreground/40 font-bold italic leading-relaxed mb-6">Complete your Discovery Quiz to map your skills!</p>
                       <Link href="/dashboard/student/quiz" className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-2xl text-primary shadow-sm group-hover:scale-110 transition-transform">
                          <ArrowRight className="w-6 h-6" />
                       </Link>
                    </div>
                 )}
              </div>
              <button className="w-full mt-12 py-5 glass bg-white/40 rounded-2xl font-black text-primary hover:bg-white/80 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl">
                 Knowledge Report
                 <ArrowRight className="w-5 h-5" />
              </button>
           </section>

           {/* AI Buddy Premium Card */}
           <section className="p-10 bg-slate-900 rounded-[3rem] text-white shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/40 via-transparent to-accent/20 opacity-50 group-hover:opacity-80 transition-opacity"></div>
              
              <div className="relative z-10 flex flex-col items-center text-center">
                 <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mb-8 border border-white/20 shadow-2xl rotate-3 group-hover:rotate-12 transition-transform duration-500">
                    <MessageSquare className="w-10 h-10 text-white" />
                 </div>
                 <h3 className="text-2xl font-black mb-4 tracking-tight">Need help right now?</h3>
                 <p className="text-white/60 text-base mb-10 leading-relaxed font-bold italic">
                    "I can explain any topic simply, in any language you prefer!"
                 </p>
                 <Link href="/dashboard/student/ai-buddy" className="w-full py-5 bg-white text-slate-900 rounded-[2rem] font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3">
                    Activate Buddy
                    <Bot className="w-6 h-6" />
                 </Link>
              </div>
              
              {/* Decorative Blur */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary rounded-full blur-[80px] opacity-30"></div>
           </section>
        </div>
      </div>
    </div>
  );
}
