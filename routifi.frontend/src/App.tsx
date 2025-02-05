import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
// import Login from "./pages/login";
import MobileLeads from "./pages/mobile-leads";
import Index from "./pages/landing-page";
import Login from "./pages/login";
import Signup from "./pages/register";

function AppContent() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/mobile-leads" element={<MobileLeads />} />
        <Route path="/sign-in" element={<Login />} />
        <Route path="/sign-up" element={<Signup />} />
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
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <AppContent />
          </ThemeProvider>
        </Router>
      </div>
    </main>
  );
}

export default App;
