import { client } from "./client";
import { Order } from "../../../backend/data/model/modelTypes";

// Define a type for the order data we'll accept when creating an order
interface CreateOrderData {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    endUserCompany?: string;
    endUserContactName?: string;
    endUserAddress?: string;
    endUserCity?: string;
    endUserPostalCode?: string;
    endUserCountry?: string;
    endUserPhoneNumber?: string;
  };
  referenceNo?: string;
  requestedDeliveryDate?: string;
  deliveryMethod?: string;
  comments?: string;
  items: Array<{
    product: {
      _ref: string;
    };
    quantity: number;
    variantId?: string;
  }>;
  clerkUserId?: string;
}

export const createOrder = async (orderData: any & { orderNumber: string }): Promise<Order> => {
  const date = new Date();
  const orderNumber = `ORD-${date.getFullYear()}${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}-${Math.floor(
    Math.random() * 10000
  )
    .toString()
    .padStart(4, "0")}`;

  // Prepare the order items in the correct format
  const orderItems = orderData.items.map((item:any) => ({
    _type: "orderItem", // Assuming you have this type in your schema
    product: {
      _type: "reference",
      _ref: item.product._ref,
    },
    quantity: item.quantity,
    ...(item.variantId && { variantId: item.variantId }),
    _key: Math.random().toString(36).substring(2, 15) // Generate a unique key
  }));

  const order: Omit<Order, "_id" | "_createdAt" | "_updatedAt" | "_rev"> = {
    _type: "order",
    orderNumber,
    user: {
      firstName: orderData.user.firstName,
      lastName: orderData.user.lastName,
      email: orderData.user.email,
      ...(orderData.user.endUserCompany && { endUserCompany: orderData.user.endUserCompany }),
      ...(orderData.user.endUserContactName && { endUserContactName: orderData.user.endUserContactName }),
      ...(orderData.user.endUserAddress && { endUserAddress: orderData.user.endUserAddress }),
      ...(orderData.user.endUserCity && { endUserCity: orderData.user.endUserCity }),
      ...(orderData.user.endUserPostalCode && { endUserPostalCode: orderData.user.endUserPostalCode }),
      ...(orderData.user.endUserCountry && { endUserCountry: orderData.user.endUserCountry }),
      ...(orderData.user.endUserPhoneNumber && { endUserPhoneNumber: orderData.user.endUserPhoneNumber }),
    },
    stockVerification: 0,
    status: "pending",
    items: orderItems,
    ...(orderData.referenceNo && { referenceNo: orderData.referenceNo }),
    ...(orderData.requestedDeliveryDate && { requestedDeliveryDate: orderData.requestedDeliveryDate }),
    ...(orderData.deliveryMethod && { deliveryMethod: orderData.deliveryMethod }),
    ...(orderData.comments && { comments: orderData.comments }),
    ...(orderData.clerkUserId && { clerkUserId: orderData.clerkUserId }),
  };

  const result = await client.create(order);

  // Send confirmation email
  if (orderData.user.email) {
    await sendOrderConfirmationEmail(orderData.user.email, orderNumber);
  }

  return result as Order;
};

const sendOrderConfirmationEmail = async (email: string, orderNumber: string) => {
  try {
    const response = await fetch("/api/send-order-confirmation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        orderNumber,
      }),
    });

    if (!response.ok) {
      console.error("Failed to send confirmation email");
      throw new Error("Failed to send confirmation email");
    }
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    throw error; // Re-throw to handle in the calling function
  }
};