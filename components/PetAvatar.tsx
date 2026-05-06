'use client'

import { motion } from 'framer-motion'

interface PetAvatarProps {
  level: 'Ichir' | string
}

export function PetAvatar({ level }: PetAvatarProps) {
  const getEmoji = () => {
    return '😸🐱'
  }

  const getSize = () => {
    return 'text-[140px]'
  }

  return (
    <motion.div
      animate={{ 
        scale: [1, 1.02, 1],
        rotate: [0, 1, -1, 0]
      }}
      transition={{ 
        duration: 2.2, 
        repeat: Infinity,
        ease: "easeInOut" 
      }}
      className={`${getSize()} select-none`}
    >
      {getEmoji()}
    </motion.div>
  )
}
