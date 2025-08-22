import React from 'react'
import { motion, Variants } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Props {
  backgroundImage?: string
  logoImage?: string
  className?: string
}

const HeroSection: React.FC<Props> = ({
  backgroundImage = "tmp9fp4q57x.jpg",
  logoImage = "/rotpunkt-kuechen-logo.svg",
  className = ""
}) => {
  const backgroundImageVariants: Variants = {
    initial: { opacity: 0, y: 40, scale: 0.9 },
    animate: {
      opacity: 0.4,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 72,
        mass: 1,
        damping: 20,
        delay: 1.1,
      }
    }
  }

  const logoVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: 0.25 }
    }
  }

  const titleVariants: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", delay: 1.22 }
    }
  }

  const subtitleVariants: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", delay: 1.45 }
    }
  }

  const descriptionVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", delay: 1.7 }
    }
  }

  return (
    <section
      className={cn(
        `bg-black grid grid-cols-1 grid-rows-1 text-white h-[50vh] min-h-[500px] overflow-hidden items-center justify-center`,
        className
      )}
      aria-labelledby="hero-title"
      role="banner"
    >
      <motion.div
        className="w-full col-span-1 row-span-1 col-start-1 row-start-1"
        variants={backgroundImageVariants}
        initial="initial"
        animate="animate"
        aria-hidden="true"
      >
        <img
          className="w-full h-full col-span-1 row-span-1 col-start-1 row-start-1 object-cover object-bottom"
          src={backgroundImage}
          alt=""
          role="presentation"
        />
      </motion.div>

      {/* Content Container */}
      <div className="container mx-auto px-4 py-16 items-center flex-wrap flex flex-col justify-center row-start-1 col-start-1 z-10 relative">

        {/* Logo Section */}
        <motion.header
          className="mx-auto px-4 py-16 w-full"
          variants={logoVariants}
          initial="initial"
          animate="animate"
        >
          <div className="flex justify-center">
            <img
              src={logoImage}
              alt="Rotpunkt Küchen Logo"
              className="mx-auto mb-2 w-24 max-h-24"
              width={96}
              height={96}
            />
          </div>
        </motion.header>

        {/* Main Title */}
        <motion.div
          className="mx-auto w-full"
          variants={titleVariants}
          initial="initial"
          animate="animate"
        >
          <h1
            id="hero-title"
            className="text-6xl font-bold uppercase tracking-tighter text-center bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent"
          >
            Traumküchen.
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.div
          className="mx-auto w-full"
          variants={subtitleVariants}
          initial="initial"
          animate="animate"
        >
          <p
            className="text-center text-lg text-gray-200 font-black tracking-tight mt-4"
            role="doc-subtitle"
          >
            Träumen Sie Ihre Rotpunkt-Traumküche mit unserem AI-Assistenten.
          </p>
        </motion.div>

        {/* Description */}
        <motion.div
          className="mx-auto max-w-sm"
          variants={descriptionVariants}
          initial="initial"
          animate="animate"
        >
          <p className="text-center text-sm text-gray-300 leading-relaxed mb-12 tracking-wide mt-6">
            Einfach eine Beschreibung eingeben und die AI generiert ein Bild
            Ihrer Traumküche. Und wenn wir Sie nicht haben, dann bauen wir sie
            für Sie.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection
