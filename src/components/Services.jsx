export default function Services() {
  const services = [
    {
      icon: "🤖",
      title: "AI Integration",
      desc: "Seamlessly embed AI models, chatbots, and automation into your web platform for intelligent user experiences.",
      tags: ["GPT-4", "LangChain", "APIs"],
    },
    {
      icon: "⚡",
      title: "React Development",
      desc: "Lightning-fast, component-driven React apps with modern hooks, state management, and best practices.",
      tags: ["React 19", "Vite", "Hooks"],
    },
    {
      icon: "🎨",
      title: "UI/UX Design",
      desc: "Pixel-perfect interfaces with Tailwind CSS, custom animations, and conversion-optimized layouts.",
      tags: ["Tailwind", "Figma", "Motion"],
    },
    {
      icon: "📱",
      title: "Responsive Design",
      desc: "Mobile-first, fully responsive layouts that look stunning on every device and screen size.",
      tags: ["Mobile-first", "CSS Grid", "Flex"],
    },
    {
      icon: "🚀",
      title: "Deployment",
      desc: "Production-ready builds deployed to Vercel, Netlify, or custom cloud infra with CI/CD pipelines.",
      tags: ["Vercel", "CI/CD", "Docker"],
    },
    {
      icon: "🛡️",
      title: "QA & Testing",
      desc: "Comprehensive testing — unit, integration, and E2E — ensuring a bug-free, stable product at launch.",
      tags: ["Jest", "Cypress", "Testing"],
    },
  ];

  return (
    <section id="services" className="py-24 bg-[#0d1224] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-700/8 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase bg-emerald-400/10 border border-emerald-400/20 px-4 py-1.5 rounded-full">
            What We Deliver
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-6 mb-4">
            Our{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Services
            </span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            End-to-end capabilities to take your AI web product from concept to production.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <div
              key={i}
              className="group relative bg-white/3 border border-white/8 rounded-2xl p-7 hover:border-violet-500/50 transition-all duration-500 hover:-translate-y-2 overflow-hidden cursor-default"
            >
              {/* Glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/0 to-cyan-600/0 group-hover:from-violet-600/5 group-hover:to-cyan-600/5 transition-all duration-500 rounded-2xl" />

              <div className="relative z-10">
                <div className="text-4xl mb-5">{s.icon}</div>
                <h3 className="text-white font-bold text-xl mb-3 group-hover:text-violet-300 transition-colors duration-300">
                  {s.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-5">{s.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {s.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-semibold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 group-hover:border-violet-500/30 group-hover:text-violet-300 transition-all duration-300"
                    >
                      {tag}
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
