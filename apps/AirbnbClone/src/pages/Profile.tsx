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
    <main className="max-w-[1120px] mx-auto px-6 max-sm:px-3 py-8" data-testid="profile-page">
      <div className="max-w-2xl">
        <h1 className="text-[32px] font-bold text-text mb-8">Personal info</h1>

        <section className="rounded-xl border border-border p-6 mb-8" aria-label="Profile details">
          <ProfileForm user={currentUser} />
        </section>

        <div className="mb-8">
          <BecomeHostButton userId={currentUser.id} isHost={currentUser.is_host} />
        </div>

        <UserReviewsList reviews={reviews} loading={reviewsLoading} />
      </div>
    </main>
  )
}
