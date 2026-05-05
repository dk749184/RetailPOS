import { useState } from "react";

const deliverables = [
  { id: 1, title: "React Project Setup", owner: "Lead Dev", day: "Day 1", week: 1, category: "Setup" },
  { id: 2, title: "Folder Architecture", owner: "Lead Dev", day: "Day 1", week: 1, category: "Setup" },
  { id: 3, title: "Navbar Component", owner: "UI Dev", day: "Day 2", week: 1, category: "UI" },
  { id: 4, title: "Hero Section", owner: "UI Dev", day: "Day 2", week: 1, category: "UI" },
  { id: 5, title: "About Section", owner: "UI Dev", day: "Day 3", week: 1, category: "UI" },
  { id: 6, title: "Services Section", owner: "UI Dev", day: "Day 3", week: 1, category: "UI" },
  { id: 7, title: "Portfolio Section", owner: "Lead Dev", day: "Day 4", week: 1, category: "UI" },
  { id: 8, title: "Team Section", owner: "Lead Dev", day: "Day 4", week: 1, category: "UI" },
  { id: 9, title: "Contact Form UI", owner: "Lead Dev", day: "Day 5", week: 1, category: "UI" },
  { id: 10, title: "Footer Component", owner: "UI Dev", day: "Day 5", week: 1, category: "UI" },
  { id: 11, title: "Basic Responsive Layout", owner: "QA Eng", day: "Day 5", week: 1, category: "QA" },
];

const ownerColors = {
  "Lead Dev": "from-violet-500 to-purple-600",
  "UI Dev": "from-cyan-500 to-blue-500",
  "QA Eng": "from-emerald-500 to-teal-500",
};

const categoryColors = {
  Setup: "bg-orange-400/10 text-orange-400 border-orange-400/20",
  UI: "bg-cyan-400/10 text-cyan-400 border-cyan-400/20",
  QA: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
};

export default function Plan() {
  const [filter, setFilter] = useState("All");

  const filters = ["All", "Lead Dev", "UI Dev", "QA Eng"];

  const filtered = filter === "All" ? deliverables : deliverables.filter((d) => d.owner === filter);

  return (
    <section id="plan" className="py-24 bg-[#090d1a] relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-700/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-violet-400 text-xs font-bold tracking-widest uppercase bg-violet-400/10 border border-violet-400/20 px-4 py-1.5 rounded-full">
            Execution Plan
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-6 mb-4">
            Deliverables{" "}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Roadmap
            </span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            11 structured deliverables across 5 days — clearly assigned, timed, and tracked.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 border ${
                filter === f
                  ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white border-transparent shadow-lg shadow-violet-500/30"
                  : "bg-white/5 border-white/10 text-slate-400 hover:border-violet-500/50 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/8 shadow-2xl shadow-black/50">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest w-12">#</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Deliverable</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Category</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Owner</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Timeline</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr
                  key={item.id}
                  className={`border-b border-white/5 transition-all duration-300 hover:bg-white/4 group ${
                    i % 2 === 0 ? "bg-white/2" : "bg-transparent"
                  }`}
                >
                  <td className="px-6 py-4">
                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center text-slate-400 text-sm font-bold group-hover:border-violet-500/40 transition-colors">
                      {item.id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white font-semibold text-sm group-hover:text-violet-300 transition-colors duration-300">
                      {item.title}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${categoryColors[item.category]}`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${ownerColors[item.owner]} flex-shrink-0`} />
                      <span className="text-slate-300 text-sm font-medium">{item.owner}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-400 text-sm font-medium bg-white/5 px-3 py-1 rounded-lg border border-white/8">
                      {item.day}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border-2 border-slate-600 bg-slate-800 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-sm bg-slate-600" />
                      </div>
                      <span className="text-slate-500 text-xs font-medium">Pending</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
          {[
            { owner: "Lead Dev", count: 5, color: "from-violet-500 to-purple-600", glow: "shadow-violet-500/20" },
            { owner: "UI Dev", count: 5, color: "from-cyan-500 to-blue-500", glow: "shadow-cyan-500/20" },
            { owner: "QA Eng", count: 1, color: "from-emerald-500 to-teal-500", glow: "shadow-emerald-500/20" },
          ].map((s) => (
            <div
              key={s.owner}
              className={`bg-gradient-to-br ${s.color}/10 border border-white/10 rounded-2xl p-6 flex items-center gap-4 shadow-lg ${s.glow}`}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg ${s.glow} flex-shrink-0`}>
                <span className="text-white text-xl font-black">{s.count}</span>
              </div>
              <div>
                <div className="text-white font-bold">{s.owner}</div>
                <div className="text-slate-400 text-sm">{s.count} Deliverable{s.count > 1 ? "s" : ""}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
