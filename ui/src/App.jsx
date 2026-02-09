import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./components/auth/LoginForm";
import SignupForm from "./components/auth/SignupForm";
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
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route
          path="/login"
          element={
            <AuthLayout>
              <LoginForm />
            </AuthLayout>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthLayout>
              <SignupForm />
            </AuthLayout>
          }
        />
        <Route path="/subscription" element={<Subscription />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/members" element={<Members />} />
          <Route path="/passwords" element={<Passwords />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/medical" element={<Medical />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
