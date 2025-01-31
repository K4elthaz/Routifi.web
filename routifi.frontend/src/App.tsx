import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import MobileLeads from "./pages/mobile-leads";

function AppContent() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/mobile-leads" element={<MobileLeads />} />
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
          <AppContent />
        </Router>
      </div>
    </main>
  );
}

export default App;
