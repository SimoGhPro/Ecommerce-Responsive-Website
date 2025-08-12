"use client";

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ShoppingCartIcon, ChevronRightIcon, PhotoIcon, EyeIcon } from "@heroicons/react/24/outline";
import { client } from "@/sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { useDispatch } from 'react-redux';
import { addItemToCart } from '../../../store/cartSlice';

// Sanity Client Configuration
const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

export default function ProductCarousel({ products }: { products: any[] }) {
  const dispatch = useDispatch();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    
    const container = scrollRef.current;
    const scrollAmount = direction === 'left' ? -container.offsetWidth : container.offsetWidth;
    
    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
    
    setScrollPosition(container.scrollLeft + scrollAmount);
  };

  const isAtStart = scrollPosition === 0;
  const isAtEnd = scrollRef.current 
    ? scrollPosition >= scrollRef.current.scrollWidth - scrollRef.current.offsetWidth - 1
    : true;

  const getProductStatus = (product: any) => {
    // Use ourInventory if available, otherwise fall back to quantity/2
    const inventory = product.ourInventory ?? 
                     (product.inventory?.ourInventory ?? 
                      Math.floor((product.inventory?.quantity ?? 0) / 2));
    
    if (inventory <= 0) return 'out_of_stock';
    return 'active';
  };

  const handleAddToCart = (product: any) => {
    // Use salePrice if available, otherwise calculate from priceExclVAT
    const price = product.price?.salePrice ?? 
                 (product.price?.priceExclVAT ? product.price.priceExclVAT * 1.2 : 0);
    
    // Use specialSalePrice if available, otherwise calculate from specialPrice
    const discountPrice = product.price?.specialSalePrice ?? 
                        (product.price?.specialPrice ? product.price.specialPrice * 1.2 : undefined);
    
    dispatch(addItemToCart({
      ...product,
      price,
      discountPrice
    }));
  };

  const formatPrice = (price: number, currency: string = 'MAD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  return (
    <section className="relative p-6 bg-white rounded-lg shadow-sm mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
        {products.length > 5 && (
          <Link 
            href={`/en/products`} 
            className="text-primary-600 hover:text-primary-800 flex items-center text-sm md:text-base group"
          >
            View all products
            <ChevronRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      <div className="relative">
        {!isAtStart && (
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 hover:bg-gray-100 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronRightIcon className="w-5 h-5 rotate-180" />
          </button>
        )}

        <div 
          ref={scrollRef}
          className="overflow-hidden snap-x snap-mandatory whitespace-nowrap py-2 -mx-2"
          onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
        >
          <div className="inline-flex space-x-4 px-2">
            {products.map((product) => {
              const status = getProductStatus(product);
              const basePrice = product.price?.salePrice || 
                               (product.price?.priceExclVAT ? product.price.priceExclVAT * 1.2 : 0);
              const specialPrice = product.price?.specialSalePrice || 
                                 (product.price?.specialPrice ? product.price.specialPrice * 1.2 : undefined);
              const currency = product.price?.currency || 'MAD';
              const isOutOfStock = status === 'out_of_stock';
              const isHovered = hoveredProduct === product._id;
              const inventory = product.ourInventory ?? 
                               (product.inventory?.ourInventory ?? 
                                Math.floor((product.inventory?.quantity ?? 0) / 2));
              
              return (
                <div 
                  key={product._id}
                  className={`snap-start w-48 flex-shrink-0 bg-white rounded-lg shadow-sm transition-all duration-300 inline-block align-top whitespace-normal relative ${
                    isHovered ? 'shadow-md scale-[1.02]' : ''
                  }`}
                  onMouseEnter={() => setHoveredProduct(product._id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <div className="flex flex-col h-full">
                    <div className="relative aspect-square bg-gray-50">
                      {product.images?.[0] ? (
                        <img
                          src={urlFor(product.images[0])?.width(400).height(400).url()}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-t-lg"
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <PhotoIcon className="h-12 w-12" />
                        </div>
                      )}

                      {isOutOfStock && (
                        <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    <div className="p-3">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-1 mb-2">
                        {product.description?.split('\n')[0] || ''}
                      </p>
                      <div className="flex items-center gap-1">
                        {specialPrice ? (
                          <>
                            <span className="text-gray-500 line-through text-xs">
                              {formatPrice(basePrice, currency)}
                            </span>
                            <span className="text-base font-bold text-primary-600">
                              {formatPrice(specialPrice, currency)}
                            </span>
                          </>
                        ) : (
                          <span className="text-base font-bold text-gray-900">
                            {formatPrice(basePrice, currency)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons - Hidden by default, shown on hover */}
                    <div className={`px-3 pb-3 space-y-2 transition-all duration-300 ${
                      isHovered ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                    }`}>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(product);
                        }}
                        className={`w-full py-1.5 px-3 rounded-md text-xs flex items-center justify-center space-x-1.5 ${
                          isOutOfStock 
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        } transition-colors`}
                        disabled={isOutOfStock}
                      >
                        <ShoppingCartIcon className="h-3.5 w-3.5" />
                        <span>{isOutOfStock ? 'Unavailable' : 'Add to Cart'}</span>
                      </button>

                      <Link
                        href={`/en/products/${product.slug.current}`}
                        className="w-full py-1.5 px-3 rounded-md text-xs flex items-center justify-center space-x-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                      >
                        <EyeIcon className="h-3.5 w-3.5" />
                        <span>View Details</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {!isAtEnd && (
          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 hover:bg-gray-100 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </section>
  );
}