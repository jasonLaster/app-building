import { useState } from 'react'
import { Grid } from 'lucide-react'
import type { PropertyImage } from '../slices/propertiesSlice'

interface ImageGalleryProps {
  images: PropertyImage[]
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [mainIndex, setMainIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div data-testid="image-gallery" className="rounded-xl bg-bg-secondary flex items-center justify-center h-[420px]">
        <p className="text-text-secondary">No images available</p>
      </div>
    )
  }

  const mainImage = images[mainIndex]

  if (images.length === 1) {
    return (
      <div data-testid="image-gallery">
        <div className="relative rounded-xl overflow-hidden h-[420px]">
          <img
            src={mainImage!.url}
            alt={mainImage!.caption || 'Property image'}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    )
  }

  const thumbnails = images.filter((_, i) => i !== mainIndex)

  return (
    <div data-testid="image-gallery" className="relative">
      <div className="grid grid-cols-4 gap-2 h-[420px] rounded-xl overflow-hidden">
        <div className="col-span-2 row-span-2 relative cursor-pointer hover:opacity-95 transition-opacity overflow-hidden">
          <img
            src={mainImage!.url}
            alt={mainImage!.caption || 'Property image'}
            className="w-full h-full object-cover"
          />
          {mainImage!.caption && (
            <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              {mainImage!.caption}
            </span>
          )}
        </div>
        {thumbnails.slice(0, 4).map((img) => {
          const originalIndex = images.indexOf(img)
          return (
            <button
              key={img.id}
              data-testid={`thumbnail-${img.id}`}
              type="button"
              aria-label={img.caption || `View property image ${originalIndex + 1}`}
              className="relative cursor-pointer overflow-hidden hover:opacity-90 transition-opacity"
              onClick={() => setMainIndex(originalIndex)}
            >
              <img
                src={img.url}
                alt={img.caption || 'Property image'}
                className="w-full h-full object-cover"
              />
              {img.caption && (
                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                  {img.caption}
                </span>
              )}
            </button>
          )
        })}
      </div>
      {images.length > 5 && (
        <button className="absolute bottom-4 right-4 flex items-center gap-2 bg-white border border-text rounded-lg px-4 py-1.5 text-sm font-semibold text-text hover:bg-bg-secondary transition-colors cursor-pointer">
          <Grid size={14} aria-hidden="true" />
          Show all photos
        </button>
      )}
    </div>
  )
}
