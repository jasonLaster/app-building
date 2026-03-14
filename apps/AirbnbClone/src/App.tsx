import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import PropertyDetail from './pages/PropertyDetail'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />
      <Route path="/properties/:id" element={<PropertyDetail />} />
    </Routes>
  )
}

export default App
