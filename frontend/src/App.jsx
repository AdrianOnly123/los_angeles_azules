import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Documentos from "./pages/Documentos";
import DocumentoDetalle from "./pages/DocumentoDetalle";

function App() {
  const token = localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas protegidas */}
        <Route
          path="/documentos"
          element={token ? <Documentos /> : <Navigate to="/login" />}
        />
        <Route
          path="/documentos/:id"
          element={token ? <DocumentoDetalle /> : <Navigate to="/login" />}
        />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/documentos" />} />
      </Routes>
    </Router>
  );
}

export default App;
