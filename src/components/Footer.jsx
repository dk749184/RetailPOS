export default function Footer() {
  const links = {
    Company: ["About", "Services", "Portfolio", "Team"],
    Project: ["Scope of Work", "Week 1 Plan", "Week 2 Plan", "Deliverables"],
    Connect: ["Contact Us", "GitHub", "LinkedIn", "Twitter"],
  };

  const scrollTo = (id) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-[#07090f] border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <span className="text-white font-black text-sm">AI</span>
              </div>
              <div>
                <span className="text-white font-bold text-lg leading-none">AI Experts</span>
                <span className="block text-cyan-400 text-[10px] font-semibold tracking-widest uppercase">Labs</span>
              </div>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Building intelligent, high-performance web platforms powered by AI — from concept to deployment in 2 weeks.
            </p>
            <div className="flex gap-3">
              {["𝕏", "in", "⌥", "gh"].map((icon, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-slate-500 hover:text-white hover:border-violet-500/50 transition-all duration-300 cursor-pointer text-xs font-bold"
                >
                  {icon}
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-white font-bold text-sm mb-5 uppercase tracking-wider">{section}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => scrollTo(item.split(" ")[0])}
                      className="text-slate-500 hover:text-violet-400 text-sm transition-colors duration-300 text-left"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-sm">
            © 2025 AI Experts Labs. All rights reserved.
          </p>
          <div className="flex items-center gap-2 bg-white/3 border border-white/8 rounded-full px-4 py-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-slate-400 text-xs font-medium">Project Active — 2-Week Sprint</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
