import { motion } from "framer-motion";

interface AnimatedBurgerProps {
  isOpen: boolean;
}

const AnimatedBurger = ({ isOpen }: AnimatedBurgerProps) => {
  return (
    <div className="w-5 h-5 flex items-center justify-center">
      {/* Create a perfect X with centered rotation */}
      <div className="relative w-5 h-5">
        {/* Top line - transforms to top-right to bottom-left diagonal */}
        <motion.div
          className="absolute h-0.5 bg-foreground rounded-full"
          style={{
            width: "100%",
            top: "25%",
            transformOrigin: "center",
          }}
          animate={{
            top: isOpen ? "50%" : "25%",
            rotate: isOpen ? 45 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
        {/* Middle line - fades out */}
        <motion.div
          className="absolute h-0.5 bg-foreground rounded-full"
          style={{
            width: "100%",
            top: "50%",
            transformOrigin: "center",
          }}
          animate={{
            opacity: isOpen ? 0 : 1,
          }}
          transition={{ duration: 0.2 }}
        />
        {/* Bottom line - transforms to top-left to bottom-right diagonal */}
        <motion.div
          className="absolute h-0.5 bg-foreground rounded-full"
          style={{
            width: "100%",
            top: "75%",
            transformOrigin: "center",
          }}
          animate={{
            top: isOpen ? "50%" : "75%",
            rotate: isOpen ? -45 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
};

export default AnimatedBurger;
