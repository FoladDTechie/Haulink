'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Props {
  current: number
  steps: { label: string }[]
  variant?: 'light' | 'dark'
}

export function StepIndicator({ current, steps, variant = 'light' }: Props) {
  const isDark = variant === 'dark'

  return (
    <div className="flex items-center gap-0 mb-7">
      {steps.map((step, i) => {
        const idx = i + 1
        const done = idx < current
        const active = idx === current

        return (
          <div key={step.label} className="flex items-center flex-1 last:flex-none">
            {/* Dot */}
            <div className="relative flex-shrink-0">
              <motion.div
                animate={{
                  backgroundColor: done
                    ? '#2ECC52'
                    : active
                    ? isDark ? '#ffffff' : '#0D1B3E'
                    : 'transparent',
                  borderColor: done
                    ? '#2ECC52'
                    : active
                    ? isDark ? '#ffffff' : '#0D1B3E'
                    : isDark ? 'rgba(255,255,255,0.2)' : 'rgba(13,27,62,0.2)',
                }}
                className={cn(
                  'w-8 h-8 rounded-full border-2 flex items-center justify-center',
                  'text-xs font-bold transition-all',
                  done
                    ? 'text-navy'
                    : active
                    ? isDark ? 'text-navy' : 'text-white'
                    : isDark ? 'text-white/30' : 'text-navy/30'
                )}
              >
                {done ? '✓' : idx}
              </motion.div>

              {/* Active ring */}
              {active && (
                <motion.div
                  layoutId="active-ring"
                  className={cn(
                    'absolute inset-0 rounded-full border-2 scale-150 opacity-25',
                    isDark ? 'border-white/40' : 'border-navy/20'
                  )}
                />
              )}
            </div>

            {/* Label */}
            <span className={cn(
              'hidden sm:block ml-2 text-xs font-semibold whitespace-nowrap',
              active
                ? isDark ? 'text-white' : 'text-navy'
                : done
                ? 'text-green-brand'
                : isDark ? 'text-white/30' : 'text-gray-400'
            )}>
              {step.label}
            </span>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <motion.div
                className="flex-1 h-0.5 mx-3"
                animate={{
                  backgroundColor: done
                    ? '#2ECC52'
                    : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(13,27,62,0.1)',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
