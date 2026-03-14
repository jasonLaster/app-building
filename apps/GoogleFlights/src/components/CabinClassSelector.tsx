import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setCabinClass, type CabinClass } from '../slices/searchSlice'
import type { RootState } from '../store'
import './CabinClassSelector.css'

const cabinClasses: { value: CabinClass; label: string }[] = [
  { value: 'economy', label: 'Economy' },
  { value: 'premium_economy', label: 'Premium Economy' },
  { value: 'business', label: 'Business' },
  { value: 'first', label: 'First' },
]

function CabinClassSelector() {
  const dispatch = useDispatch()
  const cabinClass = useSelector((state: RootState) => state.search.cabinClass)
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const selectedLabel = cabinClasses.find((c) => c.value === cabinClass)?.label || 'Economy'

  return (
    <div className="cabin-class-selector" ref={ref} data-testid="cabin-class-selector">
      <button
        className="cabin-class-selector__trigger"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="cabin-class-trigger"
      >
        <span>{selectedLabel}</span>
        <span className="cabin-class-selector__arrow">{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <div className="cabin-class-selector__dropdown" data-testid="cabin-class-dropdown">
          {cabinClasses.map((cls) => (
            <button
              key={cls.value}
              className={`cabin-class-selector__option ${cabinClass === cls.value ? 'cabin-class-selector__option--selected' : ''}`}
              onClick={() => {
                dispatch(setCabinClass(cls.value))
                setIsOpen(false)
              }}
              data-testid={`cabin-class-option-${cls.value}`}
            >
              {cls.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default CabinClassSelector
