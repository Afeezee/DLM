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
      className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-1 origin-left bg-[linear-gradient(90deg,rgba(140,106,59,0.96),rgba(182,84,45,0.92),rgba(212,170,82,0.96))] shadow-[0_0_22px_rgba(182,84,45,0.34)]"
      style={{ scaleX }}
    />
  )
}