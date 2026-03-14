const PROPERTY_TYPES = [
  'Apartment',
  'House',
  'Cabin',
  'Villa',
  'Condo',
  'Loft',
  'Cottage',
  'Townhouse',
]

interface CategoryFilterProps {
  selectedType: string
  onSelectType: (type: string) => void
}

export default function CategoryFilter({ selectedType, onSelectType }: CategoryFilterProps) {
  const handleClick = (type: string) => {
    if (selectedType === type) {
      onSelectType('')
    } else {
      onSelectType(type)
    }
  }

  return (
    <div
      data-testid="category-filter"
      className="flex gap-2 overflow-x-auto py-3 scrollbar-hide"
      style={{ scrollbarWidth: 'none' }}
    >
      {PROPERTY_TYPES.map((type) => (
        <button
          key={type}
          data-testid={`category-chip-${type}`}
          onClick={() => handleClick(type)}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium border transition-colors ${
            selectedType === type
              ? 'bg-text text-bg border-text'
              : 'bg-bg text-text-secondary border-border hover:border-text'
          }`}
        >
          {type}
        </button>
      ))}
    </div>
  )
}
