import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchPopularDestinations } from '../slices/searchSlice'
import type { RootState, AppDispatch } from '../store'
import './PopularDestinations.css'

function PopularDestinations() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { popularDestinations, popularDestinationsLoading } = useSelector(
    (state: RootState) => state.search
  )

  useEffect(() => {
    dispatch(fetchPopularDestinations())
  }, [dispatch])

  function handleClick(dest: (typeof popularDestinations)[number]) {
    // Navigate to results with this destination
    const params = new URLSearchParams({
      destination: dest.iata_code,
    })
    navigate(`/results?${params.toString()}`)
  }

  if (popularDestinationsLoading) {
    return (
      <div className="popular-destinations" data-testid="popular-destinations">
        <h3 className="popular-destinations__title">Popular destinations</h3>
        <div className="popular-destinations__grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="popular-destinations__skeleton" />
          ))}
        </div>
      </div>
    )
  }

  if (popularDestinations.length === 0) return null

  return (
    <div className="popular-destinations" data-testid="popular-destinations">
      <h3 className="popular-destinations__title">Popular destinations</h3>
      <div className="popular-destinations__grid" data-testid="popular-destinations-grid">
        {popularDestinations.map((dest) => (
          <button
            key={dest.id}
            className="popular-destinations__card"
            onClick={() => handleClick(dest)}
            data-testid={`popular-dest-${dest.iata_code}`}
          >
            <div
              className="popular-destinations__image"
              style={{ background: dest.gradient }}
            >
              <span className="popular-destinations__code">{dest.iata_code}</span>
            </div>
            <div className="popular-destinations__info">
              <span className="popular-destinations__city">{dest.city}</span>
              <span className="popular-destinations__country">{dest.country}</span>
              {dest.min_price !== null && (
                <span className="popular-destinations__price" data-testid={`popular-dest-price-${dest.iata_code}`}>
                  from ${dest.min_price}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default PopularDestinations
