import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { projects } from "../data/dummyData";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const floatTransition = (duration) => ({
  duration,
  repeat: Infinity,
  repeatType: "mirror",
  ease: "easeInOut",
});

const ProjectsCarousel = () => {
  return (
    <section id="projects" className="relative overflow-hidden bg-slate-50 px-4 py-20 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{ x: [0, 18, -12], y: [0, -16, 12] }}
          transition={floatTransition(14)}
          className="absolute left-[12%] top-24 h-48 w-48 rounded-full bg-blue-100/30 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -22, 16], y: [0, 20, -14] }}
          transition={floatTransition(17)}
          className="absolute right-[8%] bottom-10 h-60 w-60 rounded-full bg-cyan-100/30 blur-3xl"
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
            <p className="section-eyebrow">Completed Works</p>
            <h2 className="section-title">
              Development projects delivered across the city
            </h2>
          </div>
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <p className="section-copy">
              A visual showcase of infrastructure and public service initiatives
              completed under the municipal corporation.
            </p>
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={floatTransition(7)}
              className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700 shadow-[0_16px_40px_-24px_rgba(37,99,235,0.35)] backdrop-blur-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Showcase reel
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[2rem] bg-white/88 p-5 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.14)] backdrop-blur-sm sm:p-6"
        >
          <motion.div
            animate={{ x: ["-20%", "110%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-y-0 left-0 w-32 -skew-x-12 bg-white/25 blur-xl"
          />
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            loop
            autoplay={{ delay: 3200, disableOnInteraction: false }}
            navigation
            pagination={{ clickable: true }}
            spaceBetween={20}
            breakpoints={{
              0: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1200: { slidesPerView: 3 },
            }}
          >
            {projects.map((project, index) => (
              <SwiperSlide key={project.title} className="pb-12">
                <motion.article
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.06, duration: 0.35 }}
                  whileHover={{ y: -8 }}
                  className="group overflow-hidden rounded-[1.75rem] border border-slate-100 bg-slate-50 text-left"
                >
                  <div className="relative h-60 overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-70 transition duration-500 group-hover:opacity-100" />
                  </div>
                  <div className="p-5">
                    <div className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                      Completed
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-display text-xl font-bold tracking-tight text-slate-950">
                        {project.title}
                      </h3>
                      <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-slate-400 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-blue-700" />
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {project.description}
                    </p>
                  </div>
                </motion.article>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectsCarousel;
