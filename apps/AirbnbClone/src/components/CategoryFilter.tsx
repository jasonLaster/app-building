import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const PROPERTY_TYPES = [
  {
    type: 'Apartment',
    icon: (
      <svg viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="4" width="24" height="24" rx="2" />
        <line x1="4" y1="16" x2="28" y2="16" />
        <line x1="16" y1="4" x2="16" y2="28" />
        <rect x="7" y="7" width="4" height="4" fill="currentColor" stroke="none" opacity="0.5" />
        <rect x="21" y="7" width="4" height="4" fill="currentColor" stroke="none" opacity="0.5" />
        <rect x="7" y="19" width="4" height="4" fill="currentColor" stroke="none" opacity="0.5" />
        <rect x="21" y="19" width="4" height="4" fill="currentColor" stroke="none" opacity="0.5" />
      </svg>
    ),
  },
  {
    type: 'House',
    icon: (
      <svg viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 3L2 16h4v13h8v-8h4v8h8V16h4L16 3z" />
      </svg>
    ),
  },
  {
    type: 'Cabin',
    icon: (
      <svg viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 2L2 18h28L16 2z" />
        <rect x="8" y="18" width="16" height="12" />
        <rect x="13" y="22" width="6" height="8" />
        <line x1="2" y1="30" x2="30" y2="30" />
      </svg>
    ),
  },
  {
    type: 'Villa',
    icon: (
      <svg viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 28V14l13-10 13 10v14H3z" />
        <rect x="11" y="18" width="10" height="10" rx="1" />
        <path d="M8 14a8 8 0 0116 0" />
        <line x1="16" y1="6" x2="16" y2="14" />
      </svg>
    ),
  },
  {
    type: 'Condo',
    icon: (
      <svg viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="6" y="2" width="20" height="28" rx="1" />
        <line x1="6" y1="10" x2="26" y2="10" />
        <line x1="6" y1="18" x2="26" y2="18" />
        <line x1="16" y1="2" x2="16" y2="30" />
        <rect x="13" y="24" width="6" height="6" rx="0.5" />
      </svg>
    ),
  },
  {
    type: 'Loft',
    icon: (
      <svg viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="6" width="26" height="22" rx="1" />
        <line x1="3" y1="16" x2="29" y2="16" />
        <path d="M8 16v-6h10v6" />
        <rect x="20" y="22" width="5" height="6" />
        <circle cx="11" cy="11" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    type: 'Cottage',
    icon: (
      <svg viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 4L3 16v13h26V16L16 4z" />
        <rect x="12" y="20" width="8" height="9" rx="1" />
        <circle cx="16" cy="12" r="2" />
        <path d="M6 14l10-8 10 8" />
      </svg>
    ),
  },
  {
    type: 'Townhouse',
    icon: (
      <svg viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="8" width="12" height="22" />
        <rect x="18" y="4" width="12" height="26" />
        <path d="M2 8l6-4 6 4" />
        <path d="M18 4l6-3 6 3" />
        <rect x="5" y="12" width="3" height="3" />
        <rect x="5" y="20" width="3" height="3" />
        <rect x="21" y="8" width="3" height="3" />
        <rect x="21" y="16" width="3" height="3" />
        <rect x="7" y="25" width="4" height="5" />
        <rect x="23" y="25" width="4" height="5" />
      </svg>
    ),
  },
]

interface CategoryFilterProps {
  selectedType: string
  onSelectType: (type: string) => void
}

export default function CategoryFilter({ selectedType, onSelectType }: CategoryFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }

  useEffect(() => {
    updateScrollState()
    const el = scrollRef.current
    if (el) {
      el.addEventListener('scroll', updateScrollState)
      window.addEventListener('resize', updateScrollState)
    }
    return () => {
      if (el) el.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const amount = 300
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  const handleClick = (type: string) => {
    if (selectedType === type) {
      onSelectType('')
    } else {
      onSelectType(type)
    }
  }

  return (
    <div
      data-testid="category-filter"
      role="group"
      aria-label="Filter by property type"
      className="relative flex items-center"
    >
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          aria-label="Scroll categories left"
          className="absolute left-0 z-10 flex items-center justify-center w-7 h-7 rounded-full border border-border-dark bg-bg shadow-md hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
        >
          <ChevronLeft size={14} aria-hidden="true" />
        </button>
      )}
      <div
        ref={scrollRef}
        className="flex gap-8 overflow-x-auto py-3 px-1 scrollbar-hide"
        style={{ scrollbarWidth: 'none' }}
      >
        {PROPERTY_TYPES.map(({ type, icon }) => {
          const isActive = selectedType === type
          return (
            <button
              key={type}
              data-testid={`category-chip-${type}`}
              onClick={() => handleClick(type)}
              aria-pressed={isActive}
              className={`flex flex-col items-center gap-2 min-w-[56px] pb-3 pt-1 border-b-2 transition-all cursor-pointer group ${
                isActive
                  ? 'border-text text-text'
                  : 'border-transparent text-text-secondary hover:text-text hover:border-border-dark'
              }`}
            >
              <span className={`transition-opacity ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                {icon}
              </span>
              <span className={`text-xs whitespace-nowrap ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {type}
              </span>
            </button>
          )
        })}
      </div>
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          aria-label="Scroll categories right"
          className="absolute right-0 z-10 flex items-center justify-center w-7 h-7 rounded-full border border-border-dark bg-bg shadow-md hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
        >
          <ChevronRight size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
