export const student = {
  name: "Maria Santos",
  avatar: "/api/placeholder/40/40",
  grade: "Grade 8",
  classroom: "Filipino 101 - Teacher: Ms. Reyes",
  streakDays: 15,
  points: 2450,
  completedExercises: 28,
  rank: "Advanced Learner",
};

export const exercises = [
  {
    id: 1,
    title: "Spelling Challenge",
    description: "Correct misspelled words in timed challenges",
    category: "Writing Mechanics",
    progress: 65,
    icon: "Book",
    isNew: false,
  },
  {
    id: 2,
    title: "Punctuation Task",
    description: "Place punctuation marks in scrambled sentences",
    category: "Writing Mechanics",
    progress: 40,
    icon: "MessageSquare",
    isNew: false,
  },
];

export const categories = [
  "All Exercises",
  "Writing Mechanics",
  "Vocabulary Development",
];

export const teacher = {
  name: "Prof. Juan Cruz",
  avatar: "/api/placeholder/40/40",
  department: "Filipino Language Studies",
  totalClasses: 5,
  totalStudents: 156,
};

// Mock classes data
export const classes = [
  {
    id: 1,
    name: "Filipino 101",
    grade: "Grade 8",
    icon: "Users",
    totalStudents: 32,
    studentsCompleted: 24,
    schedule: "MWF 9:00-10:30",
    isActive: true,
    recentActivities: [
      {
        date: "May 19, 2025",
        description: "28 students completed 'Pagbigkas ng Tula' exercise"
      },
      {
        date: "May 18, 2025",
        description: "Posted new vocabulary list for upcoming test"
      }
    ],
    upcomingAssignments: [
      {
        title: "Weekly Spelling Quiz",
        dueDate: "May 23"
      },
      {
        title: "Basic Grammar Review",
        dueDate: "May 25"
      }
    ]
  },
  {
    id: 2,
    name: "Filipino Literature",
    grade: "Grade 9",
    icon: "BookOpen",
    totalStudents: 28,
    studentsCompleted: 14,
    schedule: "TTh 1:00-2:30",
    isActive: true,
    recentActivities: [
      {
        date: "May 20, 2025",
        description: "Assigned 'Ibong Adarna' reading comprehension"
      },
      {
        date: "May 16, 2025",
        description: "15 students completed 'Noli Me Tangere' analysis"
      }
    ],
    upcomingAssignments: [
      {
        title: "Literary Devices Quiz",
        dueDate: "May 24"
      },
      {
        title: "Essay: Philippine Folk Tales",
        dueDate: "May 28"
      }
    ]
  },
  {
    id: 3,
    name: "Advanced Filipino",
    grade: "Grade 10",
    icon: "BookOpen",
    totalStudents: 26,
    studentsCompleted: 20,
    schedule: "MWF 2:00-3:30",
    isActive: false,
    recentActivities: [
      {
        date: "May 18, 2025",
        description: "Graded final oral presentations"
      },
      {
        date: "May 15, 2025",
        description: "Posted review materials for final exam"
      }
    ],
    upcomingAssignments: [
      {
        title: "Final Exam",
        dueDate: "May 26"
      },
      {
        title: "Term Project Submission",
        dueDate: "May 24"
      }
    ]
  },
  {
    id: 4,
    name: "Filipino Grammar",
    grade: "Grade 8",
    icon: "Users",
    totalStudents: 34,
    studentsCompleted: 18,
    schedule: "TTh 10:00-11:30",
    isActive: true,
    recentActivities: [
      {
        date: "May 20, 2025",
        description: "Posted grammar exercise results"
      },
      {
        date: "May 17, 2025",
        description: "Shared new verb conjugation materials"
      }
    ],
    upcomingAssignments: [
      {
        title: "Verb Conjugation Quiz",
        dueDate: "May 25"
      },
      {
        title: "Sentence Structure Assignment",
        dueDate: "May 27"
      }
    ]
  },
];

export const students = [
    {
      id: 1,
      name: "Student 1",
      avatar: "👤",
      scores: {
        pangalan: 95,
        kabuhuan: 88,
        pagusad: 86,
        hekaniks: 92,
        bokabularyo: 89
      },
      overallProgress: 86
    },
    {
      id: 2,
      name: "Student 2", 
      avatar: "👤",
      scores: {
        pangalan: 45,
        kabuhuan: 35,
        pagusad: 31,
        hekaniks: 38,
        bokabularyo: 42
      },
      overallProgress: 31
    },
    {
      id: 3,
      name: "Student 3",
      avatar: "👤", 
      scores: {
        pangalan: 25,
        kabuhuan: 20,
        pagusad: 18,
        hekaniks: 22,
        bokabularyo: 28
      },
      overallProgress: 18
    }
  ];