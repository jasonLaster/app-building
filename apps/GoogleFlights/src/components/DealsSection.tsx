import { useNavigate } from 'react-router-dom'
import type { Deal } from '../slices/exploreSlice'
import './DealsSection.css'

interface DealsSectionProps {
  deals: Deal[]
  loading: boolean
  originCode: string | null
}

function formatDateRange(dep: string, ret: string): string {
  const d = new Date(dep + 'T12:00:00')
  const r = new Date(ret + 'T12:00:00')
  const depStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const retStr = r.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${depStr} – ${retStr}`
}

function DealsSection({ deals, loading, originCode }: DealsSectionProps) {
  const navigate = useNavigate()

  function handleDealClick(deal: Deal) {
    const params = new URLSearchParams({
      origin: originCode || '',
      destination: deal.destination_code,
      departureDate: deal.departure_date,
      returnDate: deal.return_date,
    })
    navigate(`/results?${params.toString()}`)
  }

  return (
    <div className="deals-section" data-testid="deals-section">
      <h3 className="deals-section__title">Deals</h3>

      {loading ? (
        <div className="deals-section__loading" data-testid="deals-loading">
          <div className="deals-section__skeleton-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="deals-section__skeleton-card" />
            ))}
          </div>
        </div>
      ) : deals.length === 0 ? (
        <div className="deals-section__empty" data-testid="deals-empty">
          No deals available from this airport right now
        </div>
      ) : (
        <div className="deals-section__grid" data-testid="deals-grid">
          {deals.map((deal) => (
            <button
              key={`${deal.id}-${deal.departure_date}`}
              className="deals-section__card"
              onClick={() => handleDealClick(deal)}
              data-testid={`deal-card-${deal.destination_code}`}
            >
              <div
                className="deals-section__card-image"
                style={{ background: deal.gradient }}
              >
                <span className="deals-section__card-code">{deal.destination_code}</span>
              </div>
              <div className="deals-section__card-body">
                <div className="deals-section__card-destination">
                  <span className="deals-section__card-city">{deal.destination_city}</span>
                  <span className="deals-section__card-country">{deal.destination_country}</span>
                </div>
                <div className="deals-section__card-dates" data-testid={`deal-dates-${deal.destination_code}`}>
                  {formatDateRange(deal.departure_date, deal.return_date)}
                </div>
                <div className="deals-section__card-pricing">
                  <span className="deals-section__card-price" data-testid={`deal-price-${deal.destination_code}`}>
                    ${deal.price}
                  </span>
                  {deal.savings_percent > 0 && (
                    <span className="deals-section__card-savings" data-testid={`deal-savings-${deal.destination_code}`}>
                      ↓ {deal.savings_percent}% less than usual
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default DealsSection
