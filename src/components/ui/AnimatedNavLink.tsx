import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { LucideProps } from "lucide-react";

interface AnimatedNavLinkProps {
  icon: React.ComponentType<LucideProps>;
  label: string;
  href: string;
  glowColor: string;
  hoverColor: string;
  isActive: boolean;
}

const AnimatedNavLink = ({
  icon: Icon,
  label,
  href,
  glowColor,
  hoverColor,
  isActive,
}: AnimatedNavLinkProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const springConfig = { type: "spring", stiffness: 500, damping: 30 };

  const showGlow = isHovered || isActive;

  return (
    <Link
      to={href}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-14 h-14 flex flex-col items-center justify-center rounded-2xl transition-colors duration-300 ${
        isActive ? "bg-sidebar-accent" : "bg-transparent"
      }`}
    >
      <AnimatePresence>
        {showGlow && (
          <motion.div
            className="absolute inset-0 rounded-xl"
            style={{ backgroundColor: glowColor, zIndex: 0 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.2 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={springConfig}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="relative z-10 flex flex-col items-center gap-1"
        animate={{ color: showGlow ? hoverColor : "currentColor" }}
        transition={{ duration: 0.3 }}
      >
        <Icon className="h-5 w-5" />
        <span className="text-xs">{label}</span>
      </motion.div>
    </Link>
  );
};

export default AnimatedNavLink;
