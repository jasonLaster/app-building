import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Edit, Power, Plus, Loader2, MapPin } from 'lucide-react'
import type { Property } from '../slices/propertiesSlice'

interface ListingsTabProps {
  listings: Property[]
  loading: boolean
  onDeactivate: (property: Property) => Promise<void>
  onActivate: (property: Property) => Promise<void>
  onAddListing: () => void
}

export default function ListingsTab({ listings, loading, onDeactivate, onActivate, onAddListing }: ListingsTabProps) {
  const navigate = useNavigate()
  const [confirmDialog, setConfirmDialog] = useState<Property | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setConfirmDialog(null)
    }
    if (e.key === 'Tab' && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last?.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }
  }, [])

  useEffect(() => {
    if (confirmDialog) {
      document.addEventListener('keydown', handleKeyDown)
      dialogRef.current?.querySelector<HTMLElement>('button')?.focus()
      return () => document.removeEventListener('keydown', handleKeyDown)
    } else {
      triggerRef.current?.focus()
    }
  }, [confirmDialog, handleKeyDown])

  const handleDeactivateClick = (property: Property, button: HTMLButtonElement) => {
    triggerRef.current = button
    setConfirmDialog(property)
  }

  const handleConfirmDeactivate = async () => {
    if (!confirmDialog) return
    setActionLoading(confirmDialog.id)
    await onDeactivate(confirmDialog)
    setActionLoading(null)
    setConfirmDialog(null)
  }

  const handleActivate = async (property: Property) => {
    setActionLoading(property.id)
    await onActivate(property)
    setActionLoading(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16" role="status">
        <Loader2 size={32} className="animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">Loading listings...</span>
      </div>
    )
  }

  return (
    <div data-testid="listings-tab">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg max-sm:text-base font-semibold text-text">Your Listings</h2>
        <button
          data-testid="add-listing-button"
          onClick={onAddListing}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors"
        >
          <Plus size={18} aria-hidden="true" />
          <span className="max-sm:hidden">Add Listing</span>
        </button>
      </div>

      {listings.length === 0 ? (
        <div data-testid="listings-empty-state" className="text-center py-16">
          <Home size={48} className="mx-auto text-text-secondary mb-4 opacity-50" aria-hidden="true" />
          <p className="text-text-secondary text-lg mb-4">You don&apos;t have any listings yet</p>
          <button
            onClick={onAddListing}
            className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
          >
            Add Your First Listing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((property) => {
            const rating = Number(property.avg_rating) || 0
            const reviewCount = property.review_count || 0
            const isLoading = actionLoading === property.id

            return (
              <div
                key={property.id}
                data-testid={`listing-card-${property.id}`}
                className="bg-white rounded-xl border border-border overflow-visible"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl">
                  {property.main_image ? (
                    <img
                      src={property.main_image}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-bg-secondary flex items-center justify-center text-text-secondary text-sm">
                      No image
                    </div>
                  )}
                  <span
                    data-testid={`listing-status-${property.id}`}
                    className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      property.is_active
                        ? 'bg-status-confirmed/20 text-status-confirmed'
                        : 'bg-border text-text-secondary'
                    }`}
                  >
                    {property.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-text truncate">{property.title}</h3>
                  <div className="flex items-center gap-1 text-sm text-text-secondary mt-1">
                    <MapPin size={14} aria-hidden="true" />
                    <span>{property.city}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm">
                      <span className="font-semibold text-text">${Number(property.price_per_night).toFixed(0)}</span>
                      <span className="text-text-secondary"> / night</span>
                    </p>
                    {reviewCount > 0 ? (
                      <div className="flex items-center gap-1">
                        <Star size={14} className="fill-text text-text" aria-hidden="true" />
                        <span className="text-sm font-medium">{rating.toFixed(1)}</span>
                        <span className="text-sm text-text-secondary">({reviewCount} reviews)</span>
                      </div>
                    ) : (
                      <span className="text-sm text-text-secondary">No reviews</span>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4 flex-wrap">
                    <button
                      data-testid={`listing-edit-${property.id}`}
                      onClick={() => navigate(`/properties/${property.id}`)}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-text bg-bg-secondary rounded-lg hover:bg-border transition-colors"
                    >
                      <Edit size={14} aria-hidden="true" />
                      <span className="max-sm:hidden">Edit</span>
                    </button>
                    {property.is_active ? (
                      <button
                        data-testid={`listing-deactivate-${property.id}`}
                        onClick={(e) => handleDeactivateClick(property, e.currentTarget)}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-status-cancelled bg-status-cancelled/10 rounded-lg hover:bg-status-cancelled/20 transition-colors disabled:opacity-50"
                      >
                        <Power size={14} aria-hidden="true" />
                        <span className="max-sm:hidden">{isLoading ? 'Deactivating...' : 'Deactivate'}</span>
                      </button>
                    ) : (
                      <button
                        data-testid={`listing-activate-${property.id}`}
                        onClick={() => handleActivate(property)}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-status-confirmed bg-status-confirmed/10 rounded-lg hover:bg-status-confirmed/20 transition-colors disabled:opacity-50"
                      >
                        <Power size={14} aria-hidden="true" />
                        <span className="max-sm:hidden">{isLoading ? 'Activating...' : 'Activate'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {confirmDialog && (
        <div
          data-testid="deactivate-dialog"
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setConfirmDialog(null)}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="deactivate-dialog-title"
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="deactivate-dialog-title" className="text-lg font-semibold text-text mb-2">Deactivate Listing</h3>
            <p className="text-text-secondary mb-6">
              Are you sure you want to deactivate this listing? <strong>&quot;{confirmDialog.title}&quot;</strong> will
              no longer be visible to guests.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                data-testid="deactivate-dialog-cancel"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 text-sm font-medium text-text bg-bg-secondary rounded-lg hover:bg-border transition-colors"
              >
                Cancel
              </button>
              <button
                data-testid="deactivate-dialog-confirm"
                onClick={handleConfirmDeactivate}
                disabled={actionLoading === confirmDialog.id}
                className="px-4 py-2 text-sm font-medium text-white bg-status-cancelled rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {actionLoading === confirmDialog.id ? 'Deactivating...' : 'Yes, Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Home(props: { size: number; className: string; 'aria-hidden'?: boolean | 'true' | 'false' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size}
      height={props.size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      aria-hidden={props['aria-hidden']}
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}
