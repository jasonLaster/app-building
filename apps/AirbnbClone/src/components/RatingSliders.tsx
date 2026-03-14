import { Star } from 'lucide-react'

export interface Ratings {
  rating: number
  cleanliness: number
  accuracy: number
  communication: number
  location: number
  value: number
}

interface RatingSlidersProps {
  ratings: Ratings
  onChange: (ratings: Ratings) => void
}

const SLIDER_CATEGORIES: { key: keyof Ratings; label: string }[] = [
  { key: 'rating', label: 'Overall' },
  { key: 'cleanliness', label: 'Cleanliness' },
  { key: 'accuracy', label: 'Accuracy' },
  { key: 'communication', label: 'Communication' },
  { key: 'location', label: 'Location' },
  { key: 'value', label: 'Value' },
]

export default function RatingSliders({ ratings, onChange }: RatingSlidersProps) {
  const handleChange = (key: keyof Ratings, val: number) => {
    onChange({ ...ratings, [key]: val })
  }

  return (
    <div data-testid="rating-sliders" className="space-y-5">
      <h3 className="text-lg font-semibold text-text">Rate your experience</h3>
      {SLIDER_CATEGORIES.map(({ key, label }) => (
        <div key={key} data-testid={`rating-slider-${key}`} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-text">{label}</label>
            <span className="text-sm font-semibold text-text" data-testid={`rating-value-${key}`}>
              {ratings[key] === 0 ? 'Not rated' : ratings[key]}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={5}
              step={1}
              value={ratings[key]}
              onChange={(e) => handleChange(key, parseInt(e.target.value, 10))}
              data-testid={`rating-input-${key}`}
              className="flex-1 h-2 rounded-full appearance-none cursor-pointer accent-primary"
              style={{
                background: ratings[key] === 0
                  ? 'var(--color-bg-secondary)'
                  : `linear-gradient(to right, var(--color-primary) ${((ratings[key] - 1) / 4) * 100}%, var(--color-bg-secondary) ${((ratings[key] - 1) / 4) * 100}%)`,
              }}
            />
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < ratings[key]
                      ? 'fill-primary text-primary'
                      : 'text-border'
                  }
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
