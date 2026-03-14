import { Home, Calendar, DollarSign, Star } from 'lucide-react'
import type { HostStats } from '../slices/hostSlice'

interface StatsOverviewProps {
  stats: HostStats
  loading: boolean
}

export default function StatsOverview({ stats, loading }: StatsOverviewProps) {
  const cards = [
    {
      label: 'Total Listings',
      value: String(stats.totalListings),
      icon: Home,
      testId: 'stat-total-listings',
    },
    {
      label: 'Active Bookings',
      value: String(stats.activeBookings),
      icon: Calendar,
      testId: 'stat-active-bookings',
    },
    {
      label: 'Total Earnings',
      value: `$${stats.totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      testId: 'stat-total-earnings',
    },
    {
      label: 'Average Rating',
      value: stats.reviewCount > 0 ? Number(stats.avgRating).toFixed(1) : '—',
      icon: Star,
      testId: 'stat-average-rating',
    },
  ]

  if (loading) {
    return (
      <div data-testid="stats-overview" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-border p-5 animate-pulse">
            <div className="h-4 bg-bg-secondary rounded w-24 mb-3" />
            <div className="h-8 bg-bg-secondary rounded w-16" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div data-testid="stats-overview" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.testId}
          data-testid={card.testId}
          className="bg-white rounded-xl border border-border p-5 flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <card.icon size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-sm text-text-secondary font-medium">{card.label}</p>
            <p className="text-2xl font-bold text-text mt-0.5 flex items-center gap-1">
              {card.label === 'Average Rating' && stats.reviewCount > 0 && (
                <Star size={18} className="fill-status-pending text-status-pending" />
              )}
              {card.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
