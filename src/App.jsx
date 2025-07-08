// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import DashboardEmploye from "./pages/DashboardEmploye";
import DashboardAdmin from "./pages/DashboardAdmin";
import Bilan from "./pages/Bilan";
import "./index.css";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/employe" element={<DashboardEmploye />} />
        <Route path="/admin" element={<DashboardAdmin />} />
        <Route path="/bilan" element={<Bilan />} />
      </Routes>
    </Router>
  );
}

export default App;
