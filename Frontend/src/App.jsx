import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Homepage/Home";
import DrivePreview from "./pages/Drive/DrivePreview";
import InterviewPanel from "./pages/InterView/InterviewPanel";

import PythonPracticeApp from "./pages/Prcaticeset/PythonPracticeApp";
import DomainSelectorPage from "./pages/Prcaticeset/DomainSelectorPage";
import PracticeSetPage from "./pages/Prcaticeset/PracticeSetPage";
// import Dashboard from "./pages/Dashboard/Dashboard";
import ProfileDashboard from "./pages/LoginProfile/ProfileDashboard";
import AuthPage from "./pages/LoginProfile/AuthPage";
import ForgotPassword from "./pages/LoginProfile/ForgotPassword";
import "./App.css";

// import PythonPracticeApp from './pages/Prcaticeset/PythonPracticeApp';
// import DomainSelectorPage from './pages/Prcaticeset/DomainSelectorPage';
// import PracticeSetPage from './pages/Prcaticeset/PracticeSetPage';
// import Dashboard from "./pages/Dashboard/Dashboard";
// import './App.css';
import SignUp from "./pages/SignUp/SignUp";



import { useAuth } from "./context/AuthContext.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AuthCallback from "./pages/AuthCallback.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";

function App() {
  const { isLoggedIn, loading } = useAuth();

  if (loading) return null; // wait for auth check before rendering routes

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
      <Route path="/interviewPanel" element={<InterviewPanel />} />
      <Route path="/domainselector" element={<DomainSelectorPage />} />
      {/* <Route path="/dashboard" element={<Dashboard />} /> */}
      <Route path="/profile" element={<ProfileDashboard />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/forgot" element={<ForgotPassword />} />

      <Route path="/admin" element={<AdminDashboard />} />

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
            <PythonPracticeApp />
          </ProtectedRoute>
        } 
      />


      {/* Default redirect */}
      <Route
        path="*"
        element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />}
      />

    </Routes>

    // <BrowserRouter>
    //   <Routes>
    //     <Route path="/" element={<Home />} />
    //     <Route path="/drive_name" element={<DrivePreview />} />
    //     <Route path="/interviewPanel" element={<InterviewPanel />} />
    //     <Route path="/practiceset" element={<PythonPracticeApp />} />
    //     <Route path="/domainselector" element={<DomainSelectorPage />} />
    //     <Route path="/dashboard" element={<Dashboard />} />
    //     <Route path="/signup" element={<SignUp />} />
    //   </Routes>
    // </BrowserRouter>

  );
}

export default App;
