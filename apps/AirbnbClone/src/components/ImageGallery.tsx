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
      <div data-testid="image-gallery" className="rounded-xl bg-bg-secondary flex items-center justify-center h-[400px]">
        <p className="text-text-secondary">No images available</p>
      </div>
    )
  }

  const mainImage = images[mainIndex]

  if (images.length === 1) {
    return (
      <div data-testid="image-gallery">
        <div className="relative rounded-xl overflow-hidden h-[400px]">
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
      <div className="grid grid-cols-4 gap-2 h-[400px]">
        <div className="col-span-2 row-span-2 relative cursor-pointer hover:opacity-95 transition-opacity rounded-l-xl overflow-hidden">
          <img
            src={mainImage!.url}
            alt={mainImage!.caption || 'Property image'}
            className="w-full h-full object-cover"
          />
        </div>
        {thumbnails.slice(0, 4).map((img, i) => {
          const originalIndex = images.indexOf(img)
          return (
            <div
              key={img.id}
              data-testid={`thumbnail-${img.id}`}
              className={`relative cursor-pointer overflow-hidden hover:opacity-90 transition-opacity ${
                i === 1 ? 'rounded-tr-xl' : i === 3 ? 'rounded-br-xl' : ''
              }`}
              onClick={() => setMainIndex(originalIndex)}
            >
              <img
                src={img.url}
                alt={img.caption || 'Property image'}
                className="w-full h-full object-cover"
              />
            </div>
          )
        })}
      </div>
      {images.length > 5 && (
        <button className="absolute bottom-4 right-4 flex items-center gap-2 bg-white border border-text rounded-lg px-4 py-1.5 text-sm font-semibold text-text hover:bg-bg-secondary transition-colors cursor-pointer">
          <Grid size={14} />
          Show all photos
        </button>
      )}
    </div>
  )
}
