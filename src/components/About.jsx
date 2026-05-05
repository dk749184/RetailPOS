export default function About() {
  const scope = [
    { icon: "⚙️", title: "Project Setup", desc: "React + optimized folder structure for scalability and maintainability." },
    { icon: "🎨", title: "Navbar & Hero", desc: "Pixel-perfect navbar and hero section development with animations." },
    { icon: "📄", title: "Landing Sections", desc: "Multiple high-converting landing page sections with rich content." },
    { icon: "📱", title: "Responsive Design", desc: "Fully responsive across mobile, tablet, and desktop breakpoints." },
    { icon: "✨", title: "Animations", desc: "Smooth transitions and micro-interactions for a premium feel." },
    { icon: "📬", title: "Contact Form UI", desc: "Clean, accessible contact form with modern UI patterns." },
  ];

  return (
    <section id="about" className="py-24 bg-[#0d1224] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-violet-700/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-cyan-400 text-xs font-bold tracking-widest uppercase bg-cyan-400/10 border border-cyan-400/20 px-4 py-1.5 rounded-full">
            About This Project
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-6 mb-4">
            Scope of{" "}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Work
            </span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            A comprehensive plan covering every aspect of building a modern AI-focused web platform — delivered in 2 focused weeks.
          </p>
        </div>

        {/* Scope Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {scope.map((item, i) => (
            <div
              key={i}
              className="group bg-white/3 border border-white/8 rounded-2xl p-6 hover:border-violet-500/50 hover:bg-white/6 transition-all duration-500 hover:-translate-y-1 cursor-default"
            >
              <div className="text-3xl mb-4">{item.icon}</div>
              <h3 className="text-white font-bold text-lg mb-2 group-hover:text-violet-300 transition-colors duration-300">
                {item.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Timeline Strip */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              week: "Week 1",
              label: "Foundation",
              color: "from-violet-600 to-purple-600",
              glow: "shadow-violet-500/30",
              items: ["Complete layout structure", "Core sections developed", "Basic responsiveness"],
            },
            {
              week: "Week 2",
              label: "Polish & Launch",
              color: "from-cyan-500 to-blue-600",
              glow: "shadow-cyan-500/30",
              items: ["Animation implementation", "UI refinements", "Final responsive testing", "Deployment-ready build"],
            },
          ].map((w) => (
            <div
              key={w.week}
              className={`bg-gradient-to-br ${w.color}/10 border border-white/10 rounded-2xl p-8 relative overflow-hidden`}
            >
              <div className={`absolute top-4 right-4 w-16 h-16 bg-gradient-to-br ${w.color} rounded-xl flex flex-col items-center justify-center shadow-lg ${w.glow}`}>
                <span className="text-white text-[10px] font-bold">{w.week.split(" ")[0]}</span>
                <span className="text-white text-xl font-black">{w.week.split(" ")[1]}</span>
              </div>

              <span className={`inline-block text-xs font-bold tracking-widest uppercase bg-gradient-to-r ${w.color} bg-clip-text text-transparent mb-2`}>
                {w.week}
              </span>
              <h3 className="text-white text-2xl font-black mb-6">{w.label}</h3>

              <ul className="space-y-3">
                {w.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                    <span className={`w-5 h-5 rounded-full bg-gradient-to-br ${w.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
