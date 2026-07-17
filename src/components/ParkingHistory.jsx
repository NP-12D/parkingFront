import { useState, useEffect } from "react";
import API from "../services/api";

export default function ParkingHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    API.get("/parking/history")
      .then((res) => setHistory(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h3 className="text-xl font-bold text-white">პარკირების ისტორია</h3>
      
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-slate-800/50 text-gray-400 text-xs uppercase border-b border-slate-800">
            <tr>
              <th className="p-4">ავტომობილი</th>
              <th className="p-4">ზონა</th>
              <th className="p-4">დაწყება</th>
              <th className="p-4">სტატუსი</th>
              <th className="p-4 text-right">ღირებულება</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {history.map((item) => (
              <tr key={item._id} className="hover:bg-slate-800/30 transition">
                <td className="p-4 font-semibold text-white">
                  {item.car?.title} <span className="text-xs text-gray-500 block">{item.car?.plateNumber}</span>
                </td>
                <td className="p-4">{item.zone?.name}</td>
                <td className="p-4 text-xs text-gray-400">
                  {new Date(item.startedAt).toLocaleString("ka-GE")}
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    item.status === "active" ? "bg-green-500/10 text-green-400" : "bg-gray-500/10 text-gray-400"
                  }`}>
                    {item.status === "active" ? "აქტიური" : "დასრულებული"}
                  </span>
                </td>
                <td className="p-4 text-right font-mono font-bold text-white">
                  {item.totalCost} ₾
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}