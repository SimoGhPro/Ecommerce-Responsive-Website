"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../../../../../store/cartSlice";
import { Button } from "@/components/ui/button";
import { createOrder } from "@/sanity/orderService";
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

interface OrderFormData {
  firstName: string;
  lastName: string;
  email: string;
  endUserCompany?: string;
  endUserContactName?: string;
  endUserAddress: string;
  endUserCity: string;
  endUserPostalCode: string;
  endUserCountry: string;
  endUserPhoneNumber: string;
  referenceNo?: string;
  requestedDeliveryDate?: string;
  deliveryMethod: string;
  comments?: string;
}

export default function CheckoutInformation() {
  const { user } = useUser();
  const router = useRouter();
  const dispatch = useDispatch();
  const cart = useSelector((state: { cart: CartState }) => state.cart);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderNumber] = useState(generateOrderNumber());

  const [formData, setFormData] = useState<OrderFormData>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.emailAddresses?.[0]?.emailAddress || "",
    endUserCompany: "",
    endUserContactName: "",
    endUserAddress: "",
    endUserCity: "",
    endUserPostalCode: "",
    endUserCountry: "",
    endUserPhoneNumber: "",
    referenceNo: "",
    requestedDeliveryDate: "",
    deliveryMethod: "standard",
    comments: "",
  });

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const orderItems = cart.items.map((item) => ({
        product: { 
          _ref: item._id, 
          _type: "reference" as const 
        },
        quantity: item.quantity,
        ...(item.variantId && { variantId: item.variantId }),
        _key: Math.random().toString(36).substring(2, 9)
      }));

      const orderData: Omit<Order, '_id' | '_createdAt' | '_updatedAt' | '_rev'> = {
        _type: "order",
        orderNumber,
        user: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          ...(formData.endUserCompany && { endUserCompany: formData.endUserCompany }),
          ...(formData.endUserContactName && { endUserContactName: formData.endUserContactName }),
          endUserAddress: formData.endUserAddress,
          endUserCity: formData.endUserCity,
          endUserPostalCode: formData.endUserPostalCode,
          endUserCountry: formData.endUserCountry,
          endUserPhoneNumber: formData.endUserPhoneNumber,
        },
        stockVerification: 0,
        status: "pending",
        items: orderItems,
        ...(formData.referenceNo && { referenceNo: formData.referenceNo }),
        ...(formData.requestedDeliveryDate && { requestedDeliveryDate: formData.requestedDeliveryDate }),
        deliveryMethod: formData.deliveryMethod,
        ...(formData.comments && { comments: formData.comments }),
        ...(user?.id && { clerkUserId: user.id }),
      };

      const order = await createOrder(orderData);
      dispatch(clearCart());
      router.push(`/checkout/confirmation?orderId=${order._id}`);
    } catch (err) {
      console.error("Checkout failed:", err);
      setError("Failed to process your order. Please try again.");
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
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
              {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="md:col-span-2">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <label htmlFor="endUserPhoneNumber" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="endUserPhoneNumber"
                    name="endUserPhoneNumber"
                    value={formData.endUserPhoneNumber}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
                </div>

                {/* Shipping Information */}
                <div className="md:col-span-2">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                  <label htmlFor="endUserCompany" className="block text-sm font-medium text-gray-700">
                    Company
                  </label>
                  <input
                    type="text"
                    id="endUserCompany"
                    name="endUserCompany"
                    value={formData.endUserCompany}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="endUserContactName" className="block text-sm font-medium text-gray-700">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    id="endUserContactName"
                    name="endUserContactName"
                    value={formData.endUserContactName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="endUserAddress" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <input
                    type="text"
                    id="endUserAddress"
                    name="endUserAddress"
                    value={formData.endUserAddress}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="endUserCity" className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    id="endUserCity"
                    name="endUserCity"
                    value={formData.endUserCity}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="endUserPostalCode" className="block text-sm font-medium text-gray-700">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="endUserPostalCode"
                    name="endUserPostalCode"
                    value={formData.endUserPostalCode}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="endUserCountry" className="block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <input
                    type="text"
                    id="endUserCountry"
                    name="endUserCountry"
                    value={formData.endUserCountry}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                  </div>
                </div>

                {/* Additional Comments */}
                <div className="md:col-span-2">
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
              </div>

              <div className="mt-8 flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors"
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