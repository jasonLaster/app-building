import { useState } from 'react'

interface PropertyDescriptionProps {
  description: string
}

const MAX_LENGTH = 300

export default function PropertyDescription({ description }: PropertyDescriptionProps) {
  const [expanded, setExpanded] = useState(false)
  const isLong = description.length > MAX_LENGTH

  return (
    <div data-testid="property-description" className="py-6 border-b border-border">
      <h2 className="text-lg font-semibold text-text mb-3">About this place</h2>
      <p className="text-text-secondary whitespace-pre-line leading-relaxed">
        {isLong && !expanded ? `${description.slice(0, MAX_LENGTH)}...` : description}
      </p>
      {isLong && (
        <button
          data-testid="description-toggle"
          className="mt-2 font-semibold text-text underline cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  )
}
