import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../store'
import { setActiveTab, type TripsTab } from '../slices/tripsSlice'
import './TripsTabs.css'

const tabs: { key: TripsTab; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
  { key: 'tracked', label: 'Tracked' },
]

function TripsTabs() {
  const dispatch = useDispatch<AppDispatch>()
  const activeTab = useSelector((state: RootState) => state.trips.activeTab)

  return (
    <div className="trips-tabs" data-testid="trips-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`trips-tabs__tab ${activeTab === tab.key ? 'trips-tabs__tab--active' : ''}`}
          onClick={() => dispatch(setActiveTab(tab.key))}
          data-testid={`trips-tab-${tab.key}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default TripsTabs
