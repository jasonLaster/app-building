import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { becomeHost } from '../slices/authSlice'
import type { AppDispatch } from '../store'
import { Home, Check } from 'lucide-react'

interface BecomeHostButtonProps {
  userId: string
  isHost: boolean
}

export default function BecomeHostButton({ userId, isHost }: BecomeHostButtonProps) {
  const dispatch = useDispatch<AppDispatch>()
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  if (isHost && !successMessage) return null

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await dispatch(becomeHost(userId)).unwrap()
      setShowConfirm(false)
      setSuccessMessage('You are now a host!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch {
      // Error handled by slice
    } finally {
      setLoading(false)
    }
  }

  return (
    <div data-testid="become-host-section">
      {successMessage && (
        <div data-testid="become-host-success" className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-success/10 text-success text-sm font-medium">
          <Check size={16} />
          {successMessage}
        </div>
      )}

      {!isHost && (
        <button
          data-testid="become-host-button"
          onClick={() => setShowConfirm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-white transition-colors"
          style={{ backgroundColor: '#FF5A5F' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E04E52')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FF5A5F')}
        >
          <Home size={18} />
          Become a Host
        </button>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" data-testid="become-host-dialog">
          <div className="bg-bg rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-text mb-2">Become a Host</h3>
            <p className="text-text-secondary text-sm mb-6">
              Are you sure you want to become a host? You'll be able to list properties and manage bookings.
            </p>
            <div className="flex gap-3">
              <button
                data-testid="become-host-cancel"
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="flex-1 py-2.5 rounded-lg border border-border text-text font-medium hover:bg-bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                data-testid="become-host-confirm"
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
