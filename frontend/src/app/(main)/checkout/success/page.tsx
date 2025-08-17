// app/checkout/success/page.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useSearchParams } from "next/navigation";

export default function CheckoutSuccess() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');
  const totalAmount = searchParams.get('totalAmount');
  const currency = searchParams.get('currency');

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto text-center">
        <div className="flex justify-center">
          <CheckCircleIcon className="h-16 w-16 text-green-600" />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Order Confirmed!</h1>
        {orderNumber && (
          <p className="mt-2 text-gray-600">
            Order #: {orderNumber}
          </p>
        )}
        {totalAmount && currency && (
          <p className="mt-2 text-gray-600">
            Total: {parseFloat(totalAmount).toFixed(2)} {currency}
          </p>
        )}
        <p className="mt-4 text-lg text-gray-600">
          Thank you for your purchase. We've sent a confirmation email with your order details.
        </p>
        <div className="mt-8 space-y-4">
          <Link href="/orders">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              View Your Orders
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline" className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}