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
      className="flex flex-wrap items-center gap-3 rounded-full border border-border bg-bg p-2 shadow-md"
    >
      <div className="flex-1 min-w-[160px]">
        <input
          data-testid="search-location"
          type="text"
          placeholder="Where are you going?"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full rounded-full px-4 py-2 text-sm text-text outline-none bg-transparent"
        />
      </div>
      <div className="border-l border-border pl-3">
        <input
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
          className="rounded-full px-3 py-2 text-sm text-text outline-none bg-transparent"
        />
      </div>
      <div className="border-l border-border pl-3">
        <input
          data-testid="search-checkout"
          type="date"
          value={checkOut}
          min={checkIn || today}
          onChange={(e) => setCheckOut(e.target.value)}
          className="rounded-full px-3 py-2 text-sm text-text outline-none bg-transparent"
        />
      </div>
      <div className="border-l border-border pl-3 flex items-center gap-2">
        <input
          data-testid="search-guests"
          type="number"
          min={1}
          placeholder="Guests"
          value={guests || ''}
          onChange={(e) => handleGuestsChange(e.target.value)}
          className="w-20 rounded-full px-3 py-2 text-sm text-text outline-none bg-transparent"
        />
      </div>
      <button
        data-testid="search-button"
        type="submit"
        className="flex items-center justify-center rounded-full bg-primary p-3 text-white hover:bg-primary-dark transition-colors"
      >
        <Search size={18} />
      </button>
    </form>
  )
}
