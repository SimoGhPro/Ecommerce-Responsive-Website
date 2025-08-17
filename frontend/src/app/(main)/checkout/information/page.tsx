"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../../../../../store/cartSlice";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import imageUrlBuilder from "@sanity/image-url";
import { client } from "@/sanity/client";
import { Order, Product, SanityImageAsset } from "../../../../../../backend/data/model/modelTypes";

// Image URL Builder
const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageAsset) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

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

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  phoneNumber: string;
  deliveryMethod: string;
  requestedDeliveryDate: string;
  comments: string;
}

export default function CheckoutInformation() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const dispatch = useDispatch();
  const cart = useSelector((state: { cart: CartState }) => state.cart);
  const [formData, setFormData] = useState<FormData>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.emailAddresses?.[0]?.emailAddress || "",
    address: "",
    city: "",
    postalCode: "",
    phoneNumber: "",
    deliveryMethod: "standard",
    requestedDeliveryDate: "",
    comments: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderNumber] = useState(generateOrderNumber());

  function generateOrderNumber(): string {
    const date = new Date();
    return `ORD-${date.getFullYear()}${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}-${Math.floor(
      Math.random() * 10000
    )
      .toString()
      .padStart(4, "0")}`;
  }

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

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
    }
  }, [isLoaded, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      // Create order data
      const orderData = {
        _type: "order",
        orderNumber: generateOrderNumber(),
        user: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          endUserAddress: formData.address,
          endUserCity: formData.city,
          endUserPostalCode: formData.postalCode,
          endUserPhoneNumber: formData.phoneNumber,
        },
        stockVerification: 0, // 0 for not verified, 1 for verified
        requestedDeliveryDate: formData.requestedDeliveryDate,
        deliveryMethod: formData.deliveryMethod,
        comments: formData.comments,
        items: cart.items.map(item => ({
          product: {
            _ref: item._id,
            _type: "reference",
          },
          quantity: item.quantity,
          price: item.discountPrice || item.price, // Include price per item
          _key: item._id,
        })),
        clerkUserId: user?.id,
        status: "pending",
        totalAmount: calculateTotal(), // Include total amount
        currency: "MAD", // Default currency
      };
  
      // Send order to Sanity
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order: orderData,
          cartItems: cart.items,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to create order");
      }
  
      // Clear cart
      dispatch(clearCart());
  
      // Redirect to success page
      router.push("/checkout/success");
    } catch (error) {
      console.error("Checkout error:", error);
      setError("There was an error processing your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout Information</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>

              <div className="mb-4 p-4 bg-blue-50 rounded-md">
                <p className="text-sm text-gray-600">Order Reference</p>
                <p className="font-medium text-blue-700">{orderNumber}</p>
              </div>

              <div className="space-y-4 mb-6">
                <h3 className="text-md font-medium text-gray-900">
                  {cart.items.length} {cart.items.length === 1 ? 'Item' : 'Items'} in Cart
                </h3>
                <div className="divide-y divide-gray-200">
                  {cart.items.map((item) => {
                    const primaryImage = item.images?.find((img:any) => img.isPrimary)?.asset || item.images?.[0]?.asset;
                    const imageUrl = primaryImage ? urlFor(primaryImage)?.width(300).height(300).url() : '';

                    return (
                      <div key={item._id} className="py-4 flex items-center">
                        <div className="flex-shrink-0 w-16 h-16 relative">
                          {imageUrl && (
                            <Image
                              src={imageUrl}
                              alt={item.name || 'Product image'}
                              fill
                              className="object-cover rounded-md"
                            />
                          )}
                        </div>
                        <div className="ml-4 flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {((item.discountPrice || item.price) * item.quantity).toFixed(2)} MAD
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 border-t border-gray-200 pt-4">
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
                <div className="flex justify-between font-medium text-lg pt-2">
                  <span>Total</span>
                  <span>{calculateTotal().toFixed(2)} MAD</span>
                </div>
              </div>
            </div>
          </div>


          {/* Checkout Form */}
          <div className="lg:col-span-2 order-1 lg:order-2">
          <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                Postal Code
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="deliveryMethod" className="block text-sm font-medium text-gray-700">
              Delivery Method
            </label>
            <select
              id="deliveryMethod"
              name="deliveryMethod"
              value={formData.deliveryMethod}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="standard">Standard Delivery</option>
              <option value="express">Express Delivery</option>
              <option value="pickup">Store Pickup</option>
            </select>
          </div>

          <div>
            <label htmlFor="requestedDeliveryDate" className="block text-sm font-medium text-gray-700">
              Requested Delivery Date
            </label>
            <input
              type="date"
              id="requestedDeliveryDate"
              name="requestedDeliveryDate"
              value={formData.requestedDeliveryDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
              Additional Comments
            </label>
            <textarea
              id="comments"
              name="comments"
              rows={3}
              value={formData.comments}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || cart.items.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md shadow-sm"
            >
              {isSubmitting ? "Processing..." : "Place Order"}
            </Button>
          </div>
        </form>
          </div>
        </div>
      </div>
    </div>
  );
}