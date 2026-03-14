import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import SearchPage from './pages/SearchPage'
import SearchResultsPage from './pages/SearchResultsPage'
import FlightDetailsPage from './pages/FlightDetailsPage'
import './App.css'

function App() {
  return (
    <div className="app-layout" data-testid="app-layout">
      <Sidebar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/results" element={<SearchResultsPage />} />
          <Route path="/booking/:id" element={<FlightDetailsPage />} />
          <Route path="/trips" element={<div>My Trips (Coming Soon)</div>} />
          <Route path="/explore" element={<div>Explore (Coming Soon)</div>} />
        </Routes>
      </main>
    </div>
  )
}

export default App
