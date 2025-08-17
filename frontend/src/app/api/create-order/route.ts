// // app/api/create-order/route.ts
// import { OrderConfirmationEmail } from '@/components/emails/OrderConfirmationEmail';
// import { NextResponse } from 'next/server';
// import { client } from '@/sanity/client';
// import { Resend } from 'resend';

// // Initialize Resend
// const resend = new Resend(process.env.RESEND_API_KEY);

// export async function POST(request: Request) {
//   try {
//     const { order, cartItems } = await request.json();

//     // Validate required fields
//     if (!order || !cartItems || !order.user?.email) {
//       return NextResponse.json(
//         { success: false, error: "Missing required order data" },
//         { status: 400 }
//       );
//     }

//     // 1. First create the order in Sanity
//     const createdOrder = await client.create(order);

//     // 2. Update inventory for each product in the order
//     const inventoryUpdates = cartItems.map(async (item: any) => {
//       try {
//         const product = await client.getDocument(item._id);
//         if (!product) {
//           console.error(`Product ${item._id} not found`);
//           return;
//         }

//         const currentInventory = product.inventory?.ourInventory ?? 
//                                Math.floor((product.inventory?.quantity ?? 0) / 2);
//         const newInventory = Math.max(0, currentInventory - item.quantity);

//         await client
//           .patch(item._id)
//           .set({
//             'inventory.ourInventory': newInventory,
//           })
//           .commit();
//       } catch (error) {
//         console.error(`Error updating inventory for product ${item._id}:`, error);
//       }
//     });

//     await Promise.all(inventoryUpdates);

//     // 3. Send confirmation email with Resend
//     try {
//       const { data, error } = await resend.emails.send({
//         from: 'onboarding@resend.dev', // Replace with your domain
//         to: [order.user.email],
//         subject: `Order Confirmation #${createdOrder.orderNumber}`,
//         react: OrderConfirmationEmail({ order, cartItems }),
//       });

//       if (error) {
//         console.error('Resend error:', error);
//         // Don't fail the order if email fails
//       } else {
//         console.log('Email sent successfully:', data);
//       }
//     } catch (emailError) {
//       console.error('Error sending confirmation email:', emailError);
//     }

//     return NextResponse.json({ 
//       success: true, 
//       orderId: createdOrder._id,
//       orderNumber: createdOrder.orderNumber,
//       totalAmount: createdOrder.totalAmount,
//       currency: createdOrder.currency
//     });

//   } catch (error: any) {
//     console.error('Order creation error:', error);
//     return NextResponse.json(
//       { 
//         success: false, 
//         error: error.message,
//         details: error.details || null
//       },
//       { status: 500 }
//     );
//   }
// }

// app/api/create-order/route.ts
import { OrderConfirmationEmail } from '@/components/emails/OrderConfirmationEmail';
import { NextResponse } from 'next/server';
import { client } from '@/sanity/client';
import nodemailer from 'nodemailer';

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  }
});

export async function POST(request: Request) {
  try {
    const { order, cartItems } = await request.json();

    // Validate required fields
    if (!order || !cartItems || !order.user?.email) {
      return NextResponse.json(
        { success: false, error: "Missing required order data" },
        { status: 400 }
      );
    }

    // 1. First create the order in Sanity
    const createdOrder = await client.create(order);

    // 2. Update inventory for each product in the order
    const inventoryUpdates = cartItems.map(async (item: any) => {
      try {
        const product = await client.getDocument(item._id);
        if (!product) {
          console.error(`Product ${item._id} not found`);
          return;
        }

        const currentInventory = product.inventory?.ourInventory ?? 
                               Math.floor((product.inventory?.quantity ?? 0) / 2);
        const newInventory = Math.max(0, currentInventory - item.quantity);

        await client
          .patch(item._id)
          .set({
            'inventory.ourInventory': newInventory,
          })
          .commit();
      } catch (error) {
        console.error(`Error updating inventory for product ${item._id}:`, error);
      }
    });

    await Promise.all(inventoryUpdates);

    // 3. Send confirmation email with Nodemailer
    try {
      const emailHtml = OrderConfirmationEmail({ order: createdOrder, cartItems });
      
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: order.user.email,
        subject: `Order Confirmation #${createdOrder.orderNumber}`,
        html: emailHtml,
      };

      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Don't fail the order if email fails
    }

    return NextResponse.json({ 
      success: true, 
      orderId: createdOrder._id,
      orderNumber: createdOrder.orderNumber,
      totalAmount: createdOrder.totalAmount,
      currency: createdOrder.currency
    });

  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        details: error.details || null
      },
      { status: 500 }
    );
  }
}
