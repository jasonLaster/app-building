import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setPassengers } from '../slices/searchSlice'
import type { RootState } from '../store'
import './PassengerCountSelector.css'

function PassengerCountSelector({ initiallyOpen = false }: { initiallyOpen?: boolean } = {}) {
  const dispatch = useDispatch()
  const passengers = useSelector((state: RootState) => state.search.passengers)
  const [isOpen, setIsOpen] = useState(initiallyOpen)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (initiallyOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, initiallyOpen])

  const total = passengers.adults + passengers.children + passengers.infants
  const label = total === 1 ? '1 Adult' : `${total} passengers`

  function updatePassengers(field: 'adults' | 'children' | 'infants', delta: number) {
    const newVal = passengers[field] + delta
    if (field === 'adults' && newVal < 1) return
    if (field !== 'adults' && newVal < 0) return
    if (field === 'infants' && newVal > passengers.adults) return

    const updated = { ...passengers, [field]: newVal }
    // If adults decrease below infants, cap infants
    if (field === 'adults' && updated.infants > updated.adults) {
      updated.infants = updated.adults
    }
    dispatch(setPassengers(updated))
  }

  return (
    <div className="passenger-selector" ref={ref} data-testid="passenger-count-selector">
      {!initiallyOpen && (
        <button
          className="passenger-selector__trigger"
          onClick={() => setIsOpen(!isOpen)}
          data-testid="passenger-count-trigger"
        >
          <span className="passenger-selector__icon">👤</span>
          <span>{label}</span>
          <span className="passenger-selector__arrow">{isOpen ? '▲' : '▼'}</span>
        </button>
      )}
      {isOpen && (
        <div className={`passenger-selector__dropdown ${initiallyOpen ? 'passenger-selector__dropdown--inline' : ''}`} data-testid="passenger-count-dropdown">
          <div className="passenger-selector__row" data-testid="passenger-row-adults">
            <div className="passenger-selector__info">
              <span className="passenger-selector__category">Adults</span>
            </div>
            <div className="passenger-selector__controls">
              <button
                className="passenger-selector__btn"
                onClick={() => updatePassengers('adults', -1)}
                disabled={passengers.adults <= 1}
                data-testid="adults-decrement"
              >
                −
              </button>
              <span className="passenger-selector__count" data-testid="adults-count">{passengers.adults}</span>
              <button
                className="passenger-selector__btn"
                onClick={() => updatePassengers('adults', 1)}
                data-testid="adults-increment"
              >
                +
              </button>
            </div>
          </div>
          <div className="passenger-selector__row" data-testid="passenger-row-children">
            <div className="passenger-selector__info">
              <span className="passenger-selector__category">Children</span>
              <span className="passenger-selector__age">2-11</span>
            </div>
            <div className="passenger-selector__controls">
              <button
                className="passenger-selector__btn"
                onClick={() => updatePassengers('children', -1)}
                disabled={passengers.children <= 0}
                data-testid="children-decrement"
              >
                −
              </button>
              <span className="passenger-selector__count" data-testid="children-count">{passengers.children}</span>
              <button
                className="passenger-selector__btn"
                onClick={() => updatePassengers('children', 1)}
                data-testid="children-increment"
              >
                +
              </button>
            </div>
          </div>
          <div className="passenger-selector__row" data-testid="passenger-row-infants">
            <div className="passenger-selector__info">
              <span className="passenger-selector__category">Infants</span>
              <span className="passenger-selector__age">Under 2</span>
            </div>
            <div className="passenger-selector__controls">
              <button
                className="passenger-selector__btn"
                onClick={() => updatePassengers('infants', -1)}
                disabled={passengers.infants <= 0}
                data-testid="infants-decrement"
              >
                −
              </button>
              <span className="passenger-selector__count" data-testid="infants-count">{passengers.infants}</span>
              <button
                className="passenger-selector__btn"
                onClick={() => updatePassengers('infants', 1)}
                disabled={passengers.infants >= passengers.adults}
                data-testid="infants-increment"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PassengerCountSelector
