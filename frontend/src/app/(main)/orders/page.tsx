// app/orders/page.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { client } from "@/sanity/client";

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  requestedDeliveryDate: string;
  totalAmount: number;
  currency: string;
  _createdAt: string;
}

export default function OrdersPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
    } else if (user) {
      fetchOrders();
    }
  }, [isLoaded, user, router]);

  const fetchOrders = async () => {
    try {
      const orders = await client.fetch(
        `*[_type == "order" && clerkUserId == $userId] | order(_createdAt desc) {
          _id,
          orderNumber,
          status,
          requestedDeliveryDate,
          "totalAmount": coalesce(totalAmount, 0),
          "currency": coalesce(currency, "MAD"),
          _createdAt
        }`,
        { userId: user?.id }
      );
      setOrders(orders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };
  

  if (!isLoaded || loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
          <Link href="/products">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-medium text-gray-900">No orders found</h2>
            <p className="mt-2 text-gray-600">
              You haven't placed any orders yet.
            </p>
            <Link href="/products" className="mt-6 inline-block">
              <Button>Browse Products</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 bg-gray-100 p-4 font-medium text-gray-700">
              <div className="col-span-2">Order #</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Delivery Date</div>
              <div className="col-span-2 text-right">Total</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            {orders.map((order) => (
              <div key={order._id} className="grid grid-cols-12 p-4 border-b border-gray-200">
                <div className="col-span-2 font-medium">{order.orderNumber}</div>
                <div className="col-span-2">
                  {new Date(order._createdAt).toLocaleDateString()}
                </div>
                <div className="col-span-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
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
                    {order.status}
                  </span>
                </div>
                <div className="col-span-2">
                  {order.requestedDeliveryDate
                    ? new Date(order.requestedDeliveryDate).toLocaleDateString()
                    : "-"}
                </div>
                <div className="col-span-2 text-right">
                  {order.totalAmount.toFixed(2)} {order.currency}
                </div>
                <div className="col-span-2 text-right">
                  <Link href={`/orders/${order._id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}