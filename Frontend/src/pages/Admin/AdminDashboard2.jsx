import React, { useState, useEffect } from "react";
import SoftBackdrop from "../../components/SoftBackdrop";
import LenisScroll from "../../components/lenis";

import Header from "../../components/admin/dashboard/Header";
import Sidebar from "../../components/admin/dashboard/Sidebar";
import GreetingSection from "../../components/admin/dashboard/GreetingSection";
import KPICards from "../../components/admin/dashboard/KPICards";
import KeyMetrics from "../../components/admin/dashboard/KeyMetrics";
import RecruitmentDrivesTable from "../../components/admin/dashboard/RecruitmentDrivesTable";
import ActivityFeed from "../../components/admin/dashboard/ActivityFeed";
import TrendsSection from "../../components/admin/dashboard/TrendsSection";
import SystemHealth from "../../components/admin/dashboard/SystemHealth";

import CandidatesPage from "../../components/admin/sidebar/Candidatespage";

const AdminDashboard2 = () => {
    const [activeTab, setActiveTab] =
        useState("dashboard");

    const [now, setNow] = useState(
        new Date()
    );

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <>
            <LenisScroll />

            <div className="fixed inset-0 -z-10">
                <SoftBackdrop />
            </div>

            <div className="relative min-h-screen flex flex-col bg-transparent">

                <Header now={now} />

                <div className="flex flex-1 pl-52">

                    <Sidebar
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />

                    <main className="flex-1 min-h-screen p-6 space-y-6">

                        {activeTab === "dashboard" && (
                            <>
                                <GreetingSection now={now} />

                                <KPICards />

                                <KeyMetrics />

                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

                                    <div className="xl:col-span-2">
                                        <RecruitmentDrivesTable />
                                    </div>

                                    <ActivityFeed />

                                </div>

                                <TrendsSection />

                                <SystemHealth />
                            </>
                        )}

                        {activeTab === "candidates" && (
                            <CandidatesPage />
                        )}

                    </main>
                </div>
            </div>
        </>
    );
};

export default AdminDashboard2;