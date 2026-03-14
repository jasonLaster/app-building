import { useState } from 'react'
import { Wifi, Car, Tv, Flame, Wind, Waves, ShieldCheck, MapPin, Coffee, Utensils, WashingMachine, Snowflake, Check } from 'lucide-react'
import type { Amenity } from '../slices/propertiesSlice'

interface AmenitiesListProps {
  amenities: Amenity[]
}

const INITIAL_SHOW = 10

const iconMap: Record<string, React.ReactNode> = {
  wifi: <Wifi size={20} />,
  parking: <Car size={20} />,
  tv: <Tv size={20} />,
  heating: <Flame size={20} />,
  'air conditioning': <Snowflake size={20} />,
  pool: <Waves size={20} />,
  'smoke detector': <ShieldCheck size={20} />,
  'fire extinguisher': <ShieldCheck size={20} />,
  'first aid kit': <ShieldCheck size={20} />,
  'carbon monoxide detector': <ShieldCheck size={20} />,
  'near beach': <MapPin size={20} />,
  'near downtown': <MapPin size={20} />,
  coffee: <Coffee size={20} />,
  kitchen: <Utensils size={20} />,
  washer: <WashingMachine size={20} />,
  dryer: <Wind size={20} />,
}

function getIcon(amenity: Amenity) {
  if (amenity.icon) {
    const mapped = iconMap[amenity.icon.toLowerCase()]
    if (mapped) return mapped
  }
  const mapped = iconMap[amenity.name.toLowerCase()]
  if (mapped) return mapped
  return <Check size={20} />
}

export default function AmenitiesList({ amenities }: AmenitiesListProps) {
  const [showAll, setShowAll] = useState(false)

  if (amenities.length === 0) {
    return (
      <div data-testid="amenities-list" className="py-6 border-b border-border">
        <h2 className="text-lg font-semibold text-text mb-3">Amenities</h2>
        <p className="text-text-secondary">No amenities listed</p>
      </div>
    )
  }

  const categories = Array.from(new Set(amenities.map((a) => a.category)))
  const grouped = categories.map((cat) => ({
    category: cat,
    items: amenities.filter((a) => a.category === cat),
  }))

  const displayAmenities = showAll ? amenities : amenities.slice(0, INITIAL_SHOW)
  const displayCategories = showAll
    ? grouped
    : grouped
        .map((g) => ({
          ...g,
          items: g.items.filter((a) => displayAmenities.includes(a)),
        }))
        .filter((g) => g.items.length > 0)

  return (
    <div data-testid="amenities-list" className="py-6 border-b border-border">
      <h2 className="text-lg font-semibold text-text mb-4">Amenities</h2>
      <div className="space-y-4">
        {displayCategories.map((group) => (
          <div key={group.category}>
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-2">
              {group.category}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {group.items.map((amenity) => (
                <div
                  key={amenity.id}
                  data-testid={`amenity-${amenity.id}`}
                  className="flex items-center gap-3 text-text-secondary py-1"
                >
                  <span className="text-text-secondary">{getIcon(amenity)}</span>
                  <span>{amenity.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {amenities.length > INITIAL_SHOW && (
        <button
          data-testid="amenities-toggle"
          className="mt-4 font-semibold text-text underline cursor-pointer"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? 'Show less' : `Show all ${amenities.length} amenities`}
        </button>
      )}
    </div>
  )
}
