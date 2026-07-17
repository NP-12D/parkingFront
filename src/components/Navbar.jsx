import { Wallet, LogOut, Car, History, LayoutDashboard, ShieldAlert } from "lucide-react";

export default function Navbar({ activeTab, setActiveTab, user, onLogout }) {
  const navItems = [
    { id: "dashboard", label: "მთავარი", icon: LayoutDashboard },
    { id: "cars", label: "მანქანები", icon: Car },
    { id: "history", label: "ისტორია", icon: History },
    ...(user?.role === "admin"
      ? [{ id: "admin", label: "ადმინი", icon: ShieldAlert, isAdmin: true }]
      : []),
  ];

  return (
    <nav className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 text-white px-4 sm:px-6 py-3.5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* ლოგო და ბალანსი (მობილურზე ერთ ხაზზე) */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveTab("dashboard")}
          >
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2.5 rounded-2xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <span className="text-xl">🅿️</span>
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              ParkSpace
            </span>
          </div>

          {/* ბალანსი მობილურისთვის (ჩანს მხოლოდ პატარა ეკრანებზე) */}
          <div className="md:hidden flex items-center gap-2">
            <BalanceBadge balance={user?.balance} />
          </div>
        </div>

        {/* ნავიგაციის ტაბები */}
        <div className="flex items-center space-x-1 sm:space-x-2 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800/80 w-full md:w-auto overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? item.isAdmin
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-semibold"
                      : "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* მარჯვენა მხარე: ბალანსი (დესკტოპზე) + გასვლის ღილაკი */}
        <div className="hidden md:flex items-center space-x-4">
          <BalanceBadge balance={user?.balance} />

          <button
            onClick={onLogout}
            title="გასვლა"
            className="flex items-center gap-2 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-3.5 py-2.5 rounded-xl transition duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>გასვლა</span>
          </button>
        </div>

      </div>
    </nav>
  );
}

// 💳 ბალანსის ცალკეული სტილიზებული კომპონენტი
function BalanceBadge({ balance = 0 }) {
  return (
    <div className="relative group overflow-hidden bg-slate-950/80 border border-emerald-500/30 hover:border-emerald-500/50 px-3.5 py-1.5 sm:py-2 rounded-xl transition-all duration-300">
      <div className="absolute -inset-1 bg-emerald-500/10 rounded-xl blur-sm group-hover:bg-emerald-500/20 transition duration-300"></div>
      <div className="relative flex items-center gap-2.5">
        <div className="p-1.5 bg-emerald-500/15 text-emerald-400 rounded-lg">
          <Wallet className="w-4 h-4" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 leading-none mb-0.5">
            ბალანსი
          </span>
          <span className="font-bold text-emerald-400 text-sm leading-none">
            {balance} <span className="text-xs font-normal">₾</span>
          </span>
        </div>
      </div>
    </div>
  );
}