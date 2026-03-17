import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import EventsSection from "../components/EventsSection";
import LoginSection from "../components/LoginSection";
import ProjectsCarousel from "../components/ProjectsCarousel";
import NewsSection from "../components/NewsSection";
import Footer from "../components/Footer";

const backdropFloat = (duration) => ({
  duration,
  repeat: Infinity,
  repeatType: "mirror",
  ease: "easeInOut",
});

const LandingPage = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.92),rgba(248,250,252,0.95))]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:90px_90px]" />
        <motion.div
          animate={{ x: [0, 50, -20], y: [0, -30, 15], scale: [1, 1.08, 0.98] }}
          transition={backdropFloat(20)}
          className="absolute left-[-10rem] top-[6rem] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.20),rgba(59,130,246,0.04)_52%,transparent_72%)] blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -45, 20], y: [0, 35, -10], scale: [1, 1.05, 1] }}
          transition={backdropFloat(24)}
          className="absolute right-[-8rem] top-[24rem] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.16),rgba(16,185,129,0.05)_48%,transparent_74%)] blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 28, -24], y: [0, -20, 12], scale: [1, 1.06, 0.97] }}
          transition={backdropFloat(22)}
          className="absolute bottom-[-8rem] left-[22%] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.14),rgba(37,99,235,0.04)_50%,transparent_74%)] blur-3xl"
        />
      </div>

      <div className="relative z-10">
        <Navbar />
        <main>
          
          <Hero />
           <LoginSection />
          <EventsSection />
          <ProjectsCarousel />
          <NewsSection />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;
