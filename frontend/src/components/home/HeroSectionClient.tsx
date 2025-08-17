'use client';

import { useEffect, useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface Banner {
  _id: string;
  alt?: string;
  imageUrl: string | null;
  thumbUrl: string | null;
}

export default function HeroSectionClient({ banners }: { banners: Banner[] }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>(null);
  const currentIndexRef = useRef(0);

  useEffect(() => {
    if (banners.length <= 1) return;

    const startAutoPlay = () => {
      intervalRef.current = setInterval(() => {
        nextSlide();
      }, 2500);
    };

    const stopAutoPlay = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };

    const updateSlide = (index: number) => {
      if (!carouselRef.current) return;
      
      const slides = carouselRef.current.querySelectorAll('[data-slide]');
      const indicators = carouselRef.current.querySelectorAll('[data-indicator]');
      const thumbs = carouselRef.current.querySelectorAll('[data-thumb]');

      slides.forEach((slide, i) => {
        slide.classList.toggle('opacity-100', i === index);
        slide.classList.toggle('opacity-0', i !== index);
      });

      indicators.forEach((indicator, i) => {
        indicator.classList.toggle('bg-white', i === index);
        indicator.classList.toggle('w-6', i === index);
        indicator.classList.toggle('bg-white/50', i !== index);
      });

      thumbs.forEach((thumb, i) => {
        thumb.classList.toggle('ring-2', i === index);
        thumb.classList.toggle('ring-white', i === index);
        thumb.classList.toggle('opacity-70', i !== index);
      });

      currentIndexRef.current = index;
    };

    const nextSlide = () => {
      const nextIndex = (currentIndexRef.current + 1) % banners.length;
      updateSlide(nextIndex);
    };

    const prevSlide = () => {
      const prevIndex = (currentIndexRef.current - 1 + banners.length) % banners.length;
      updateSlide(prevIndex);
    };

    const goToSlide = (index: number) => {
      updateSlide(index);
    };

    // Initialize
    startAutoPlay();

    // Add event listeners
    const prevBtn = carouselRef.current?.querySelector('[data-prev]');
    const nextBtn = carouselRef.current?.querySelector('[data-next]');
    
    prevBtn?.addEventListener('click', () => {
      stopAutoPlay();
      prevSlide();
      startAutoPlay();
    });

    nextBtn?.addEventListener('click', () => {
      stopAutoPlay();
      nextSlide();
      startAutoPlay();
    });

    // Cleanup
    return () => {
      stopAutoPlay();
      prevBtn?.removeEventListener('click', prevSlide);
      nextBtn?.removeEventListener('click', nextSlide);
    };
  }, [banners.length]);

  if (!banners.length) return null;

  return (
    <section className="relative h-[80vh] max-h-[800px] w-full overflow-hidden" ref={carouselRef}>
      {/* Slides */}
      <div className="relative w-full h-full">
        {banners.map((banner, index) => (
          <div
            key={banner._id}
            data-slide
            className={`absolute inset-0 transition-opacity duration-1000 ${index === 0 ? 'opacity-100' : 'opacity-0'}`}
          >
            {banner.imageUrl && (
              <img
                src={banner.imageUrl}
                alt={banner.alt || 'Promotional banner'}
                className="w-full h-full object-cover"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            )}
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      {banners.length > 1 && (
        <>
          <button
            data-prev
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50"
            aria-label="Previous banner"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <button
            data-next
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50"
            aria-label="Next banner"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Indicator dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              data-indicator
              className={`h-3 w-3 rounded-full transition-all ${index === 0 ? 'bg-white w-6' : 'bg-white/50'}`}
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => {
                const event = new Event('click');
                document.dispatchEvent(event);
                currentIndexRef.current = index;
              }}
            />
          ))}
        </div>
      )}

      {/* Thumbnail previews */}
      {banners.length > 1 && (
        <div className="absolute bottom-20 left-1/2 z-10 flex -translate-x-1/2 space-x-2 p-2 bg-black/30 rounded-lg">
          {banners.map((banner, index) => (
            <button
              key={`thumb-${banner._id}`}
              data-thumb
              className={`w-16 h-10 rounded-md overflow-hidden transition-all ${index === 0 ? 'ring-2 ring-white' : 'opacity-70'}`}
              aria-label={`View banner ${index + 1}`}
              onClick={() => {
                const event = new Event('click');
                document.dispatchEvent(event);
                currentIndexRef.current = index;
              }}
            >
              {banner.thumbUrl && (
                <img
                  src={banner.thumbUrl}
                  alt={banner.alt || ''}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}