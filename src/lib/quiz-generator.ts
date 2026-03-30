"use client";

// Simple structure to provide high-quality foundational quiz data
// Based on Grade (Target = Current - 2)

export interface QuizQuestion {
  id: string;
  subject: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
  explanation: string;
}

const QUIZ_DATA: Record<string, QuizQuestion[]> = {
  // --- Grade 9 Level (For Grade 11 Students) ---
  "9_math": [
    {
      id: "9m1",
      subject: "Math",
      question: "Which of the following is a linear equation in two variables?",
      options: ["x² + y = 5", "2x + 3y = 7", "x + 2 = 0", "y² = 9"],
      correctAnswer: 1,
      explanation: "A linear equation in two variables has the form ax + by + c = 0, where x and y have exponents of 1."
    },
    {
      id: "9m2",
      subject: "Math",
      question: "If a triangle has sides of 3cm, 4cm, and 5cm, what type of triangle is it?",
      options: ["Equilateral", "Isosceles", "Right-angled", "Scalene"],
      correctAnswer: 2,
      explanation: "3² + 4² = 5² (9 + 16 = 25). This satisfies the Pythagorean theorem, making it a right-angled triangle."
    },
    {
      id: "9m3",
      subject: "Math",
      question: "What is the value of (2⁵) ^ 0?",
      options: ["32", "0", "1", "5"],
      correctAnswer: 2,
      explanation: "Any non-zero number raised to the power of 0 is always 1."
    }
  ],
  "9_science": [
    {
      id: "9s1",
      subject: "Science",
      question: "What is the SI unit of Force?",
      options: ["Joule", "Pascal", "Newton", "Watt"],
      correctAnswer: 2,
      explanation: "Force is measured in Newtons (N), named after Isaac Newton."
    },
    {
      id: "9s2",
      subject: "Science",
      question: "Which cell organelle is known as the 'Powerhouse of the Cell'?",
      options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi Apparatus"],
      correctAnswer: 1,
      explanation: "Mitochondria are responsible for creating energy (ATP) for the cell."
    }
  ],
  
  // --- Grade 8 Level (For Grade 10 Students) ---
  "8_math": [
    {
      id: "8m1",
      subject: "Math",
      question: "What is the square root of 225?",
      options: ["12", "15", "25", "18"],
      correctAnswer: 1,
      explanation: "15 × 15 = 225."
    },
    {
      id: "8m2",
      subject: "Math",
      question: "A quadrilateral with all sides equal and all angles 90° is a:",
      options: ["Rhombus", "Rectangle", "Square", "Parallelogram"],
      correctAnswer: 2,
      explanation: "A square has four equal sides and four right angles."
    }
  ],
  "8_science": [
    {
      id: "8s1",
      subject: "Science",
      question: "Which of the following is a non-renewable source of energy?",
      options: ["Solar", "Wind", "Coal", "Hydro"],
      correctAnswer: 2,
      explanation: "Coal is a fossil fuel and takes millions of years to form, making it non-renewable."
    }
  ],

  // --- Grade 7 Level (For Grade 9 Students) ---
  "7_math": [
    {
      id: "7m1",
      subject: "Math",
      question: "What is 20% of 500?",
      options: ["50", "100", "150", "200"],
      correctAnswer: 1,
      explanation: "(20/100) × 500 = 100."
    }
  ],
  
  // --- Fallback Basics ---
  "generic_english": [
    {
      id: "e1",
      subject: "English",
      question: "Choose the correct verb form: 'She ________ to school every day.'",
      options: ["go", "goes", "going", "gone"],
      correctAnswer: 1,
      explanation: "Third-person singular 'she' requires the verb 'goes' in simple present tense."
    },
    {
      id: "e2",
      subject: "English",
      question: "Which of these is a synonym for 'Huge'?",
      options: ["Tiny", "Small", "Massive", "Thin"],
      correctAnswer: 2,
      explanation: "Massive means very large, just like huge."
    }
  ]
};

export function getQuizForStudent(grade: number, studentSubjects: string[]): QuizQuestion[] {
  // Adaptive Logic: Target = Grade - 2
  const targetGrade = Math.max(5, grade - 2);
  let finalQuestions: QuizQuestion[] = [];

  // 1. Try to get specific Subject-Grade questions
  studentSubjects.forEach(sub => {
    const key = `${targetGrade}_${sub.toLowerCase()}`;
    if (QUIZ_DATA[key]) {
      finalQuestions = [...finalQuestions, ...QUIZ_DATA[key]];
    } else {
       // Fallback to a lower grade version of the same subject if exists
       const fallbackKey = `8_${sub.toLowerCase()}`;
       if (QUIZ_DATA[fallbackKey]) finalQuestions = [...finalQuestions, ...QUIZ_DATA[fallbackKey]];
    }
  });

  // 2. Always add English if not enough questions
  if (finalQuestions.length < 5) {
     finalQuestions = [...finalQuestions, ...QUIZ_DATA["generic_english"]];
  }

  // 3. Last fallback: Math 8
  if (finalQuestions.length < 3) {
     finalQuestions = [...finalQuestions, ...QUIZ_DATA["8_math"]];
  }

  // Shuffle and limit to 10
  return finalQuestions.sort(() => Math.random() - 0.5).slice(0, 10);
}
