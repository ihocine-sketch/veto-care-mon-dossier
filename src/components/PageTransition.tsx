import { motion, type Transition } from "framer-motion";
import { ReactNode } from "react";

const t: Transition = { duration: 0.4, ease: [0.4, 0, 0.2, 1] };

export const PageTransition = ({ children }: { children: ReactNode }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={t}>
    {children}
  </motion.div>
);
