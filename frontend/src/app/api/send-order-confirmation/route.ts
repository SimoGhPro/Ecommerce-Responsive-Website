import type { NextApiRequest, NextApiResponse } from 'next';
import { OrderConfirmationTemplate } from '@/components/checkout/OrderConfirmationTemplate';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailRequest {
  email: string;
  orderNumber: string;
  customerName: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      email,
      orderNumber,
      customerName,
      orderDate,
      items,
      subtotal,
      tax,
      total
    } = req.body as EmailRequest;

    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: [email],
      subject: `Your Order #${orderNumber} Confirmation`,
      react: OrderConfirmationTemplate({
        orderNumber,
        customerName,
        orderDate,
        items,
        subtotal,
        tax,
        total
      }),
    });

    if (error) {
      console.error('Email sending error:', error);
      return res.status(400).json(error);
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Failed to send confirmation email' });
  }
}