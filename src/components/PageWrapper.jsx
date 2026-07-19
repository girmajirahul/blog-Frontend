import React from "react";
import { motion } from "framer-motion";
export default function PageWrapper({ children, className="" }) {
  return (
    <motion.div
      initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
      transition={{duration:0.2,ease:"easeOut"}}
      className={`flex-1 overflow-y-auto ${className}`}
    >
      {children}
    </motion.div>
  );
}
