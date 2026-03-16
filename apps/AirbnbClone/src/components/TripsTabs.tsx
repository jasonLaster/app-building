import { useState, useRef } from 'react'
import type { Booking } from '../slices/bookingsSlice'
import TripCard from './TripCard'
import { Link } from 'react-router-dom'

type TabKey = 'upcoming' | 'past' | 'cancelled'

interface TripsTabsProps {
  bookings: Booking[]
  onCancelBooking: (booking: Booking) => void
  hasMore?: boolean
  loadingMore?: boolean
  onLoadMore?: () => void
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

export default function TripsTabs({ bookings, onCancelBooking, hasMore, loadingMore, onLoadMore }: TripsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('upcoming')
  const filtered = filterBookings(bookings, activeTab)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const handleTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex: number | null = null
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % tabs.length
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + tabs.length) % tabs.length
    } else if (e.key === 'Home') {
      nextIndex = 0
    } else if (e.key === 'End') {
      nextIndex = tabs.length - 1
    }
    if (nextIndex !== null) {
      e.preventDefault()
      setActiveTab(tabs[nextIndex]!.key)
      tabRefs.current[nextIndex]?.focus()
    }
  }

  return (
    <div data-testid="trips-tabs">
      <div className="flex gap-1 border-b border-border mb-6" role="tablist" aria-label="Trip categories">
        {tabs.map((tab, index) => (
          <button
            key={tab.key}
            ref={(el) => { tabRefs.current[index] = el }}
            data-testid={`tab-${tab.key}`}
            role="tab"
            aria-selected={activeTab === tab.key}
            aria-controls={`tabpanel-${tab.key}`}
            id={`tab-${tab.key}`}
            tabIndex={activeTab === tab.key ? 0 : -1}
            onClick={() => setActiveTab(tab.key)}
            onKeyDown={(e) => handleTabKeyDown(e, index)}
            className={`px-4 max-sm:px-3 py-3 max-sm:py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-text text-text'
                : 'border-transparent text-text-secondary hover:text-text hover:border-border-dark'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        data-testid="trips-list"
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
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
          <ul className="grid gap-4" role="list">
            {filtered.map((booking) => (
              <li key={booking.id}>
                <TripCard
                  booking={booking}
                  onCancel={() => onCancelBooking(booking)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {hasMore && (
        <div className="text-center mt-6">
          <button
            data-testid="load-more-trips"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="px-6 py-2.5 text-sm font-medium text-text border border-border rounded-lg hover:bg-bg-secondary transition-colors disabled:opacity-50"
          >
            {loadingMore ? 'Loading...' : 'Load more trips'}
          </button>
        </div>
      )}
    </div>
  )
}
