import { useState, useEffect, useRef, useCallback } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../store'
import { fetchAmenities } from '../slices/amenitiesSlice'
import type { Amenity } from '../slices/propertiesSlice'

interface FiltersPanelProps {
  minPrice: number
  maxPrice: number
  minBedrooms: number
  minBeds: number
  minBathrooms: number
  selectedAmenityIds: string[]
  onApplyFilters: (filters: {
    minPrice: number
    maxPrice: number
    minBedrooms: number
    minBeds: number
    minBathrooms: number
    amenityIds: string[]
  }) => void
  onReset: () => void
}

export default function FiltersPanel({
  minPrice,
  maxPrice,
  minBedrooms,
  minBeds,
  minBathrooms,
  selectedAmenityIds,
  onApplyFilters,
  onReset,
}: FiltersPanelProps) {
  const dispatch = useDispatch<AppDispatch>()
  const amenities = useSelector((state: RootState) => state.amenities.items)
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  const [localMinPrice, setLocalMinPrice] = useState(minPrice)
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice)
  const [localMinBedrooms, setLocalMinBedrooms] = useState(minBedrooms)
  const [localMinBeds, setLocalMinBeds] = useState(minBeds)
  const [localMinBathrooms, setLocalMinBathrooms] = useState(minBathrooms)
  const [localAmenityIds, setLocalAmenityIds] = useState<string[]>(selectedAmenityIds)

  useEffect(() => {
    if (isOpen && amenities.length === 0) {
      dispatch(fetchAmenities())
    }
  }, [isOpen, amenities.length, dispatch])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      toggleRef.current?.focus()
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleKeyDown])

  useEffect(() => {
    setLocalMinPrice(minPrice)
    setLocalMaxPrice(maxPrice)
    setLocalMinBedrooms(minBedrooms)
    setLocalMinBeds(minBeds)
    setLocalMinBathrooms(minBathrooms)
    setLocalAmenityIds(selectedAmenityIds)
  }, [minPrice, maxPrice, minBedrooms, minBeds, minBathrooms, selectedAmenityIds])

  const toggleAmenity = (id: string) => {
    setLocalAmenityIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  const handleApply = () => {
    onApplyFilters({
      minPrice: localMinPrice,
      maxPrice: localMaxPrice,
      minBedrooms: localMinBedrooms,
      minBeds: localMinBeds,
      minBathrooms: localMinBathrooms,
      amenityIds: localAmenityIds,
    })
  }

  const handleReset = () => {
    setLocalMinPrice(0)
    setLocalMaxPrice(0)
    setLocalMinBedrooms(0)
    setLocalMinBeds(0)
    setLocalMinBathrooms(0)
    setLocalAmenityIds([])
    onReset()
  }

  // Group amenities by category
  const grouped = amenities.reduce<Record<string, Amenity[]>>((acc, a) => {
    const list = acc[a.category]
    if (!list) {
      acc[a.category] = [a]
    } else {
      list.push(a)
    }
    return acc
  }, {})

  return (
    <div data-testid="filters-panel-container">
      <button
        ref={toggleRef}
        data-testid="filters-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-xs font-semibold text-text hover:border-text transition-colors"
      >
        <SlidersHorizontal size={16} aria-hidden="true" />
        Filters
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          data-testid="filters-panel"
          role="dialog"
          aria-label="Filters"
          className="mt-3 rounded-xl border border-border bg-bg p-5 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text text-lg">Filters</h3>
            <button onClick={() => { setIsOpen(false); toggleRef.current?.focus() }} aria-label="Close filters" className="text-text-secondary hover:text-text">
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          {/* Price Range */}
          <fieldset className="mb-5">
            <legend className="font-medium text-text text-sm mb-2">Price range</legend>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label htmlFor="filter-min-price" className="text-xs text-text-secondary">Min price</label>
                <input
                  id="filter-min-price"
                  data-testid="filter-min-price"
                  type="text"
                  inputMode="decimal"
                  value={localMinPrice || ''}
                  onChange={(e) => setLocalMinPrice(parseFloat(e.target.value) || 0)}
                  placeholder="$0"
                  className="w-full mt-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-text"
                />
              </div>
              <span className="text-text-secondary mt-4" aria-hidden="true">–</span>
              <div className="flex-1">
                <label htmlFor="filter-max-price" className="text-xs text-text-secondary">Max price</label>
                <input
                  id="filter-max-price"
                  data-testid="filter-max-price"
                  type="text"
                  inputMode="decimal"
                  value={localMaxPrice || ''}
                  onChange={(e) => setLocalMaxPrice(parseFloat(e.target.value) || 0)}
                  placeholder="Any"
                  className="w-full mt-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-text"
                />
              </div>
            </div>
          </fieldset>

          {/* Rooms */}
          <fieldset className="mb-5">
            <legend className="font-medium text-text text-sm mb-2">Rooms and beds</legend>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="filter-min-bedrooms" className="text-xs text-text-secondary">Bedrooms</label>
                <select
                  id="filter-min-bedrooms"
                  data-testid="filter-min-bedrooms"
                  value={localMinBedrooms}
                  onChange={(e) => setLocalMinBedrooms(parseInt(e.target.value, 10))}
                  className="w-full mt-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-text bg-bg"
                >
                  <option value={0}>Any</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>{n}+</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="filter-min-beds" className="text-xs text-text-secondary">Beds</label>
                <select
                  id="filter-min-beds"
                  data-testid="filter-min-beds"
                  value={localMinBeds}
                  onChange={(e) => setLocalMinBeds(parseInt(e.target.value, 10))}
                  className="w-full mt-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-text bg-bg"
                >
                  <option value={0}>Any</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>{n}+</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="filter-min-bathrooms" className="text-xs text-text-secondary">Bathrooms</label>
                <select
                  id="filter-min-bathrooms"
                  data-testid="filter-min-bathrooms"
                  value={localMinBathrooms}
                  onChange={(e) => setLocalMinBathrooms(parseInt(e.target.value, 10))}
                  className="w-full mt-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-text bg-bg"
                >
                  <option value={0}>Any</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>{n}+</option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>

          {/* Amenities */}
          {Object.keys(grouped).length > 0 && (
            <div className="mb-5">
              <h4 className="font-medium text-text text-sm mb-2">Amenities</h4>
              {Object.entries(grouped).map(([category, items]) => (
                <div key={category} className="mb-3">
                  <p className="text-xs text-text-secondary font-medium mb-1.5">{category}</p>
                  <div className="flex flex-wrap gap-2">
                    {items.map((amenity) => (
                      <label
                        key={amenity.id}
                        data-testid={`amenity-checkbox-${amenity.id}`}
                        className="flex items-center gap-1.5 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={localAmenityIds.includes(amenity.id)}
                          onChange={() => toggleAmenity(amenity.id)}
                          className="rounded accent-primary"
                        />
                        <span className="text-sm text-text">{amenity.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <button
              data-testid="filters-reset"
              onClick={handleReset}
              className="text-sm font-medium text-text-secondary underline hover:text-text"
            >
              Clear all
            </button>
            <button
              data-testid="filters-apply"
              onClick={handleApply}
              className="rounded-lg bg-text text-bg px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Show results
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
