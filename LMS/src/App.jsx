import { useState, useEffect } from "react";
import { DOMAINS } from "./data/courses.js";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [inputName, setInputName] = useState("");
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);
  const [completedModules, setCompletedModules] = useState([]);
  const [notes, setNotes] = useState("");
  const [showCertificate, setShowCertificate] = useState(null);

  // Load user session
  useEffect(() => {
    const savedName = localStorage.getItem("lms_user_name");
    if (savedName) {
      setUserName(savedName);
      setIsLoggedIn(true);
    }
  }, []);

  // Sync completion history per active user
  useEffect(() => {
    if (userName) {
      const userProgress = JSON.parse(
        localStorage.getItem(`lms_completed_${userName}`) || "[]"
      );
      setCompletedModules(userProgress);
    } else {
      setCompletedModules([]);
    }
  }, [userName]);

  // Load notes
  useEffect(() => {
    if (currentModule && userName) {
      const savedNote =
        localStorage.getItem(`note_${userName}_${currentModule.id}`) || "";
      setNotes(savedNote);
    }
  }, [currentModule, userName]);

  // Handle Login
  const handleLogin = (e) => {
    e.preventDefault();
    if (!inputName.trim()) return;
    const formattedName = inputName.trim();
    setUserName(formattedName);
    localStorage.setItem("lms_user_name", formattedName);
    setIsLoggedIn(true);
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("lms_user_name");
    setUserName("");
    setIsLoggedIn(false);
    setSelectedDomain(null);
    setCurrentModule(null);
  };

  const handleNoteChange = (e) => {
    const val = e.target.value;
    setNotes(val);
    if (currentModule && userName) {
      localStorage.setItem(`note_${userName}_${currentModule.id}`, val);
    }
  };

  // Calculate Course Completion Percentage
  const getCourseProgress = (course) => {
    if (!course || !course.modules.length) return 0;
    const completedCount = course.modules.filter((m) =>
      completedModules.includes(m.id)
    ).length;
    return Math.round((completedCount / course.modules.length) * 100);
  };

  // Toggle Module Completion & Check for 100% Certificate Trigger
  const toggleComplete = (id, course) => {
    if (!userName) return;

    let updated;
    if (completedModules.includes(id)) {
      updated = completedModules.filter((mId) => mId !== id);
    } else {
      updated = [...completedModules, id];
    }

    setCompletedModules(updated);
    localStorage.setItem(`lms_completed_${userName}`, JSON.stringify(updated));

    // Check if toggling completes 100% of the active course
    if (course) {
      const isFinished = course.modules.every((m) =>
        m.id === id ? !completedModules.includes(m.id) : completedModules.includes(m.id)
      );
      if (isFinished) {
        setShowCertificate({
          userName,
          domainTitle: selectedDomain?.title || "Web Development",
          date: new Date().toLocaleDateString(),
        });
      }
    }
  };

  // 1. LOGIN SCREEN
  if (!isLoggedIn) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-white font-sans p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Ascend-LMS</h1>
          <p className="text-xs text-slate-400 mb-6">Enter your name to start tracking your course progress</p>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="e.g. Manikanth"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-500 cursor-pointer"
            >
              Start Learning
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. DOMAINS SELECTION SCREEN
  if (!selectedDomain) {
    return (
      <div className="min-h-screen bg-slate-950 text-white font-sans p-6 md:p-12">
        <header className="mx-auto max-w-6xl flex items-center justify-between pb-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold">Ascend-LMS</h1>
          <div className="flex items-center gap-4">
            <span className="text-xs text-indigo-400 font-semibold bg-indigo-950/60 border border-indigo-800/50 px-3 py-1.5 rounded-full">
              👤 {userName}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-6xl mt-10">
          <h2 className="text-2xl font-bold mb-1">Welcome back, {userName}! 👋</h2>
          <p className="text-slate-400 text-sm mb-8">Select a learning domain track to explore modules.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DOMAINS.map((domain) => (
              <button
                key={domain.id}
                onClick={() => {
                  setSelectedDomain(domain);
                  setCurrentModule(domain.courses[0]?.modules[0] || null);
                }}
                className="group text-left rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl hover:border-indigo-500 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="h-12 w-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-lg font-bold mb-4">
                    {domain.title.charAt(0)}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{domain.title}</h3>
                  <p className="text-xs text-slate-400">{domain.courses.length} Courses Available</p>
                </div>
                <div className="mt-8 flex items-center justify-between text-xs font-semibold text-indigo-400">
                  <span>Explore Track</span>
                  <span>→</span>
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Active course lookup
  const activeCourse = selectedDomain.courses.find((c) =>
    c.modules.some((m) => m.id === currentModule?.id)
  ) || selectedDomain.courses[0];

  const currentCourseProgress = getCourseProgress(activeCourse);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-80 border-r border-slate-800 bg-slate-900 p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setSelectedDomain(null)}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
          >
            ← Back
          </button>
          <span className="text-[11px] text-slate-400 truncate max-w-[120px]">👤 {userName}</span>
        </div>

        <h1 className="text-lg font-bold text-white mb-6 border-b border-slate-800 pb-3">
          {selectedDomain.title}
        </h1>

        {/* Modules List with Course Percentage Bar */}
        <div className="flex-1 overflow-y-auto space-y-6">
          {selectedDomain.courses.map((course) => {
            const coursePercent = getCourseProgress(course);

            return (
              <div key={course.id} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <h2 className="font-semibold text-slate-300 uppercase tracking-wider">{course.title}</h2>
                  <span className="font-mono text-indigo-400 font-bold">{coursePercent}%</span>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${coursePercent}%` }}
                  />
                </div>

                {/* Claim Certificate Button if 100% */}
                {coursePercent === 100 && (
                  <button
                    onClick={() =>
                      setShowCertificate({
                        userName,
                        domainTitle: selectedDomain.title,
                        date: new Date().toLocaleDateString(),
                      })
                    }
                    className="w-full py-1.5 text-[11px] font-bold rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 cursor-pointer"
                  >
                    🏆 Claim Certificate
                  </button>
                )}

                <ul className="space-y-1 pt-1">
                  {course.modules.map((module) => {
                    const isCompleted = completedModules.includes(module.id);
                    const isActive = currentModule?.id === module.id;

                    return (
                      <li key={module.id}>
                        <button
                          onClick={() => setCurrentModule(module)}
                          className={`flex w-full items-center justify-between rounded-lg p-2.5 text-left text-xs transition-all cursor-pointer ${
                            isActive
                              ? "bg-indigo-950/80 text-indigo-300 font-medium border-l-2 border-indigo-500"
                              : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className={isCompleted ? "text-emerald-400" : "text-slate-600"}>
                              {isCompleted ? "✓" : "○"}
                            </span>
                            <span className="truncate">{module.title}</span>
                          </div>
                          <span className="ml-2 text-[10px] text-slate-500 font-mono">{module.duration || "Video"}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {currentModule ? (
          <div className="mx-auto max-w-4xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">{currentModule.title}</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Course Overall Progress: <strong className="text-indigo-400">{currentCourseProgress}%</strong>
                </p>
              </div>

              <button
                onClick={() => toggleComplete(currentModule.id, activeCourse)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  completedModules.includes(currentModule.id)
                    ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white"
                }`}
              >
                {completedModules.includes(currentModule.id) ? "✓ Completed" : "Mark as Complete"}
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl ring-1 ring-slate-800">
              <iframe
                className="h-full w-full border-0"
                src={`https://www.youtube-nocookie.com/embed/${currentModule.youtubeId}?rel=0&modestbranding=1`}
                title="Lesson Video Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Notes Section */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {userName}'s Study Notes
                </h3>
                <span className="text-[10px] text-emerald-400">Auto-saved</span>
              </div>
              <textarea
                value={notes}
                onChange={handleNoteChange}
                placeholder="Type your study notes here..."
                className="h-28 w-full resize-none rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-slate-500 text-xs">
            Select a module to start learning
          </div>
        )}
      </main>

      {/* UPDATED CERTIFICATE MODAL POPUP */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border-4 border-indigo-500/30 bg-slate-900 p-8 text-center text-white shadow-2xl space-y-6 relative">
            <button
              onClick={() => setShowCertificate(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
            >
              ✕
            </button>

            <div className="border-2 border-indigo-500/40 p-8 rounded-xl bg-slate-950/60 space-y-5">
              <div className="text-indigo-400 text-xs font-bold uppercase tracking-widest">
                Certificate of Completion
              </div>
              <p className="text-xs text-slate-400">This is proudly presented to</p>
              <h2 className="text-3xl font-extrabold text-white tracking-wide underline decoration-indigo-500 underline-offset-8">
                {showCertificate.userName}
              </h2>
              <p className="text-xs text-slate-300 pt-2">
                for successfully mastering all modules in
              </p>

              {/* Renders Domain Name cleanly (e.g. Web Development / AI / DS) */}
              <h3 className="text-2xl font-bold text-indigo-300 tracking-wide">
                Domain: {showCertificate.domainTitle}
              </h3>
              
              <div className="pt-6 flex justify-between items-center text-[11px] text-slate-500 border-t border-slate-800">
                <span>Issue Date: {showCertificate.date}</span>
                <span className="font-mono text-indigo-400 font-bold">Ascend-LMS Certified</span>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white cursor-pointer shadow-lg shadow-indigo-600/30"
            >
              🖨 Print / Save as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}