"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, ArrowRight, CheckCircle2, BookOpen, Sparkles, 
  Smartphone, Loader2, PlayCircle, Globe, Headphones
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { updateStudentProfile } from "@/lib/db";

const SUBJECTS = ["Math", "Science", "English", "Social Studies", "Telugu", "Hindi", "Computer Basics", "Other"];
const SKILLS = ["Coding", "Graphic Design", "Public Speaking", "Financial Literacy", "Career Guidance", "Web Dev", "App Dev", "Music", "Art", "Robotics"];

export default function StudentOnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    subjects: [] as string[],
    learningPace: "", // More time / Average / Quickly
    curiosities: [] as string[],
    learningPreference: "", // 1-on-1 / Group / Both
    hasSmartphone: "", // Yes / No
    hasInternet: "", // Yes / No / Sometimes
  });

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(s => Math.min(s + 1, 3));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => setCurrentStep(s => Math.max(s - 1, 1));

  const validateStep = (step: number) => {
    if (step === 1 && (formData.subjects.length === 0 || !formData.learningPace)) {
      toast.error("Please pick your subjects and learning pace");
      return false;
    }
    if (step === 2 && (formData.curiosities.length === 0 || !formData.learningPreference)) {
      toast.error("Please pick your interests and preference");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!formData.hasSmartphone || !formData.hasInternet) {
      toast.error("Please answer accessibility questions");
      return;
    }
    if (!user) {
      toast.error("User not found. Please log in again.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await updateStudentProfile(user.uid, {
        subjects: formData.subjects,
        learningPace: formData.learningPace,
        curiosities: formData.curiosities,
        learningPreference: formData.learningPreference,
        hasSmartphone: formData.hasSmartphone === "Yes",
        hasInternet: formData.hasInternet,
        onboardingComplete: true,
      });
      
      toast.success("Onboarding complete! Welcome to your discovery journey.");
      router.push("/dashboard/student/quiz");
    } catch (e: any) {
      console.error("Onboarding error:", e);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header/Progress */}
        <div className="flex flex-col items-center mb-12">
           <div className="flex gap-2 mb-4">
              {[1, 2, 3].map(s => (
                <div 
                  key={s} 
                  className={cn(
                    "w-12 h-2 rounded-full transition-all duration-500",
                    currentStep >= s ? "bg-primary" : "bg-border"
                  )}
                />
              ))}
           </div>
           <h1 className="text-3xl font-extrabold text-foreground tracking-tight text-center">
              Welcome to the family! 🌟
           </h1>
           <p className="text-foreground/50 font-medium text-center mt-2">
              Let's customize your learning experience
           </p>
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl shadow-primary/10 border border-primary/5 p-8 md:p-12 relative overflow-hidden min-h-[500px] flex flex-col">
           {/* Step Body */}
           <div className="flex-1">
              {currentStep === 1 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                   <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-6">
                         <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <BookOpen className="w-5 h-5" />
                         </div>
                         <h2 className="text-xl font-bold">Academic Support</h2>
                      </div>
                      <label className="text-sm font-bold text-foreground/70 uppercase tracking-widest">Which subjects do you need help with? *</label>
                      <div className="flex flex-wrap gap-2">
                         {SUBJECTS.map(s => (
                           <button
                             key={s}
                             onClick={() => {
                               const next = formData.subjects.includes(s) ? formData.subjects.filter(i=>i!==s) : [...formData.subjects, s];
                               setFormData({...formData, subjects: next});
                             }}
                             className={cn(
                               "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                               formData.subjects.includes(s) ? "bg-primary text-white shadow-lg" : "bg-background border border-border text-foreground/60 hover:border-primary/50"
                             )}
                           >
                             {s}
                           </button>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-4">
                      <label className="text-sm font-bold text-foreground/70 uppercase tracking-widest">How would you describe your learning pace? *</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                         {["I need more time", "Average", "I pick up quickly"].map(p => (
                           <button
                             key={p}
                             onClick={() => setFormData({...formData, learningPace: p})}
                             className={cn(
                               "p-4 border rounded-2xl text-center font-bold text-sm transition-all",
                               formData.learningPace === p ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground/60 hover:bg-background"
                             )}
                           >
                             {p}
                           </button>
                         ))}
                      </div>
                   </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                   <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-6">
                         <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                            <Sparkles className="w-5 h-5" />
                         </div>
                         <h2 className="text-xl font-bold">Skills & Interests</h2>
                      </div>
                      <label className="text-sm font-bold text-foreground/70 uppercase tracking-widest">What would you like to learn for fun? *</label>
                      <div className="flex flex-wrap gap-2">
                         {SKILLS.map(s => (
                           <button
                             key={s}
                             onClick={() => {
                               const next = formData.curiosities.includes(s) ? formData.curiosities.filter(i=>i!==s) : [...formData.curiosities, s];
                               setFormData({...formData, curiosities: next});
                             }}
                             className={cn(
                               "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                               formData.curiosities.includes(s) ? "bg-accent text-white shadow-lg" : "bg-background border border-border text-foreground/60 hover:border-primary/50"
                             )}
                           >
                             {s}
                           </button>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-4">
                      <label className="text-sm font-bold text-foreground/70 uppercase tracking-widest">How do you prefer to learn? *</label>
                      <div className="flex gap-4">
                         {["1-on-1 sessions", "Group workshops", "Both"].map(p => (
                           <button
                             key={p}
                             onClick={() => setFormData({...formData, learningPreference: p})}
                             className={cn(
                               "flex-1 p-4 border rounded-2xl text-center font-bold text-sm transition-all",
                               formData.learningPreference === p ? "border-accent bg-accent/5 text-accent" : "border-border text-foreground/60 hover:bg-background"
                             )}
                           >
                             {p}
                           </button>
                         ))}
                      </div>
                   </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                   <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-6">
                         <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center text-warning">
                            <Smartphone className="w-5 h-5" />
                         </div>
                         <h2 className="text-xl font-bold">Accessibility Tools</h2>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="space-y-3">
                           <p className="font-bold flex items-center gap-2">Do you have a smartphone? 📱</p>
                           <div className="flex gap-4">
                              {["Yes", "No"].map(a => (
                                <button
                                  key={a}
                                  onClick={() => setFormData({...formData, hasSmartphone: a})}
                                  className={cn(
                                    "flex-1 p-4 border rounded-2xl text-center font-bold transition-all",
                                    formData.hasSmartphone === a ? "border-warning bg-warning/5 text-warning" : "border-border text-foreground/60 hover:bg-background"
                                  )}
                                >
                                  {a}
                                </button>
                              ))}
                           </div>
                        </div>

                        <div className="space-y-3">
                           <p className="font-bold">Do you have internet access at home? 🌐</p>
                           <div className="flex gap-4">
                              {["Yes", "No", "Sometimes"].map(a => (
                                <button
                                  key={a}
                                  onClick={() => setFormData({...formData, hasInternet: a})}
                                  className={cn(
                                    "flex-1 p-4 border rounded-2xl text-center font-bold transition-all text-sm",
                                    formData.hasInternet === a ? "border-warning bg-warning/5 text-warning" : "border-border text-foreground/60 hover:bg-background"
                                  )}
                                >
                                  {a}
                                </button>
                              ))}
                           </div>
                        </div>
                      </div>

                      {(formData.hasSmartphone === "No" || formData.hasInternet === "No") && (
                         <div className="p-6 bg-warning/5 rounded-3xl border border-warning/20 flex gap-4 animate-in slide-in-from-bottom-2">
                            <div className="w-12 h-12 bg-warning/20 rounded-full flex items-center justify-center shrink-0">
                               <Headphones className="w-6 h-6 text-warning" />
                            </div>
                            <div>
                               <p className="font-bold text-warning-foreground">No problem!</p>
                               <p className="text-sm text-foreground/60 mt-1">
                                  You can access Vidyastaan by calling our helpline. We'll send the number to your mobile.
                               </p>
                            </div>
                         </div>
                      )}
                   </div>
                </div>
              )}
           </div>

           {/* Actions */}
           <div className="mt-12 flex items-center justify-between pt-8 border-t border-border">
              <button
                onClick={prevStep}
                className={cn(
                  "p-4 rounded-2xl hover:bg-primary/5 font-bold transition-all flex items-center gap-2",
                  currentStep === 1 ? "opacity-0 pointer-events-none" : "text-foreground/40 hover:text-primary"
                )}
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>

              {currentStep < 3 ? (
                <button
                  onClick={nextStep}
                  className="px-8 py-4 bg-primary text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-10 py-4 bg-accent text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-accent/90 transition-all shadow-xl shadow-accent/20"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Celebration"}
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
