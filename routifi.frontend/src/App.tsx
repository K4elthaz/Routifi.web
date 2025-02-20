import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { ToastProvider } from "./components/ui/toast";
import { Toaster } from "./components/ui/toaster";

import MobileLeads from "./pages/mobile-leads";
import Index from "./pages/landing-page";
import Login from "./pages/login";
import Signup from "./pages/register";
import AcceptInvite from "./pages/accept-invite-page";

import OrgnaizationParent from "./pages/org-layout-page";
import Dashboard from "./components/dashboard/dashboard-page";
import Leads from "./components/leads/leads-page";
import Users from "./components/users/users-page";
import Maps from "./components/maps/maps-page";
import Tags from "./components/tags/tags-page";
import Settings from "./components/settings/settings-page";

import AccountSettings from "./pages/account-settings";

function AppContent() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/mobile-leads" element={<MobileLeads />} />
        <Route path="/sign-in" element={<Login />} />
        <Route path="/sign-up" element={<Signup />} />
        <Route path="/app/invite/accept/:inviteId" element={<AcceptInvite />} />
        <Route path="/org/:slug" element={<OrgnaizationParent />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="users" element={<Users />} />
          <Route path="maps" element={<Maps />} />
          <Route path="tags" element={<Tags />} />
          <Route path="settings" element={<Settings />} />
          <Route path="account" element={<AccountSettings />} />
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <div className="content">
        <Router>
          <ToastProvider>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
              <AppContent />
              <Toaster />
            </ThemeProvider>
          </ToastProvider>
        </Router>
      </div>
    </main>
  );
}

export default App;
