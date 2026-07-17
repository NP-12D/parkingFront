import { useState } from "react";
import API from "../services/api";

export default function Auth({ onLoginSuccess, onForgotPassword }) { // 👈 დაემატა onForgotPassword
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const switchTab = (toLogin) => {
    setIsLogin(toLogin);
    setError("");
    setMessage("");
    setFormData({ name: "", email: "", password: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (isLogin) {
        const res = await API.post("/users/login", {
          email: formData.email,
          password: formData.password,
        });

        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
          if (typeof onLoginSuccess === "function") {
            onLoginSuccess();
          }
        } else {
          setError("ბექენდმა ტოკენი არ დააბრუნა.");
        }
      } else {
        await API.post("/users", {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });

        setMessage("რეგისტრაცია წარმატებით დასრულდა! ახლა გაიარეთ ავტორიზაცია.");
        setIsLogin(true);
        setFormData({ name: "", email: "", password: "" });
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        (err.message === "Network Error"
          ? "ქსელის შეცდომა! შეამოწმეთ სერვერთან კავშირი."
          : "დაფიქსირდა შეცდომა");
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-block bg-blue-600 p-3 rounded-2xl text-2xl mb-1">🅿️</div>
          <h2 className="text-2xl font-bold text-white tracking-wide">ParkSpace</h2>
        </div>

        <div className="flex bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
          <button
            type="button"
            onClick={() => switchTab(true)}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${
              isLogin ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            შესვლა
          </button>
          <button
            type="button"
            onClick={() => switchTab(false)}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${
              !isLogin ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            რეგისტრაცია
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl text-center">
            {error}
          </div>
        )}
        {message && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">სახელი</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="გიორგი ბერიძე"
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">ელ-ფოსტა</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="user@example.com"
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-gray-400">პაროლი</label>
              
              {/* 👈 აი აქ დაემატა "დაგავიწყდა პაროლი?" ღილაკი */}
              {isLogin && onForgotPassword && (
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-xs text-blue-400 hover:text-blue-300 hover:underline transition"
                >
                  დაგავიწყდა პაროლი?
                </button>
              )}
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition font-bold rounded-xl text-white text-sm mt-2 shadow-lg shadow-blue-600/20"
          >
            {loading ? "მიმდინარეობს..." : isLogin ? "შესვლა" : "რეგისტრაცია"}
          </button>
        </form>
      </div>
    </div>
  );
}