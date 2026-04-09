import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  rotation: number;
}

interface SparkleEffectProps {
  /** Trigger key – change to fire sparkles */
  trigger: string | null;
  /** Position as CSS top/left percentages */
  top: string;
  left: string;
  width: string;
}

function generateSparkles(count: number): Sparkle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 120,
    y: (Math.random() - 0.5) * 100,
    size: 4 + Math.random() * 8,
    delay: Math.random() * 0.15,
    rotation: Math.random() * 360,
  }));
}

const sparkleColors = ["#FFD700", "#FFF9C4", "#FFE082", "#FFFFFF", "#FF8F00", "#76FF03"];

export function SparkleEffect({ trigger, top, left, width }: SparkleEffectProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (trigger) {
      setSparkles(generateSparkles(12));
      setActive(true);
      const timer = setTimeout(() => setActive(false), 800);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <AnimatePresence>
      {active && (
        <div
          style={{
            position: "absolute",
            top,
            left,
            width,
            pointerEvents: "none",
          }}
          className="flex h-10 items-center justify-center sm:h-12 md:h-14"
        >
          {sparkles.map((s) => (
            <motion.div
              key={s.id}
              initial={{
                opacity: 1,
                scale: 0,
                x: 0,
                y: 0,
                rotate: 0,
              }}
              animate={{
                opacity: [1, 1, 0],
                scale: [0, 1.2, 0.6],
                x: s.x,
                y: s.y,
                rotate: s.rotation,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.7,
                delay: s.delay,
                ease: "easeOut",
              }}
              style={{
                position: "absolute",
                width: s.size,
                height: s.size,
              }}
            >
              {/* Star shape */}
              <svg viewBox="0 0 24 24" fill={sparkleColors[s.id % sparkleColors.length]}>
                <path d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41Z" />
              </svg>
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
