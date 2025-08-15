"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCartIcon, ChevronDownIcon, EyeIcon, ExclamationTriangleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { client } from "@/sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { useDispatch, useSelector } from 'react-redux';
import { addItemToCart } from '../../../../store/cartSlice';
import { PhotoIcon } from "@heroicons/react/24/solid";

// Sanity Client Configuration
const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

type SortOption = 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

export default function ProductItemsClient({ products }: { products: any[] }) {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: any) => state.cart.items);
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

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

  const handleAddToCart = async (product: any) => {
    const inventory = product.ourInventory ?? 
                     (product.inventory?.ourInventory ?? 
                      Math.floor((product.inventory?.quantity ?? 0) / 2));
    
    // Check if product is in stock
    if (inventory <= 0) return;
    
    // Check if already in cart with max quantity
    const cartItem = cartItems.find((item: any) => item._id === product._id);
    if (cartItem && cartItem.quantity >= inventory) return;
    
    setAddingProductId(product._id);
    
    const price = product.price?.salePrice ?? 
                 (product.price?.priceExclVAT ? product.price.priceExclVAT * 1.2 : 0);
    const discountPrice = product.price?.specialSalePrice ?? 
                        (product.price?.specialPrice ? product.price.specialPrice * 1.2 : undefined);
    
    try {
      await dispatch(addItemToCart({
        ...product,
        price,
        discountPrice
      }));
    } finally {
      setTimeout(() => setAddingProductId(null), 500);
    }
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
        <div className="text-center py-16">
          <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900">No products found</h3>
          <p className="mt-2 text-gray-500">
            We couldn't find any products in this category.
          </p>
          <Link href="/products" className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium">
            Browse all products
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header and Sorting */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Our Collection</h1>
          <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
            {sortedProducts.length} {sortedProducts.length === 1 ? 'item' : 'items'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 hidden sm:inline">Sort by:</span>
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs hover:border-gray-300 transition-colors"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
            </select>
            <ChevronDownIcon className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500" />
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
          const isLowStock = inventory > 0 && inventory < 5;
          const cartItem = cartItems.find((item: any) => item._id === product._id);
          const availableQuantity = inventory - (cartItem?.quantity || 0);
          const isMaxQuantityReached = cartItem ? cartItem.quantity >= inventory : false;
          const isAdding = addingProductId === product._id;

          return (
            <div
              key={product._id}
              className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 ${
                isHovered ? 'shadow-md -translate-y-1' : 'hover:shadow-md hover:-translate-y-1'
              }`}
              onMouseEnter={() => setHoveredProduct(product._id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              {/* Product Image with Stock Badge */}
              <div className="relative aspect-square bg-gray-50 group">
                <Link href={`/products/${product.slug.current}`} className="block h-full">
                  {product.images?.[0] ? (
                    <img
                      src={urlFor(product.images[0])?.width(600).height(600).url()}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                      <div className="text-center p-4">
                        <div className="mx-auto h-12 w-12 mb-2">
                          <PhotoIcon className="w-full h-full" />
                        </div>
                        <span className="text-xs">No image available</span>
                      </div>
                    </div>
                  )}
                </Link>

                {/* Stock Indicators */}
                {isOutOfStock ? (
                  <span className="absolute top-3 right-3 bg-red-50 text-red-700 text-xs px-2.5 py-1 rounded-full border border-red-100 shadow-xs">
                    Out of Stock
                  </span>
                ) : (
                  <>
                    {isLowStock && (
                      <div className="absolute top-3 right-3 flex items-center bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-full border border-amber-100 shadow-xs">
                        <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                        <span>Only {inventory} left</span>
                      </div>
                    )}
                    {!isLowStock && inventory > 0 && (
                      <span className="absolute top-3 right-3 bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full border border-green-100 shadow-xs">
                        In Stock
                      </span>
                    )}
                  </>
                )}

                {/* Discount Badge */}
                {hasSpecialPrice && (
                  <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-xs">
                    {Math.round((1 - (specialPrice / basePrice)) * 100)}% OFF
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="mb-2">
                  <Link href={`/products/${product.slug.current}`}>
                    <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  {product.manufacturer && (
                    <p className="text-xs text-gray-500 mt-1">{product.manufacturer}</p>
                  )}
                </div>

                {/* Price Section */}
                <div className="mb-4">
                  {hasSpecialPrice ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-blue-600">
                          {formatPrice(specialPrice, currency)}
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(basePrice, currency)}
                        </span>
                      </div>
                      {specialPriceValidUntil && (
                        <p className="text-xs text-green-600 mt-1">
                          Offer ends {specialPriceValidUntil}
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
                    disabled={isOutOfStock || isMaxQuantityReached || isAdding}
                    className={`w-full py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 ${
                      isOutOfStock || isMaxQuantityReached
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } transition-colors font-medium`}
                  >
                    {isAdding ? (
                      <>
                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCartIcon className="w-4 h-4" />
                        <span>
                          {isOutOfStock ? 'Out of Stock' : 
                           isMaxQuantityReached ? 'Max Reached' : 'Add to Cart'}
                        </span>
                      </>
                    )}
                  </button>

                  <Link
                    href={`/products/${product.slug.current}`}
                    className="w-full py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    <EyeIcon className="w-4 h-4" />
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