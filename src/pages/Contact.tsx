import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fadeInUp, DURATION, EASE } from '@/lib/motion'
import { cn } from '@/lib/utils'

export function Contact() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // UI only - no actual submission
  }

  const contactInfo = [
    { icon: MapPin, label: 'Address', value: '123 Design Street, Algiers, Algeria' },
    { icon: Phone, label: 'Phone', value: '+213 555 123 456' },
    { icon: Mail, label: 'Email', value: 'hello@bendouha.com' },
    { icon: Clock, label: 'Hours', value: 'Mon-Sat: 9AM - 6PM' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <motion.section
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="border-b border-neutral-200 bg-neutral-50/50"
      >
        <div className="container mx-auto px-4 py-16 md:px-6 md:py-24">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-4 inline-block text-sm font-medium uppercase tracking-wider text-neutral-500"
          >
            Get in Touch
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: DURATION.slow, ease: EASE.out }}
            className="font-display text-4xl font-light tracking-tight text-neutral-900 md:text-5xl lg:text-6xl"
          >
            {t('contact.title')}
          </motion.h1>
        </div>
      </motion.section>

      {/* Content */}
      <section className="container mx-auto px-4 py-16 md:px-6 md:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: DURATION.slower, ease: EASE.out }}
          >
            <h2 className="mb-6 font-display text-2xl font-light tracking-tight text-neutral-900 md:text-3xl">
              We'd love to hear from you
            </h2>
            <p className="mb-8 text-neutral-600">
              Whether you have a question about our products, need styling advice,
              or just want to say hello, we're here to help.
            </p>

            <div className="space-y-6">
              {contactInfo.map(({ icon: Icon, label, value }, index) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: DURATION.slow }}
                  className="flex items-start gap-4"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-neutral-100">
                    <Icon className="h-5 w-5 text-neutral-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-500">{label}</p>
                    <p className="text-neutral-900">{value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: DURATION.slower, ease: EASE.out, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={cn(
                      'w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm',
                      'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                      'transition-all duration-200'
                    )}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={cn(
                      'w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm',
                      'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                      'transition-all duration-200'
                    )}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className={cn(
                    'w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm',
                    'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                    'transition-all duration-200'
                  )}
                  placeholder="How can we help?"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={5}
                  className={cn(
                    'w-full resize-none rounded-lg border border-neutral-300 px-4 py-3 text-sm',
                    'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                    'transition-all duration-200'
                  )}
                  placeholder="Tell us more..."
                  required
                />
              </div>

              <Button type="submit" size="lg" className="w-full rounded-full sm:w-auto">
                Send Message
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
