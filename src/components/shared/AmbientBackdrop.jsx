import { motion } from 'framer-motion'

export default function AmbientBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        animate={{ scale: [1, 1.08, 0.96, 1], x: [0, 36, -18, 0], y: [0, 18, -24, 0] }}
        className="absolute -left-16 top-10 h-72 w-72 rounded-full bg-brand-primary/20 blur-3xl"
        transition={{ duration: 18, ease: 'easeInOut', repeat: Infinity }}
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], x: [0, -30, 12, 0], y: [0, 24, -14, 0] }}
        className="absolute right-[-5rem] top-[16%] h-80 w-80 rounded-full bg-brand-accent/20 blur-3xl"
        transition={{ duration: 22, ease: 'easeInOut', repeat: Infinity }}
      />
      <motion.div
        animate={{ scale: [1, 0.92, 1.04, 1], x: [0, 20, -24, 0], y: [0, -16, 20, 0] }}
        className="absolute bottom-[-8rem] left-[28%] h-96 w-96 rounded-full bg-amber-200/30 blur-3xl"
        transition={{ duration: 26, ease: 'easeInOut', repeat: Infinity }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.16),transparent_36%,rgba(255,255,255,0.08)_58%,transparent_78%)]" />
      <div className="absolute inset-0 opacity-[0.28] bg-[linear-gradient(rgba(140,106,59,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(140,106,59,0.08)_1px,transparent_1px)] bg-[size:74px_74px] [mask-image:linear-gradient(180deg,black,transparent_94%)]" />
    </div>
  )
}