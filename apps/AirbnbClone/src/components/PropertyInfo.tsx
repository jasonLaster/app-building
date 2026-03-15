import { Clock } from 'lucide-react'
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

export default function PropertyInfo({ property }: PropertyInfoProps) {
  return (
    <div data-testid="property-info" className="py-6 border-b border-border">
      <div className="flex items-center gap-4 text-sm text-text-secondary">
        <div className="flex items-center gap-1.5">
          <Clock size={16} />
          <span>Check-in: {formatTime(property.check_in_time)}</span>
        </div>
        <span>·</span>
        <div className="flex items-center gap-1.5">
          <Clock size={16} />
          <span>Check-out: {formatTime(property.check_out_time)}</span>
        </div>
      </div>
    </div>
  )
}
