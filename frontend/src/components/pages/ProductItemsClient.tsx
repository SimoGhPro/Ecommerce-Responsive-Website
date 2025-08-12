"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCartIcon, ChevronDownIcon, EyeIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { client } from "@/sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { useDispatch, useSelector } from 'react-redux';
import { addItemToCart } from '../../../store/cartSlice';

// Sanity Client Configuration
const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

type SortOption = 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

export default function productItemsClient({ products }: { products: any[] }) {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: any) => state.cart.items);
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    const priceA = a.price?.salePrice ?? (a.price?.priceExclVAT || 0) * 1.2;
    const priceB = b.price?.salePrice ?? (b.price?.priceExclVAT || 0) * 1.2;
    
    switch (sortOption) {
      case 'price-asc': return priceA - priceB;
      case 'price-desc': return priceB - priceA;
      case 'name-asc': return (a.name || '').localeCompare(b.name || '');
      case 'name-desc': return (b.name || '').localeCompare(a.name || '');
      default: return 0;
    }
  });

  const getProductStatus = (product: any) => {
    const inventory = product.ourInventory ?? 
                     (product.inventory?.ourInventory ?? 
                      Math.floor((product.inventory?.quantity ?? 0) / 2));
    
    if (inventory <= 0) return 'out_of_stock';
    return 'active';
  };

  const handleAddToCart = (product: any) => {
    const inventory = product.ourInventory ?? 
                     (product.inventory?.ourInventory ?? 
                      Math.floor((product.inventory?.quantity ?? 0) / 2));
    
    // Check if product is in stock
    if (inventory <= 0) return;
    
    // Check if already in cart with max quantity
    const cartItem = cartItems.find((item : any) => item._id === product._id);
    if (cartItem && cartItem.quantity >= inventory) return;
    
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

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No products found in this category</h3>
          <p className="mt-2 text-sm text-gray-500">
            Try selecting a different category or check back later.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header and Sorting */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'}
          </span>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <span className="text-sm text-gray-600">Sort by:</span>
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
            </select>
            <ChevronDownIcon className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedProducts.map((product) => {
          const status = getProductStatus(product);
          const basePrice = product.price?.salePrice ?? 
                          (product.price?.priceExclVAT ? product.price.priceExclVAT * 1.2 : 0);
          const specialPrice = product.price?.specialSalePrice ?? 
                            (product.price?.specialPrice ? product.price.specialPrice * 1.2 : undefined);
          const currency = product.price?.currency || 'MAD';
          const isOutOfStock = status === 'out_of_stock';
          const isHovered = hoveredProduct === product._id;
          const hasSpecialPrice = specialPrice && specialPrice < basePrice;
          const specialPriceValidUntil = product.price?.endDate 
            ? new Date(product.price.endDate).toLocaleDateString() 
            : null;
          const inventory = product.ourInventory ?? 
                          (product.inventory?.ourInventory ?? 
                          Math.floor((product.inventory?.quantity ?? 0) / 2));
          const isLowStock = inventory > 0 && inventory < 3;
          const cartItem = cartItems.find((item : any) => item._id === product._id);
          const availableQuantity = inventory - (cartItem?.quantity || 0);
          const isMaxQuantityReached = cartItem ? cartItem.quantity >= inventory : false;

          return (
            <div
              key={product._id}
              className={`bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 ${
                isHovered ? 'shadow-md' : 'hover:shadow-md'
              }`}
              onMouseEnter={() => setHoveredProduct(product._id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              {/* Product Image with Stock Badge */}
              <div className="relative aspect-square bg-gray-50">
                {product.images?.[0] ? (
                  <img
                    src={urlFor(product.images[0])?.width(600).height(600).url()}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <div className="text-center p-4">
                      <div className="mx-auto h-12 w-12 mb-2">
                        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                      <span className="text-xs">No image available</span>
                    </div>
                  </div>
                )}

                {/* Stock Indicators */}
                {isOutOfStock ? (
                  <span className="absolute top-2 right-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    Out of Stock
                  </span>
                ) : (
                  <>
                    {isLowStock && (
                      <div className="absolute top-2 right-2 flex items-center bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                        <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                        <span>Only {inventory} left</span>
                      </div>
                    )}
                    {!isLowStock && inventory > 0 && (
                      <span className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {availableQuantity} In Stock
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="mb-1">
                  <h3 className="font-medium text-gray-900 line-clamp-1">
                    {product.name}
                  </h3>
                  {product.manufacturer && (
                    <p className="text-xs text-gray-500">{product.manufacturer}</p>
                  )}
                </div>

                {/* Price Section */}
                <div className="mb-3">
                  {hasSpecialPrice ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-blue-600">
                          {formatPrice(specialPrice, currency)}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(basePrice, currency)}
                        </span>
                      </div>
                      {specialPriceValidUntil && (
                        <p className="text-xs text-green-600 mt-1">
                          Special Price Valid until {specialPriceValidUntil}
                        </p>
                      )}
                    </>
                  ) : (
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(basePrice, currency)}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={isOutOfStock || isMaxQuantityReached}
                    className={`w-full py-2 px-4 rounded-md flex items-center justify-center space-x-2 ${
                      isOutOfStock || isMaxQuantityReached
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } transition-colors`}
                  >
                    <ShoppingCartIcon className="h-4 w-4" />
                    <span>
                      {isOutOfStock ? 'Unavailable' : 
                       isMaxQuantityReached ? 'Max Quantity' : 'Add to Cart'}
                    </span>
                  </button>

                  

                  <Link
                    href={`/en/products/${product.slug.current}`}
                    className="w-full py-2 px-4 rounded-md flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
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
  );
}