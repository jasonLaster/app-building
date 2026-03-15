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
      <div data-testid="property-detail-page" className="p-6 max-sm:p-3 max-w-6xl mx-auto flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    )
  }

  if (error || !property) {
    return (
      <div data-testid="property-detail-page" className="p-6 max-sm:p-3 max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-text-secondary">{error || 'Property not found'}</p>
        <button
          className="text-primary font-semibold hover:underline cursor-pointer"
          onClick={() => navigate('/')}
        >
          Back to listings
        </button>
      </div>
    )
  }

  return (
    <div data-testid="property-detail-page" className="px-6 max-sm:px-3 py-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[26px] font-semibold text-text leading-tight">{property.title}</h1>
        <div className="flex items-center gap-4 shrink-0">
          <button className="flex items-center gap-1.5 text-sm font-semibold text-text underline hover:no-underline cursor-pointer">
            <Share size={16} />
            Share
          </button>
          <button className="flex items-center gap-1.5 text-sm font-semibold text-text underline hover:no-underline cursor-pointer">
            <Heart size={16} />
            Save
          </button>
        </div>
      </div>

      <ImageGallery images={property.images || []} />

      <div className="mt-8 flex flex-col lg:flex-row gap-12">
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
    </div>
  )
}
