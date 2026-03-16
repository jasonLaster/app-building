import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Loader2, Share, Heart } from 'lucide-react'
import type { RootState, AppDispatch } from '../store'
import { fetchPropertyDetail, clearPropertyDetail } from '../slices/propertyDetailSlice'
import ImageGallery from '../components/ImageGallery'
import PropertyHeader from '../components/PropertyHeader'
import PropertyInfo from '../components/PropertyInfo'
import PropertyDescription from '../components/PropertyDescription'
import AmenitiesList from '../components/AmenitiesList'
import BookingCard from '../components/BookingCard'
import ReviewsSection from '../components/ReviewsSection'
import HostInfoCard from '../components/HostInfoCard'

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { property, loading, error } = useSelector((state: RootState) => state.propertyDetail)

  useEffect(() => {
    if (id) {
      dispatch(fetchPropertyDetail(id))
    }
    return () => {
      dispatch(clearPropertyDetail())
    }
  }, [dispatch, id])

  if (loading) {
    return (
      <main data-testid="property-detail-page" className="p-6 max-sm:p-3 max-w-[1120px] mx-auto flex items-center justify-center min-h-[60vh]" aria-busy="true">
        <Loader2 size={32} className="animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">Loading property details</span>
      </main>
    )
  }

  if (error || !property) {
    return (
      <main data-testid="property-detail-page" className="p-6 max-sm:p-3 max-w-[1120px] mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-text-secondary" role="alert">{error || 'Property not found'}</p>
        <button
          className="text-primary font-semibold hover:underline cursor-pointer"
          onClick={() => navigate('/')}
        >
          Back to listings
        </button>
      </main>
    )
  }

  return (
    <main data-testid="property-detail-page" className="px-6 max-sm:px-3 py-6 max-w-[1120px] mx-auto">
      {/* Title section above images - Airbnb style */}
      <h1 className="text-[26px] max-sm:text-[20px] font-semibold text-text mb-1">{property.title}</h1>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-text underline cursor-pointer">
          {property.city}, {property.country}
        </p>
        <div className="flex items-center gap-4 shrink-0">
          <button className="flex items-center gap-1.5 text-sm font-semibold text-text underline hover:no-underline cursor-pointer">
            <Share size={16} aria-hidden="true" />
            <span className="max-sm:hidden">Share</span>
          </button>
          <button className="flex items-center gap-1.5 text-sm font-semibold text-text underline hover:no-underline cursor-pointer">
            <Heart size={16} aria-hidden="true" />
            <span className="max-sm:hidden">Save</span>
          </button>
        </div>
      </div>

      <ImageGallery images={property.images || []} />

      <div className="mt-10 max-sm:mt-6 flex flex-col lg:flex-row gap-12 max-md:gap-8">
        <div className="flex-1 min-w-0">
          <PropertyHeader property={property} />
          <PropertyInfo property={property} />
          <PropertyDescription description={property.description} />
          <AmenitiesList amenities={property.amenities || []} />
          <ReviewsSection reviews={property.reviews || []} />
          <HostInfoCard property={property} />
        </div>

        <div className="w-full lg:w-[372px] shrink-0">
          <BookingCard property={property} />
        </div>
      </div>
    </main>
  )
}
