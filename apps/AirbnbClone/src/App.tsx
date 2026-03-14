import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import PropertyDetail from './pages/PropertyDetail'
import MyTrips from './pages/MyTrips'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />
      <Route path="/properties/:id" element={<PropertyDetail />} />
      <Route path="/trips" element={<MyTrips />} />
    </Routes>
  )
}

export default App
