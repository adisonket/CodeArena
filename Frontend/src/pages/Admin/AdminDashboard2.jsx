import React, { useState, useEffect } from "react";
import SoftBackdrop from "../../components/SoftBackdrop";

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
import AdminDrive from "../../components/admin/sidebar/AdminDrive";
import AdminAssessments from "../../components/admin/sidebar/AdminAssessments";
import AdminInterview from "../../components/admin/sidebar/AdminInterview";


const AdminDashboard2 = () => {

    const [activeTab, setActiveTab] = useState(() => {
        return localStorage.getItem("adminActiveTab") || "dashboard";
    });

    const [now, setNow] = useState(new Date());

    useEffect(() => {
        localStorage.setItem("adminActiveTab", activeTab);
    }, [activeTab]);

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <>


            <div className="fixed inset-0 -z-10">
                <SoftBackdrop />
            </div>

            {/* <div className="relative min-h-screen flex flex-col bg-transparent"> */}
            {/* <div className="relative h-screen flex flex-col bg-transparent overflow-hidden"> */}
            <div className="relative h-screen flex flex-col bg-transparent">

                <Header now={now} />

                {/* <div className="flex flex-1 pl-52"> */}
                <div className="flex flex-1 pl-52 overflow-hidden">

                    <Sidebar
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />

                    {/* <main className="flex-1 min-h-screen p-6 space-y-6"> */}
                    {/* <main className="flex-1 h-[calc(100vh-73px)] overflow-y-auto p-6 space-y-6"> */}
                    <main className="flex-1 h-[calc(100vh-73px)] overflow-y-scroll p-6 space-y-6">

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

                        {activeTab === "drives" && (
                            <AdminDrive />
                        )}

                        {activeTab === "assessments" && (
                            <AdminAssessments />
                        )}

                        {activeTab === "interviews" && (
                            <AdminInterview />
                        )}

                    </main>
                </div>
            </div>
        </>
    );
};

export default AdminDashboard2;