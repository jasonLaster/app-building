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
    <div data-testid="home-page">
      <h1 className="sr-only">Find your next stay</h1>

      {/* Search section */}
      <div className="py-4 px-6 max-sm:px-3 border-b border-border">
        <SearchBar
          onSearch={handleSearch}
          initialCity={filters.city}
          initialCheckIn={filters.checkIn}
          initialCheckOut={filters.checkOut}
          initialGuests={filters.guests}
        />
      </div>

      {/* Category filter + Filters button */}
      <div className="sticky top-[80px] z-40 bg-bg border-b border-border">
        <div className="max-w-[1280px] mx-auto px-6 max-sm:px-3 flex items-center gap-4">
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
      </div>

      {/* Property grid */}
      <div className="max-w-[1280px] mx-auto px-6 max-sm:px-3 pt-6 pb-8">
        <PropertyGrid properties={items} loading={loading} />

        <Pagination
          currentPage={filters.page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  )
}
