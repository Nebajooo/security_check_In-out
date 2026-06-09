import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginScreen from "./pages/LoginScreen";
import DashboardScreen from "./pages/DashboardScreen";
import GuestCheckinScreen from "./pages/GuestCheckinScreen";
import GuestCheckoutScreen from "./pages/GuestCheckoutScreen";
import CompanyEquipmentOut from "./pages/CompanyEquipmentOut";
import CompanyEquipmentIn from "./pages/CompanyEquipmentIn";
import HistoryScreen from "./pages/HistoryScreen";
import AllInOutScreen from "./pages/AllInOutScreen";
import "./App.css";
import AdminExportPanel from "./components/AdminExportPanel";
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginScreen />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guest/checkin"
          element={
            <ProtectedRoute>
              <GuestCheckinScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guest/checkout"
          element={
            <ProtectedRoute>
              <GuestCheckoutScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/out"
          element={
            <ProtectedRoute>
              <CompanyEquipmentOut />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/in"
          element={
            <ProtectedRoute>
              <CompanyEquipmentIn />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/all"
          element={
            <ProtectedRoute>
              <AllInOutScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute>
              <AdminExportPanel />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
