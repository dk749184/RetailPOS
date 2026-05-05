export default function Portfolio() {
  const projects = [
    {
      title: "AI Chat Platform",
      desc: "Real-time conversational AI interface with GPT-4 integration, streaming responses, and multi-session management.",
      tech: ["React", "OpenAI", "WebSocket"],
      gradient: "from-violet-600 to-purple-700",
      tag: "AI / Chat",
    },
    {
      title: "Analytics Dashboard",
      desc: "Data visualization dashboard with live charts, KPI tracking, and exportable reports for business intelligence.",
      tech: ["React", "Recharts", "REST API"],
      gradient: "from-cyan-600 to-blue-700",
      tag: "Dashboard",
    },
    {
      title: "E-Commerce Platform",
      desc: "Full-featured online store with product management, cart, checkout, and payment gateway integration.",
      tech: ["React", "Stripe", "Firebase"],
      gradient: "from-pink-600 to-rose-700",
      tag: "E-Commerce",
    },
    {
      title: "NLP Document Tool",
      desc: "Smart document summarization, keyword extraction, and sentiment analysis powered by transformer models.",
      tech: ["React", "Python", "HuggingFace"],
      gradient: "from-emerald-600 to-teal-700",
      tag: "NLP / AI",
    },
  ];

  return (
    <section id="portfolio" className="py-24 bg-[#090d1a] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-pink-700/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-pink-400 text-xs font-bold tracking-widest uppercase bg-pink-400/10 border border-pink-400/20 px-4 py-1.5 rounded-full">
            Our Work
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-6 mb-4">
            Featured{" "}
            <span className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
              Portfolio
            </span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Real-world projects built with precision, modern tech, and a focus on performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((p, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/3 hover:border-white/20 transition-all duration-500 hover:-translate-y-1 cursor-pointer"
            >
              {/* Color Bar */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${p.gradient}`} />

              <div className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${p.gradient} text-white mb-3 inline-block`}>
                      {p.tag}
                    </span>
                    <h3 className="text-white font-black text-2xl group-hover:text-violet-300 transition-colors duration-300">
                      {p.title}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-violet-500/20 group-hover:border-violet-500/50 transition-all duration-300 flex-shrink-0 ml-4">
                    <svg className="w-4 h-4 text-slate-400 group-hover:text-violet-400 -rotate-45 group-hover:rotate-0 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>

                <p className="text-slate-400 text-sm leading-relaxed mb-6">{p.desc}</p>

                <div className="flex flex-wrap gap-2">
                  {p.tech.map((t) => (
                    <span
                      key={t}
                      className="text-xs font-semibold px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
