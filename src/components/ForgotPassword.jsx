import { useState } from "react";
import API from "../services/api";

export default function ForgotPassword({ onBackToLogin }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await API.post("/users/forgot-password", { email });
      setMessage(res.data.message || "აღდგენის ბმული გაიგზავნა თქვენს ელფოსტაზე!");
      setEmail("");
    } catch (err) {
      setError(err.response?.data?.message || "შეცდომა მოთხოვნისას");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl space-y-6 text-white shadow-xl">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto text-xl">
          🔑
        </div>
        <h2 className="text-2xl font-bold">პაროლის აღდგენა</h2>
        <p className="text-xs text-gray-400">
          შეიყვანეთ ელფოსტა, რომელზეც გამოგიგზავნით აღდგენის ინსტრუქციას
        </p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-medium text-center">
          {message}
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-medium text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1 font-medium">
            ელფოსტა
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="example@gmail.com"
            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 font-bold rounded-xl text-white transition disabled:opacity-50 text-sm shadow-lg shadow-blue-600/20"
        >
          {loading ? "იგზავნება..." : "ინსტრუქციის გაგზავნა"}
        </button>
      </form>

      {onBackToLogin && (
        <button
          onClick={onBackToLogin}
          className="w-full text-xs text-gray-400 hover:text-white transition text-center block pt-2"
        >
          ← ავტორიზაციაზე დაბრუნება
        </button>
      )}
    </div>
  );
}