import { useState, FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  /* redirect, если уже вошли */
  if (user) return <Navigate to="/dashboard" replace />;

  /* локальный стейт формы */
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);      // AuthContext сохранит токены
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Неверный логин или пароль");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-80 p-8 rounded-xl shadow space-y-4"
      >
        <h1 className="text-xl font-semibold text-center">Вход</h1>

        {error && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}

        <input
          type="text"
          placeholder="Логин"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="input"
          required
        />

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
          required
        />

        <button
          type="submit"
          className="btn w-full"
          disabled={!username || !password}
        >
          Войти
        </button>
      </form>
    </div>
  );
}
