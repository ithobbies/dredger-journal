import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { logout } = useAuth();

  return (
    <header className="bg-gray-800 text-white px-6 py-3 flex items-center gap-6">
      <h1 className="font-semibold text-lg mr-8">Dredger Journal</h1>

      <nav className="flex gap-4 flex-1">
        <Link className="hover:text-blue-300" to="/repairs">
          Ремонты
        </Link>
        <Link className="hover:text-blue-300" to="/repairs/new">
          + Новый ремонт
        </Link>
        <Link className="hover:text-blue-300" to="/deviations">
          Отклонения
        </Link>
        <Link className="hover:text-blue-300" to="/deviations/new">
          + Новое отклонение
        </Link>
        <Link className="hover:text-blue-300" to="/spare-parts">
          Запчасти
        </Link>
      </nav>

      <button
        onClick={logout}
        className="bg-red-600 hover:bg-red-700 py-1 px-3 rounded"
      >
        Выход
      </button>
    </header>
  );
}
