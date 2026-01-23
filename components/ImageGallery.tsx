'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ImageGalleryProps {
  images: string[]
  alt: string
}

export default function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-bike bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">No image available</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-bike bg-gray-100 rounded-lg overflow-hidden">
        <Image
          src={images[selectedImage]}
          alt={`${alt} - Image ${selectedImage + 1}`}
          fill
          className="object-contain"
          priority={selectedImage === 0}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
        />
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="grid grid-cols-6 gap-2">
          {images.slice(0, 6).map((image, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${
                selectedImage === idx
                  ? 'border-blue-600 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <Image
                src={image}
                alt={`${alt} - Thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                sizes="100px"
              />
            </button>
          ))}
          {images.length > 6 && (
            <div className="relative aspect-square rounded-md overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-600">
                +{images.length - 6}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Image Counter */}
      <div className="text-center text-sm text-gray-600">
        Image {selectedImage + 1} of {images.length}
      </div>
    </div>
  )
}
