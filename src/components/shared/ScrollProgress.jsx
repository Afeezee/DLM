import { motion, useScroll, useSpring } from 'framer-motion'

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    damping: 28,
    mass: 0.22,
    stiffness: 140,
  })

  return (
    <motion.div
      aria-hidden="true"
      className="scroll-progress pointer-events-none fixed inset-x-0 top-0 z-[80] h-1 origin-left"
      style={{ scaleX }}
    />
  )
}