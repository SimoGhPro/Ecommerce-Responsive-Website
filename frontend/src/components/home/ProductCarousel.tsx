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
    const inventory = product.ourInventory ?? 
                     (product.inventory?.ourInventory ?? 
                      Math.floor((product.inventory?.quantity ?? 0) / 2));
    
    if (inventory <= 0) return 'out_of_stock';
    return 'active';
  };

  const handleAddToCart = (product: any) => {
    const price = product.price?.salePrice ?? 
                 (product.price?.priceExclVAT ? product.price.priceExclVAT * 1.2 : 0);
    
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
    <section className="relative px-8 py-12 bg-white rounded-xl shadow-sm mb-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Our Products</h2>
            <p className="text-gray-500 mt-1">Discover our curated collection</p>
          </div>
          {products.length > 5 && (
            <Link 
              href={`/products`} 
              className="text-primary-600 hover:text-primary-800 flex items-center text-sm md:text-base group font-medium"
            >
              View all products
              <ChevronRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        <div className="relative group">
          {!isAtStart && (
            <button 
              onClick={() => scroll('left')}
              className="absolute -left-12 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-lg p-3 hover:bg-gray-100 transition-all duration-300 hover:scale-110"
              aria-label="Scroll left"
            >
              <ChevronRightIcon className="w-6 h-6 rotate-180 text-gray-700" />
            </button>
          )}

          <div 
            ref={scrollRef}
            className="overflow-hidden snap-x snap-mandatory whitespace-nowrap py-2 -mx-4"
            onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
          >
            <div className="inline-flex space-x-6 px-4">
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
                    className={`snap-start w-56 flex-shrink-0 bg-white rounded-xl shadow-sm transition-all duration-300 inline-block align-top whitespace-normal relative ${
                      isHovered ? 'shadow-lg scale-[1.02]' : ''
                    }`}
                    onMouseEnter={() => setHoveredProduct(product._id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                  >
                    <div className="flex flex-col h-full">
                      <div className="relative aspect-square bg-gray-50 rounded-t-xl overflow-hidden">
                        {product.images?.[0] ? (
                          <img
                            src={urlFor(product.images[0])?.width(400).height(400).url()}
                            alt={product.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
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

                      <div className="p-4 flex flex-col flex-grow">
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-grow">
                          {product.description?.split('\n')[0] || ''}
                        </p>
                        <div className="flex items-center gap-1.5">
                          {specialPrice ? (
                            <>
                              <span className="text-gray-400 line-through text-xs">
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
                      <div className={`px-4 pb-4 space-y-2 transition-all duration-300 ${
                        isHovered ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                      }`}>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToCart(product);
                          }}
                          className={`w-full py-2 px-3 rounded-lg text-sm flex items-center justify-center space-x-1.5 ${
                            isOutOfStock 
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          } transition-colors`}
                          disabled={isOutOfStock}
                        >
                          <ShoppingCartIcon className="h-4 w-4" />
                          <span>{isOutOfStock ? 'Unavailable' : 'Add to Cart'}</span>
                        </button>

                        <Link
                          href={`/products/${product.slug.current}`}
                          className="w-full py-2 px-3 rounded-lg text-sm flex items-center justify-center space-x-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                        >
                          <EyeIcon className="h-4 w-4" />
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
              className="absolute -right-12 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-lg p-3 hover:bg-gray-100 transition-all duration-300 hover:scale-110"
              aria-label="Scroll right"
            >
              <ChevronRightIcon className="w-6 h-6 text-gray-700" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}