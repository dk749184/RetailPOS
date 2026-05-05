export default function Team() {
  const team = [
    {
      name: "Lead Dev",
      role: "Lead Developer",
      tasks: 5,
      desc: "Architects the project structure, handles core logic, portfolio and team sections, contact form UI, and overall technical leadership.",
      gradient: "from-violet-500 to-purple-600",
      skills: ["React", "Architecture", "API", "Git"],
      initials: "LD",
      days: ["Day 1", "Day 4", "Day 5"],
    },
    {
      name: "UI Dev",
      role: "UI Developer",
      tasks: 5,
      desc: "Crafts pixel-perfect components — Navbar, Hero, About, Services, and Footer — with attention to visual detail and UX flow.",
      gradient: "from-cyan-500 to-blue-600",
      skills: ["Tailwind", "CSS", "Figma", "Animations"],
      initials: "UI",
      days: ["Day 2", "Day 3", "Day 5"],
    },
    {
      name: "QA Eng",
      role: "QA Engineer",
      tasks: 1,
      desc: "Ensures responsive layout integrity across all devices, validates UI consistency, and prepares the build for deployment.",
      gradient: "from-emerald-500 to-teal-600",
      skills: ["Testing", "Responsive", "Cross-browser", "QA"],
      initials: "QA",
      days: ["Day 5"],
    },
  ];

  return (
    <section id="team" className="py-24 bg-[#0d1224] relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-700/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-yellow-400 text-xs font-bold tracking-widest uppercase bg-yellow-400/10 border border-yellow-400/20 px-4 py-1.5 rounded-full">
            The Team
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-6 mb-4">
            Meet the{" "}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Experts
            </span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Three specialized roles working in sync to deliver a flawless product on time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, i) => (
            <div
              key={i}
              className="group bg-white/3 border border-white/8 rounded-2xl p-8 hover:border-white/20 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
            >
              {/* Background glow */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${member.gradient} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity duration-500`} />

              <div className="relative z-10">
                {/* Avatar */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center shadow-xl mb-6`}>
                  <span className="text-white font-black text-xl">{member.initials}</span>
                </div>

                {/* Task badge */}
                <div className="absolute top-6 right-6">
                  <div className={`bg-gradient-to-r ${member.gradient} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg`}>
                    {member.tasks} Task{member.tasks > 1 ? "s" : ""}
                  </div>
                </div>

                <h3 className="text-white font-black text-xl mb-1">{member.name}</h3>
                <p className={`text-sm font-semibold bg-gradient-to-r ${member.gradient} bg-clip-text text-transparent mb-4`}>
                  {member.role}
                </p>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">{member.desc}</p>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {member.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs font-medium px-2.5 py-1 rounded-lg bg-white/5 border border-white/8 text-slate-400"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Active Days */}
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">Active Days</p>
                  <div className="flex flex-wrap gap-2">
                    {member.days.map((day) => (
                      <span
                        key={day}
                        className={`text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${member.gradient} text-white shadow-md`}
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
