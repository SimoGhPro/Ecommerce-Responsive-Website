// app/orders/[id]/page.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { client } from "@/sanity/client";
import Image from "next/image";
import imageUrlBuilder from "@sanity/image-url";

interface OrderItem {
  _key: string;
  product: {
    _ref: string;
    name?: string;
    images?: any[];
  };
  quantity: number;
  price?: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  requestedDeliveryDate: string;
  deliveryMethod: string;
  comments?: string;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    endUserAddress?: string;
    endUserCity?: string;
    endUserPostalCode?: string;
    endUserPhoneNumber?: string;
  };
  items?: OrderItem[];
  totalAmount?: number;
  currency?: string;
  _createdAt: string;
}

const builder = imageUrlBuilder(client);

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
    } else {
      fetchOrder();
    }
  }, [isLoaded, user, router, params.id]);

  const fetchOrder = async () => {
    try {
      const orderData = await client.fetch(
        `*[_type == "order" && _id == $id && clerkUserId == $userId][0] {
          _id,
          orderNumber,
          status,
          requestedDeliveryDate,
          deliveryMethod,
          comments,
          user,
          items,
          "totalAmount": coalesce(totalAmount, 0),
          "currency": coalesce(currency, "MAD"),
          _createdAt
        }`,
        { id: params.id, userId: user?.id }
      );

      if (!orderData) {
        throw new Error("Order not found");
      }

      setOrder(orderData);

      // Fetch product details for each item
      const productIds = orderData.items?.map((item: any) => item.product._ref) || [];
      if (productIds.length > 0) {
        const productsData = await client.fetch(
          `*[_type == "product" && _id in $productIds] {
            _id,
            name,
            price,
            images
          }`,
          { productIds }
        );
        setProducts(productsData);
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!order) {
    return <div>Order not found</div>;
  }

  const getProductById = (id: string) => {
    return products.find((product) => product._id === id);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/orders" className="text-blue-600 hover:text-blue-800">
            &larr; Back to Orders
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Order #{order.orderNumber}
          </h1>
          <div className="mt-2 flex items-center">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              order.status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : order.status === "processing"
                ? "bg-blue-100 text-blue-800"
                : order.status === "shipped"
                ? "bg-purple-100 text-purple-800"
                : order.status === "delivered"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
            <span className="ml-4 text-gray-600">
              Placed on {new Date(order._createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                Order Items
              </h2>
              <div className="divide-y divide-gray-200">
                {order.items?.map((item) => {
                  const product = getProductById(item.product._ref);
                  const primaryImage = product?.images?.[0]?.asset;
                  const imageUrl = primaryImage
                    ? builder.image(primaryImage).width(200).height(200).url()
                    : null;

                  return (
                    <div key={item._key} className="py-4 flex">
                      {imageUrl && (
                        <div className="flex-shrink-0">
                          <Image
                            src={imageUrl}
                            alt={product?.name || "Product"}
                            width={80}
                            height={80}
                            className="rounded-md"
                          />
                        </div>
                      )}
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-base font-medium text-gray-900">
                              {product?.name || "Unknown Product"}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                          <p className="text-base font-medium text-gray-900">
                            {((item.price || 0) * item.quantity).toFixed(2)} {order.currency}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Delivery Information
              </h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {order.user?.firstName} {order.user?.lastName}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {order.user?.email}
                </p>
                <p>
                  <span className="font-medium">Phone:</span>{" "}
                  {order.user?.endUserPhoneNumber}
                </p>
                <p>
                  <span className="font-medium">Address:</span>{" "}
                  {order.user?.endUserAddress}
                </p>
                <p>
                  <span className="font-medium">City:</span> {order.user?.endUserCity}
                </p>
                <p>
                  <span className="font-medium">Postal Code:</span>{" "}
                  {order.user?.endUserPostalCode}
                </p>
                <p>
                  <span className="font-medium">Delivery Method:</span>{" "}
                  {order.deliveryMethod}
                </p>
                {order.requestedDeliveryDate && (
                  <p>
                    <span className="font-medium">Requested Delivery Date:</span>{" "}
                    {new Date(order.requestedDeliveryDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Order Summary
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{order.totalAmount?.toFixed(2)} {order.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="font-medium">Total</span>
                  <span className="font-medium">
                    {order.totalAmount?.toFixed(2)} {order.currency}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}