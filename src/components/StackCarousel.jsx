import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { MapPinned, X } from "lucide-react";

const sharedTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

const StackCarousel = ({ images }) => {
  const [activeImage, setActiveImage] = useState(null);

  return (
    <LayoutGroup id="smart-infrastructure-gallery">
      <div className="relative flex h-full flex-col px-3 py-3 sm:px-4 sm:py-4">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-700">
              Smart infrastructure gallery
            </p>
            <h2 className="font-display mt-1.5 text-base font-bold tracking-tight text-slate-950 sm:text-lg">
              Prayagraj visual overview
            </h2>
            <p className="mt-1.5 max-w-lg text-xs leading-6 text-slate-600 sm:text-sm">
              Click any image to open a shared-layout view of Prayagraj landmarks and infrastructure.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700">
            <MapPinned className="h-3 w-3" />
            Interactive gallery
          </div>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((image) => (
            <motion.button
              key={image.id}
              type="button"
              layout
              onClick={() => setActiveImage(image)}
              transition={sharedTransition}
              className="group relative text-left"
            >
              <motion.div
                layout
                layoutId={`image-${image.id}`}
                transition={sharedTransition}
                className="relative aspect-[4/2.9] overflow-hidden rounded-lg bg-slate-100 shadow-[0_14px_32px_-22px_rgba(15,23,42,0.22)]"
              >
                <img
                  src={image.imageUrl}
                  alt={image.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/5 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <span className="inline-flex rounded-full bg-white/15 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.22em] text-white/90 backdrop-blur-sm">
                    {image.tag}
                  </span>
                  <h3 className="font-display mt-2 text-sm font-bold tracking-tight text-white sm:text-[15px]">
                    {image.title}
                  </h3>
                </div>
              </motion.div>
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {activeImage && (
            <motion.div
              className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/50 px-3 py-4 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveImage(null)}
            >
              <motion.div
                layout
                layoutId={`image-${activeImage.id}`}
                transition={sharedTransition}
                onClick={(event) => event.stopPropagation()}
                className="relative w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-[0_24px_70px_-28px_rgba(15,23,42,0.38)]"
              >
                <div className="grid lg:grid-cols-[1.02fr_0.98fr]">
                  <div className="relative h-[200px] sm:h-[260px] lg:h-[340px]">
                    <img
                      src={activeImage.imageUrl}
                      alt={activeImage.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/18 via-transparent to-transparent lg:hidden" />
                  </div>

                  <motion.div layout className="relative flex flex-col p-4 sm:p-5">
                    <button
                      type="button"
                      onClick={() => setActiveImage(null)}
                      className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    <span className="inline-flex w-max rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-blue-700">
                      {activeImage.tag}
                    </span>
                    <h3 className="font-display mt-4 max-w-md pr-8 text-lg font-bold tracking-tight text-slate-950 sm:text-xl">
                      {activeImage.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-6 text-slate-600">
                      {activeImage.description}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
};

export default StackCarousel;
