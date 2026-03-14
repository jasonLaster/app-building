import { Home, Users, BedDouble, Bath, Clock } from 'lucide-react'
import type { Property } from '../slices/propertiesSlice'

interface PropertyInfoProps {
  property: Property
}

function formatTime(time: string): string {
  const [hoursStr, minutesStr] = time.split(':')
  const hours = parseInt(hoursStr || '0', 10)
  const minutes = minutesStr || '00'
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes} ${ampm}`
}

function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural}`
}

export default function PropertyInfo({ property }: PropertyInfoProps) {
  return (
    <div data-testid="property-info" className="flex flex-wrap gap-4 py-6 border-b border-border">
      <div className="flex items-center gap-2 text-text-secondary">
        <Home size={20} />
        <span>{property.property_type}</span>
      </div>
      <div className="flex items-center gap-2 text-text-secondary">
        <Users size={20} />
        <span>{pluralize(property.max_guests, 'guest', 'guests')}</span>
      </div>
      <div className="flex items-center gap-2 text-text-secondary">
        <BedDouble size={20} />
        <span>{pluralize(property.bedrooms, 'bedroom', 'bedrooms')}</span>
      </div>
      <div className="flex items-center gap-2 text-text-secondary">
        <BedDouble size={16} />
        <span>{pluralize(property.beds, 'bed', 'beds')}</span>
      </div>
      <div className="flex items-center gap-2 text-text-secondary">
        <Bath size={20} />
        <span>{pluralize(property.bathrooms, 'bathroom', 'bathrooms')}</span>
      </div>
      <div className="flex items-center gap-2 text-text-secondary">
        <Clock size={18} />
        <span>Check-in: {formatTime(property.check_in_time)}</span>
      </div>
      <div className="flex items-center gap-2 text-text-secondary">
        <Clock size={18} />
        <span>Check-out: {formatTime(property.check_out_time)}</span>
      </div>
    </div>
  )
}
