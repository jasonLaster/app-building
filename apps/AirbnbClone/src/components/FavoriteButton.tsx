import { Heart } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../store'
import { addFavorite, removeFavorite } from '../slices/favoritesSlice'

interface FavoriteButtonProps {
  propertyId: string
}

export default function FavoriteButton({ propertyId }: FavoriteButtonProps) {
  const dispatch = useDispatch<AppDispatch>()
  const currentUser = useSelector((state: RootState) => state.auth.currentUser)
  const favoriteIds = useSelector((state: RootState) => state.favorites.propertyIds)
  const isFavorited = favoriteIds.includes(propertyId)

  if (!currentUser) return null

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isFavorited) {
      dispatch(removeFavorite({ userId: currentUser.id, propertyId }))
    } else {
      dispatch(addFavorite({ userId: currentUser.id, propertyId }))
    }
  }

  return (
    <button
      data-testid={`favorite-button-${propertyId}`}
      onClick={handleClick}
      className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/70 hover:bg-white/90 transition-colors"
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        size={20}
        className={isFavorited ? 'fill-primary text-primary' : 'text-text-secondary'}
      />
    </button>
  )
}
