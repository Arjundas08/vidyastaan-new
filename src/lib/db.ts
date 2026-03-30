import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  serverTimestamp,
  orderBy,
  limit
} from "firebase/firestore";
import { db } from "./firebase";

// Collection Names
export const COLLECTIONS = {
  USERS: "users",
  STUDENTS: "students",
  VOLUNTEER_APPLICATIONS: "volunteer_applications",
  VOLUNTEERS: "volunteers",
  SESSIONS: "sessions",
  WORKSHOPS: "workshops",
  PROGRESS: "progress",
  ASSIGNMENTS: "assignments",
  CALLS: "calls"
};

// --- User & Student Services ---

export async function createUserProfile(uid: string, data: any) {
  await setDoc(doc(db, COLLECTIONS.USERS, uid), {
    ...data,
    createdAt: serverTimestamp()
  });
}

export async function updateStudentProfile(uid: string, data: any) {
  await setDoc(doc(db, COLLECTIONS.STUDENTS, uid), {
    ...data,
    uid,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function getStudentProfile(uid: string) {
  const snap = await getDoc(doc(db, COLLECTIONS.STUDENTS, uid));
  return snap.exists() ? snap.data() : null;
}

// --- Volunteer Services ---

export async function submitVolunteerApplication(data: any) {
  return await addDoc(collection(db, COLLECTIONS.VOLUNTEER_APPLICATIONS), {
    ...data,
    status: "pending",
    submittedAt: serverTimestamp()
  });
}

export async function getVolunteerApplication(id: string) {
  const snap = await getDoc(doc(db, COLLECTIONS.VOLUNTEER_APPLICATIONS, id));
  return snap.exists() ? snap.data() : null;
}

export async function approveVolunteer(applicationId: string, uid: string) {
  const appSnap = await getDoc(doc(db, COLLECTIONS.VOLUNTEER_APPLICATIONS, applicationId));
  if (!appSnap.exists()) throw new Error("Application not found");
  
  const appData = appSnap.data();
  
  // Create volunteer profile
  await setDoc(doc(db, COLLECTIONS.VOLUNTEERS, uid), {
    uid,
    applicationId,
    deliveryType: appData.priority,
    subjects: appData.subjects || [],
    skills: appData.skills || [],
    availability: appData.availability || {},
    impactScore: 0,
    sessionsCompleted: 0,
    workshopsHosted: 0,
    studentsAssigned: [],
    status: "approved",
    approvedAt: serverTimestamp()
  });

  // Update application status
  await updateDoc(doc(db, COLLECTIONS.VOLUNTEER_APPLICATIONS, applicationId), {
    status: "approved"
  });

  // Update user role
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    role: "volunteer"
  });
}

export async function rejectVolunteer(applicationId: string) {
  await updateDoc(doc(db, COLLECTIONS.VOLUNTEER_APPLICATIONS, applicationId), {
    status: "rejected"
  });
}

export async function getVolunteerProfile(uid: string) {
  const snap = await getDoc(doc(db, COLLECTIONS.VOLUNTEERS, uid));
  return snap.exists() ? snap.data() : null;
}

export async function getStudentsForVolunteer(uid: string) {
  const q = query(
    collection(db, COLLECTIONS.STUDENTS),
    where("assignedVolunteerId", "==", uid)
  );
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// --- Session & Workshop Services ---

export async function createSession(data: any) {
  return await addDoc(collection(db, COLLECTIONS.SESSIONS), {
    ...data,
    status: "scheduled",
    createdAt: serverTimestamp()
  });
}

export async function getSessionsForUser(userId: string, role: "student" | "volunteer") {
  const q = query(
    collection(db, COLLECTIONS.SESSIONS),
    where(role === "student" ? "studentId" : "volunteerId", "==", userId)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .sort((a: any, b: any) => (b.scheduledAt?.seconds || 0) - (a.scheduledAt?.seconds || 0));
}

export async function createWorkshop(data: any) {
  return await addDoc(collection(db, COLLECTIONS.WORKSHOPS), {
    ...data,
    status: "pending_approval",
    registeredStudents: [],
    createdAt: serverTimestamp()
  });
}

export async function getUpcomingWorkshops() {
  const q = query(
    collection(db, COLLECTIONS.WORKSHOPS),
    where("status", "==", "approved")
  );
  const snap = await getDocs(q);
  const now = new Date();
  return snap.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter((w: any) => {
      const scheduled = w.scheduledAt?.seconds ? new Date(w.scheduledAt.seconds * 1000) : new Date(w.scheduledAt);
      return scheduled >= now;
    })
    .sort((a: any, b: any) => (a.scheduledAt?.seconds || 0) - (b.scheduledAt?.seconds || 0));
}

// --- Admin Services ---

export async function getPendingApplications() {
  const q = query(collection(db, COLLECTIONS.VOLUNTEER_APPLICATIONS), where("status", "==", "pending"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getUnassignedStudents() {
  const q = query(collection(db, COLLECTIONS.STUDENTS), where("assignedVolunteerId", "==", null));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getAvailableVolunteers() {
  const q = query(collection(db, COLLECTIONS.VOLUNTEERS), where("status", "==", "approved"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function assignMatch(studentId: string, volunteerId: string, reason: string) {
  await updateDoc(doc(db, COLLECTIONS.STUDENTS, studentId), {
    assignedVolunteerId: volunteerId,
    status: "on-track"
  });
  
  await updateDoc(doc(db, COLLECTIONS.VOLUNTEERS, volunteerId), {
    studentsAssigned: [...(await getDoc(doc(db, COLLECTIONS.VOLUNTEERS, volunteerId))).data()?.studentsAssigned || [], studentId]
  });

  return await addDoc(collection(db, COLLECTIONS.ASSIGNMENTS), {
    studentId,
    volunteerId,
    claudeSuggestionReason: reason,
    assignedAt: serverTimestamp()
  });
}

export async function getGlobalStats() {
  const [students, volunteers, apps, sessions] = await Promise.all([
    getDocs(collection(db, COLLECTIONS.STUDENTS)),
    getDocs(query(collection(db, COLLECTIONS.VOLUNTEERS), where("status", "==", "approved"))),
    getDocs(query(collection(db, COLLECTIONS.VOLUNTEER_APPLICATIONS), where("status", "==", "pending"))),
    getDocs(collection(db, COLLECTIONS.SESSIONS))
  ]);

  return {
    studentCount: students.size,
    volunteerCount: volunteers.size,
    pendingAppCount: apps.size,
    sessionCount: sessions.size
  };
}
