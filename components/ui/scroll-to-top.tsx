"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";

interface ScrollToTopProps {
  showAtHeight?: number;
  position?: "bottom-right" | "bottom-left";
  className?: string;
}

export function ScrollToTop({
  showAtHeight = 300,
  position = "bottom-right",
  className,
}: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Handle scroll event to show/hide the button
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > showAtHeight);
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);
    
    // Initial check
    handleScroll();

    // Clean up
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showAtHeight]);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Position classes
  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed ${positionClasses[position]} z-50 ${className}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            size="icon"
            onClick={scrollToTop}
            className="rounded-full shadow-md h-10 w-10"
            aria-label="Scroll to top"
          >
            <FontAwesomeIcon icon={faArrowUp} className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}