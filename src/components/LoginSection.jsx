import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { loginCards } from "../data/dummyData";

const floatTransition = (duration) => ({
  duration,
  repeat: Infinity,
  repeatType: "mirror",
  ease: "easeInOut",
});

const loginRoutes = {
  "Citizen Login": "/login/citizen",
  "Contractor Login": "/login/contractor",
  "Officer Login": "/login/admin",
};

const LoginSection = () => {
  return (
    <section id="login" className="relative overflow-hidden bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{ x: [0, 20, -14], y: [0, -18, 12] }}
          transition={floatTransition(14)}
          className="absolute left-[8%] top-16 h-44 w-44 rounded-full bg-blue-200/20 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -16, 18], y: [0, 22, -10] }}
          transition={floatTransition(16)}
          className="absolute right-[10%] top-20 h-56 w-56 rounded-full bg-emerald-100/30 blur-3xl"
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
            <p className="section-eyebrow">Secure Access</p>
            <h2 className="section-title">
              Dedicated login paths for every civic stakeholder
            </h2>
          </div>
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <p className="section-copy">
              Access the municipal ecosystem through role-based portals designed
              for residents, contractors, and administrative teams.
            </p>
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={floatTransition(6.5)}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.45)]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Role-based experience
            </motion.div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {loginCards.map((card, index) => {
            const Icon = card.icon;
            const route = loginRoutes[card.title];
            const Action = route ? Link : "button";
            const actionProps = route ? { to: route } : { type: "button" };

            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: index * 0.08, duration: 0.45 }}
                whileHover={{ y: -10, scale: 1.01 }}
                className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50/90 p-6 shadow-[0_20px_60px_-30px_rgba(37,99,235,0.35)] backdrop-blur-sm"
              >
                <motion.div
                  animate={{ x: ["-120%", "140%"] }}
                  transition={{ duration: 4.8 + index, repeat: Infinity, ease: "linear", delay: index * 0.4 }}
                  className="absolute inset-y-0 left-0 w-24 -skew-x-12 bg-white/30 blur-xl"
                />
                <motion.div
                  animate={{ y: [-6, 6, -6] }}
                  transition={floatTransition(6 + index)}
                  className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg shadow-blue-200"
                >
                  <Icon className="h-6 w-6" />
                </motion.div>
                <h3 className="card-title mt-6">{card.title}</h3>
                <p className="mt-3 max-w-sm text-sm leading-7 text-slate-600">
                  {card.description}
                </p>
                <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }} className="mt-8 inline-flex">
                  <Action
                    {...actionProps}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Login
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </Action>
                </motion.div>
                <motion.div
                  animate={{ scaleX: [0.3, 1, 0.45], opacity: [0.55, 1, 0.6] }}
                  transition={{ duration: 3.6 + index, repeat: Infinity, ease: "easeInOut" }}
                  className="mt-6 h-1 origin-left rounded-full bg-gradient-to-r from-blue-500/80 via-cyan-300 to-transparent"
                />
              </motion.div>
            );
          })}
        </div>

        <motion.div
          id="services"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55 }}
          className="relative mt-10 overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-r from-blue-50 to-slate-50 p-6 shadow-sm sm:p-8"
        >
          <motion.div
            animate={{ x: ["-10%", "110%"] }}
            transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
            className="absolute inset-y-0 left-0 w-32 -skew-x-12 bg-white/30 blur-xl"
          />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">
                New User
              </p>
              <h3 className="card-title mt-2">Sign up for municipal digital services</h3>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/register/citizen"
                className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Citizen Registration
              </Link>
              <button
                type="button"
                className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
              >
                Contractor Registration
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LoginSection;
