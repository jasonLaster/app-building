import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setTripType, type TripType } from '../slices/searchSlice'
import type { RootState } from '../store'
import './TripTypeSelector.css'

const tripTypes: { value: TripType; label: string }[] = [
  { value: 'round_trip', label: 'Round trip' },
  { value: 'one_way', label: 'One way' },
  { value: 'multi_city', label: 'Multi-city' },
]

function TripTypeSelector() {
  const dispatch = useDispatch()
  const tripType = useSelector((state: RootState) => state.search.tripType)
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

  const selectedLabel = tripTypes.find((t) => t.value === tripType)?.label || 'Round trip'

  return (
    <div className="trip-type-selector" ref={ref} data-testid="trip-type-selector">
      <button
        className="trip-type-selector__trigger"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="trip-type-selector-trigger"
      >
        <span>{selectedLabel}</span>
        <span className="trip-type-selector__arrow">{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <div className="trip-type-selector__dropdown" data-testid="trip-type-selector-dropdown">
          {tripTypes.map((type) => (
            <button
              key={type.value}
              className={`trip-type-selector__option ${tripType === type.value ? 'trip-type-selector__option--selected' : ''}`}
              onClick={() => {
                dispatch(setTripType(type.value))
                setIsOpen(false)
              }}
              data-testid={`trip-type-option-${type.value}`}
            >
              {type.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default TripTypeSelector
