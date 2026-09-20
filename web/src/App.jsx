import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { api, clearToken } from "./api.js";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import NewPatient from "./pages/NewPatient.jsx";
import Patient from "./pages/Patient.jsx";
import Report from "./pages/Report.jsx";
import OnePager from "./pages/OnePager.jsx";
import Import from "./pages/Import.jsx";
import Portal from "./pages/Portal.jsx";

const PUBLIC_PATHS = new Set(["/", "/login"]);

function TopBar({ label, sublabel, onSignOut }) {
  return (
    <header className="topbar no-print">
      <Link to="/" className="brand" style={{ color: "inherit", textDecoration: "none" }}>
        <span className="brand-mark">P</span>
        <span>
          Persist.health <span className="brand-sub">· {sublabel}</span>
        </span>
      </Link>
      <div className="topbar-right">
        <span>{label}</span>
        <button onClick={onSignOut}>Sign out</button>
      </div>
    </header>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const loadSession = useCallback(async () => {
    try {
      setSession(await api.get("/me"));
    } catch {
      setSession(null);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const signOut = async () => {
    await api.post("/auth/logout").catch(() => {});
    clearToken();
    setSession(null);
    navigate("/login");
  };

  if (checking) {
    return (
      <div className="login-wrap">
        <span className="spinner" />
      </div>
    );
  }

  // Signed out, the app is two public pages: the landing page at "/" and the
  // sign-in form. Anything else is a clinical route, so it goes to sign-in.
  if (!session) {
    if (!PUBLIC_PATHS.has(location.pathname)) return <Navigate to="/login" replace />;
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login onSignedIn={loadSession} />} />
      </Routes>
    );
  }

  // Patients get a separate, much smaller app — they never see the clinician
  // views, and the router simply doesn't define those routes for them.
  if (session.role === "patient") {
    return (
      <>
        <TopBar label={session.patient.name} sublabel="my tracking" onSignOut={signOut} />
        <Routes>
          <Route path="/" element={<Portal session={session} onRefresh={loadSession} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </>
    );
  }

  return (
    <>
      <TopBar label={session.doctor.name} sublabel="clinical decision support" onSignOut={signOut} />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/patients/new" element={<NewPatient />} />
        <Route path="/patients/:id" element={<Patient />} />
        <Route path="/import" element={<Import />} />
        <Route path="/reports/:id" element={<Report />} />
        <Route path="/reports/:id/one-pager" element={<OnePager />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
