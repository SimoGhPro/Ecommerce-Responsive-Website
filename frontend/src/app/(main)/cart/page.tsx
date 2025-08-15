"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCartIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useDispatch, useSelector } from 'react-redux';
import {
  addItemToCart,
  removeItemFromCart,
  decreaseItemQuantity,
  clearCart,
} from '../../../../store/cartSlice';
import imageUrlBuilder from '@sanity/image-url';
import { client } from '@/sanity/client';
import { type SanityImageSource } from '@sanity/image-url/lib/types/types';
// In your CartPage component
import { CheckoutButton } from '@/components/cart/CheckoutButton';


interface CartItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  images?: Array<{
    asset: any;
    isPrimary?: boolean;
  }>;
  quantity: number;
  totalPrice: number;
}

interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
}

// Image URL Builder
const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

const CartPage = () => {
  const dispatch = useDispatch();
  const cart = useSelector((state: { cart: CartState }) => state.cart);

  const handleRemoveItem = (id: string) => {
    dispatch(removeItemFromCart(id));
  };

  const handleDecreaseQuantity = (id: string) => {
    dispatch(decreaseItemQuantity(id));
  };

  const handleIncreaseQuantity = (product: CartItem) => {
    dispatch(addItemToCart({
      ...product,
      price: product.discountPrice || product.price,
    }));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const calculateTax = () => {
    // Assuming 10% tax rate
    return getEffectiveTotalAmount() * 0.1;
  };

  const calculateTotal = () => {
    return getEffectiveTotalAmount() + calculateTax();
  };

  // Calculate subtotal from items if totalAmount is 0
  const getEffectiveTotalAmount = () => {
    if (cart.totalAmount > 0) return cart.totalAmount;
    return cart.items.reduce((sum, item) => sum + (item.discountPrice || item.price) * item.quantity, 0);
  };

  // Calculate total quantity from items if totalQuantity is 0
  const getEffectiveTotalQuantity = () => {
    if (cart.totalQuantity > 0) return cart.totalQuantity;
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  };


  const effectiveTotalAmount = getEffectiveTotalAmount();
  const effectiveTotalQuantity = getEffectiveTotalQuantity();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
          <Link
            href="/"
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Continue Shopping
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 ml-8">Your Shopping Cart</h1>
        </div>

        {cart.items.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCartIcon className="h-16 w-16 mx-auto text-gray-400" />
            <h2 className="mt-4 text-2xl font-medium text-gray-900">
              Your cart is empty
            </h2>
            <p className="mt-2 text-gray-500">
              Start adding some items to your cart
            </p>
            <Link
              href="/products"
              className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">
                  {effectiveTotalQuantity} {effectiveTotalQuantity === 1 ? 'Item' : 'Items'} in Cart
                </h2>
                <button
                  onClick={handleClearCart}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Clear Cart
                </button>
              </div>

              <div className="divide-y divide-gray-200">
                {cart.items.map((item) => {
                  const primaryImage = item.images?.find((img) => img.isPrimary)?.asset || item.images?.[0]?.asset;
                  const imageUrl = primaryImage ? urlFor(primaryImage)?.width(300).height(300).url() : '';

                  return (
                    <div key={item._id} className="py-6 flex flex-col sm:flex-row">
                      <div className="flex-shrink-0">
                        {imageUrl && (
                          <Image
                            src={imageUrl}
                            alt={item.name}
                            width={120}
                            height={120}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        )}
                      </div>

                      <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-base font-medium text-gray-900">
                              {item.name}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              {item.description?.substring(0, 100)}...
                            </p>
                          </div>
                          <p className="text-base font-medium text-gray-900 ml-4">
                            {((item.discountPrice || item.price) * item.quantity).toFixed(2)} MAD
                          </p>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center border rounded-md">
                            <button
                              onClick={() => handleDecreaseQuantity(item._id)}
                              className="px-3 py-1 text-lg"
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="px-4">{item.quantity}</span>
                            <button
                              onClick={() => handleIncreaseQuantity(item)}
                              className="px-3 py-1 text-lg"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemoveItem(item._id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6 h-fit sticky top-8">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{effectiveTotalAmount.toFixed(2)} MAD</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">Free</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="text-gray-900">{calculateTax().toFixed(2)} MAD</span>
                </div>

                <div className="border-t border-gray-200 pt-4 flex justify-between">
                  <span className="text-lg font-medium text-gray-900">Total</span>
                  <span className="text-lg font-medium text-gray-900">
                    {calculateTotal().toFixed(2)} MAD
                  </span>
                </div>
              </div>
              
              <CheckoutButton />

              <p className="mt-4 text-center text-sm text-gray-500">
                or{' '}
                <Link
                  href="/products"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Continue Shopping
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;