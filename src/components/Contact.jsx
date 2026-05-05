import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <section id="contact" className="py-24 bg-[#090d1a] relative overflow-hidden">
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-violet-700/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-cyan-700/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-cyan-400 text-xs font-bold tracking-widest uppercase bg-cyan-400/10 border border-cyan-400/20 px-4 py-1.5 rounded-full">
            Get In Touch
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-6 mb-4">
            Contact{" "}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Us
            </span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Ready to start your project? Send us a message and our team will get back to you within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          {/* Info Panel */}
          <div className="lg:col-span-2 space-y-6">
            {[
              {
                icon: "📍",
                title: "Location",
                val: "Remote — Worldwide",
              },
              {
                icon: "📧",
                title: "Email",
                val: "hello@aiexpertslabs.com",
              },
              {
                icon: "⏱️",
                title: "Response Time",
                val: "Within 24 hours",
              },
              {
                icon: "📅",
                title: "Project Timeline",
                val: "2 Weeks Delivery",
              },
            ].map((info, i) => (
              <div
                key={i}
                className="flex items-center gap-4 bg-white/3 border border-white/8 rounded-2xl p-5 hover:border-violet-500/40 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600/20 to-cyan-600/20 border border-white/10 flex items-center justify-center text-xl flex-shrink-0">
                  {info.icon}
                </div>
                <div>
                  <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{info.title}</div>
                  <div className="text-white font-semibold text-sm mt-0.5">{info.val}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-white/3 border border-white/8 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-violet-600/5 to-cyan-600/5 rounded-full blur-2xl" />

              {sent && (
                <div className="absolute inset-x-0 top-0 mx-8 mt-8 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3 z-10">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-emerald-400 text-sm font-semibold">Message sent successfully! We'll be in touch soon.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className={`relative z-10 space-y-5 ${sent ? "mt-16" : ""} transition-all duration-300`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-violet-500 focus:bg-violet-500/5 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-violet-500 focus:bg-violet-500/5 transition-all duration-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="Project Inquiry / Collaboration"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-violet-500 focus:bg-violet-500/5 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us about your project..."
                    rows={5}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-violet-500 focus:bg-violet-500/5 transition-all duration-300 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold py-4 rounded-xl hover:opacity-90 hover:scale-[1.02] transition-all duration-300 shadow-2xl shadow-violet-500/30 text-sm"
                >
                  Send Message →
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
