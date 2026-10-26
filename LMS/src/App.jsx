import { useState, useEffect } from "react";
import { DOMAINS } from "./data/courses.js";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" | "signup"
  const [userName, setUserName] = useState("");
  const [inputName, setInputName] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [selectedDomain, setSelectedDomain] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);
  const [completedModules, setCompletedModules] = useState([]);
  const [notes, setNotes] = useState("");
  const [showCertificate, setShowCertificate] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false); // Mobile Menu Toggle

  // Load existing session on initial mount
  useEffect(() => {
    const savedName = localStorage.getItem("lms_user_name");
    if (savedName) {
      setUserName(savedName);
      setIsLoggedIn(true);
    }
  }, []);

  // Sync completion history for active logged-in user
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

  // Load study notes per module for active user
  useEffect(() => {
    if (currentModule && userName) {
      const savedNote =
        localStorage.getItem(`note_${userName}_${currentModule.id}`) || "";
      setNotes(savedNote);
    }
  }, [currentModule, userName]);

  // Handle Authentication (Login & Sign Up)
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError("");

    const formattedName = inputName.trim();
    if (!formattedName || !inputPassword) {
      setAuthError("Please fill in all fields.");
      return;
    }

    const usersDb = JSON.parse(localStorage.getItem("lms_users_db") || "{}");

    if (authMode === "signup") {
      if (usersDb[formattedName.toLowerCase()]) {
        setAuthError("An account with this name already exists. Please log in.");
        return;
      }

      usersDb[formattedName.toLowerCase()] = {
        name: formattedName,
        password: inputPassword,
        joinedDate: new Date().toLocaleDateString(),
      };
      localStorage.setItem("lms_users_db", JSON.stringify(usersDb));

      setUserName(formattedName);
      localStorage.setItem("lms_user_name", formattedName);
      setIsLoggedIn(true);
      setInputName("");
      setInputPassword("");
    } else {
      const existingUser = usersDb[formattedName.toLowerCase()];
      if (!existingUser) {
        setAuthError("No account found with this name. Please sign up first.");
        return;
      }

      if (existingUser.password !== inputPassword) {
        setAuthError("Incorrect password. Please try again.");
        return;
      }

      setUserName(existingUser.name);
      localStorage.setItem("lms_user_name", existingUser.name);
      setIsLoggedIn(true);
      setInputName("");
      setInputPassword("");
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("lms_user_name");
    setUserName("");
    setIsLoggedIn(false);
    setSelectedDomain(null);
    setCurrentModule(null);
    setShowProfile(false);
    setIsMobileSidebarOpen(false);
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

  // Toggle Module Completion & Certificate Trigger
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

  // 1. MOBILE-FRIENDLY SIGN UP & LOGIN SCREEN
  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-950 text-white font-sans p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Ascend-LMS</h1>
            <p className="text-xs text-slate-400 mt-1">
              {authMode === "login"
                ? "Sign in to access your personal workspace"
                : "Create your account to start earning certificates"}
            </p>
          </div>

          <div className="mb-6 flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => {
                setAuthMode("login");
                setAuthError("");
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer ${
                authMode === "login"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => {
                setAuthMode("signup");
                setAuthError("");
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer ${
                authMode === "signup"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign Up
            </button>
          </div>

          {authError && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-950/20 p-3 text-center text-xs text-red-400 font-medium">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="e.g. Raam"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Password</label>
              <input
                type="password"
                required
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 transition-all cursor-pointer"
            >
              {authMode === "login" ? "Log In to Workspace" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. MOBILE-FRIENDLY USER PROFILE DASHBOARD VIEW
  if (showProfile) {
    const earnedCertificates = DOMAINS.filter((domain) =>
      domain.courses.every((course) => getCourseProgress(course) === 100)
    );

    return (
      <div className="min-h-screen bg-slate-950 text-white font-sans p-4 sm:p-8 md:p-12">
        <header className="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-800">
          <h1 className="text-xl sm:text-2xl font-bold">Ascend-LMS</h1>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowProfile(false)}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer"
            >
              ← Back
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-6xl mt-6 sm:mt-8 space-y-6 sm:space-y-8">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-xl sm:text-2xl font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">{userName}</h2>
                <p className="text-xs text-slate-400">Learner Dashboard & Progress Analytics</p>
              </div>
            </div>

            <div className="flex w-full sm:w-auto gap-3 pt-2 sm:pt-0">
              <div className="flex-1 sm:flex-none rounded-xl border border-slate-800 bg-slate-950/80 p-3 sm:p-4 text-center min-w-[90px] sm:min-w-[110px]">
                <span className="text-xl sm:text-2xl font-bold text-indigo-400 block">{completedModules.length}</span>
                <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-semibold">Modules</span>
              </div>
              <div className="flex-1 sm:flex-none rounded-xl border border-slate-800 bg-slate-950/80 p-3 sm:p-4 text-center min-w-[90px] sm:min-w-[110px]">
                <span className="text-xl sm:text-2xl font-bold text-emerald-400 block">{earnedCertificates.length}</span>
                <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-semibold">Certificates</span>
              </div>
            </div>
          </div>

          <section>
            <h3 className="text-base sm:text-lg font-bold text-white mb-4">🏆 Achieved Certificates</h3>
            {earnedCertificates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {earnedCertificates.map((domain) => (
                  <div
                    key={domain.id}
                    className="rounded-2xl border border-emerald-500/30 bg-emerald-950/10 p-5 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Verified</span>
                      <span className="text-xs text-slate-400">100% Completed</span>
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-white">{domain.title}</h4>
                      <p className="text-xs text-slate-400">Ascend-LMS Domain Certificate</p>
                    </div>
                    <button
                      onClick={() =>
                        setShowCertificate({
                          userName,
                          domainTitle: domain.title,
                          date: new Date().toLocaleDateString(),
                        })
                      }
                      className="w-full py-2.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer"
                    >
                      View / Download Certificate
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 text-center text-xs text-slate-400">
                No certificates achieved yet. Complete 100% of any domain course to earn your certificate!
              </div>
            )}
          </section>

          <section className="space-y-6">
            <h3 className="text-base sm:text-lg font-bold text-white">📚 Watched Modules by Domain</h3>

            {DOMAINS.map((domain) => {
              const domainWatchedModules = domain.courses.flatMap((course) =>
                course.modules.filter((m) => completedModules.includes(m.id))
              );

              return (
                <div key={domain.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h4 className="text-sm sm:text-base font-bold text-indigo-300">{domain.title}</h4>
                    <span className="text-xs text-slate-400 font-mono">
                      {domainWatchedModules.length} Watched
                    </span>
                  </div>

                  {domainWatchedModules.length > 0 ? (
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {domainWatchedModules.map((module) => (
                        <li
                          key={module.id}
                          className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span className="text-slate-200 truncate">{module.title}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono ml-2">{module.duration || "Video"}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No modules watched in this domain yet.</p>
                  )}
                </div>
              );
            })}
          </section>
        </main>
      </div>
    );
  }

  // 3. MOBILE-FRIENDLY DOMAINS SELECTION SCREEN
  if (!selectedDomain) {
    return (
      <div className="min-h-screen bg-slate-950 text-white font-sans p-4 sm:p-8 md:p-12">
        <header className="mx-auto max-w-6xl flex items-center justify-between pb-6 border-b border-slate-800">
          <h1 className="text-xl sm:text-2xl font-bold">Ascend-LMS</h1>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowProfile(true)}
              className="text-xs text-indigo-400 font-semibold bg-indigo-950/60 border border-indigo-800/50 px-3 py-1.5 rounded-full hover:border-indigo-500 cursor-pointer transition-all truncate max-w-[130px] sm:max-w-none"
            >
              👤 {userName}'s Profile
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-6xl mt-8 sm:mt-10">
          <h2 className="text-xl sm:text-2xl font-bold mb-1">Welcome back, {userName}! 👋</h2>
          <p className="text-slate-400 text-xs sm:text-sm mb-6 sm:mb-8">Select a learning domain track to explore modules.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {DOMAINS.map((domain) => (
              <button
                key={domain.id}
                onClick={() => {
                  setSelectedDomain(domain);
                  setCurrentModule(domain.courses[0]?.modules[0] || null);
                }}
                className="group text-left rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6 shadow-xl hover:border-indigo-500 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-base sm:text-lg font-bold mb-3 sm:mb-4">
                    {domain.title.charAt(0)}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">{domain.title}</h3>
                  <p className="text-xs text-slate-400">{domain.courses.length} Courses Available</p>
                </div>
                <div className="mt-6 sm:mt-8 flex items-center justify-between text-xs font-semibold text-indigo-400">
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

  const activeCourse = selectedDomain.courses.find((c) =>
    c.modules.some((m) => m.id === currentModule?.id)
  ) || selectedDomain.courses[0];

  const currentCourseProgress = getCourseProgress(activeCourse);

  // 4. MOBILE-FRIENDLY LEARNING WORKSPACE WITH COLLAPSIBLE SIDEBAR
  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Mobile Top Navigation Bar */}
      <div className="md:hidden flex items-center justify-between border-b border-slate-800 bg-slate-900 p-4">
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="flex items-center gap-2 text-xs font-semibold text-indigo-400 bg-slate-800 px-3 py-2 rounded-lg"
        >
          <span>{isMobileSidebarOpen ? "✕ Close Menu" : "☰ Course Modules"}</span>
        </button>
        <span className="text-xs font-bold text-white truncate max-w-[150px]">
          {selectedDomain.title}
        </span>
      </div>

      {/* Sidebar Navigation Drawer */}
      <aside
        className={`fixed md:relative inset-y-0 left-0 z-40 w-80 border-r border-slate-800 bg-slate-900 p-4 flex flex-col h-full transform transition-transform duration-300 ease-in-out ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              setSelectedDomain(null);
              setIsMobileSidebarOpen(false);
            }}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
          >
            ← Back to Domains
          </button>
          <button
            onClick={() => {
              setShowProfile(true);
              setIsMobileSidebarOpen(false);
            }}
            className="text-[11px] text-indigo-400 font-medium truncate max-w-[120px] hover:underline cursor-pointer"
          >
            👤 {userName}
          </button>
        </div>

        <h1 className="text-lg font-bold text-white mb-6 border-b border-slate-800 pb-3">
          {selectedDomain.title}
        </h1>

        <div className="flex-1 overflow-y-auto space-y-6">
          {selectedDomain.courses.map((course) => {
            const coursePercent = getCourseProgress(course);

            return (
              <div key={course.id} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <h2 className="font-semibold text-slate-300 uppercase tracking-wider">{course.title}</h2>
                  <span className="font-mono text-indigo-400 font-bold">{coursePercent}%</span>
                </div>

                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${coursePercent}%` }}
                  />
                </div>

                {coursePercent === 100 && (
                  <button
                    onClick={() => {
                      setShowCertificate({
                        userName,
                        domainTitle: selectedDomain.title,
                        date: new Date().toLocaleDateString(),
                      });
                      setIsMobileSidebarOpen(false);
                    }}
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
                          onClick={() => {
                            setCurrentModule(module);
                            setIsMobileSidebarOpen(false); // Auto close sidebar on mobile video select
                          }}
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

      {/* Main Video & Notes Workspace */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {currentModule ? (
          <div className="mx-auto max-w-4xl space-y-4 sm:space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white">{currentModule.title}</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Course Overall Progress: <strong className="text-indigo-400">{currentCourseProgress}%</strong>
                </p>
              </div>

              <button
                onClick={() => toggleComplete(currentModule.id, activeCourse)}
                className={`w-full sm:w-auto px-4 py-2.5 sm:py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  completedModules.includes(currentModule.id)
                    ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white"
                }`}
              >
                {completedModules.includes(currentModule.id) ? "✓ Completed" : "Mark as Complete"}
              </button>
            </div>

            {/* Responsive Video Container */}
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
          <div className="flex h-full items-center justify-center text-slate-500 text-xs text-center p-6">
            Select a module from the menu to start watching
          </div>
        )}
      </main>

      {/* MOBILE-OPTIMIZED CERTIFICATE MODAL */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border-2 sm:border-4 border-indigo-500/30 bg-slate-900 p-5 sm:p-8 text-center text-white shadow-2xl space-y-4 sm:space-y-6 relative my-auto">
            <button
              onClick={() => setShowCertificate(null)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
            >
              ✕
            </button>

            <div className="border-2 border-indigo-500/40 p-4 sm:p-8 rounded-xl bg-slate-950/60 space-y-3 sm:space-y-5">
              <div className="text-indigo-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                Certificate of Completion
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">This is proudly presented to</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide underline decoration-indigo-500 underline-offset-8">
                {showCertificate.userName}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300 pt-1 sm:pt-2">
                for successfully mastering all modules in
              </p>

              <h3 className="text-xl sm:text-2xl font-bold text-indigo-300 tracking-wide">
                Domain: {showCertificate.domainTitle}
              </h3>

              <div className="pt-4 sm:pt-6 flex flex-col sm:flex-row gap-2 justify-between items-center text-[10px] sm:text-[11px] text-slate-500 border-t border-slate-800">
                <span>Issue Date: {showCertificate.date}</span>
                <span className="font-mono text-indigo-400 font-bold">Ascend-LMS Certified</span>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white cursor-pointer shadow-lg shadow-indigo-600/30"
            >
              🖨 Print / Save as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}