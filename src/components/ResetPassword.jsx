import { useState, useEffect } from "react";
import API from "../services/api";

export default function ResetPassword({ onSuccess }) {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // URL-იდან ტოკენის (Query Parameter) ამოღება (?token=...)
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const urlToken = queryParams.get("token") || queryParams.get("resetToken");
    
    if (urlToken) {
      setToken(urlToken);
    } else {
      setError("აღდგენის ტოკენი ვერ მოიძებნა ბმულში.");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("ტოკენი აკლია! გთხოვთ, თავიდან გახსნათ ელ-ფოსტის ბმული.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("პაროლები ერთმანეთს არ ემთხვევა!");
      return;
    }

    if (newPassword.length < 6) {
      setError("პაროლი უნდა შედგებოდეს მინიმუმ 6 სიმბოლოსგან.");
      return;
    }

    setLoading(true);

    try {
      // 👈 ვაგზავნით როგორც 'token', ასევე 'resetToken' და 'password' / 'newPassword'
      // რათა ბექენდის ნებისმიერ ვარიანტს მოერგოს
      const res = await API.post("/users/reset-password", {
        token,
        resetToken: token,
        password: newPassword,
        newPassword: newPassword,
      });

      setMessage(res.data.message || "პაროლი წარმატებით შეიცვალა!");

      // URL-იდან ?token=... პარამეტრის გასუფთავება
      window.history.replaceState({}, document.title, window.location.pathname);

      setTimeout(() => {
        if (typeof onSuccess === "function") {
          onSuccess();
        }
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "შეცდომა! პაროლის შეცვლა ვერ მოხერხდა."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">ახალი პაროლის დაყენება</h2>
        <p className="text-xs text-slate-400">
          შეიყვანეთ ახალი პაროლი თქვენი ანგარიშისთვის
        </p>
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
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            ახალი პაროლი
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            გაიმეორეთ ახალი პაროლი
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !token}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition font-bold rounded-xl text-white text-sm shadow-lg shadow-blue-600/20"
        >
          {loading ? "შენახვა..." : "პაროლის განახლება"}
        </button>
      </form>
    </div>
  );
}