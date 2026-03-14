import { useState } from 'react'
import type { Booking } from '../slices/bookingsSlice'
import TripCard from './TripCard'
import { Link } from 'react-router-dom'

type TabKey = 'upcoming' | 'past' | 'cancelled'

interface TripsTabsProps {
  bookings: Booking[]
  onCancelBooking: (booking: Booking) => void
}

const tabs: { key: TabKey; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
  { key: 'cancelled', label: 'Cancelled' },
]

function filterBookings(bookings: Booking[], tab: TabKey): Booking[] {
  const today = new Date().toISOString().split('T')[0]
  switch (tab) {
    case 'upcoming':
      return bookings
        .filter(
          (b) =>
            (b.status === 'pending' || b.status === 'confirmed') &&
            b.check_in.split('T')[0]! >= today!
        )
        .sort((a, b) => a.check_in.localeCompare(b.check_in))
    case 'past':
      return bookings
        .filter((b) => b.status === 'completed')
        .sort((a, b) => a.check_in.localeCompare(b.check_in))
    case 'cancelled':
      return bookings
        .filter((b) => b.status === 'cancelled')
        .sort((a, b) => a.check_in.localeCompare(b.check_in))
  }
}

export default function TripsTabs({ bookings, onCancelBooking }: TripsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('upcoming')
  const filtered = filterBookings(bookings, activeTab)

  return (
    <div data-testid="trips-tabs">
      <div className="flex gap-1 border-b border-border mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            data-testid={`tab-${tab.key}`}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-text text-text'
                : 'border-transparent text-text-secondary hover:text-text hover:border-border-dark'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div data-testid="trips-list">
        {filtered.length === 0 ? (
          <div data-testid="trips-empty-state" className="text-center py-12">
            <p className="text-text-secondary text-lg">
              {activeTab === 'upcoming' && 'No upcoming trips'}
              {activeTab === 'past' && 'No past trips'}
              {activeTab === 'cancelled' && 'No cancelled trips.'}
            </p>
            {activeTab === 'upcoming' && (
              <Link
                to="/"
                className="inline-block mt-3 text-primary hover:text-primary-dark font-medium"
              >
                Browse properties
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((booking) => (
              <TripCard
                key={booking.id}
                booking={booking}
                onCancel={() => onCancelBooking(booking)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
