import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, FileText, User, Lock, LogOut, X } from "lucide-react";
import SoftBackdrop from "./SoftBackdrop";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
    const [open, setOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const dropdownRef = useRef(null);
    const [search, setSearch] = useState("");

    const { user, isLoggedIn, logout } = useAuth();
    const navigate = useNavigate();

    const fullName = user ? `${user.firstName} ${user.lastName}` : "";
    const initials = user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() : "";

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <>
            <header className="p-5 shadow-lg flex justify-between items-center bg-white/5 backdrop-blur-md relative">

                <a href="/" className="text-2xl font-bold text-slate-200 hover:text-white transition-colors cursor-pointer">
                    CodeArena
                </a>

                

                {isLoggedIn && (
                    <div className="relative" ref={dropdownRef}>
                        <div
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => setOpen(!open)}
                        >
                            <div className="p-[2px] rounded-full bg-gradient-to-tr from-indigo-600 via-purple-700 to-indigo-900 shadow-[0_0_12px_rgba(99,102,241,0.35)]">
                                <div className="w-9 h-9 rounded-full overflow-hidden bg-[#0f172a] flex items-center justify-center text-sm text-white">
                                    {user?.picture ? (
                                        <img
                                            src={user.picture}
                                            alt="Profile"
                                            referrerPolicy="no-referrer"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        initials
                                    )}
                                </div>
                            </div>

                            <h3 className="text-slate-300 font-semibold">
                                {fullName}
                            </h3>

                            <ChevronDown
                                size={20}
                                className={`transition-transform text-slate-300 ${open ? "rotate-180" : ""}`}
                            />
                        </div>

                        {open && (
                            <div className="absolute right-0 mt-7 w-56 bg-black/90 backdrop-blur-lg border border-white/20 rounded-2xl shadow-lg p-3 space-y-2 z-50">

                                <a href="/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-slate-200 hover:bg-white/10">
                                    <User size={16} strokeWidth={3} />
                                    My Profile
                                </a>

                                <a href="/forgot" className="flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-slate-200 hover:bg-white/10">
                                    <Lock size={16} strokeWidth={3} />
                                    Change Password
                                </a>

                                <button 
                                    onClick={handleLogout} 
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-red-400 hover:bg-red-500/10 text-left"
                                >
                                    <LogOut size={16} strokeWidth={3} />
                                    Log Out
                                </button>

                            </div>
                        )}
                    </div>
                )}

            </header>
        </>
    );
};

export default Header;