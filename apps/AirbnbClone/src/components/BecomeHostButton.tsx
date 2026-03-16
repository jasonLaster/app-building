import { useState, useEffect, useRef, useCallback } from 'react'
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
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)

  const closeDialog = useCallback(() => {
    setShowConfirm(false)
    triggerRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!showConfirm) return

    cancelRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDialog()
        return
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled])'
        )
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (!first || !last) return
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showConfirm, closeDialog])

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
      <div aria-live="polite">
        {successMessage && (
          <div data-testid="become-host-success" className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-success/10 text-success text-sm font-medium">
            <Check size={16} aria-hidden="true" />
            {successMessage}
          </div>
        )}
      </div>

      {!isHost && (
        <button
          ref={triggerRef}
          data-testid="become-host-button"
          onClick={() => setShowConfirm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-white transition-colors"
          style={{ backgroundColor: '#FF5A5F' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E04E52')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FF5A5F')}
        >
          <Home size={18} aria-hidden="true" />
          Become a Host
        </button>
      )}

      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          data-testid="become-host-dialog"
          onClick={(e) => { if (e.target === e.currentTarget) closeDialog() }}
          onKeyDown={() => {}}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="become-host-dialog-title"
            className="bg-bg rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl"
          >
            <h3 id="become-host-dialog-title" className="text-lg font-semibold text-text mb-2">Become a Host</h3>
            <p className="text-text-secondary text-sm mb-6">
              Are you sure you want to become a host? You'll be able to list properties and manage bookings.
            </p>
            <div className="flex gap-3">
              <button
                ref={cancelRef}
                data-testid="become-host-cancel"
                onClick={closeDialog}
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
