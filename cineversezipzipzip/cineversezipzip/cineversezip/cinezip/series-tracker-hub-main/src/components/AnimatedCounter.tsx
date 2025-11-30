import { useEffect, useRef, useState } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  decimals?: number;
}

const AnimatedCounter = ({ 
  value, 
  duration = 2, 
  suffix = "", 
  prefix = "",
  className,
  decimals = 0
}: AnimatedCounterProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hasAnimated, setHasAnimated] = useState(false);
  
  const spring = useSpring(0, {
    damping: 30,
    stiffness: 100,
    duration: duration * 1000,
  });
  
  const display = useTransform(spring, (current) => {
    return decimals > 0 
      ? current.toFixed(decimals)
      : Math.floor(current).toLocaleString();
  });

  useEffect(() => {
    if (isInView && !hasAnimated) {
      spring.set(value);
      setHasAnimated(true);
    }
  }, [isInView, value, spring, hasAnimated]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
