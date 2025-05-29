import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import SidePanel from "../components/SidePanel";
import "../styles/ClassroomView.css";

interface Game {
  id: number;
  title: string;
  type: string;
  completed: boolean;
  instructions?: string;
}

interface Chapter {
  id: number;
  title: string;
  subtitle: string;
  games: Game[];
  instructions?: string;
}

interface Announcement {
  id: number;
  title: string;
  date: string;
  content: string;
}

interface Classmate {
  id: number;
  name: string;
  points: number;
  avatar: string;
}

interface ClassData {
  id: string;
  title: string;
  subtitle: string;
  instructor: string;
  description: string;
  chapters: Chapter[];
  announcements: Announcement[];
  classmates: Classmate[];
}

const ClassroomView: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [activeTab, setActiveTab] = useState<string>("chapters");
  const [expandedChapters, setExpandedChapters] = useState<number[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<string>("");
  const [modalTitle, setModalTitle] = useState<string>("");
  
  // Mock class data - in a real application this would come from an API
  const mockClasses: ClassData[] = [
    {
      id: "1",
      title: "Filipino",
      subtitle: "Pagpapalawak ng Kaalaman sa Wika at Panitikan",
      instructor: "Prof. Michelle Santos",
      description: "Dito nagsisimula ang iyong paglalakbay sa pagsusulat. Sa apat na yugto, unti-unti nating huhubugin ang iyong galing. Huwag kang mag-alala—kasama mo ako sa bawat makulit na hakbang!",
      chapters: [
        {
          id: 1,
          title: "Writing Mechanics in Filipino",
          subtitle: "Chapter 1",
          instructions: "This chapter focuses on mastering the mechanics of writing in Filipino language including spelling, punctuation, and parts of speech.",
          games: [
            { 
              id: 101, 
              title: "Lesson 1.1 : Spelling Challenge", 
              type: "game", 
              completed: false, 
              instructions: "Test your Filipino spelling skills through this fun and interactive game."
            },
            { 
              id: 102, 
              title: "Lesson 1.2 : Punctuation Task", 
              type: "game", 
              completed: false, 
              instructions: "Learn proper punctuation in Filipino through engaging puzzles."
            },
            { 
              id: 103, 
              title: "Lesson 1.3 : Parts of Speech Challenge", 
              type: "game", 
              completed: false, 
              instructions: "Identify different parts of speech in Filipino sentences."
            }
          ]
        },
        {
          id: 2,
          title: "Vocabulary Development",
          subtitle: "Chapter 2",
          instructions: "Expand your Filipino vocabulary through games and interactive activities.",
          games: [
            { 
              id: 201, 
              title: "Lesson 2.1 : Word Association Game", 
              type: "game", 
              completed: false, 
              instructions: "Connect related Filipino words to build your vocabulary."
            },
            { 
              id: 202, 
              title: "Lesson 2.2 : Word Matching Activity", 
              type: "game", 
              completed: false, 
              instructions: "Match Filipino words with their meanings in this fun game."
            }
          ]
        },
        {
          id: 3,
          title: "Grammar and Sentence Construction Mastery",
          subtitle: "Chapter 3",
          instructions: "Master Filipino grammar and sentence construction through interactive challenges.",
          games: [
            { 
              id: 301, 
              title: "Lesson 3.1 : Sentence Construction Challenge", 
              type: "game", 
              completed: false, 
              instructions: "Build grammatically correct Filipino sentences from given words."
            },
            { 
              id: 302, 
              title: "Lesson 3.2 : Emoji Sentence Challenge", 
              type: "game", 
              completed: false, 
              instructions: "Guess the Filipino sentence represented by a series of emojis."
            }
          ]
        },
        {
            id: 4,
            title: " Creative Storytelling and Narrative Exploration",
            subtitle: "Chapter 4",
            instructions: "Master Filipino grammar and sentence construction through interactive challenges.",
            games: [
              { 
                id: 401, 
                title: "Lesson 4.1 : Paragraph Building Exercise", 
                type: "game", 
                completed: false, 
                instructions: "Build grammatically correct Filipino sentences from given words."
              },
              { 
                id: 402, 
                title: "Lesson 4.2 : Caption This! (Image-Based Storytelling)", 
                type: "game", 
                completed: false, 
                instructions: "Guess the Filipino sentence represented by a series of emojis."
              }
            ]
          }
      ],
      announcements: [
        {
          id: 1,
          title: "Welcome to Filipino Language Learning!",
          date: "May 3, 2025",
          content: "Welcome to our interactive Filipino language course! Complete the first chapter games by next week."
        },
        {
          id: 2,
          title: "New Games Added!",
          date: "May 5, 2025",
          content: "We've added new games to Chapter 3. Check them out and earn more points!"
        }
      ],
      classmates: [
        { id: 1, name: "Jordan Lee", points: 450, avatar: "/avatar1.png" },
        { id: 2, name: "Morgan Smith", points: 420, avatar: "/avatar2.png" },
        { id: 3, name: "Alex Johnson", points: 380, avatar: "/avatar3.png" },
        { id: 4, name: "Taylor Brown", points: 350, avatar: "/avatar4.png" },
        { id: 5, name: "Casey Wilson", points: 320, avatar: "/avatar5.png" }
      ]
    },
    {
      id: "2",
      title: "Filipino (Advanced)",
      subtitle: "Advanced Filipino Literature",
      instructor: "Prof. David Kim",
      description: "Advanced Filipino language and literature course focusing on classical and modern works.",
      chapters: [],
      announcements: [],
      classmates: []
    }
  ];

  useEffect(() => {
    // Find the class that matches the classId from URL
    const selectedClass = mockClasses.find(c => c.id === classId);
    if (selectedClass) {
      setClassData(selectedClass);
    } else {
      // Redirect to classes page if class not found
      navigate("/classroom");
    }
  }, [classId, navigate]);

  const toggleChapter = (chapterId: number) => {
    if (expandedChapters.includes(chapterId)) {
      setExpandedChapters(expandedChapters.filter(id => id !== chapterId));
    } else {
      setExpandedChapters([...expandedChapters, chapterId]);
    }
  };

  const openInstructionsModal = (title: string, instructions: string) => {
    setModalTitle(title);
    setModalContent(instructions);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const startGame = (gameId: number) => {
    // Navigate to the specific game page
    navigate(`/game/${gameId}`);
  };

  if (!classData) {
    return <div className="loading">Loading class...</div>;
  }

  return (
    <div className="custom-homepage-container">
      <SidePanel
        tab_1_isActive={true}
        tab_2_isActive={false}
        tab_3_isActive={false}
        tab_4_isActive={false}
      />
      
      <div className="custom-page-container classroom-view">
        {/* Back button */}
        <div className="back-navigation">
          <button className="back-button" onClick={() => navigate("/classroom")}>
            &larr; Back to Classes
          </button>
        </div>

        {/* Class Header */}
        <div className="class-header">
          <div className="class-header-info">
            <h1 className="class-title">{classData.title}</h1>
            <p className="class-subtitle">{classData.subtitle}</p>
            <p className="class-instructor">Instructor: {classData.instructor}</p>
          </div>
          <div className="class-progress">
            <div className="progress-circle">
              <div className="progress-text">
                <span className="progress-percentage">15%</span>
                <span className="progress-label">Complete</span>
              </div>
            </div>
          </div>
        </div>

        {/* Class Description with Logo */}
        <div className="class-description">
          <div className="description-container">
            <div className="description-logo">
              <img src="/logo.png" alt="Course Logo" className="course-logo" />
            </div>
            <p>{classData.description}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="class-tabs">
          <button 
            className={`tab-button ${activeTab === "chapters" ? "active" : ""}`}
            onClick={() => setActiveTab("chapters")}
          >
            Chapters
          </button>
          <button 
            className={`tab-button ${activeTab === "announcements" ? "active" : ""}`}
            onClick={() => setActiveTab("announcements")}
          >
            Announcements
          </button>
          <button 
            className={`tab-button ${activeTab === "classmates" ? "active" : ""}`}
            onClick={() => setActiveTab("classmates")}
          >
            Classmates
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "chapters" && (
            <div className="chapters-scroll-container">
              {classData.chapters.map((chapter) => (
                <div key={chapter.id} className="chapter-card">
                  <div 
                    className="chapter-dropdown-header"
                    onClick={() => toggleChapter(chapter.id)}
                  >
                    <div className="chapter-title-section">
                      <h3>{chapter.title}</h3>
                      <p>{chapter.subtitle}</p>
                    </div>
                    <div className="chapter-controls">
                      <div 
                        className="question-mark-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          openInstructionsModal(`${chapter.title} - ${chapter.subtitle}`, chapter.instructions || "No instructions available.");
                        }}
                      >
                        ?
                      </div>
                      <div className="dropdown-arrow">
                        {expandedChapters.includes(chapter.id) ? "▲" : "▼"}
                      </div>
                    </div>
                  </div>
                  
                  {expandedChapters.includes(chapter.id) && (
                    <div className="games-list">
                      {chapter.games.map((game) => (
                        <div 
                          key={game.id} 
                          className={`game-item ${game.completed ? "completed" : ""}`}
                        >
                          <div className="game-icon">
                            🎮
                          </div>
                          <div className="game-info">
                            <p className="game-title">{game.title}</p>
                            <p className="game-type">{game.type}</p>
                          </div>
                          <div className="game-controls">
                            {game.completed && (
                              <div className="game-status">
                                ✓
                              </div>
                            )}
                            <div 
                              className="question-mark-icon game-info-icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                openInstructionsModal(game.title, game.instructions || "No instructions available.");
                              }}
                            >
                              ?
                            </div>
                            <button 
                              className="start-game-button"
                              onClick={() => startGame(game.id)}
                            >
                              Start
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "announcements" && (
            <div className="announcements-container">
              {classData.announcements.map((announcement) => (
                <div key={announcement.id} className="announcement-card">
                  <div className="announcement-header">
                    <h3 className="announcement-title">{announcement.title}</h3>
                    <p className="announcement-date">{announcement.date}</p>
                  </div>
                  <div className="announcement-content">
                    <p>{announcement.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "classmates" && (
            <div className="classmates-container">
              <h3 className="classmates-title">Class Leaderboard</h3>
              <div className="classmates-list">
                {classData.classmates.map((classmate, index) => (
                  <div key={classmate.id} className="classmate-card">
                    <div className="classmate-rank">{index + 1}</div>
                    <div className="classmate-avatar">
                      <img src={classmate.avatar || "/logo.png"} alt={classmate.name} />
                    </div>
                    <div className="classmate-info">
                      <p className="classmate-name">{classmate.name}</p>
                    </div>
                    <div className="classmate-points">
                      <span className="points-icon">⭐</span>
                      <span className="points-value">{classmate.points}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: "#fff", borderRadius: "12px" }}>
            <div className="modal-header">
              <h3>{modalTitle}</h3>
              <button className="close-modal-button" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <p>{modalContent}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomView;