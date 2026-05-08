'use client'

import { motion } from 'framer-motion'

const SLOTS = [
  { x: 30,  booked: true,  delay: 0.7  },
  { x: 100, booked: true,  delay: 0.9  },
  { x: 170, booked: false, delay: 1.1  },
  { x: 240, booked: true,  delay: 0.8  },
  { x: 310, booked: false, delay: 1.2  },
  { x: 380, booked: true,  delay: 1.0  },
  { x: 450, booked: false, delay: 1.3  },
  { x: 520, booked: false, delay: 1.4  },
]

export function TrailerVisual() {
  return (
    <div className="relative select-none">
      {/* Legend */}
      <div className="absolute -top-7 right-0 flex items-center gap-5 text-[11px]">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-green-brand/70" />
          <span className="text-white/30 tracking-wide">Booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm border border-white/15" />
          <span className="text-white/30 tracking-wide">Available</span>
        </div>
      </div>

      <svg
        viewBox="0 0 720 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full drop-shadow-[0_40px_80px_rgba(0,0,0,0.7)]"
      >
        {/* Trailer body */}
        <rect x="0" y="50" width="578" height="178" rx="8" fill="#111111" />
        <rect x="0" y="50" width="578" height="178" rx="8"
              stroke="#2ECC52" strokeWidth="1" strokeOpacity="0.15" fill="none" />
        {/* Roof ridge */}
        <rect x="4" y="52" width="570" height="5" rx="2.5" fill="#1A1A1A" opacity="0.9" />
        {/* Floor line */}
        <rect x="4" y="221" width="570" height="4" rx="2" fill="#050505" opacity="0.7" />

        {/* Cab */}
        <rect x="578" y="88" width="138" height="140" rx="8" fill="#1A1A1A" />
        {/* Windshield */}
        <rect x="590" y="102" width="60" height="48" rx="4" fill="#2ECC52" fillOpacity="0.28" />
        <rect x="590" y="102" width="60" height="48" rx="4" stroke="#2ECC52" strokeWidth="0.5" strokeOpacity="0.4" fill="none" />
        {/* Side window */}
        <rect x="656" y="108" width="48" height="36" rx="4" fill="white" fillOpacity="0.06" />
        <rect x="656" y="108" width="48" height="36" rx="4" stroke="white" strokeWidth="0.5" strokeOpacity="0.12" fill="none" />
        {/* Cab door crease */}
        <line x1="656" y1="100" x2="656" y2="220" stroke="#050505" strokeWidth="2" />
        {/* Mirror */}
        <rect x="583" y="118" width="8" height="14" rx="2" fill="#050505" />
        {/* Grille */}
        <rect x="706" y="148" width="10" height="52" rx="2" fill="#050505" />
        {/* Lights */}
        <rect x="708" y="150" width="5" height="10" rx="1.5" fill="#2ECC52" fillOpacity="0.55" />
        <rect x="708" y="188" width="5" height="8" rx="1.5" fill="white" fillOpacity="0.2" />

        {/* Undercarriage rail */}
        <rect x="20" y="224" width="545" height="10" rx="3" fill="#050505" opacity="0.8" />

        {/* Wheels — rear dual */}
        <circle cx="108" cy="252" r="32" fill="#111111" />
        <circle cx="108" cy="252" r="20" fill="#080808" />
        <circle cx="108" cy="252" r="8"  fill="#1A1A1A" />
        <circle cx="108" cy="252" r="2"  fill="#2ECC52" fillOpacity="0.5" />

        <circle cx="152" cy="252" r="26" fill="#111111" opacity="0.9" />
        <circle cx="152" cy="252" r="16" fill="#080808" opacity="0.9" />
        <circle cx="152" cy="252" r="6"  fill="#1A1A1A" opacity="0.9" />

        <circle cx="428" cy="252" r="32" fill="#111111" />
        <circle cx="428" cy="252" r="20" fill="#080808" />
        <circle cx="428" cy="252" r="8"  fill="#1A1A1A" />
        <circle cx="428" cy="252" r="2"  fill="#2ECC52" fillOpacity="0.5" />

        <circle cx="472" cy="252" r="26" fill="#111111" opacity="0.9" />
        <circle cx="472" cy="252" r="16" fill="#080808" opacity="0.9" />
        <circle cx="472" cy="252" r="6"  fill="#1A1A1A" opacity="0.9" />

        {/* Steer axle */}
        <circle cx="630" cy="248" r="28" fill="#111111" />
        <circle cx="630" cy="248" r="17" fill="#080808" />
        <circle cx="630" cy="248" r="6"  fill="#1A1A1A" />
        <circle cx="630" cy="248" r="2"  fill="#2ECC52" fillOpacity="0.35" />

        {/* Slot dividers + fills */}
        {SLOTS.map((slot, i) => (
          <g key={i}>
            <rect x={slot.x} y="56" width="1" height="162" fill="#2ECC52" fillOpacity="0.35" />

            {slot.booked && (
              <>
                <motion.rect
                  x={slot.x + 1} y="56"
                  width="68" height="162"
                  fill="#2ECC52"
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 0.18, scaleY: 1 }}
                  transition={{ duration: 0.65, delay: slot.delay, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: `${slot.x + 1}px 56px` }}
                />
                <motion.rect
                  x={slot.x + 1} y="56"
                  width="68" height="2.5"
                  fill="#2ECC52"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.65 }}
                  transition={{ duration: 0.3, delay: slot.delay + 0.35 }}
                />
              </>
            )}
          </g>
        ))}

        <rect x="570" y="56" width="1" height="162" fill="#2ECC52" fillOpacity="0.35" />

        {/* Haulink text watermark */}
        <text x="285" y="150" textAnchor="middle"
              fill="white" fillOpacity="0.04"
              fontSize="30" fontWeight="800" fontFamily="sans-serif" letterSpacing="8">
          HAULINK
        </text>

        {/* Booked count badge */}
        <motion.g
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.9, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <rect x="8" y="60" width="82" height="24" rx="4"
                fill="#2ECC52" fillOpacity="0.1" />
          <rect x="8" y="60" width="82" height="24" rx="4"
                stroke="#2ECC52" strokeWidth="0.8" strokeOpacity="0.35" fill="none" />
          <text x="49" y="76" textAnchor="middle"
                fill="#2ECC52" fontSize="9.5" fontWeight="700"
                fontFamily="sans-serif" letterSpacing="1.2">
            4 / 8 BOOKED
          </text>
        </motion.g>
      </svg>
    </div>
  )
}
