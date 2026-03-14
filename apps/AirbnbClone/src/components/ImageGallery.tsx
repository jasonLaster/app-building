import { useState } from 'react'
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
          {mainImage!.caption && (
            <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-sm px-3 py-1.5">
              {mainImage!.caption}
            </p>
          )}
        </div>
      </div>
    )
  }

  const thumbnails = images.filter((_, i) => i !== mainIndex)

  return (
    <div data-testid="image-gallery">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-xl overflow-hidden">
        <div className="relative h-[400px]">
          <img
            src={mainImage!.url}
            alt={mainImage!.caption || 'Property image'}
            className="w-full h-full object-cover"
          />
          {mainImage!.caption && (
            <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-sm px-3 py-1.5">
              {mainImage!.caption}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 h-[400px]">
          {thumbnails.slice(0, 4).map((img) => {
            const originalIndex = images.indexOf(img)
            return (
              <div
                key={img.id}
                data-testid={`thumbnail-${img.id}`}
                className="relative cursor-pointer overflow-hidden hover:opacity-90 transition-opacity"
                onClick={() => setMainIndex(originalIndex)}
              >
                <img
                  src={img.url}
                  alt={img.caption || 'Property image'}
                  className="w-full h-full object-cover"
                />
                {img.caption && (
                  <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1">
                    {img.caption}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
