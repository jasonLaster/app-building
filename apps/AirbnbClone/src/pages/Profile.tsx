import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../store'
import { fetchUserReviews } from '../slices/userReviewsSlice'
import ProfileForm from '../components/ProfileForm'
import BecomeHostButton from '../components/BecomeHostButton'
import UserReviewsList from '../components/UserReviewsList'

export default function Profile() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { currentUser } = useSelector((state: RootState) => state.auth)
  const { items: reviews, loading: reviewsLoading } = useSelector((state: RootState) => state.userReviews)

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    dispatch(fetchUserReviews(currentUser.id))
  }, [currentUser, dispatch, navigate])

  if (!currentUser) {
    return null
  }

  return (
    <div className="p-6 max-sm:p-3 max-w-2xl mx-auto" data-testid="profile-page">
      <h1 className="text-2xl font-bold text-text mb-6">My Profile</h1>

      <div className="rounded-xl border border-border p-6 mb-6">
        <ProfileForm user={currentUser} />
      </div>

      <div className="mb-6">
        <BecomeHostButton userId={currentUser.id} isHost={currentUser.is_host} />
      </div>

      <UserReviewsList reviews={reviews} loading={reviewsLoading} />
    </div>
  )
}
