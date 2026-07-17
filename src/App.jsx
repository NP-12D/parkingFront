import { useState, useEffect } from "react";
import Auth from "./components/Auth";
import Navbar from "./components/Navbar";
import ParkingDashboard from "./components/ParkingDashboard";
import API from "./services/api";
import getUserFromToken from "./utilis/auth";
import MyCars from "./components/MyCars";
import ParkingHistory from "./components/ParkingHistory";
import AdminDashboard from "./components/AdminDashboard";
import ForgotPassword from "./components/ForgotPassword"; // 👈 იმპორტი
import ResetPassword from "./components/ResetPassword";   // 👈 იმპორტი

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [authMode, setAuthMode] = useState("login"); // "login", "forgot", "reset"

  // URL-იდან ტოკენის შემოწმება (თუ მომხმარებელი ელფოსტის ბმულით შემოვიდა)
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get("token")) {
      setAuthMode("reset");
    }
  }, []);

  // მომხმარებლის მონაცემების (ბალანსის) განახლება ID-ით
  const fetchUserData = async () => {
    try {
      const tokenUser = getUserFromToken();
      const userId = tokenUser?.id || tokenUser?._id;

      if (userId) {
        const res = await API.get(`/users/${userId}`);
        const userData = res.data.user || res.data.data || res.data;
        setUser(userData);
      }
    } catch (err) {
      console.error("მონაცემების განახლება ვერ მოხერხდა", err);
    }
  };

  useEffect(() => {
    const tokenUser = getUserFromToken();
    if (tokenUser) {
      setUser(tokenUser);
      fetchUserData();
    }
  }, []);

  const handleLoginSuccess = () => {
    const tokenUser = getUserFromToken();
    setUser(tokenUser);
    fetchUserData();
    setActiveTab("dashboard");
    setAuthMode("login");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setAuthMode("login");
  };

  // 1. თუ მომხმარებელს აქვს ტოკენი URL-ში ან გადავიდა Reset Password-ზე
  if (authMode === "reset") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <ResetPassword onSuccess={() => setAuthMode("login")} />
      </div>
    );
  }

  // 2. თუ მომხმარებელი Forgot Password გვერდზეა
  if (authMode === "forgot") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <ForgotPassword onBackToLogin={() => setAuthMode("login")} />
      </div>
    );
  }

  // 3. თუ ავტორიზებული არ არის -> Auth (Login/Register)
  if (!user) {
    return (
      <Auth
        onLoginSuccess={handleLoginSuccess}
        onForgotPassword={() => setAuthMode("forgot")} // 👈 Auth კომპონენტში "დაგავიწყდა პაროლი?" ღილაკისთვის
      />
    );
  }

  // 4. ავტორიზებული მომხმარებლის ინტერფეისი
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === "dashboard" && (
          <ParkingDashboard onRefreshUser={fetchUserData} />
        )}

        {activeTab === "cars" && <MyCars />}

        {activeTab === "history" && <ParkingHistory />}

        {activeTab === "admin" && user?.role === "admin" && (
          <AdminDashboard />
        )}
      </main>
    </div>
  );
}