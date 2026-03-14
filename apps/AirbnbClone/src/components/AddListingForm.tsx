import { useState, useEffect, useCallback, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { X, Plus, Trash2, ChevronLeft, ChevronRight, Minus, Check, Loader2 } from 'lucide-react'
import type { RootState, AppDispatch } from '../store'
import type { Amenity } from '../slices/propertiesSlice'
import { fetchAmenities } from '../slices/amenitiesSlice'
import { createProperty } from '../slices/hostSlice'

interface AddListingFormProps {
  hostId: string
  onClose: () => void
  onSuccess: () => void
}

interface FormData {
  propertyType: string
  title: string
  address: string
  city: string
  state: string
  country: string
  latitude: number | null
  longitude: number | null
  maxGuests: number
  bedrooms: number
  beds: number
  bathrooms: number
  selectedAmenities: string[]
  photos: { url: string; caption: string }[]
  pricePerNight: string
  cleaningFee: string
  description: string
}

const PROPERTY_TYPES = ['Apartment', 'House', 'Cabin', 'Villa', 'Condo', 'Loft', 'Cottage', 'Townhouse']
const TOTAL_STEPS = 7

const initialFormData: FormData = {
  propertyType: '',
  title: '',
  address: '',
  city: '',
  state: '',
  country: '',
  latitude: null,
  longitude: null,
  maxGuests: 1,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  selectedAmenities: [],
  photos: [],
  pricePerNight: '',
  cleaningFee: '0',
  description: '',
}

interface AddressSuggestion {
  display_name: string
  address?: {
    road?: string
    house_number?: string
    city?: string
    town?: string
    village?: string
    state?: string
    country?: string
  }
  lat: string
  lon: string
}

export default function AddListingForm({ hostId, onClose, onSuccess }: AddListingFormProps) {
  const dispatch = useDispatch<AppDispatch>()
  const amenities = useSelector((state: RootState) => state.amenities.items)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [photoUrl, setPhotoUrl] = useState('')
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [propertyTypeOpen, setPropertyTypeOpen] = useState(false)
  const propertyTypeRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (amenities.length === 0) {
      dispatch(fetchAmenities())
    }
  }, [dispatch, amenities.length])

  useEffect(() => {
    if (!propertyTypeOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (propertyTypeRef.current && !propertyTypeRef.current.contains(e.target as Node)) {
        setPropertyTypeOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [propertyTypeOpen])

  const fetchAddressSuggestions = useCallback(async (query: string) => {
    if (query.length < 3) {
      setAddressSuggestions([])
      return
    }
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(query)}&limit=5`
      )
      const data = await response.json() as AddressSuggestion[]
      setAddressSuggestions(data)
      setShowSuggestions(true)
    } catch {
      setAddressSuggestions([])
    }
  }, [])

  const handleAddressChange = (value: string) => {
    setFormData((prev) => ({ ...prev, address: value }))
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchAddressSuggestions(value)
    }, 300)
  }

  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    const addr = suggestion.address
    const road = addr?.house_number ? `${addr.house_number} ${addr.road || ''}` : (addr?.road || '')
    setFormData((prev) => ({
      ...prev,
      address: road || suggestion.display_name,
      city: addr?.city || addr?.town || addr?.village || '',
      state: addr?.state || '',
      country: addr?.country || '',
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon),
    }))
    setShowSuggestions(false)
    setAddressSuggestions([])
  }

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.propertyType) newErrors.propertyType = 'Property type is required'
      if (!formData.title.trim()) newErrors.title = 'Title is required'
    } else if (step === 2) {
      if (!formData.city.trim()) newErrors.city = 'City is required'
      if (!formData.country.trim()) newErrors.country = 'Country is required'
    } else if (step === 3) {
      if (formData.maxGuests < 1) newErrors.maxGuests = 'Max guests must be at least 1'
      if (formData.bedrooms < 1) newErrors.bedrooms = 'At least 1 bedroom is required'
      if (formData.beds < 1) newErrors.beds = 'At least 1 bed is required'
      if (formData.bathrooms < 1) newErrors.bathrooms = 'At least 1 bathroom is required'
    } else if (step === 5) {
      if (formData.photos.length === 0) newErrors.photos = 'At least one photo is required'
    } else if (step === 6) {
      const price = parseFloat(formData.pricePerNight)
      if (!price || price <= 0) newErrors.pricePerNight = 'Price per night is required and must be greater than 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) {
      setStep((s) => Math.min(s + 1, TOTAL_STEPS))
    }
  }

  const handleBack = () => {
    setErrors({})
    setStep((s) => Math.max(s - 1, 1))
  }

  const handleAddPhoto = () => {
    if (!photoUrl.trim()) return
    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, { url: photoUrl.trim(), caption: '' }],
    }))
    setPhotoUrl('')
    setErrors((prev) => {
      const next = { ...prev }
      delete next.photos
      return next
    })
  }

  const handleRemovePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }))
  }

  const toggleAmenity = (amenityId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedAmenities: prev.selectedAmenities.includes(amenityId)
        ? prev.selectedAmenities.filter((id) => id !== amenityId)
        : [...prev.selectedAmenities, amenityId],
    }))
  }

  const handlePublish = async () => {
    setPublishing(true)
    try {
      const result = await dispatch(createProperty({
        host_id: hostId,
        title: formData.title,
        description: formData.description,
        property_type: formData.propertyType,
        price_per_night: parseFloat(formData.pricePerNight),
        cleaning_fee: parseFloat(formData.cleaningFee) || 0,
        max_guests: formData.maxGuests,
        bedrooms: formData.bedrooms,
        beds: formData.beds,
        bathrooms: formData.bathrooms,
        address: formData.address,
        city: formData.city,
        state: formData.state || null,
        country: formData.country,
        latitude: formData.latitude,
        longitude: formData.longitude,
        amenity_ids: formData.selectedAmenities,
      })).unwrap()

      const propertyId = result.id

      for (let i = 0; i < formData.photos.length; i++) {
        const photo = formData.photos[i]
        if (photo) {
          await fetch('/api/property-images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              property_id: propertyId,
              url: photo.url,
              caption: photo.caption,
              display_order: i,
            }),
          })
        }
      }

      onSuccess()
    } catch {
      setErrors({ publish: 'Failed to publish listing. Please try again.' })
    } finally {
      setPublishing(false)
    }
  }

  const handleCancel = () => {
    setShowDiscardDialog(true)
  }

  const incrementField = (field: 'maxGuests' | 'bedrooms' | 'beds' | 'bathrooms') => {
    setFormData((prev) => ({ ...prev, [field]: prev[field] + 1 }))
  }

  const decrementField = (field: 'maxGuests' | 'bedrooms' | 'beds' | 'bathrooms') => {
    setFormData((prev) => ({ ...prev, [field]: Math.max(0, prev[field] - 1) }))
  }

  const amenitiesByCategory = amenities.reduce<Record<string, Amenity[]>>((acc, amenity) => {
    const cat = amenity.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(amenity)
    return acc
  }, {})

  const renderStepIndicator = () => (
    <div data-testid="step-indicator" className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
        <div
          key={s}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
            s < step
              ? 'bg-primary text-white'
              : s === step
                ? 'bg-primary text-white'
                : 'bg-bg-secondary text-text-secondary'
          }`}
        >
          {s < step ? <Check size={14} /> : s}
        </div>
      ))}
      <span className="ml-2 text-sm text-text-secondary">Step {step} of {TOTAL_STEPS}</span>
    </div>
  )

  const renderStep1 = () => (
    <div data-testid="add-listing-step-1">
      <h3 className="text-lg font-semibold text-text mb-4">Property Type & Title</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-text mb-1.5">Property Type *</label>
        <div className="relative" ref={propertyTypeRef}>
          <button
            type="button"
            data-testid="property-type-select"
            onClick={() => setPropertyTypeOpen(!propertyTypeOpen)}
            className={`w-full text-left px-4 py-3 rounded-lg border ${
              errors.propertyType ? 'border-error' : 'border-border'
            } bg-white text-sm focus:outline-none focus:border-primary`}
          >
            {formData.propertyType || 'Select property type...'}
          </button>
          {propertyTypeOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
              {PROPERTY_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  data-testid={`property-type-option-${type.toLowerCase()}`}
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, propertyType: type }))
                    setPropertyTypeOpen(false)
                    setErrors((prev) => {
                      const next = { ...prev }
                      delete next.propertyType
                      return next
                    })
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-bg-secondary transition-colors ${
                    formData.propertyType === type ? 'bg-primary/10 text-primary font-medium' : 'text-text'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>
        {errors.propertyType && <p className="text-error text-xs mt-1">{errors.propertyType}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-text mb-1.5">Title *</label>
        <input
          data-testid="listing-title-input"
          type="text"
          value={formData.title}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, title: e.target.value }))
            if (errors.title) setErrors((prev) => { const n = { ...prev }; delete n.title; return n })
          }}
          placeholder="Give your place a catchy title"
          className={`w-full px-4 py-3 rounded-lg border ${
            errors.title ? 'border-error' : 'border-border'
          } text-sm focus:outline-none focus:border-primary`}
        />
        {errors.title && <p className="text-error text-xs mt-1">{errors.title}</p>}
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div data-testid="add-listing-step-2">
      <h3 className="text-lg font-semibold text-text mb-4">Location</h3>

      <div className="mb-4 relative">
        <label className="block text-sm font-medium text-text mb-1.5">Address</label>
        <input
          data-testid="listing-address-input"
          type="text"
          value={formData.address}
          onChange={(e) => handleAddressChange(e.target.value)}
          onFocus={() => { if (addressSuggestions.length > 0) setShowSuggestions(true) }}
          placeholder="Start typing an address..."
          className="w-full px-4 py-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"
        />
        {showSuggestions && addressSuggestions.length > 0 && (
          <div
            data-testid="address-suggestions"
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto"
          >
            {addressSuggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectSuggestion(s)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-bg-secondary transition-colors border-b border-border last:border-b-0"
              >
                {s.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">City *</label>
          <input
            data-testid="listing-city-input"
            type="text"
            value={formData.city}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, city: e.target.value }))
              if (errors.city) setErrors((prev) => { const n = { ...prev }; delete n.city; return n })
            }}
            placeholder="City"
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.city ? 'border-error' : 'border-border'
            } text-sm focus:outline-none focus:border-primary`}
          />
          {errors.city && <p className="text-error text-xs mt-1">{errors.city}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">State</label>
          <input
            data-testid="listing-state-input"
            type="text"
            value={formData.state}
            onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
            placeholder="State/Province"
            className="w-full px-4 py-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-text mb-1.5">Country *</label>
        <input
          data-testid="listing-country-input"
          type="text"
          value={formData.country}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, country: e.target.value }))
            if (errors.country) setErrors((prev) => { const n = { ...prev }; delete n.country; return n })
          }}
          placeholder="Country"
          className={`w-full px-4 py-3 rounded-lg border ${
            errors.country ? 'border-error' : 'border-border'
          } text-sm focus:outline-none focus:border-primary`}
        />
        {errors.country && <p className="text-error text-xs mt-1">{errors.country}</p>}
      </div>
    </div>
  )

  const renderStep3 = () => {
    const fields: { key: 'maxGuests' | 'bedrooms' | 'beds' | 'bathrooms'; label: string }[] = [
      { key: 'maxGuests', label: 'Max Guests' },
      { key: 'bedrooms', label: 'Bedrooms' },
      { key: 'beds', label: 'Beds' },
      { key: 'bathrooms', label: 'Bathrooms' },
    ]

    return (
      <div data-testid="add-listing-step-3">
        <h3 className="text-lg font-semibold text-text mb-4">Property Details</h3>
        <div className="space-y-4">
          {fields.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <label className="text-sm font-medium text-text">{label} *</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  data-testid={`${key}-decrement`}
                  onClick={() => decrementField(key)}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-secondary hover:border-text transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span data-testid={`${key}-value`} className="text-lg font-medium text-text w-8 text-center">
                  {formData[key]}
                </span>
                <button
                  type="button"
                  data-testid={`${key}-increment`}
                  onClick={() => incrementField(key)}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-secondary hover:border-text transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
              {errors[key] && <p className="text-error text-xs">{errors[key]}</p>}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderStep4 = () => (
    <div data-testid="add-listing-step-4">
      <h3 className="text-lg font-semibold text-text mb-4">Amenities</h3>
      <p className="text-sm text-text-secondary mb-4">Select the amenities your property offers (optional)</p>
      {Object.entries(amenitiesByCategory).map(([category, items]) => (
        <div key={category} className="mb-6">
          <h4 className="text-sm font-semibold text-text mb-2 capitalize">{category}</h4>
          <div className="grid grid-cols-2 gap-2">
            {items.map((amenity) => (
              <label
                key={amenity.id}
                data-testid={`amenity-checkbox-${amenity.id}`}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                  formData.selectedAmenities.includes(amenity.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-border-dark'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.selectedAmenities.includes(amenity.id)}
                  onChange={() => toggleAmenity(amenity.id)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                    formData.selectedAmenities.includes(amenity.id)
                      ? 'bg-primary border-primary'
                      : 'border-border-dark'
                  }`}
                >
                  {formData.selectedAmenities.includes(amenity.id) && (
                    <Check size={10} className="text-white" />
                  )}
                </div>
                <span className="text-sm text-text">{amenity.name}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  const renderStep5 = () => (
    <div data-testid="add-listing-step-5">
      <h3 className="text-lg font-semibold text-text mb-4">Photos</h3>

      <div className="flex gap-2 mb-4">
        <input
          data-testid="photo-url-input"
          type="text"
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddPhoto() } }}
          placeholder="Enter image URL..."
          className="flex-1 px-4 py-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"
        />
        <button
          type="button"
          data-testid="add-photo-button"
          onClick={handleAddPhoto}
          className="px-4 py-3 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          Add Photo
        </button>
      </div>

      {errors.photos && <p className="text-error text-xs mb-3">{errors.photos}</p>}

      {formData.photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {formData.photos.map((photo, index) => (
            <div key={index} data-testid={`photo-item-${index}`} className="relative group">
              <div className="aspect-[4/3] rounded-lg overflow-hidden border border-border">
                <img
                  src={photo.url}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = ''
                    ;(e.target as HTMLImageElement).alt = 'Failed to load'
                  }}
                />
              </div>
              <button
                type="button"
                data-testid={`remove-photo-${index}`}
                onClick={() => handleRemovePhoto(index)}
                className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              >
                <Trash2 size={14} className="text-status-cancelled" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderStep6 = () => (
    <div data-testid="add-listing-step-6">
      <h3 className="text-lg font-semibold text-text mb-4">Pricing</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-text mb-1.5">Price per Night *</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">$</span>
          <input
            data-testid="price-per-night-input"
            type="text"
            inputMode="decimal"
            value={formData.pricePerNight}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9.]/g, '')
              setFormData((prev) => ({ ...prev, pricePerNight: val }))
              if (errors.pricePerNight) setErrors((prev) => { const n = { ...prev }; delete n.pricePerNight; return n })
            }}
            placeholder="0"
            className={`w-full pl-8 pr-4 py-3 rounded-lg border ${
              errors.pricePerNight ? 'border-error' : 'border-border'
            } text-sm focus:outline-none focus:border-primary`}
          />
        </div>
        {errors.pricePerNight && <p className="text-error text-xs mt-1">{errors.pricePerNight}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-text mb-1.5">Cleaning Fee</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">$</span>
          <input
            data-testid="cleaning-fee-input"
            type="text"
            inputMode="decimal"
            value={formData.cleaningFee}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9.]/g, '')
              setFormData((prev) => ({ ...prev, cleaningFee: val }))
            }}
            placeholder="0"
            className="w-full pl-8 pr-4 py-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"
          />
        </div>
      </div>
    </div>
  )

  const renderStep7 = () => {
    const selectedAmenityNames = amenities
      .filter((a) => formData.selectedAmenities.includes(a.id))
      .map((a) => a.name)

    return (
      <div data-testid="add-listing-step-7">
        <h3 className="text-lg font-semibold text-text mb-4">Review & Publish</h3>

        {errors.publish && (
          <div className="bg-error/10 text-error text-sm px-4 py-3 rounded-lg mb-4">{errors.publish}</div>
        )}

        <div className="space-y-4">
          <div className="bg-bg-secondary rounded-lg p-4">
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Property</h4>
            <p className="text-sm"><strong>Type:</strong> {formData.propertyType}</p>
            <p className="text-sm"><strong>Title:</strong> {formData.title}</p>
          </div>

          <div className="bg-bg-secondary rounded-lg p-4">
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Location</h4>
            <p className="text-sm">
              {[formData.address, formData.city, formData.state, formData.country].filter(Boolean).join(', ')}
            </p>
          </div>

          <div className="bg-bg-secondary rounded-lg p-4">
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p><strong>Guests:</strong> {formData.maxGuests}</p>
              <p><strong>Bedrooms:</strong> {formData.bedrooms}</p>
              <p><strong>Beds:</strong> {formData.beds}</p>
              <p><strong>Bathrooms:</strong> {formData.bathrooms}</p>
            </div>
          </div>

          {selectedAmenityNames.length > 0 && (
            <div className="bg-bg-secondary rounded-lg p-4">
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Amenities</h4>
              <p className="text-sm">{selectedAmenityNames.join(', ')}</p>
            </div>
          )}

          {formData.photos.length > 0 && (
            <div className="bg-bg-secondary rounded-lg p-4">
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Photos</h4>
              <div className="flex gap-2 overflow-x-auto">
                {formData.photos.map((photo, i) => (
                  <div key={i} className="w-20 h-16 rounded-lg overflow-hidden shrink-0 border border-border">
                    <img src={photo.url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-bg-secondary rounded-lg p-4">
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Pricing</h4>
            <p className="text-sm"><strong>Price per night:</strong> ${formData.pricePerNight}</p>
            <p className="text-sm"><strong>Cleaning fee:</strong> ${formData.cleaningFee || '0'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      data-testid="add-listing-form"
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 shadow-lg">
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-text">Add New Listing</h2>
          <button
            data-testid="add-listing-close"
            onClick={handleCancel}
            className="w-8 h-8 rounded-full hover:bg-bg-secondary flex items-center justify-center transition-colors"
          >
            <X size={20} className="text-text-secondary" />
          </button>
        </div>

        <div className="px-6 py-6">
          {renderStepIndicator()}

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderStep5()}
          {step === 6 && renderStep6()}
          {step === 7 && renderStep7()}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-border px-6 py-4 flex items-center justify-between">
          <button
            data-testid="add-listing-cancel"
            onClick={handleCancel}
            className="px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text transition-colors"
          >
            Cancel
          </button>
          <div className="flex gap-3">
            {step > 1 && (
              <button
                data-testid="add-listing-back"
                onClick={handleBack}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-text bg-bg-secondary rounded-lg hover:bg-border transition-colors"
              >
                <ChevronLeft size={16} />
                Back
              </button>
            )}
            {step < TOTAL_STEPS ? (
              <button
                data-testid="add-listing-next"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
              >
                Next
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                data-testid="add-listing-publish"
                onClick={handlePublish}
                disabled={publishing}
                className="flex items-center gap-1.5 px-6 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {publishing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Publishing...
                  </>
                ) : (
                  'Publish'
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {showDiscardDialog && (
        <div
          data-testid="discard-dialog"
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
          onClick={() => setShowDiscardDialog(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-text mb-2">Discard your listing?</h3>
            <p className="text-text-secondary mb-6">All entered information will be lost.</p>
            <div className="flex gap-3 justify-end">
              <button
                data-testid="discard-dialog-keep"
                onClick={() => setShowDiscardDialog(false)}
                className="px-4 py-2 text-sm font-medium text-text bg-bg-secondary rounded-lg hover:bg-border transition-colors"
              >
                Keep Editing
              </button>
              <button
                data-testid="discard-dialog-confirm"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-white bg-status-cancelled rounded-lg hover:opacity-90 transition-opacity"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
