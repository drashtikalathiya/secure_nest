import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./components/auth/LoginForm";
import SignupForm from "./components/auth/SignupForm";
import {
  ProtectedRoute,
  PublicRoute,
  SubscriptionRoute,
} from "./components/auth/AuthGuards";
import Subscription from "./pages/Subscription";
import Dashboard from "./pages/Dashboard";
import AuthLayout from "./components/layouts/AuthLayout";
import AppLayout from "./components/layouts/AppLayout";
import Members from "./pages/Members";
import Passwords from "./pages/Passwords";
import Contacts from "./pages/Contacts";
import Documents from "./pages/Documents";
import Finance from "./pages/Finance";
import Medical from "./pages/Medical";
import Settings from "./pages/Settings";
import { Toaster } from "react-hot-toast";
import AcceptInvitation from "./pages/AcceptInvitation";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          element={
            <PublicRoute>
              <AuthLayout />
            </PublicRoute>
          }
        >
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
        </Route>
        <Route
          path="/invite/accept"
          element={
            <PublicRoute>
              <AcceptInvitation />
            </PublicRoute>
          }
        />
        <Route
          path="/subscription"
          element={
            <SubscriptionRoute>
              <Subscription />
            </SubscriptionRoute>
          }
        />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/members" element={<Members />} />
          <Route path="/passwords" element={<Passwords />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/medical" element={<Medical />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
