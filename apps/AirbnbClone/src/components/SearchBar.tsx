import { useState } from 'react'
import { Search } from 'lucide-react'

interface SearchBarProps {
  onSearch: (filters: { city: string; checkIn: string; checkOut: string; guests: number }) => void
  initialCity?: string
  initialCheckIn?: string
  initialCheckOut?: string
  initialGuests?: number
}

export default function SearchBar({ onSearch, initialCity = '', initialCheckIn = '', initialCheckOut = '', initialGuests = 0 }: SearchBarProps) {
  const [city, setCity] = useState(initialCity)
  const [checkIn, setCheckIn] = useState(initialCheckIn)
  const [checkOut, setCheckOut] = useState(initialCheckOut)
  const [guests, setGuests] = useState(initialGuests)

  const today = new Date().toISOString().split('T')[0]

  const checkOutMin = (() => {
    if (!checkIn) return today
    const d = new Date(checkIn + 'T00:00:00')
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  })()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch({ city, checkIn, checkOut, guests })
  }

  const handleGuestsChange = (value: string) => {
    const num = parseInt(value, 10)
    if (isNaN(num) || num < 1) {
      setGuests(1)
    } else {
      setGuests(num)
    }
  }

  return (
    <form
      data-testid="search-bar"
      onSubmit={handleSubmit}
      role="search"
      aria-label="Search properties"
      className="flex items-center rounded-full border border-border bg-bg shadow-sm hover:shadow-md transition-shadow max-w-[850px] mx-auto"
    >
      <div className="flex-1 min-w-0 px-7 py-3.5">
        <label htmlFor="search-location" className="block text-xs font-bold text-text">Where</label>
        <input
          id="search-location"
          data-testid="search-location"
          type="text"
          placeholder="Search destinations"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full text-sm text-text-secondary outline-none bg-transparent placeholder-text-secondary mt-0.5"
        />
      </div>

      <div className="w-px h-8 bg-border shrink-0" aria-hidden="true" />

      <div className="px-5 py-3.5">
        <span className="block text-xs font-bold text-text" id="search-when-label">Check in</span>
        <div className="flex items-center gap-2" role="group" aria-labelledby="search-when-label">
          <label htmlFor="search-checkin" className="sr-only">Check-in date</label>
          <input
            id="search-checkin"
            data-testid="search-checkin"
            type="date"
            value={checkIn}
            min={today}
            onChange={(e) => {
              setCheckIn(e.target.value)
              if (checkOut && e.target.value >= checkOut) {
                setCheckOut('')
              }
            }}
            className="text-sm text-text-secondary outline-none bg-transparent w-[120px] mt-0.5"
          />
        </div>
      </div>

      <div className="w-px h-8 bg-border shrink-0" aria-hidden="true" />

      <div className="px-5 py-3.5">
        <label htmlFor="search-checkout" className="block text-xs font-bold text-text">Check out</label>
        <input
          id="search-checkout"
          data-testid="search-checkout"
          type="date"
          value={checkOut}
          min={checkOutMin}
          onChange={(e) => setCheckOut(e.target.value)}
          className="text-sm text-text-secondary outline-none bg-transparent w-[120px] mt-0.5"
        />
      </div>

      <div className="w-px h-8 bg-border shrink-0" aria-hidden="true" />

      <div className="flex items-center gap-2 pl-5 pr-2 py-2">
        <div>
          <label htmlFor="search-guests" className="block text-xs font-bold text-text">Who</label>
          <input
            id="search-guests"
            data-testid="search-guests"
            type="number"
            min={1}
            placeholder="Add guests"
            value={guests || ''}
            onChange={(e) => handleGuestsChange(e.target.value)}
            className="w-24 text-sm text-text-secondary outline-none bg-transparent placeholder-text-secondary mt-0.5"
          />
        </div>
        <button
          data-testid="search-button"
          type="submit"
          aria-label="Search"
          className="flex items-center justify-center gap-2 rounded-full bg-primary p-3.5 text-white hover:bg-primary-dark transition-colors shrink-0"
        >
          <Search size={16} aria-hidden="true" />
        </button>
      </div>
    </form>
  )
}
