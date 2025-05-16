import { FormEvent, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { Navigate } from "react-router-dom";

/**
 * Страница авторизации:
 *  – ввод логина/пароля
 *  – показ ошибки при 401
 *  – спиннер во время запроса
 */
export default function Login() {
  const { user, login } = useAuth();

  if (user) return <Navigate to="/repairs" replace />;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      // после login контекст перекинет нас на защищённый маршрут (/repairs)
    } catch {
      setError("Неверный логин или пароль");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-80 bg-white p-6 rounded-xl shadow"
      >
        <h1 className="text-2xl font-semibold mb-6 text-center">Вход</h1>

        {error && (
          <div className="mb-4 text-red-600 text-sm text-center">{error}</div>
        )}

        <label className="block">
          <span className="text-sm text-gray-600">Логин</span>
          <input
            className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>

        <label className="block mt-4">
          <span className="text-sm text-gray-600">Пароль</span>
          <input
            type="password"
            className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-60"
        >
          {loading ? "Входим…" : "Войти"}
        </button>
      </form>
    </div>
  );
}
