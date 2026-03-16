import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import PropertyDetail from './pages/PropertyDetail'
import MyTrips from './pages/MyTrips'
import HostDashboard from './pages/HostDashboard'
import Profile from './pages/Profile'
import WriteReview from './pages/WriteReview'
import Sidebar from './components/Sidebar'
import Footer from './components/Footer'

function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route path="/trips" element={<MyTrips />} />
          <Route path="/trips/:bookingId/review" element={<WriteReview />} />
          <Route path="/hosting" element={<HostDashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
