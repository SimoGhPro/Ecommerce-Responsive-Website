'use client';

import { useState } from 'react';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { 
  PhotoIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { client } from '@/sanity/client';

import { useDispatch, useSelector } from 'react-redux';
import { addItemToCart } from '../../../../../store/cartSlice';


const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) => 
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

export default function ProductPageClient({ 
  product,
  lang 
}: { 
  product: any;
  lang: string;
}) {
  const [selectedImage, setSelectedImage] = useState(0);
  const cartItems = useSelector((state: any) => state.cart.items);
  const dispatch = useDispatch();
  // Calculate inventory values
  const inventory = product.ourInventory ?? 
                   (product.inventory?.ourInventory ?? 
                    Math.floor((product.inventory?.quantity ?? 0) / 2));
  const isOutOfStock = inventory <= 0;
  const isLowStock = inventory > 0 && inventory < 5;
  const cartItem = cartItems.find((item : any) => item._id === product._id);
  const availableQuantity = inventory - (cartItem?.quantity || 0);
  const stockStatus = isOutOfStock ? 'Out of Stock' : 
                     isLowStock ? `Only ${inventory} Left` : 
                     `${availableQuantity} In Stock`;

  // Price calculations
  const basePrice = product.price?.salePrice || 
                   (product.price?.priceExclVAT ? product.price.priceExclVAT * 1.2 : 0);
  const vatAmount = basePrice * ((product.price?.vat || 0) / 100);
  const recycleTax = product.price?.recycleTax || 0;
  const totalPrice = basePrice + vatAmount + recycleTax;
  const currency = product.price?.currency || 'USD';

  const nextImage = () => {
    setSelectedImage((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImage((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Product Header with Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Image Gallery - Client Side */}
        <div className="relative">
          {/* Main Image with Stock Badge */}
          <div className="bg-gray-50 rounded-lg overflow-hidden aspect-square mb-4 relative">
            {product.images?.[selectedImage] ? (
              <img
                src={urlFor(product.images[selectedImage])?.width(800).height(800).url()}
                alt={`${product.name} - Image ${selectedImage + 1}`}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <PhotoIcon className="h-12 w-12 mx-auto mb-2" />
                <p>No image available</p>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          {product.images?.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
              >
                <ChevronRightIcon className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Thumbnail Strip */}
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto py-2 scrollbar-hide">
              {product.images.map((image: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
                    selectedImage === index
                      ? 'border-indigo-600'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img
                    src={urlFor(image)?.width(100).height(100).url()}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info - Static */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          
          {/* Inventory Details */}
          <div className="mb-4">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-2 ${
              isOutOfStock ? 'bg-red-100 text-red-800' :
              isLowStock ? 'bg-amber-100 text-amber-800' :
              'bg-green-100 text-green-800'
            }`}>
              {isLowStock && <ExclamationTriangleIcon className="w-4 h-4 mr-1" />}
              {!isLowStock && !isOutOfStock && <CheckBadgeIcon className="w-4 h-4 mr-1" />}
              {stockStatus}
            </div>
            
            {!isOutOfStock && (
              <p className="text-sm text-gray-600">
                {isLowStock 
                  ? `Hurry! Only ${inventory} item${inventory === 1 ? '' : 's'} remaining in stock.`
                  : 'Available in stock with fast delivery.'}
              </p>
            )}
          </div>

          <p className="text-gray-700 mb-6 whitespace-pre-line">
            {product.description || 'No description available.'}
          </p>

          {/* Pricing Section */}
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency,
                  minimumFractionDigits: 2,
                }).format(totalPrice)}
              </span>
              <span className="text-sm text-gray-500">incl. VAT</span>
            </div>
            
            {product.price?.recycleTax > 0 && (
              <p className="text-sm text-gray-600 mb-2">
                + {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency,
                  minimumFractionDigits: 2,
                }).format(product.price.recycleTax)} recycle tax
              </p>
            )}
            
            {product.price?.specialPrice && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-lg font-bold text-indigo-600">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency,
                    minimumFractionDigits: 2,
                  }).format(product.price.specialPrice)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency,
                    minimumFractionDigits: 2,
                  }).format(basePrice)}
                </span>
              </div>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              handleAddToCart(product);
            }}
            className={`w-full py-3 px-6 rounded-lg font-bold text-white flex items-center justify-center gap-2 ${
              !isOutOfStock
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            disabled={isOutOfStock}
          >
            <ShoppingCartIcon className="w-5 h-5" />
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>

          {/* Additional Stock Info */}
          {!isOutOfStock && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                {isLowStock 
                  ? `❗ Only ${inventory} left - order soon!`
                  : '✅ Available - usually ships within 24 hours'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Specifications */}
      {product.specifications?.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.specifications.map((spec: any, index: number) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">{spec.name}</h3>
                <p className="text-gray-700">{spec.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warranty Information */}
      {product.warranty && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">Warranty Information</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="text-gray-700 whitespace-pre-line">{product.warranty}</p>
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {product.intelPoints && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Intel Points</h3>
            <p>{product.intelPoints}</p>
          </div>
        )}
        {product.manufacturer && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Manufacturer</h3>
            <p>{product.manufacturer}</p>
          </div>
        )}
        {product.isESD && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">ESD Protection</h3>
            <p>Yes</p>
          </div>
        )}
      </div>
    </div>
  );
}