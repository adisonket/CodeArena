import React from "react";

import {
    LayoutDashboard,
    Users,
    Server,
    Trophy,
    ClipboardList,
    MonitorPlay,
    BarChart3,
    Settings,
    LogOut,
} from "lucide-react";

const navItems = [
    {
        id: "dashboard",
        Icon: LayoutDashboard,
        label: "Dashboard",
    },
    {
        id: "candidates",
        Icon: Users,
        label: "Candidates",
    },
    {
        id: "drives",
        Icon: Server,
        label: "Drives",
    },
    {
        id: "assessments",
        Icon: ClipboardList,
        label: "Assessments",
    },
    {
        id: "interviews",
        Icon: MonitorPlay,
        label: "Interviews",
    },
    {
        id: "results",
        Icon: Trophy,
        label: "Results",
    },
    {
        id: "analytics",
        Icon: BarChart3,
        label: "Analytics",
    },
    {
        id: "settings",
        Icon: Settings,
        label: "Settings",
    },
];

const Sidebar = ({
    activeTab,
    setActiveTab,
}) => {
    return (
        <aside
            className="fixed left-0 top-[73px] h-[calc(100vh-90px)] w-52 border-r border-white/5 flex flex-col py-5 px-3 gap-1 rounded-r-3xl z-40"
            style={{
                background:
                    "rgba(255,255,255,0.015)",
            }}
        >
            {navItems.map(
                ({ id, Icon, label }) => (
                    <button
                        key={id}
                        onClick={() =>
                            setActiveTab(id)
                        }
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all w-full text-left ${
                            activeTab === id
                                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold"
                                : "text-white/45 hover:text-white/80 hover:bg-white/5"
                        }`}
                    >
                        <Icon
                            size={15}
                            className="shrink-0"
                        />

                        <span className="text-[13px]">
                            {label}
                        </span>
                    </button>
                )
            )}

            <div className="mt-auto pt-4 border-t border-white/5">
                <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/35 hover:text-white/70 hover:bg-white/5 transition-all w-full text-left text-[13px]">
                    <LogOut size={15} />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;