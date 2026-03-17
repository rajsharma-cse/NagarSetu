import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Menu, Sparkles, X } from "lucide-react";
import { navLinks } from "../data/dummyData";

const floatingTransition = (duration) => ({
  duration,
  repeat: Infinity,
  repeatType: "mirror",
  ease: "easeInOut",
});

const navContainer = {
  hidden: { opacity: 0, y: -18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.08,
    },
  },
};

const navItem = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (href) => {
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 px-2 pt-2 sm:px-3 lg:px-4">
      <motion.nav
        initial="hidden"
        animate="visible"
        variants={navContainer}
        className="relative mx-auto flex w-full items-center justify-between overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/70 px-3 py-3 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.38)] backdrop-blur-2xl sm:px-4 lg:px-5"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.75rem]">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.72),rgba(248,250,252,0.46))]" />
          <motion.div
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-[linear-gradient(90deg,rgba(37,99,235,0.08),rgba(14,165,233,0.06),rgba(16,185,129,0.08),rgba(37,99,235,0.08))] bg-[length:200%_100%]"
          />
          <motion.div
            animate={{ x: [0, 22, -10], y: [0, -12, 10], scale: [1, 1.08, 0.98] }}
            transition={floatingTransition(11)}
            className="absolute -left-8 top-0 h-24 w-24 rounded-full bg-blue-300/20 blur-2xl"
          />
          <motion.div
            animate={{ x: [0, -18, 8], y: [0, 14, -8], scale: [1, 1.06, 1] }}
            transition={floatingTransition(14)}
            className="absolute right-12 top-0 h-20 w-20 rounded-full bg-cyan-300/20 blur-2xl"
          />
          <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/70 to-transparent" />
        </div>

        <motion.button
          variants={navItem}
          type="button"
          onClick={() => handleNavClick("#home")}
          className="relative z-10 flex min-w-0 shrink-0 items-center gap-3 text-left sm:gap-4"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-6px] rounded-[1.4rem] bg-[conic-gradient(from_180deg,rgba(37,99,235,0.0),rgba(37,99,235,0.32),rgba(6,182,212,0.2),rgba(16,185,129,0.26),rgba(37,99,235,0.0))] blur-[2px]"
            />
            <div className="relative rounded-[1.3rem] bg-white/95 p-1.5 shadow-[0_16px_40px_-24px_rgba(37,99,235,0.55)]">
              <img
                src="/log.png"
                alt="NagaSetu logo"
                className="h-11 w-11 rounded-[1rem] object-cover sm:h-12 sm:w-12"
              />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-arial truncate text-[10px] font-bold uppercase tracking-[0.34em] text-blue-700 sm:text-[11px]">
                NagarSetu
              </p>
              <motion.span
                animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                className="hidden rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-700 sm:inline-flex"
              >
                Smart Gov
              </motion.span>
            </div>
            <p className="font-brand text-sm font-bold  text-blue-600 sm:text-[1.10rem] lg:text-[1.18rem]">
              Prayagraj Nagar Nigam
            </p>
          </div>
        </motion.button>

        <motion.div
          variants={navItem}
          className="relative z-10 mx-8 hidden flex-1 md:flex md:items-center"
        >
          <div className="flex w-full items-center justify-between rounded-full border border-slate-200/70 bg-white/72 px-3 py-1.5 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.25)] backdrop-blur-xl lg:px-4">
            {navLinks.map((link) => (
              <motion.button
                key={link.href}
                type="button"
                onClick={() => handleNavClick(link.href)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group relative overflow-hidden rounded-full px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors duration-300 hover:text-slate-950 lg:px-5"
              >
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-50 via-cyan-50 to-emerald-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-x-3 bottom-1.5 h-[3px] origin-left scale-x-0 rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 transition-transform duration-300 ease-out group-hover:scale-x-100"
                />
                <span className="relative z-10">{link.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={navItem}
          className="relative z-10 hidden shrink-0 md:flex md:items-center md:justify-end"
        >
          <motion.button
            type="button"
            onClick={() => handleNavClick("#login")}
            whileHover={{ y: -3, scale: 1.02, boxShadow: "0 22px 44px -18px rgba(37,99,235,0.5)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="group relative overflow-hidden rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_18px_40px_-20px_rgba(15,23,42,0.4)]"
          >
            <motion.span
              aria-hidden="true"
              animate={{ x: ["-120%", "180%"] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-y-0 left-0 w-14 -skew-x-12 bg-white/25 blur-md"
            />
            <span className="relative z-10 inline-flex items-center gap-2">
              Portal Login
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </motion.button>
        </motion.div>

        <motion.button
          variants={navItem}
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative z-10 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/90 text-slate-700 shadow-sm md:hidden"
          aria-label="Toggle navigation menu"
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isOpen ? "close" : "menu"}
              initial={{ opacity: 0, rotate: -12, scale: 0.85 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 12, scale: 0.85 }}
              transition={{ duration: 0.18 }}
              className="absolute"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </motion.nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.24 }}
            className="mx-auto mt-2 overflow-hidden rounded-[1.6rem] border border-white/70 bg-white/85 px-4 py-4 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.35)] backdrop-blur-2xl md:hidden"
          >
            <div className="mb-3 flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-700">
              <Sparkles className="h-3.5 w-3.5" />
              Quick navigation
            </div>
            <div className="space-y-2">
              {navLinks.map((link, index) => (
                <motion.button
                  key={link.href}
                  type="button"
                  onClick={() => handleNavClick(link.href)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="block w-full rounded-2xl bg-slate-50/80 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  {link.label}
                </motion.button>
              ))}
              <motion.button
                type="button"
                onClick={() => handleNavClick("#login")}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.24 }}
                className="mt-3 w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Portal Login
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
