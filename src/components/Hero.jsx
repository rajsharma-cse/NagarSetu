import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BellRing, MapPinned, Phone, Sparkles } from "lucide-react";
import StackCarousel from "../components/StackCarousel";
import { municipalDirectory, stackCarouselImages, wardDirectory } from "../data/dummyData";

const floatingTransition = (duration) => ({
  duration,
  repeat: Infinity,
  repeatType: "mirror",
  ease: "easeInOut",
});

const animatedGradientTransition = {
  duration: 16,
  repeat: Infinity,
  ease: "linear",
};

const heroContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
    },
  },
};

const heroItemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 140,
      damping: 20,
      mass: 0.9,
    },
  },
};

const logoSwapTransition = {
  type: "spring",
  stiffness: 120,
  damping: 14,
  duration: 0.6,
};

const headingPrefix = "Welcome to ";
const animatedWord = "Nagar-सेतु";
const TYPE_SPEED = 40;
const BACK_SPEED = 25;
const BACK_DELAY = 2000;

const prayagrajMapEmbed =
  "https://www.openstreetmap.org/export/embed.html?bbox=81.7600%2C25.3800%2C81.9300%2C25.5000&layer=mapnik&marker=25.4448%2C81.8432";
const prayagrajMapLink =
  "https://www.openstreetmap.org/?mlat=25.4448&mlon=81.8432#map=12/25.4448/81.8432";

const LogoSide = ({ src, alt, imageClassName = "" }) => (
  <div className="flex-1 rounded-2xl bg-white/80 p-6 shadow-lg backdrop-blur">
    <img
      src={src}
      alt={alt}
      className={`mx-auto h-[120px] w-[120px] object-contain ${imageClassName}`}
    />
  </div>
);

const LogoSwapPanel = () => {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFlipped((prev) => !prev);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full [perspective:1000px]">
      <motion.div
        initial={{ rotateY: 0, scale: 1, boxShadow: "0 18px 44px -26px rgba(15,23,42,0.16)" }}
        animate={{
          rotateY: flipped ? 180 : 0,
          scale: flipped ? 1.03 : 1,
          boxShadow: flipped
            ? "0 24px 52px -22px rgba(15,23,42,0.26)"
            : "0 18px 44px -26px rgba(15,23,42,0.16)",
        }}
        transition={logoSwapTransition}
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
        className="relative h-[176px] rounded-[1.75rem]"
      >
        <div
          style={{ backfaceVisibility: "hidden", transformStyle: "preserve-3d" }}
          className="absolute inset-0 flex items-center justify-center gap-4 sm:gap-6"
        >
          <LogoSide
            src="/log.png"
            alt="NagarSetu logo"
            imageClassName="rounded-[1.3rem] object-cover"
          />
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-500 text-xl font-black text-white shadow-[0_18px_40px_-18px_rgba(37,99,235,0.5)] sm:h-16 sm:w-16 sm:text-2xl">
            X
          </div>
          <LogoSide
            src="/gallery/prayagraj-nagar-nigam.png"
            alt="Prayagraj Nagar Nigam logo"
          />
        </div>

        <div
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            transformStyle: "preserve-3d",
          }}
          className="absolute inset-0 flex items-center justify-center gap-4 sm:gap-6"
        >
          <LogoSide
            src="/gallery/prayagraj-nagar-nigam.png"
            alt="Prayagraj Nagar Nigam logo"
          />
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-500 text-xl font-black text-white shadow-[0_18px_40px_-18px_rgba(37,99,235,0.5)] sm:h-16 sm:w-16 sm:text-2xl">
            X
          </div>
          <LogoSide
            src="/log.png"
            alt="NagarSetu logo"
            imageClassName="rounded-[1.3rem] object-cover"
          />
        </div>
      </motion.div>
    </div>
  );
};

const Hero = () => {
  const [prefixText, setPrefixText] = useState("");
  const [wordText, setWordText] = useState("");

  useEffect(() => {
    let index = 0;
    let timeoutId;

    const typePrefix = () => {
      setPrefixText(headingPrefix.slice(0, index + 1));
      index += 1;
      if (index < headingPrefix.length) {
        timeoutId = setTimeout(typePrefix, TYPE_SPEED);
      }
    };

    timeoutId = setTimeout(typePrefix, 60);
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (prefixText.length !== headingPrefix.length) {
      return undefined;
    }

    let timeoutId;
    let current = 0;
    let deleting = false;
    let cancelled = false;

    const tick = () => {
      if (cancelled) {
        return;
      }

      if (!deleting) {
        current += 1;
        setWordText(animatedWord.slice(0, current));

        if (current === animatedWord.length) {
          deleting = true;
          timeoutId = setTimeout(tick, BACK_DELAY);
        } else {
          timeoutId = setTimeout(tick, TYPE_SPEED);
        }
        return;
      }

      current -= 1;
      setWordText(animatedWord.slice(0, current));

      if (current === 0) {
        deleting = false;
        timeoutId = setTimeout(tick, TYPE_SPEED);
      } else {
        timeoutId = setTimeout(tick, BACK_SPEED);
      }
    };

    timeoutId = setTimeout(tick, 120);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [prefixText]);

  const scrollToSection = (selector) => {
    const target = document.querySelector(selector);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-[#f8fafc] px-4 pb-12 pt-8 sm:px-6 lg:px-8 lg:pb-16"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(37,99,235,0.14),transparent_26%),radial-gradient(circle_at_85%_18%,rgba(56,189,248,0.16),transparent_24%),radial-gradient(circle_at_78%_78%,rgba(16,185,129,0.14),transparent_25%),radial-gradient(circle_at_35%_72%,rgba(99,102,241,0.10),transparent_22%)]" />
        <motion.div
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={animatedGradientTransition}
          className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.7),rgba(255,255,255,0.15))] bg-[length:200%_200%]"
        />

        <motion.div
          animate={{ x: [0, 30, -10], y: [0, -20, 10], scale: [1, 1.08, 0.98] }}
          transition={floatingTransition(18)}
          className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(96,165,250,0.7),rgba(37,99,235,0.18)_48%,transparent_72%)] blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -24, 12], y: [0, 18, -14], scale: [1, 1.05, 1] }}
          transition={floatingTransition(20)}
          className="absolute right-[-4rem] top-[-2rem] h-80 w-80 rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(45,212,191,0.6),rgba(14,165,233,0.18)_52%,transparent_74%)] blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 18, -18], y: [0, -14, 20], scale: [1, 1.12, 0.96] }}
          transition={floatingTransition(22)}
          className="absolute bottom-[-6rem] left-[28%] h-80 w-80 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.28),rgba(16,185,129,0.20)_50%,transparent_72%)] blur-3xl"
        />

        <motion.div
          animate={{ rotateX: [0, 16, 0], rotateY: [0, -14, 0], y: [-10, 10, -10] }}
          transition={floatingTransition(10)}
          className="absolute right-[9%] top-[16%] h-28 w-28 rounded-[2rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.34),rgba(59,130,246,0.12))] shadow-[0_30px_60px_-30px_rgba(37,99,235,0.28)] backdrop-blur-md"
        />
        <motion.div
          animate={{ rotateX: [0, -14, 0], rotateY: [0, 18, 0], y: [12, -10, 12] }}
          transition={floatingTransition(11.5)}
          className="absolute right-[22%] top-[34%] h-20 w-20 rounded-[1.6rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.3),rgba(34,211,238,0.16))] shadow-[0_24px_50px_-26px_rgba(14,165,233,0.28)] backdrop-blur-md"
        />
        <motion.div
          animate={{ rotateX: [0, 14, 0], rotateY: [0, 12, 0], y: [-8, 12, -8] }}
          transition={floatingTransition(12.5)}
          className="absolute right-[7%] top-[48%] h-32 w-32 rounded-[2.2rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.28),rgba(16,185,129,0.16))] shadow-[0_30px_60px_-30px_rgba(16,185,129,0.24)] backdrop-blur-md"
        />
        <motion.div
          animate={{ y: [-10, 10, -10], rotate: [0, 8, 0] }}
          transition={floatingTransition(8)}
          className="absolute right-[16%] top-[26%] h-16 w-16 rounded-[40%] bg-[linear-gradient(135deg,rgba(37,99,235,0.10),rgba(6,182,212,0.16))] blur-xl"
        />
        <motion.div
          animate={{ y: [10, -8, 10], rotate: [0, -6, 0] }}
          transition={floatingTransition(9.5)}
          className="absolute right-[28%] top-[58%] h-14 w-14 rounded-[38%] bg-[linear-gradient(135deg,rgba(16,185,129,0.12),rgba(59,130,246,0.12))] blur-xl"
        />
        <motion.div
          animate={{ rotate: [0, 180, 360], scale: [1, 1.08, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
          className="absolute left-[10%] top-[14%] h-40 w-40 rounded-full border border-blue-200/40"
        />
      </div>

      <div className="section-shell relative">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)] lg:items-center xl:gap-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={heroContainerVariants}
            className="text-center lg:text-left"
          >
            <motion.div
              variants={heroItemVariants}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-blue-700 shadow-[0_8px_30px_rgba(37,99,235,0.08)] backdrop-blur-sm"
            >
              <Sparkles className="h-4 w-4" />
              Trusted civic services platform
            </motion.div>
            <motion.div variants={heroItemVariants} className="relative max-w-[42rem]">
              <div className="absolute -left-4 top-3 hidden h-20 w-20 rounded-full bg-blue-200/30 blur-2xl lg:block" />
              <h1 className="font-hero relative text-[1.72rem] font-normal leading-[1.2] sm:text-[2.08rem] lg:text-[2.5rem] xl:text-[2.78rem]">
                <span className="bg-[linear-gradient(135deg,#0f172a_0%,#1e40af_38%,#0891b2_74%,#059669_100%)] bg-clip-text text-transparent drop-shadow-[0_8px_32px_rgba(37,99,235,0.12)]">
                  {prefixText}
                </span>
                <span className="relative inline-block min-w-[6.6ch] overflow-visible pt-[0.16em] pr-[0.14em] align-top">
                  <span className="invisible bg-[linear-gradient(135deg,#0f172a_0%,#1e40af_38%,#0891b2_74%,#059669_100%)] bg-clip-text text-transparent">
                    {animatedWord}
                  </span>
                  <span className="absolute inset-0 whitespace-nowrap overflow-visible bg-[linear-gradient(135deg,#0f172a_0%,#1e40af_38%,#0891b2_74%,#059669_100%)] bg-clip-text text-transparent">
                    {wordText}
                  </span>
                </span>
              </h1>
            </motion.div>
            <motion.p
              variants={heroItemVariants}
              className="mt-5 max-w-2xl text-base font-medium leading-8 text-slate-600 sm:text-lg sm:leading-9 lg:max-w-3xl"
            >
              AI powered municipal services platform
            </motion.p>

            <motion.div
              variants={heroItemVariants}
              className="mt-8 flex flex-col gap-3 sm:flex-row lg:justify-start"
            >
              <motion.button
                type="button"
                onClick={() => scrollToSection("#services")}
                whileHover={{
                  scale: 1.02,
                  y: -3,
                  boxShadow: "0 22px 36px rgba(37,99,235,0.28)",
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 320, damping: 18 }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Explore Services
                <motion.span
                  aria-hidden="true"
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 320, damping: 20 }}
                  className="inline-flex"
                >
                  <ArrowRight className="h-4 w-4" />
                </motion.span>
              </motion.button>
              <button
                type="button"
                onClick={() => scrollToSection("#news")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white/80 px-6 py-3 text-sm font-semibold text-slate-700 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-sm transition hover:text-blue-700"
              >
                Latest Updates
                <BellRing className="h-4 w-4" />
              </button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 26, y: 16 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="relative mx-auto w-full max-w-[27rem] lg:justify-self-end"
          >
            <LogoSwapPanel />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.08 }}
          className="mx-auto mt-6 max-w-5xl overflow-hidden rounded-[1.5rem] bg-white/72 shadow-[0_18px_44px_-26px_rgba(15,23,42,0.16)] backdrop-blur-md"
        >
          <StackCarousel images={stackCarouselImages} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.14 }}
          className="mt-8 rounded-[2rem] bg-white/72 p-6 shadow-[0_24px_70px_-28px_rgba(37,99,235,0.2)] backdrop-blur-md sm:p-8"
        >
          <div className="flex flex-col gap-4 pb-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">
                Prayagraj Nagar Nigam Wards
              </p>
              <h2 className="font-display mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Ward directory and parshad contacts
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                A basic, practical ward information panel with publicly listed
                ward names, councilors, contact details, and city map context.
              </p>
            </div>
            <div className="rounded-full bg-blue-50/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 backdrop-blur-sm">
              Official public info
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2 lg:items-start">
            <div className="flex h-full flex-col rounded-[1.5rem] bg-slate-50/80 p-5 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-100">
                  <MapPinned className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
                    Main office
                  </p>
                  <h3 className="font-display mt-1 text-lg font-bold tracking-tight text-slate-950">
                    Prayagraj Municipal Corporation
                  </h3>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {municipalDirectory.office}
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Phone className="h-4 w-4 text-blue-700" />
                {municipalDirectory.phone}
              </div>
              <p className="mt-2 text-sm text-slate-600">{municipalDirectory.email}</p>

              <div className="mt-5 overflow-hidden rounded-[1.5rem] bg-white shadow-sm">
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
                    Prayagraj city map
                  </p>
                  <a
                    href={prayagrajMapLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-blue-700 hover:text-blue-800"
                  >
                    Open full map
                  </a>
                </div>
                <iframe
                  title="Prayagraj city map"
                  src={prayagrajMapEmbed}
                  className="h-[220px] w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
                  Important helplines
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {municipalDirectory.helplines.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl bg-white/90 px-4 py-3 text-sm font-medium leading-6 text-slate-700 shadow-sm"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex h-full flex-col rounded-[1.5rem] bg-slate-50/80 p-5 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
                Ward list snapshot
              </p>
              <div className="mt-4 grid h-[640px] content-start gap-3 overflow-y-auto pr-1">
                {wardDirectory.map((ward) => (
                  <div
                    key={ward.ward}
                    className="rounded-2xl bg-white/90 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                          {ward.ward}
                        </p>
                        <h3 className="font-display mt-1 text-lg font-bold tracking-tight text-slate-950">
                          {ward.name}
                        </h3>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        Parshad
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-800">
                      {ward.councilor}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">Contact: {ward.contact}</p>
                    <p className="mt-2 text-xs leading-6 text-slate-500">{ward.address}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
