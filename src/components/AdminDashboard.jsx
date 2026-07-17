import { useState, useEffect } from "react";
import API from "../services/api";

export default function AdminDashboard() {
  const [allParkings, setAllParkings] = useState([]);
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedZoneHistory, setSelectedZoneHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneAddress, setNewZoneAddress] = useState("");
  const [newZoneRate, setNewZoneRate] = useState("");
  const [isAddingZone, setIsAddingZone] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [parkingsRes, zonesRes] = await Promise.all([
        API.get("/parking/all"),
        API.get("/zones"),
      ]);
      setAllParkings(parkingsRes.data);
      setZones(zonesRes.data);
    } catch (err) {
      console.error("ადმინის მონაცემები ვერ ჩაიტვირთა", err);
    }
  };

  const fetchZoneHistory = async (zoneId) => {
    setSelectedZone(zoneId);
    setLoadingHistory(true);
    try {
      const res = await API.get(`/zones/${zoneId}/history`);
      setSelectedZoneHistory(res.data);
    } catch (err) {
      console.error("ზონის ისტორიის წამოღება ვერ მოხერხდა", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCreateZone = async (e) => {
    e.preventDefault();
    if (!newZoneName || !newZoneAddress || !newZoneRate) return;

    setIsAddingZone(true);
    try {
      await API.post("/zones", {
        name: newZoneName,
        address: newZoneAddress,
        hourlyRate: Number(newZoneRate),
      });

      setNewZoneName("");
      setNewZoneAddress("");
      setNewZoneRate("");

      loadAdminData();
    } catch (err) {
      alert(err.response?.data?.message || "შეცდომა ზონის დამატებისას");
    } finally {
      setIsAddingZone(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h2 className="text-2xl font-bold text-white">ადმინისტრატორის პანელი</h2>

      {/* ➕ ახალი ზონის დამატების ფორმა */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
        <h3 className="text-lg font-bold text-white">➕ ახალი ზონის დამატება</h3>
        <form
          onSubmit={handleCreateZone}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              ზონის სახელი
            </label>
            <input
              type="text"
              value={newZoneName}
              onChange={(e) => setNewZoneName(e.target.value)}
              placeholder="მაგ: Zone A"
              required
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">მისამართი</label>
            <input
              type="text"
              value={newZoneAddress}
              onChange={(e) => setNewZoneAddress(e.target.value)}
              placeholder="მაგ: რუსთაველის გამზ. N12"
              required
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">
              ტარიფი (₾ / სთ)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={newZoneRate}
              onChange={(e) => setNewZoneRate(e.target.value)}
              placeholder="2.5"
              required
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 text-sm"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isAddingZone}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 font-bold rounded-xl text-white transition disabled:opacity-50 text-sm"
            >
              {isAddingZone ? "ემატება..." : "ზონის დამატება"}
            </button>
          </div>
        </form>
      </div>

     
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-300">ზონების მონიტორინგი</h3>

        <div className="flex gap-3 overflow-x-auto pb-3 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-slate-900/60 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-purple-600">
          <button
            onClick={() => {
              setSelectedZone(null);
              setSelectedZoneHistory(null);
            }}
            className={`p-4 rounded-2xl transition text-left min-w-[160px] shrink-0 border ${
              selectedZone === null
                ? "bg-purple-600 border-purple-500 text-white font-bold"
                : "bg-slate-900 border-slate-800 text-gray-400 hover:border-slate-700"
            }`}
          >
            <h4 className="font-bold">ყველა ზონა</h4>
            <p className="text-xs opacity-80">სრული სია</p>
          </button>

          {zones.map((z) => (
            <button
              key={z._id}
              onClick={() => fetchZoneHistory(z._id)}
              className={`p-4 rounded-2xl transition text-left min-w-[220px] shrink-0 border ${
                selectedZone === z._id
                  ? "bg-purple-900/50 border-purple-500 text-white"
                  : "bg-slate-900 border-slate-800 text-gray-300 hover:border-purple-500/50"
              }`}
            >
              <h4 className="font-bold text-white">{z.name}</h4>
              <p className="text-xs text-gray-400 truncate">
                {z.address || "მისამართი არ არის"}
              </p>
              <p className="text-xs text-purple-400 font-semibold mt-1">
                {z.hourlyRate} ₾ / სთ
              </p>
            </button>
          ))}
        </div>
      </div>

      {selectedZoneHistory && (
        <div className="bg-slate-900 border border-purple-500/30 p-6 rounded-3xl space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold text-lg text-purple-400">
                ზონის სტატისტიკა:{" "}
                {selectedZoneHistory.zone?.name || selectedZoneHistory.name}
              </h4>
              <p className="text-sm text-gray-400">
                სულ პარკირება:{" "}
                <span className="font-bold text-white">
                  {selectedZoneHistory.totalParkings ||
                    selectedZoneHistory.history?.length ||
                    0}
                </span>
              </p>
            </div>
            {loadingHistory && (
              <span className="text-xs text-purple-400 animate-pulse">
                იტვირთება...
              </span>
            )}
          </div>

          {selectedZoneHistory.history &&
          selectedZoneHistory.history.length > 0 ? (
            <div className="overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-slate-900/60 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-purple-600">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-slate-800/80 text-gray-400 text-xs uppercase">
                  <tr>
                    <th className="p-3">მომხმარებელი</th>
                    <th className="p-3">ავტომობილი</th>
                    <th className="p-3">სტატუსი</th>
                    <th className="p-3 text-right">თანხა</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {selectedZoneHistory.history.map((item) => (
                    <tr key={item._id}>
                      <td className="p-3 text-white">
                        {item.owner?.name || item.owner?.email}
                      </td>
                      <td className="p-3">{item.car?.plateNumber}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            item.status === "active"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold text-white">
                        {item.totalCost} ₾
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-300">
          {selectedZone ? "ზონის ჩანაწერები" : "ყველა პარკირების ჩანაწერი"}
        </h3>
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-slate-900/60 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-purple-600">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-slate-800/50 text-gray-400 text-xs uppercase border-b border-slate-800">
                <tr>
                  <th className="p-4">მომხმარებელი</th>
                  <th className="p-4">ავტომობილი</th>
                  <th className="p-4">ზონა</th>
                  <th className="p-4">სტატუსი</th>
                  <th className="p-4 text-right">თანხა</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {allParkings
                  .filter(
                    (p) =>
                      !selectedZone ||
                      p.zone?._id === selectedZone ||
                      p.zone === selectedZone
                  )
                  .map((p) => (
                    <tr key={p._id}>
                      <td className="p-4 font-medium text-white">
                        {p.owner?.name || p.owner?.email}
                      </td>
                      <td className="p-4">
                        {p.car?.title} ({p.car?.plateNumber})
                      </td>
                      <td className="p-4">{p.zone?.name}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            p.status === "active"
                              ? "bg-green-500/10 text-green-400 border border-green-500/20"
                              : "bg-gray-500/10 text-gray-400"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold text-white">
                        {p.totalCost || 0} ₾
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}