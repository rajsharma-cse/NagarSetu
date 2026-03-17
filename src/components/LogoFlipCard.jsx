import { motion } from "framer-motion";

const flipTransition = {
  type: "spring",
  stiffness: 120,
  damping: 14,
  duration: 0.6,
};

function LogoFlipCard({ src, alt, imageClassName = "" }) {
  return (
    <div className="flex-1 [perspective:1000px]">
      <motion.div
        initial={{ rotateY: 0, scale: 1 }}
        animate={{ rotateY: 0, scale: 1 }}
        whileHover={{
          rotateY: 180,
          scale: 1.05,
          boxShadow: "0 24px 48px -20px rgba(15,23,42,0.28)",
        }}
        transition={flipTransition}
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
        className="relative rounded-2xl bg-white/80 p-6 shadow-lg backdrop-blur hover:shadow-xl"
      >
        <motion.img
          src={src}
          alt={alt}
          transition={flipTransition}
          style={{ backfaceVisibility: "hidden", willChange: "transform" }}
          className={`mx-auto h-[120px] w-[120px] object-contain ${imageClassName}`}
        />
      </motion.div>
    </div>
  );
}

export default LogoFlipCard;
