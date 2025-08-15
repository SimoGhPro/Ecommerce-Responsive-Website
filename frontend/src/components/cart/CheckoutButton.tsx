// components/CheckoutButton.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";

export const CheckoutButton = () => {
  const { isSignedIn } = useUser();
  const router = useRouter();

  const handleCheckout = () => {
    if (isSignedIn) {
      router.push("/checkout/information");
    }
  };

  return (
    <>
      {isSignedIn ? (
        <Button
          onClick={handleCheckout}
          className="mt-6 w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors"
        >
          Proceed to Checkout
        </Button>
      ) : (
        <SignInButton mode="modal">
          <Button className="mt-6 w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors">
            Proceed to Checkout
          </Button>
        </SignInButton>
      )}
    </>
  );
};