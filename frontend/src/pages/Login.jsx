import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/auth";
const API = import.meta.env.VITE_API || "http://localhost:3305/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const { token, user: loggedUser } = await login(email, password);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(loggedUser || {}));
      navigate("/documentos");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

return (
    <div className="page" style={{ maxWidth: 480 }}>
      <h1 className="h1">Iniciar sesión</h1>
      <div className="card-neon">
        {err && <div className="error">{err}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Email</label>
            <input
              className="input-neon"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <label>Contraseña</label>
            <input
              className="input-neon"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn-neon" type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="muted" style={{ marginTop: 14 }}>
          ¿No tienes cuenta?{" "}
          <Link className="link-neon" to="/register">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}