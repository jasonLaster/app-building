import { useState, useRef, useEffect, useCallback } from 'react'
import type { Airport } from '../slices/searchSlice'
import './AirportAutocomplete.css'

interface AirportAutocompleteProps {
  value: Airport | null
  onChange: (airport: Airport | null) => void
  placeholder: string
  error?: string
  testIdPrefix: string
}

function AirportAutocomplete({ value, onChange, placeholder, error, testIdPrefix }: AirportAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Airport[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [noResults, setNoResults] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 1) {
      setSuggestions([])
      setIsOpen(false)
      setNoResults(false)
      return
    }
    try {
      const res = await fetch(`/api/airports?q=${encodeURIComponent(searchQuery)}`)
      const data = (await res.json()) as Airport[]
      setSuggestions(data)
      setIsOpen(true)
      setNoResults(data.length === 0)
    } catch {
      setSuggestions([])
      setNoResults(false)
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleInputChange(val: string) {
    setQuery(val)
    if (value) {
      onChange(null)
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(val)
    }, 200)
  }

  function handleSelect(airport: Airport) {
    onChange(airport)
    setQuery('')
    setSuggestions([])
    setIsOpen(false)
    setNoResults(false)
  }

  function handleFocus() {
    setIsFocused(true)
    if (value) {
      setQuery('')
    }
  }

  const displayValue = isFocused
    ? query
    : value
      ? `${value.city} (${value.iata_code})`
      : ''

  return (
    <div className={`airport-autocomplete ${error ? 'airport-autocomplete--error' : ''}`} ref={ref} data-testid={`${testIdPrefix}-container`}>
      <input
        ref={inputRef}
        type="text"
        className="airport-autocomplete__input"
        value={displayValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={() => {
          // Delay to allow click on suggestion
          setTimeout(() => {
            if (!ref.current?.contains(document.activeElement)) {
              setIsFocused(false)
              setIsOpen(false)
            }
          }, 150)
        }}
        placeholder={placeholder}
        data-testid={`${testIdPrefix}-input`}
      />
      {error && <span className="airport-autocomplete__error" data-testid={`${testIdPrefix}-error`}>{error}</span>}
      {isOpen && (
        <div className="airport-autocomplete__dropdown" data-testid={`${testIdPrefix}-dropdown`}>
          {noResults ? (
            <div className="airport-autocomplete__no-results" data-testid={`${testIdPrefix}-no-results`}>
              No airports found
            </div>
          ) : (
            suggestions.map((airport) => (
              <button
                key={airport.id}
                className="airport-autocomplete__suggestion"
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleSelect(airport)
                }}
                data-testid={`${testIdPrefix}-suggestion-${airport.iata_code}`}
              >
                <span className="airport-autocomplete__suggestion-name">
                  {airport.name}
                </span>
                <span className="airport-autocomplete__suggestion-code">
                  {airport.iata_code}
                </span>
                <span className="airport-autocomplete__suggestion-city">
                  {airport.city}, {airport.country}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default AirportAutocomplete
