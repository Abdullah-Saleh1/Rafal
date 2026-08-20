'use client'

import { useState } from 'react'

export default function PropertyGallery({ images, title }) {
  const [activeImage, setActiveImage] = useState(0)
  if (!images.length) return null

  return (
    <div>
      <div className="overflow-hidden rounded-3xl border border-[#E8E9E9]/10 bg-[#15402D]">
        <img src={images[activeImage]} alt={title} className="h-[340px] w-full object-cover md:h-[520px]" />
      </div>
      {images.length > 1 && <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">{images.map((url, index) => <button key={url} type="button" onClick={() => setActiveImage(index)} className={`overflow-hidden rounded-xl border transition ${activeImage === index ? 'border-[#E8E9E9]' : 'border-transparent opacity-70 hover:opacity-100'}`}><img src={url} alt={`صورة ${index + 1} للعقار`} className="h-24 w-full object-cover" /></button>)}</div>}
    </div>
  )
}
