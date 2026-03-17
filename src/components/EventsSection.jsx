import { motion } from "framer-motion";
import { ChevronRight, Mail, Phone, Shield, Sparkles } from "lucide-react";
import { events, officials } from "../data/dummyData";

const sectionFloat = (duration) => ({
  duration,
  repeat: Infinity,
  repeatType: "mirror",
  ease: "easeInOut",
});

const EventsSection = () => {
  return (
    <section id="events" className="relative overflow-hidden bg-slate-50 px-4 py-20 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{ x: [0, 18, -10], y: [0, -18, 12] }}
          transition={sectionFloat(13)}
          className="absolute left-[4%] top-24 h-44 w-44 rounded-full bg-blue-200/20 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -14, 12], y: [0, 20, -10] }}
          transition={sectionFloat(15)}
          className="absolute right-[6%] top-20 h-56 w-56 rounded-full bg-cyan-200/20 blur-3xl"
        />
        <motion.div
          animate={{ y: [-10, 12, -10], rotate: [0, 6, 0] }}
          transition={sectionFloat(11)}
          className="absolute right-[18%] top-44 h-16 w-16 rounded-[32%] bg-gradient-to-br from-blue-200/40 to-cyan-100/10 blur-xl"
        />
      </div>

      <div className="section-shell relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55 }}
          className="section-header"
        >
          <div>
            <p className="section-eyebrow">City Engagement</p>
            <h2 className="section-title">
              Events and key officials, organized for quick access
            </h2>
          </div>
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <p className="section-copy">
              Stay updated with upcoming civic programs while keeping important
              leadership contacts visible in one modern, responsive view.
            </p>
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={sectionFloat(6)}
              className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700 shadow-[0_16px_40px_-24px_rgba(37,99,235,0.4)] backdrop-blur-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Live civic snapshot
            </motion.div>
          </div>
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial={{ opacity: 0, y: -28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="relative rounded-[2rem] bg-white/90 p-6 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.18)] backdrop-blur-sm sm:p-8"
          >
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent" />
            <div className="mb-8 flex items-start justify-between gap-4">
              <div className="max-w-md">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">
                  Upcoming Events
                </p>
                <h3 className="card-title mt-2">Citizen participation calendar</h3>
              </div>
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={sectionFloat(7.5)}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"
              >
                <Shield className="h-5 w-5" />
              </motion.div>
            </div>

            <div className="space-y-5">
              {events.map((event, index) => {
                const Icon = event.icon;

                return (
                  <motion.div
                    key={event.title}
                    initial={{ opacity: 0, y: -12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -6, scale: 1.01 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08, duration: 0.32 }}
                    className="group relative rounded-[1.5rem] border border-slate-100 bg-slate-50/90 p-5 transition hover:border-blue-200 hover:bg-white hover:shadow-[0_18px_44px_-24px_rgba(37,99,235,0.3)]"
                  >
                    <div className="absolute left-[1.65rem] top-16 hidden h-[calc(100%-2rem)] w-px bg-gradient-to-b from-blue-200 to-transparent sm:block" />
                    <motion.div
                      animate={{ opacity: [0.18, 0.34, 0.18] }}
                      transition={{ duration: 3.4 + index, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 rounded-[1.5rem] bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_35%)]"
                    />
                    <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start">
                      <div className="flex items-start gap-4">
                        <motion.div
                          whileHover={{ rotate: -4, scale: 1.06 }}
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200"
                        >
                          <Icon className="h-5 w-5" />
                        </motion.div>
                        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 sm:hidden">
                          {event.date}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div className="max-w-md">
                            <h4 className="font-display text-lg font-bold tracking-tight text-slate-950">
                              {event.title}
                            </h4>
                            <p className="mt-2 text-sm leading-7 text-slate-600">
                              {event.description}
                            </p>
                          </div>
                          <span className="hidden rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 sm:inline-flex">
                            {event.date}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition group-hover:text-blue-700"
                        >
                          Read details
                          <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="relative rounded-[2rem] bg-white/90 p-6 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.18)] backdrop-blur-sm sm:p-8"
          >
            <div className="absolute right-6 top-6 h-24 w-24 rounded-full bg-blue-100/40 blur-2xl" />
            <div className="mb-8 flex items-start justify-between gap-4">
              <div className="max-w-md">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">
                  City Officials
                </p>
                <h3 className="card-title mt-2">Leadership at a glance</h3>
              </div>
              <div className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                Official Profiles
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {officials.map((official, index) => {
                const Icon = official.icon;

                return (
                  <motion.div
                    key={official.name}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ delay: index * 0.08, duration: 0.35 }}
                    whileHover={{ y: -8 }}
                    className="group overflow-hidden rounded-[1.75rem] border border-slate-100 bg-slate-50 shadow-sm"
                  >
                    <div className="relative h-52 overflow-hidden bg-slate-200">
                      <img
                        src={official.image}
                        alt={official.name}
                        className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
                    </div>
                    <div className="relative p-5 text-left">
                      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                        <Icon className="h-4 w-4" />
                        Incumbent
                      </div>
                      <h4 className="font-display text-lg font-bold tracking-tight text-slate-950">
                        {official.name}
                      </h4>
                      <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
                        {official.position}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{official.office}</p>
                      <div className="mt-4 space-y-2 text-sm text-slate-600">
                        <div className="flex items-start gap-2">
                          <Phone className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                          <span>{official.phone}</span>
                        </div>
                        <div className="flex items-start gap-2 break-all">
                          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                          <span>{official.email}</span>
                        </div>
                      </div>
                      <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                        {official.contactNote}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
