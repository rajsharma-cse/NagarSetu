import { motion } from "framer-motion";
import { ArrowRight, Newspaper, Sparkles } from "lucide-react";
import { newsItems } from "../data/dummyData";

const floatTransition = (duration) => ({
  duration,
  repeat: Infinity,
  repeatType: "mirror",
  ease: "easeInOut",
});

const NewsSection = () => {
  return (
    <section id="news" className="relative overflow-hidden bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{ x: [0, 16, -10], y: [0, -14, 10] }}
          transition={floatTransition(14)}
          className="absolute right-[12%] top-14 h-48 w-48 rounded-full bg-blue-100/30 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -18, 14], y: [0, 18, -12] }}
          transition={floatTransition(16)}
          className="absolute left-[8%] bottom-10 h-52 w-52 rounded-full bg-cyan-100/25 blur-3xl"
        />
      </div>

      <div className="section-shell relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55 }}
          className="section-header"
        >
          <div>
            <p className="section-eyebrow">City Important News</p>
            <h2 className="section-title">
              Official updates and critical civic announcements
            </h2>
          </div>
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <p className="section-copy">
              Keep residents informed with verified municipal notices, infrastructure
              milestones, and service updates published by the corporation.
            </p>
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={floatTransition(6.8)}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.45)]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Verified notice feed
            </motion.div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 p-8 text-left text-white shadow-[0_20px_60px_-20px_rgba(37,99,235,0.45)]"
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.22, 0.32, 0.22] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-[-2rem] top-[-2rem] h-36 w-36 rounded-full bg-white/10 blur-2xl"
            />
            <motion.div
              animate={{ x: ["-15%", "115%"] }}
              transition={{ duration: 8.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-y-0 left-0 w-28 -skew-x-12 bg-white/10 blur-xl"
            />
            <div className="relative inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
              <Newspaper className="h-4 w-4" />
              Breaking Civic Update
            </div>
            <h3 className="relative font-display mt-6 max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              {newsItems[0].title}
            </h3>
            <p className="relative mt-4 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base sm:leading-8">
              {newsItems[0].description}
            </p>
            <div className="relative mt-6 flex flex-wrap items-center gap-3 text-sm text-blue-100">
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 font-medium">
                {newsItems[0].category}
              </span>
              <span>{newsItems[0].date}</span>
            </div>
            <motion.button
              type="button"
              whileHover={{ y: -3, x: 2 }}
              whileTap={{ scale: 0.98 }}
              className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-blue-700 transition"
            >
              Read Full Notice
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </motion.article>

          <div className="space-y-5">
            {newsItems.slice(1).map((item, index) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                whileHover={{ y: -6 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50/90 p-6 text-left shadow-sm backdrop-blur-sm transition hover:shadow-[0_18px_40px_-24px_rgba(37,99,235,0.28)]"
              >
                <motion.div
                  animate={{ opacity: [0.14, 0.26, 0.14] }}
                  transition={{ duration: 4 + index, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_38%)]"
                />
                <div className="relative flex items-center justify-between gap-4">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                    {item.category}
                  </span>
                  <span className="text-sm text-slate-500">{item.date}</span>
                </div>
                <h3 className="relative font-display mt-4 text-xl font-bold tracking-tight text-slate-950">
                  {item.title}
                </h3>
                <p className="relative mt-3 text-sm leading-7 text-slate-600">
                  {item.description}
                </p>
                <button
                  type="button"
                  className="relative mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-blue-700"
                >
                  Read more
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </button>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
