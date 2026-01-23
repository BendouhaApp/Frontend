import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Header } from './Header'
import { Footer } from './Footer'

export function MainLayout() {
  const location = useLocation()

  return (
    <div className="flex min-h-screen flex-col">
      {/* Skip to content link for keyboard users */}
      <a
        href="#main-content"
        className="skip-to-content"
      >
        Skip to main content
      </a>
      
      <Header />
      
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      
      <Footer />
    </div>
  )
}
