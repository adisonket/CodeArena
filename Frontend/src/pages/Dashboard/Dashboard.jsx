import React, { useState, useRef, useEffect, useCallback } from "react";
import Header from '../../components/Header';
import DateTime from '../../components/DateTime';
import SoftBackdropNew from "../../components/SoftBackdropNew";

// ─── Scroll Animation Hook ───
const useScrollReveal = (options = {}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: options.threshold || 0.1, rootMargin: options.rootMargin || '0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
};

// ─── Animated Counter Hook ───
const useCounter = (target, isVisible, duration = 2000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isVisible, target, duration]);
  return count;
};

// ─── Scroll Reveal Wrapper ───
const ScrollReveal = ({ children, delay = 0, direction = 'up', className = '' }) => {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.1 });

  const directionStyles = {
    up: 'translate-y-12',
    down: '-translate-y-12',
    left: 'translate-x-12',
    right: '-translate-x-12',
    scale: 'scale-90',
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0 translate-x-0 scale-100' : `opacity-0 ${directionStyles[direction]}`} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// ─── Animated Collapsible Section ───
const CollapsibleSection = ({ isOpen, children, className = '' }) => {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!contentRef.current) return;

    if (isOpen) {
      const contentHeight = contentRef.current.scrollHeight;
      setHeight(contentHeight);
    } else {
      setHeight(0);
    }
  }, [isOpen, shouldRender]);

  const handleTransitionEnd = () => {
    if (!isOpen) {
      // Keep rendered but hidden
    }
  };

  return (
    <div className={className}
      style={{
        height: `${height}px`,
        overflow: 'hidden',
        transition: 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onTransitionEnd={handleTransitionEnd}
    >
      <div ref={contentRef}>
        {shouldRender && children}
      </div>
    </div>
  );
};

// ─── Section Header with Dropdown Toggle ───
const SectionHeader = ({ isOpen, onToggle, icon, title, gradientFrom, gradientTo, lineColor }) => {
  return (
    <div
      className="flex items-center gap-4 sm:gap-5 mb-0 cursor-pointer group select-none"
      onClick={onToggle}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${gradientFrom} border ${gradientTo} backdrop-blur-sm transition-all duration-300 group-hover:scale-110`}>
        {icon}
      </div>
      <h2 className="text-white text-xl sm:text-2xl font-bold whitespace-nowrap flex-shrink-0">
        {title}
      </h2>
      <div className={`flex-1 h-0.5 rounded-full bg-gradient-to-r ${lineColor} to-transparent transition-all duration-300`} />

      {/* Dropdown Toggle Button */}
      <button
        className={`
          flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider
          border transition-all duration-300 shrink-0 ml-2
          ${isOpen
            ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400 shadow-lg shadow-indigo-500/20'
            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white hover:border-white/20'
          }
        `}
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
      >
        <span>{isOpen ? 'Hide' : 'Show'}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-500 ease-in-out ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </div>
  );
};

const Dashboard = () => {
  // ─── Dropdown State ───
  const [analyticsOpen, setAnalyticsOpen] = useState(true);
  const [categoriesOpen, setCategoriesOpen] = useState(true);

  // ─── State for backend integration ───
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statsData, setStatsData] = useState({
    completed: 65,
    inProgress: 25,
    notStarted: 10
  });
  const [progressData, setProgressData] = useState([
    { label: 'DSA', value: 75, level: 'high' },
    { label: 'System Design', value: 45, level: 'medium' },
    { label: 'Aptitude', value: 90, level: 'high' },
    { label: 'Core Subjects', value: 60, level: 'medium' }
  ]);
  const [graphData, setGraphData] = useState([
    { day: 'Mon', value: 30 },
    { day: 'Tue', value: 45 },
    { day: 'Wed', value: 60 },
    { day: 'Thu', value: 40 },
    { day: 'Fri', value: 80 },
    { day: 'Sat', value: 65 },
    { day: 'Sun', value: 55 }
  ]);
  const [graphPeriod, setGraphPeriod] = useState('W');
  const [categoryData] = useState([
    {
      id: 'drive',
      title: 'Drive',
      description: 'Access your study materials, notes, and important documents all in one organized place.',
      badgeText: 'New',
      stats: [
        { num: 156, text: 'Files' },
        { num: 12, text: 'Folders' },
        { num: 2.4, text: 'GB' }
      ]
    },
    {
      id: 'practice',
      title: 'Practice Set',
      description: 'Sharpen your skills with curated practice problems and real-world coding challenges.',
      badgeText: 'Popular',
      stats: [
        { num: 248, text: 'Questions' },
        { num: 89, text: 'Solved' },
        { num: 4.8, text: 'Rating' }
      ]
    },
    {
      id: 'mock',
      title: 'Mock Interview',
      description: 'Prepare for real interviews with AI-powered mock sessions and detailed feedback.',
      badgeText: 'Pro',
      stats: [
        { num: 24, text: 'Sessions' },
        { num: 4.2, text: 'Avg Score' },
        { num: 45, text: 'Hours' }
      ]
    }
  ]);

  // ─── Backend Fetch Function ───
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Replace with your actual API endpoints
    } catch (err) {
      setError(err.message);
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGraphData = useCallback(async (period) => {
    try {
      setGraphPeriod(period);
    } catch (err) {
      console.error('Graph fetch error:', err);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ─── Scroll refs for animated counters ───
  const [pieRef, pieVisible] = useScrollReveal({ threshold: 0.3 });
  const completedCount = useCounter(statsData.completed, pieVisible);
  const totalProgress = progressData.reduce((a, b) => a + b.value, 0) / progressData.length;
  const [totalRef, totalVisible] = useScrollReveal({ threshold: 0.3 });
  const totalCount = useCounter(totalProgress, totalVisible);
  const avgPerDay = graphData.reduce((a, b) => a + b.value, 0) / graphData.length;
  const totalWeek = graphData.reduce((a, b) => a + b.value, 0);

  // ─── Helper Functions ───
  const getProgressWidth = (value) => `${Math.min(Math.max(value, 0), 100)}%`;
  const getBarHeight = (value) => `${Math.min(Math.max(value, 5), 100)}%`;

  const getLevelClasses = (level) => {
    const map = {
      high: { status: 'bg-emerald-500/15 text-emerald-400', fill: 'from-emerald-400 to-teal-400', shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]' },
      medium: { status: 'bg-amber-500/15 text-amber-400', fill: 'from-amber-400 to-orange-400', shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]' },
      low: { status: 'bg-red-500/15 text-red-400', fill: 'from-red-400 to-rose-500', shadow: 'shadow-[0_0_20px_rgba(239,68,68,0.4)]' }
    };
    return map[level] || map.low;
  };

  const cardConfig = {
    drive: {
      orb1: 'bg-emerald-400', orb2: 'bg-teal-400',
      iconBox: 'from-emerald-400 to-teal-400 shadow-[0_10px_30px_rgba(16,185,129,0.4)]',
      iconGlow: 'rgba(16,185,129,0.4)',
      badge: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
      statIcon: 'bg-emerald-500/15 text-emerald-400',
      btn: 'from-emerald-400 to-teal-400 shadow-[0_8px_25px_rgba(16,185,129,0.35)] hover:shadow-[0_12px_35px_rgba(16,185,129,0.5)]',
      icon: (<><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" /></>)
    },
    practice: {
      orb1: 'bg-purple-500', orb2: 'bg-indigo-500',
      iconBox: 'from-indigo-500 to-purple-600 shadow-[0_10px_30px_rgba(99,102,241,0.4)]',
      iconGlow: 'rgba(99,102,241,0.4)',
      badge: 'bg-purple-500/20 border-purple-500/40 text-purple-400',
      statIcon: 'bg-purple-500/15 text-purple-400',
      btn: 'from-indigo-500 to-purple-600 shadow-[0_8px_25px_rgba(99,102,241,0.35)] hover:shadow-[0_12px_35px_rgba(99,102,241,0.5)]',
      icon: (<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></>)
    },
    mock: {
      orb1: 'bg-orange-500', orb2: 'bg-red-400',
      iconBox: 'from-orange-500 to-red-400 shadow-[0_10px_30px_rgba(249,115,22,0.4)]',
      iconGlow: 'rgba(249,115,22,0.4)',
      badge: 'bg-orange-500/20 border-orange-500/40 text-orange-400',
      statIcon: 'bg-orange-500/15 text-orange-400',
      btn: 'from-orange-500 to-red-400 shadow-[0_8px_25px_rgba(249,115,22,0.35)] hover:shadow-[0_12px_35px_rgba(249,115,22,0.5)]',
      icon: (<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>)
    }
  };

  const statIcons = {
    Files: <><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></>,
    Folders: <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />,
    GB: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
    Questions: <><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
    Solved: <><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>,
    Rating: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
    Sessions: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
    'Avg Score': <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
    Hours: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
  };

  const btnTexts = { drive: 'Open Drive', practice: 'Start Practice', mock: 'Start Interview' };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center max-w-md">
          <h3 className="text-white text-lg font-bold mb-2">Something went wrong</h3>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <button onClick={fetchDashboardData} className="px-6 py-2.5 bg-indigo-500 text-white rounded-xl font-semibold">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SoftBackdropNew />

      <div className="min-h-screen relative">
        {/* ─── Global Keyframes ─── */}
        <style>{`
          @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.3)} }
          @keyframes draw-segment { from{stroke-dasharray:0 251} }
          @keyframes ring-pulse { 0%,100%{opacity:.3;transform:scale(1)} 50%{opacity:.6;transform:scale(1.05)} }
          @keyframes legend-pulse { 0%{transform:scale(1);opacity:1} 100%{transform:scale(2.2);opacity:0} }
          @keyframes shine-sweep { 0%{left:-100%} 50%,100%{left:100%} }
          @keyframes icon-glow { 0%,100%{transform:translate(-50%,-50%) scale(1);opacity:.5} 50%{transform:translate(-50%,-50%) scale(1.3);opacity:.8} }
          @keyframes badge-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:.5} }
          @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
          @keyframes section-fade-in { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }

          @keyframes blob-1 {
            0%, 100% { transform: translate(0px, 0px) scale(1); }
            25% { transform: translate(120px, -80px) scale(1.2); }
            50% { transform: translate(-80px, 120px) scale(0.85); }
            75% { transform: translate(100px, 60px) scale(1.1); }
          }
          @keyframes blob-2 {
            0%, 100% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(-150px, 100px) scale(1.3); }
            66% { transform: translate(80px, -120px) scale(0.9); }
          }
          @keyframes blob-3 {
            0%, 100% { transform: translate(0px, 0px) scale(1); }
            40% { transform: translate(100px, -100px) scale(1.15); }
            80% { transform: translate(-120px, 80px) scale(0.95); }
          }
          @keyframes blob-4 {
            0%, 100% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
            50% { transform: translate(-100px, -60px) scale(1.2) rotate(180deg); }
          }
          @keyframes star-twinkle {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.5); }
          }

          .dot-pulse{animation:pulse-dot 2s infinite}
          .seg-completed{stroke:url(#completedGrad);stroke-dasharray:163 251;stroke-dashoffset:0;animation:draw-segment 1.5s ease-out forwards}
          .seg-progress{stroke:url(#progressGrad);stroke-dasharray:63 251;stroke-dashoffset:-163}
          .seg-not-started{stroke:url(#notStartedGrad);stroke-dasharray:25 251;stroke-dashoffset:-226}
          .legend-pulse-anim{animation:legend-pulse 2s ease-out infinite}
          .shine-anim{animation:shine-sweep 3s ease-in-out infinite}
          .icon-glow-anim{animation:icon-glow 2s ease-in-out infinite}
          .badge-pulse-anim{animation:badge-pulse 2s infinite}
          .float-anim{animation:float 3s ease-in-out infinite}
          .section-fade-in{animation:section-fade-in 0.4s ease-out forwards}

          .box-card{transition:all .4s cubic-bezier(.4,0,.2,1)}
          .box-card:hover{transform:translateY(-8px)}
          .box-card:hover .glow-overlay{opacity:1}
          .cat-card{transition:all .4s cubic-bezier(.4,0,.2,1)}
          .cat-card:hover{transform:translateY(-10px)}
          .cat-card:hover .orb-1{transform:scale(1.2);opacity:.4}
          .cat-card:hover .border-overlay{border-color:rgba(255,255,255,.25)}
          .btn-cta:hover .btn-shine-el{left:100%}
          .btn-cta:hover .btn-arrow{transform:translateX(5px)}
          .bar-col:hover{transform:scaleY(1.08)}
          .bar-col:hover .bar-tip{opacity:1;transform:translateX(-50%) scale(1)}
          .legend-row:hover{background:rgba(255,255,255,.08);transform:translateX(5px)}
          .stat-card-mini:hover{background:rgba(255,255,255,.06)}

          .bg-blob-1 { animation: blob-1 20s ease-in-out infinite; }
          .bg-blob-2 { animation: blob-2 25s ease-in-out infinite; }
          .bg-blob-3 { animation: blob-3 22s ease-in-out infinite; }
          .bg-blob-4 { animation: blob-4 30s ease-in-out infinite; }
          .star { animation: star-twinkle 3s ease-in-out infinite; }

          /* Collapsible section preview bar */
          .section-preview {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }
        `}</style>

        {/* ═══════════════ ANIMATED BACKGROUND ═══════════════ */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
          <div className="bg-blob-1 absolute rounded-full" style={{ top: "-10%", left: "-5%", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(139, 92, 246, 0.35) 0%, rgba(139, 92, 246, 0.1) 40%, transparent 70%)", filter: "blur(60px)" }} />
          <div className="bg-blob-2 absolute rounded-full" style={{ top: "20%", right: "-10%", width: "550px", height: "550px", background: "radial-gradient(circle, rgba(34, 211, 238, 0.3) 0%, rgba(34, 211, 238, 0.08) 40%, transparent 70%)", filter: "blur(70px)" }} />
          <div className="bg-blob-3 absolute rounded-full" style={{ bottom: "-10%", left: "20%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, rgba(236, 72, 153, 0.1) 40%, transparent 70%)", filter: "blur(80px)" }} />
          <div className="bg-blob-4 absolute rounded-full" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "450px", height: "450px", background: "radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 60%)", filter: "blur(90px)" }} />
          <div className="bg-blob-1 absolute rounded-full" style={{ bottom: "10%", right: "5%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 60%)", filter: "blur(70px)", animationDelay: "5s" }} />
          <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
          {[...Array(15)].map((_, i) => (
            <div key={i} className="star absolute rounded-full bg-white" style={{ width: `${1 + (i % 3)}px`, height: `${1 + (i % 3)}px`, left: `${(i * 7) % 100}%`, top: `${(i * 13) % 100}%`, animationDelay: `${i * 0.4}s`, animationDuration: `${3 + (i % 4)}s` }} />
          ))}
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Header */}
        <div className="relative" style={{ zIndex: 10 }}>
          <Header />
        </div>

        {/* ─── Main Content ─── */}
        <div className="relative px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 2xl:px-28 py-6 sm:py-8 max-w-[1600px] mx-auto" style={{ zIndex: 10 }}>

          {/* ═══════ Header Section ═══════ */}
          <ScrollReveal direction="up" delay={0}>
            <header className="mb-12 sm:mb-14">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex-1">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-3 flex flex-wrap gap-3">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-500 to-fuchsia-400">Dashboard</span>
                    <span className="text-white">Overview</span>
                  </h1>
                  <p className="text-slate-400 text-base sm:text-lg font-normal">Track your learning journey and progress</p>
                  <div className="mt-5 inline-block">
                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 backdrop-blur-md hover:bg-white/[0.08] transition-colors duration-300">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Today</span>
                        <span className="text-white text-sm sm:text-base font-semibold"><DateTime /></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-10">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
                <div className="w-2.5 h-2.5 rotate-45 rounded-sm bg-gradient-to-br from-indigo-500 to-purple-600 float-anim" />
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
              </div>
            </header>
          </ScrollReveal>

          {/* ═══════ Analytics Section ═══════ */}
          <ScrollReveal direction="left" delay={100}>
            <div className="mb-6">
              <SectionHeader
                isOpen={analyticsOpen}
                onToggle={() => setAnalyticsOpen(prev => !prev)}
                icon={
                  <svg className="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                    <path d="M22 12A10 10 0 0 0 12 2v10z" />
                  </svg>
                }
                title="Analytics & Statistics"
                gradientFrom="bg-indigo-500/15"
                gradientTo="border-indigo-500/25"
                lineColor="from-indigo-500/40"
              />
            </div>
          </ScrollReveal>

          {/* Analytics collapsed preview bar */}
          {!analyticsOpen && (
            <div className="section-preview mb-8 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] cursor-pointer hover:bg-white/[0.06] transition-all duration-300" onClick={() => setAnalyticsOpen(true)}>
              <div className="flex gap-2">
                {[
                  { color: 'bg-emerald-400', label: `${statsData.completed}% Done` },
                  { color: 'bg-amber-400', label: `${statsData.inProgress}% Active` },
                  { color: 'bg-red-400', label: `${statsData.notStarted}% Pending` },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="text-slate-500 text-xs">{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex-1" />
              <span className="text-indigo-400 text-xs font-semibold">Click to expand</span>
              <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          )}

          {/* ─── Collapsible Analytics Content ─── */}
          <CollapsibleSection isOpen={analyticsOpen} className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 mb-14 pt-2">

              {/* ──── Box 1: Pie Chart ──── */}
              <ScrollReveal direction="up" delay={100}>
                <div className="box-card group relative rounded-3xl overflow-hidden bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/[0.08] backdrop-blur-md">
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                  <div className="glow-overlay absolute -inset-1/2 w-[200%] h-[200%] opacity-0 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle,rgba(99,102,241,0.08)_0%,transparent_50%)]" />
                  <div className="relative p-6 sm:p-8 z-10">
                    <div className="flex items-center gap-4 mb-7">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/40">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" /><path d="M12 2a10 10 0 0 1 10 10" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white text-lg font-bold truncate">Overall Stats</h3>
                        <span className="text-slate-500 text-sm">Performance overview</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.7rem] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 shrink-0">
                        <span className="dot-pulse w-1.5 h-1.5 bg-emerald-400 rounded-full" />Live
                      </div>
                    </div>
                    <div ref={pieRef} className="flex flex-col items-center gap-8">
                      <div className="relative">
                        <div className="relative w-48 h-48 sm:w-52 sm:h-52">
                          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                            <defs>
                              <linearGradient id="completedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#34d399" /><stop offset="100%" stopColor="#14b8a6" />
                              </linearGradient>
                              <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#f59e0b" />
                              </linearGradient>
                              <linearGradient id="notStartedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#f87171" /><stop offset="100%" stopColor="#ef4444" />
                              </linearGradient>
                              <filter id="glow">
                                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                              </filter>
                            </defs>
                            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                            <circle cx="50" cy="50" r="40" fill="none" strokeWidth="12" strokeLinecap="round" className="seg-completed" filter="url(#glow)" />
                            <circle cx="50" cy="50" r="40" fill="none" strokeWidth="12" strokeLinecap="round" className="seg-progress" />
                            <circle cx="50" cy="50" r="40" fill="none" strokeWidth="12" strokeLinecap="round" className="seg-not-started" />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="flex items-baseline">
                              <span className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">{completedCount}</span>
                              <span className="text-xl font-bold text-emerald-400">%</span>
                            </div>
                            <span className="text-slate-500 text-sm mt-1">Completed</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 w-full">
                        {[
                          { label: "Completed", value: statsData.completed, dot: "from-emerald-400 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]" },
                          { label: "In Progress", value: statsData.inProgress, dot: "from-amber-400 to-orange-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]" },
                          { label: "Not Started", value: statsData.notStarted, dot: "from-red-400 to-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]" },
                        ].map((leg) => (
                          <div key={leg.label} className="legend-row flex items-center gap-3 px-4 py-3 bg-white/[0.03] rounded-xl transition-all duration-300 cursor-default">
                            <div className={`relative w-3.5 h-3.5 rounded-full bg-gradient-to-br ${leg.dot}`}>
                              <span className={`legend-pulse-anim absolute inset-0 rounded-full bg-gradient-to-br ${leg.dot}`} />
                            </div>
                            <span className="text-slate-300 text-sm flex-1">{leg.label}</span>
                            <span className="text-white font-bold text-sm">{leg.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-indigo-500/25 rounded-tl-md pointer-events-none" />
                  <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-indigo-500/25 rounded-br-md pointer-events-none" />
                </div>
              </ScrollReveal>

              {/* ──── Box 2: Learning Progress ──── */}
              <ScrollReveal direction="up" delay={200}>
                <div className="box-card group relative rounded-3xl overflow-hidden bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/[0.08] backdrop-blur-md">
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                  <div className="glow-overlay absolute -inset-1/2 w-[200%] h-[200%] opacity-0 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle,rgba(236,72,153,0.08)_0%,transparent_50%)]" />
                  <div className="relative p-6 sm:p-8 z-10">
                    <div className="flex items-center gap-4 mb-7">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg shadow-pink-500/40">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white text-lg font-bold truncate">Learning Progress</h3>
                        <span className="text-slate-500 text-sm">Skills development</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.7rem] font-semibold text-amber-400 bg-amber-500/15 border border-amber-500/25 shrink-0">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
                        </svg>
                        +12%
                      </div>
                    </div>
                    <div className="flex flex-col gap-5">
                      {progressData.map((item, index) => {
                        const lc = getLevelClasses(item.level);
                        return (
                          <div key={item.label || index} className="group/prog">
                            <div className="flex justify-between items-center mb-2.5">
                              <div className="flex items-center gap-3">
                                <span className="text-slate-600 text-xs font-semibold font-mono">{String(index + 1).padStart(2, "0")}</span>
                                <span className="text-slate-200 text-sm font-medium">{item.label}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`px-2.5 py-0.5 rounded-full text-[0.65rem] font-semibold uppercase tracking-wider ${lc.status}`}>{item.level}</span>
                                <span className="text-white text-sm font-bold min-w-[36px] text-right">{item.value}%</span>
                              </div>
                            </div>
                            <div className="relative h-2.5 bg-white/5 rounded-full overflow-hidden">
                              <div className={`relative h-full rounded-full overflow-hidden bg-gradient-to-r ${lc.fill} ${lc.shadow} transition-all duration-1000 ease-out`} style={{ width: getProgressWidth(item.value) }}>
                                <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-r from-transparent to-white/50 rounded-r-full" />
                                <div className="shine-anim absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                              </div>
                              <div className="absolute inset-0 flex justify-between px-[25%]">
                                {[0, 1, 2, 3].map((i) => (<span key={i} className="w-px h-full bg-white/[0.06]" />))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div ref={totalRef} className="flex justify-between items-center mt-7 p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                      <div className="flex items-center gap-3 text-slate-300 font-semibold text-sm">
                        <svg className="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" />
                        </svg>
                        Total Progress
                      </div>
                      <div className="flex items-baseline">
                        <span className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">{totalCount}</span>
                        <span className="text-lg font-bold text-indigo-400 ml-0.5">%</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-indigo-500/25 rounded-tl-md pointer-events-none" />
                  <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-indigo-500/25 rounded-br-md pointer-events-none" />
                </div>
              </ScrollReveal>

              {/* ──── Box 3: Weekly Activity ──── */}
              <ScrollReveal direction="up" delay={300}>
                <div className="box-card group relative rounded-3xl overflow-hidden bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/[0.08] backdrop-blur-md lg:col-span-2 xl:col-span-1">
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                  <div className="glow-overlay absolute -inset-1/2 w-[200%] h-[200%] opacity-0 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle,rgba(56,189,248,0.08)_0%,transparent_50%)]" />
                  <div className="relative p-6 sm:p-8 z-10">
                    <div className="flex items-center gap-4 mb-7">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-sky-400 to-cyan-400 shadow-lg shadow-sky-500/40">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white text-lg font-bold truncate">Weekly Activity</h3>
                        <span className="text-slate-500 text-sm">Hours spent learning</span>
                      </div>
                      <div className="flex gap-1 p-1 bg-white/5 rounded-xl shrink-0">
                        {["W", "M", "Y"].map((t) => (
                          <button key={t} onClick={() => fetchGraphData(t)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 cursor-pointer ${graphPeriod === t ? "bg-gradient-to-r from-sky-400 to-cyan-400 text-white shadow-md shadow-sky-500/40" : "text-slate-500 hover:text-white"}`}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3 sm:gap-4 mb-6">
                      <div className="flex flex-col justify-between py-2 text-slate-600 text-[0.65rem] font-medium text-right min-w-[22px]">
                        {["80", "60", "40", "20", "0"].map((v) => (<span key={v}>{v}</span>))}
                      </div>
                      <div className="flex-1 relative h-44 sm:h-48">
                        <div className="absolute inset-0 flex flex-col justify-between">
                          {[0, 1, 2, 3].map((i) => (<div key={i} className="w-full h-px bg-white/5" />))}
                        </div>
                        <div className="relative flex justify-around items-end h-full pt-2">
                          {graphData.map((item, index) => (
                            <div key={item.day || index} className="flex flex-col items-center gap-2 flex-1">
                              <div className="h-36 sm:h-40 flex items-end justify-center w-full">
                                <div className="bar-col relative rounded-t-lg rounded-b transition-all duration-[400ms] cursor-pointer" style={{ width: "clamp(20px, 5vw, 35px)", height: getBarHeight(item.value) }}>
                                  <div className="absolute inset-0 rounded-[inherit] overflow-hidden bg-gradient-to-t from-sky-500 to-cyan-400">
                                    <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-white/25 to-transparent" />
                                  </div>
                                  <span className="bar-tip absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 scale-[0.8] bg-slate-900/95 border border-white/10 px-3 py-2 rounded-xl flex flex-col items-center opacity-0 transition-all duration-300 pointer-events-none whitespace-nowrap backdrop-blur-sm z-20">
                                    <span className="text-sky-400 text-base font-bold">{item.value}</span>
                                    <span className="text-slate-500 text-[0.65rem]">hours</span>
                                  </span>
                                </div>
                              </div>
                              <span className="text-slate-500 text-[0.7rem] font-medium">{item.day}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: avgPerDay.toFixed(1), label: "Avg/Day", bg: "bg-sky-500/15", color: "text-sky-400", icon: (<><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>) },
                        { value: totalWeek, label: "This Week", bg: "bg-purple-500/15", color: "text-purple-400", icon: (<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />) },
                        { value: "+18%", label: "vs Last Week", bg: "bg-emerald-500/15", color: "text-emerald-400", icon: (<polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />) },
                      ].map((stat) => (
                        <div key={stat.label} className="stat-card-mini flex items-center gap-2.5 p-3 sm:p-4 bg-white/[0.03] rounded-xl transition-all duration-300">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${stat.bg}`}>
                            <svg className={`w-4 h-4 ${stat.color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{stat.icon}</svg>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-white text-sm sm:text-lg font-bold truncate">{stat.value}</span>
                            <span className="text-slate-500 text-[0.65rem] truncate">{stat.label}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-indigo-500/25 rounded-tl-md pointer-events-none" />
                  <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-indigo-500/25 rounded-br-md pointer-events-none" />
                </div>
              </ScrollReveal>
            </div>
          </CollapsibleSection>

          {/* ═══════ Learning Categories Section ═══════ */}
          <ScrollReveal direction="left" delay={100}>
            <div className="mb-6">
              <SectionHeader
                isOpen={categoriesOpen}
                onToggle={() => setCategoriesOpen(prev => !prev)}
                icon={
                  <svg className="w-5 h-5 text-fuchsia-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                  </svg>
                }
                title="Learning Categories"
                gradientFrom="bg-fuchsia-500/15"
                gradientTo="border-fuchsia-500/25"
                lineColor="from-fuchsia-500/40"
              />
            </div>
          </ScrollReveal>

          {/* Categories collapsed preview bar */}
          {!categoriesOpen && (
            <div className="section-preview mb-8 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] cursor-pointer hover:bg-white/[0.06] transition-all duration-300" onClick={() => setCategoriesOpen(true)}>
              <div className="flex gap-3">
                {categoryData.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${cat.id === 'drive' ? 'bg-emerald-400' : cat.id === 'practice' ? 'bg-purple-400' : 'bg-orange-400'}`} />
                    <span className="text-slate-500 text-xs">{cat.title}</span>
                  </div>
                ))}
              </div>
              <div className="flex-1" />
              <span className="text-fuchsia-400 text-xs font-semibold">Click to expand</span>
              <svg className="w-4 h-4 text-fuchsia-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          )}

          {/* ─── Collapsible Category Content ─── */}
          <CollapsibleSection isOpen={categoriesOpen}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 pb-12 pt-2">
              {categoryData.map((card, cardIndex) => {
                const conf = cardConfig[card.id];
                if (!conf) return null;
                return (
                  <ScrollReveal key={card.id} direction="up" delay={100 + cardIndex * 150}>
                    <div className="cat-card group relative rounded-3xl overflow-hidden backdrop-blur-md">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] to-white/[0.02] overflow-hidden">
                        <div className={`orb-1 absolute w-48 h-48 -top-12 -right-12 rounded-full blur-[60px] opacity-30 transition-all duration-500 ${conf.orb1}`} />
                        <div className={`absolute w-36 h-36 -bottom-8 -left-8 rounded-full blur-[50px] opacity-20 ${conf.orb2}`} />
                        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                      </div>
                      <div className="relative p-6 sm:p-8 z-10">
                        <div className="flex items-start justify-between mb-5">
                          <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${conf.iconBox}`}>
                            <svg className="w-7 h-7 text-white relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{conf.icon}</svg>
                            <div className="icon-glow-anim absolute top-1/2 left-1/2 w-full h-full rounded-[inherit]" style={{ background: `radial-gradient(circle, ${conf.iconGlow}, transparent 70%)` }} />
                          </div>
                          <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[0.7rem] font-bold uppercase tracking-wider border ${conf.badge}`}>
                            <span className="badge-pulse-anim w-1.5 h-1.5 rounded-full bg-current" />{card.badgeText}
                          </div>
                        </div>
                        <h3 className="text-white text-2xl font-extrabold mb-2">{card.title}</h3>
                        <p className="text-slate-400 text-sm sm:text-[0.95rem] leading-relaxed mb-6">{card.description}</p>
                        <div className="flex gap-4 sm:gap-5 mb-6 p-4 sm:p-5 bg-black/20 rounded-2xl backdrop-blur-sm flex-wrap">
                          {card.stats.map((s) => (
                            <div key={s.text} className="flex items-center gap-2.5 flex-1 min-w-[80px]">
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${conf.statIcon}`}>
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  {statIcons[s.text] || <circle cx="12" cy="12" r="10" />}
                                </svg>
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-white text-lg sm:text-xl font-extrabold leading-tight">{s.num}</span>
                                <span className="text-slate-500 text-[0.7rem] uppercase tracking-wider truncate">{s.text}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button className={`btn-cta relative w-full px-6 py-4 rounded-2xl text-sm sm:text-base font-bold text-white flex items-center justify-center gap-3 overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-r ${conf.btn}`}>
                          <span className="relative z-10">{btnTexts[card.id]}</span>
                          <span className="btn-arrow relative z-10 flex items-center transition-transform duration-300">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                            </svg>
                          </span>
                          <div className="btn-shine-el absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-[left] duration-500" />
                        </button>
                      </div>
                      <div className="border-overlay absolute inset-0 rounded-3xl border border-white/10 pointer-events-none transition-all duration-300" />
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </CollapsibleSection>

        </div>
      </div>
    </>
  );
};

export default Dashboard;