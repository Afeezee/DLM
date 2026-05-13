import { motion } from 'framer-motion'

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.05,
      staggerChildren: 0.05,
    },
  },
}

const wordVariants = {
  hidden: {
    opacity: 0,
    y: '105%',
  },
  visible: {
    opacity: 1,
    y: '0%',
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

export default function RevealText({ amount = 0.35, as: Component = 'h1', className = '', once = true, text }) {
  const words = String(text ?? '')
    .split(' ')
    .filter(Boolean)

  return (
    <Component className={className}>
      <motion.span
        className="inline-flex flex-wrap"
        initial="hidden"
        variants={containerVariants}
        viewport={{ amount, once }}
        whileInView="visible"
      >
        {words.map((word, index) => (
          <span key={`${word}-${index}`} className="mr-[0.28em] overflow-hidden pb-[0.08em]">
            <motion.span className="inline-block" variants={wordVariants}>
              {word}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Component>
  )
}