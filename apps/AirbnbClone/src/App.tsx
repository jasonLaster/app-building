import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<div>Home</div>} />
    </Routes>
  )
}

export default App
