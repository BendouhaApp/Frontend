import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from '@/lib/gsap-motion'
import { useState } from 'react'
import { Globe, Check } from 'lucide-react'
import { languages, changeLanguage, type LanguageCode } from '@/i18n'
import { cn } from '@/lib/utils'

interface LanguageSwitcherProps {
  variant?: 'icon' | 'full' | 'minimal'
  className?: string
}

export function LanguageSwitcher({
  variant = 'icon',
  className,
}: LanguageSwitcherProps) {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0]

  const handleLanguageChange = (langCode: LanguageCode) => {
    changeLanguage(langCode)
    setIsOpen(false)
  }

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={cn(
              'text-sm font-medium transition-colors',
              i18n.language === lang.code
                ? 'text-neutral-900'
                : 'text-neutral-400 hover:text-neutral-600'
            )}
          >
            {lang.code.toUpperCase()}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 rounded-full p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900',
          variant === 'full' && 'px-3'
        )}
        aria-label="Change language"
      >
        <Globe className="h-5 w-5" />
        {variant === 'full' && (
          <span className="text-sm font-medium">{currentLang.name}</span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute end-0 top-full z-50 mt-2 min-w-[160px] overflow-hidden rounded-xl border border-neutral-200 bg-white p-1 shadow-lg"
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-start text-sm font-medium transition-colors',
                    i18n.language === lang.code
                      ? 'bg-neutral-100 text-neutral-900'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  )}
                >
                  <span>{lang.name}</span>
                  {i18n.language === lang.code && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// Mobile-friendly language switcher for sheet/drawer
export function LanguageSwitcherMobile({ className }: { className?: string }) {
  const { i18n, t } = useTranslation()

  const handleLanguageChange = (langCode: LanguageCode) => {
    changeLanguage(langCode)
  }

  return (
    <div className={cn('space-y-2', className)}>
      <span className="text-sm font-medium text-neutral-500">
        {t('common.language')}
      </span>
      <div className="flex gap-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={cn(
              'flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all',
              i18n.language === lang.code
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
            )}
          >
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  )
}
