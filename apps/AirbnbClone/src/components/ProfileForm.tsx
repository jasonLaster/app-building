import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { User, updateUser } from '../slices/authSlice'
import type { AppDispatch } from '../store'
import { User as UserIcon, Mail, Phone, FileText, Image, Check } from 'lucide-react'

interface ProfileFormProps {
  user: User
}

function isValidUrl(str: string): boolean {
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const dispatch = useDispatch<AppDispatch>()
  const [name, setName] = useState(user.name)
  const [bio, setBio] = useState(user.bio || '')
  const [phone, setPhone] = useState(user.phone || '')
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '')
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setName(user.name)
    setBio(user.bio || '')
    setPhone(user.phone || '')
    setAvatarUrl(user.avatar_url || '')
  }, [user])

  const handleSave = async () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (avatarUrl.trim() && !isValidUrl(avatarUrl.trim())) {
      newErrors.avatar_url = 'Please enter a valid URL'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setSuccessMessage('')
      return
    }

    setErrors({})
    setSaving(true)

    try {
      await dispatch(updateUser({
        id: user.id,
        name: name.trim(),
        bio: bio.trim() || null,
        phone: phone.trim() || null,
        avatar_url: avatarUrl.trim() || null,
      })).unwrap()
      setSuccessMessage('Profile updated')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch {
      setErrors({ form: 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div data-testid="profile-form">
      <div aria-live="polite">
        {successMessage && (
          <div data-testid="profile-success-message" className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-success/10 text-success text-sm font-medium">
            <Check size={16} aria-hidden="true" />
            {successMessage}
          </div>
        )}
      </div>

      {errors.form && (
        <div data-testid="profile-error-message" role="alert" className="mb-4 p-3 rounded-lg bg-error/10 text-error text-sm font-medium">
          {errors.form}
        </div>
      )}

      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-bg-secondary border border-border shrink-0">
          {avatarUrl.trim() && isValidUrl(avatarUrl.trim()) ? (
            <img
              data-testid="avatar-preview"
              src={avatarUrl.trim()}
              alt="Avatar preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-secondary" aria-hidden="true">
              <UserIcon size={32} />
            </div>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-text">{user.name}</h3>
          <p className="text-sm text-text-secondary">Member since {new Date(user.created_at.split('T')[0] + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="profile-name" className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-1.5">
            <UserIcon size={14} aria-hidden="true" />
            Name
          </label>
          <input
            id="profile-name"
            data-testid="profile-name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-required="true"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
            className={`w-full px-3 py-2.5 rounded-lg border ${errors.name ? 'border-error' : 'border-border'} bg-bg text-text focus:outline-none focus:border-primary transition-colors`}
            placeholder="Your name"
          />
          {errors.name && <p id="name-error" data-testid="name-error" role="alert" className="text-error text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="profile-email" className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-1.5">
            <Mail size={14} aria-hidden="true" />
            Email
          </label>
          <input
            id="profile-email"
            data-testid="profile-email-input"
            type="email"
            value={user.email}
            readOnly
            disabled
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-secondary text-text-secondary cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="profile-bio" className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-1.5">
            <FileText size={14} aria-hidden="true" />
            Bio
          </label>
          <textarea
            id="profile-bio"
            data-testid="profile-bio-input"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg text-text focus:outline-none focus:border-primary transition-colors resize-none"
            placeholder="Tell us about yourself"
          />
        </div>

        <div>
          <label htmlFor="profile-phone" className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-1.5">
            <Phone size={14} aria-hidden="true" />
            Phone
          </label>
          <input
            id="profile-phone"
            data-testid="profile-phone-input"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg text-text focus:outline-none focus:border-primary transition-colors"
            placeholder="Phone number"
          />
        </div>

        <div>
          <label htmlFor="profile-avatar" className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-1.5">
            <Image size={14} aria-hidden="true" />
            Avatar URL
          </label>
          <input
            id="profile-avatar"
            data-testid="profile-avatar-input"
            type="text"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            aria-invalid={!!errors.avatar_url}
            aria-describedby={errors.avatar_url ? 'avatar-url-error' : undefined}
            className={`w-full px-3 py-2.5 rounded-lg border ${errors.avatar_url ? 'border-error' : 'border-border'} bg-bg text-text focus:outline-none focus:border-primary transition-colors`}
            placeholder="https://example.com/avatar.jpg"
          />
          {errors.avatar_url && <p id="avatar-url-error" data-testid="avatar-url-error" role="alert" className="text-error text-xs mt-1">{errors.avatar_url}</p>}
        </div>
      </div>

      <button
        data-testid="profile-save-button"
        onClick={handleSave}
        disabled={saving}
        className="mt-6 w-full py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  )
}
