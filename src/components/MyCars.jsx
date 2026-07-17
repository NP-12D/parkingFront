import { useState, useEffect } from "react";
import API from "../services/api";

export default function MyCars() {
  const [cars, setCars] = useState([]);
  const [title, setTitle] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [carType, setCarType] = useState("Sedan");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const res = await API.get("/cars");
      setCars(res.data);
    } catch (err) {
      console.error("მანქანების წამოღება ვერ მოხერხდა", err);
    }
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/cars", { title, plateNumber, carType });
      setTitle("");
      setPlateNumber("");
      fetchCars();
    } catch (err) {
      alert(err.response?.data?.message || "შეცდომა მანქანის დამატებისას");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCar = async (id) => {
    if (!window.confirm("ნამდვილად გსურთ მანქანის წაშლა?")) return;
    try {
      await API.delete(`/cars/${id}`);
      fetchCars();
    } catch (err) {
      alert(err.response?.data?.message || "შეცდომა წაშლისას");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <form onSubmit={handleAddCar} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 h-fit">
        <h3 className="text-lg font-bold text-white">მანქანის დამატება</h3>
        
        <div>
          <label className="block text-xs text-gray-400 mb-1">სახელი (მაგ: ჩემი BMW)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="BMW M5"
            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">სახელმწიფო ნომერი</label>
          <input
            type="text"
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value)}
            required
            placeholder="AA-123-AA"
            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white uppercase focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">ტიპი</label>
          <select
            value={carType}
            onChange={(e) => setCarType(e.target.value)}
            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
          >
            <option value="Sedan">სედანი</option>
            <option value="SUV">ჯიპი / SUV</option>
            <option value="Hatchback">ჰეჩბექი</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 font-bold rounded-xl text-white transition disabled:opacity-50"
        >
          {loading ? "ემატება..." : "დამატება"}
        </button>
      </form>

      <div className="md:col-span-2 space-y-4">
        <h3 className="text-lg font-bold text-white">ჩემი ავტომობილები</h3>
        {cars.length === 0 ? (
          <div className="p-8 border border-dashed border-slate-800 rounded-2xl text-center text-gray-500 text-sm">
            მანქანები არ არის დამატებული
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cars.map((car) => (
              <div key={car._id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex justify-between items-center group">
                <div>
                  <h4 className="font-bold text-white text-base">{car.title}</h4>
                  <p className="text-xs text-gray-400">{car.carType}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono px-3 py-1.5 rounded-lg font-bold text-sm">
                    {car.plateNumber}
                  </span>
                  <button
                    onClick={() => handleDeleteCar(car._id)}
                    className="text-gray-500 hover:text-red-400 transition text-sm p-1"
                    title="წაშლა"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}