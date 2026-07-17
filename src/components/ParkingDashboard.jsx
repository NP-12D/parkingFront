import { useState, useEffect } from "react";
import API from "../services/api";

export default function ParkingDashboard({ onRefreshUser }) {
  const [cars, setCars] = useState([]);
  const [zones, setZones] = useState([]);
  const [activeParking, setActiveParking] = useState(null);
  const [selectedCar, setSelectedCar] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [carsRes, zonesRes, historyRes] = await Promise.all([
        API.get("/cars"),
        API.get("/zones"),
        API.get("/parking/history"),
      ]);

      setCars(carsRes.data);
      setZones(zonesRes.data);

      const active = historyRes.data.find((p) => p.status === "active");
      
      // თუ ბექენდში სესია აღარ არის აქტიური (მაგ: cron-მა გააჩერა), ფრონტენდზეც გავათიშინოთ
      if (!active && activeParking) {
        setSuccess("პარკირების სესია დასრულდა (ბალანსი ამოიწურა).");
      }
      
      setActiveParking(active || null);
    } catch (err) {
      console.error("მონაცემების ჩატვირთვა ვერ მოხერხდა", err);
    }
  };

  // 🔄 1. პერიოდული შემოწმება (Polling): ყოველ 10 წამში ამოწმებს ბექენდის სტატუსს
  useEffect(() => {
    let checkInterval = null;

    if (activeParking) {
      checkInterval = setInterval(() => {
        loadDashboardData();
        if (onRefreshUser) onRefreshUser(); // ბალანსის განახლება ნავბარში
      }, 10000); // 10000ms = 10 წამი
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [activeParking]);

  // ⏱️ 2. წამმზომის ტაიმერი (1 წამიანი ინტერვალით)
  useEffect(() => {
    let interval = null;
    if (activeParking) {
      const startTime = new Date(activeParking.startedAt).getTime();
      
      const initialNow = new Date().getTime();
      setElapsedSeconds(Math.floor((initialNow - startTime) / 1000));

      interval = setInterval(() => {
        const now = new Date().getTime();
        setElapsedSeconds(Math.floor((now - startTime) / 1000));
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [activeParking]);

  const handleStartParking = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await API.post("/parking/start", {
        carId: selectedCar,
        zoneId: selectedZone,
      });

      setActiveParking(res.data.data || res.data);
      setSuccess("პარკირება წარმატებით დაიწყო!");
      setSelectedCar("");
      setSelectedZone("");

      if (onRefreshUser) onRefreshUser();
      loadDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || "შეცდომა პარკირების დაწყებისას");
    } finally {
      setLoading(false);
    }
  };

  const handleStopParking = async () => {
    if (!activeParking) return;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await API.post(`/parking/stop/${activeParking._id}`);
      setSuccess(`პარკირება დასრულდა! სულ ჩამოიჭრა: ${res.data.totalCost || 0} ₾`);
      setActiveParking(null);

      if (onRefreshUser) onRefreshUser();
    } catch (err) {
      setError(err.response?.data?.message || "შეცდომა პარკირების დასრულებისას");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (totalSec) => {
    if (totalSec < 0) totalSec = 0;
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl text-sm">
          {success}
        </div>
      )}

      {activeParking ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold rounded-full animate-pulse">
            <span className="w-2 h-2 rounded-full bg-green-400"></span> პარკირება მიმდინარეობს
          </span>

          <div className="text-6xl font-mono font-extrabold text-blue-400 tracking-wider">
            {formatTime(elapsedSeconds)}
          </div>

          <div className="grid grid-cols-2 gap-4 text-left bg-slate-800/50 p-4 rounded-2xl border border-slate-800 text-sm">
            <div>
              <span className="text-gray-400 block text-xs">მანქანა</span>
              <span className="font-semibold text-white">
                {activeParking.car?.title || activeParking.car?.plateNumber || "არჩეული"}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-xs">ზონა</span>
              <span className="font-semibold text-white">
                {activeParking.zone?.name || "ზონა"}
              </span>
            </div>
          </div>

          <button
            onClick={handleStopParking}
            disabled={loading}
            className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 transition font-bold rounded-2xl text-white shadow-lg shadow-red-600/20"
          >
            {loading ? "სრულდება..." : "პარკირების დასრულება"}
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleStartParking}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-5 shadow-xl"
        >
          <h2 className="text-xl font-bold text-white mb-2">ახალი პარკირების დაწყება</h2>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">აირჩიე ავტომობილი</label>
            <select
              value={selectedCar}
              onChange={(e) => setSelectedCar(e.target.value)}
              required
              className="w-full p-3.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">-- აირჩიე მანქანა --</option>
              {cars.map((car) => (
                <option key={car._id} value={car._id}>
                  {car.title || car.model || "ავტომობილი"} ({car.plateNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">აირჩიე პარკირების ზონა</label>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              required
              className="w-full p-3.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">-- აირჩიე ზონა --</option>
              {zones.map((zone) => (
                <option key={zone._id} value={zone._id}>
                  {zone.name} — {zone.hourlyRate} ₾/სთ ({zone.address})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition font-bold rounded-2xl text-white shadow-lg shadow-blue-600/20 mt-4"
          >
            {loading ? "იწყება..." : "პარკირების დაწყება"}
          </button>
        </form>
      )}
    </div>
  );
}