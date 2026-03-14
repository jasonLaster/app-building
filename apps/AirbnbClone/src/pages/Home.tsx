import { useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../store'
import { fetchProperties, setFilters, resetFilters, setPage } from '../slices/propertiesSlice'
import { fetchFavorites } from '../slices/favoritesSlice'
import SearchBar from '../components/SearchBar'
import CategoryFilter from '../components/CategoryFilter'
import PropertyGrid from '../components/PropertyGrid'
import FiltersPanel from '../components/FiltersPanel'
import Pagination from '../components/Pagination'

export default function Home() {
  const dispatch = useDispatch<AppDispatch>()
  const { items, loading, totalPages, filters } = useSelector((state: RootState) => state.properties)
  const currentUser = useSelector((state: RootState) => state.auth.currentUser)

  useEffect(() => {
    dispatch(fetchProperties(filters))
  }, [dispatch, filters])

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchFavorites(currentUser.id))
    }
  }, [dispatch, currentUser])

  const handleSearch = useCallback((searchFilters: { city: string; checkIn: string; checkOut: string; guests: number }) => {
    dispatch(setFilters({
      city: searchFilters.city,
      checkIn: searchFilters.checkIn,
      checkOut: searchFilters.checkOut,
      guests: searchFilters.guests,
      page: 1,
    }))
  }, [dispatch])

  const handleCategorySelect = useCallback((type: string) => {
    dispatch(setFilters({ propertyType: type, page: 1 }))
  }, [dispatch])

  const handleApplyFilters = useCallback((panelFilters: {
    minPrice: number
    maxPrice: number
    minBedrooms: number
    minBeds: number
    minBathrooms: number
    amenityIds: string[]
  }) => {
    dispatch(setFilters({ ...panelFilters, page: 1 }))
  }, [dispatch])

  const handleResetFilters = useCallback(() => {
    dispatch(resetFilters())
  }, [dispatch])

  const handlePageChange = useCallback((page: number) => {
    dispatch(setPage(page))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch])

  return (
    <div data-testid="home-page" className="p-6 max-sm:p-3 max-w-7xl mx-auto">
      <div className="mb-4">
        <SearchBar
          onSearch={handleSearch}
          initialCity={filters.city}
          initialCheckIn={filters.checkIn}
          initialCheckOut={filters.checkOut}
          initialGuests={filters.guests}
        />
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 overflow-hidden">
          <CategoryFilter
            selectedType={filters.propertyType}
            onSelectType={handleCategorySelect}
          />
        </div>
        <FiltersPanel
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          minBedrooms={filters.minBedrooms}
          minBeds={filters.minBeds}
          minBathrooms={filters.minBathrooms}
          selectedAmenityIds={filters.amenityIds}
          onApplyFilters={handleApplyFilters}
          onReset={handleResetFilters}
        />
      </div>

      <PropertyGrid properties={items} loading={loading} />

      <Pagination
        currentPage={filters.page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
