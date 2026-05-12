import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Homepage/Home";
import DrivePreview from "./pages/Drive/DrivePreview";
import Assessment from "./pages/InterView/Assessment.jsx";

import PracticeSet from "./pages/Prcaticeset/PracticeSet.jsx";
import DomainSelectorPage from "./pages/Prcaticeset/DomainSelectorPage";
import FeedbackPanel from "./pages/LoginProfile/FeedbackPanel.jsx";
import ProfileDashboard from "./pages/LoginProfile/ProfileDashboard";
import AuthPage from "./pages/LoginProfile/AuthPage";
import ForgotPassword from "./pages/LoginProfile/ForgotPassword";
import "./App.css";
import SignUp from "./pages/SignUp/SignUp";



import { useAuth } from "./context/AuthContext.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Dash from "./pages/Dashboard/Dashboard.jsx";
import AuthCallback from "./pages/AuthCallback.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import Interview from "./pages/InterView/Interview.jsx";
import AdminDashboard2 from "./pages/Admin/AdminDashboard2.jsx";
import CandidatesPage from "./components/admin/sidebar/Candidatespage.jsx";
import AdminLoginPage from "./pages/Admin/AdminLoginPage.jsx";
import AdminDash from "./pages/AdminDash";
import UserProfileForm from "./pages/Registration/UserProfileForm.jsx";


function App() {
  const { isLoggedIn, loading } = useAuth();

  if (loading) return null;

  return (

    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          isLoggedIn ? <Navigate to="/dashboard" replace /> : <AuthPage />
        }
      />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route path="/" element={<Home />} />
      <Route path="/drive" element={<DrivePreview />} />
      <Route path="/assessment" element={<Assessment />} />
      <Route path="/domainselector" element={<DomainSelectorPage />} />
      <Route path="/dash" element={<Dash />} />
      {/* <Route path="/profile" element={<ProfileDashboard />} /> */}
      <Route path="/login" element={<AuthPage />} />
      <Route path="/forgot" element={<ForgotPassword />} />
      <Route path="/feedback" element={<FeedbackPanel />} />

      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/adminlogin" element={<AdminLoginPage />} />
      <Route path="/admindashboard" element={<AdminDash />} />

      <Route path="/admindash" element={<AdminDashboard2 />} />
      <Route path="/candidate" element={<CandidatesPage />} />

      <Route path="/interview" element={<Interview/>} />
      <Route path="/registration" element={<UserProfileForm />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route 
        path="/practiceset" 
        element={
          <ProtectedRoute>
            <PracticeSet />
          </ProtectedRoute>
        } 
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfileDashboard />
          </ProtectedRoute>
        }
      />


      {/* Default redirect */}
      <Route
        path="*"
        element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />}
      />

    </Routes>
  );
}

export default App;
