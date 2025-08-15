// components/emails/OrderConfirmationTemplate.tsx
import React from 'react';

interface OrderConfirmationProps {
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

export const OrderConfirmationTemplate: React.FC<OrderConfirmationProps> = ({
  orderNumber,
  customerName,
  orderDate,
  items,
  subtotal,
  tax,
  total
}) => (
  <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
    <h1 style={{ color: '#111827', fontSize: '24px', marginBottom: '20px' }}>
      Thank you for your order, {customerName}!
    </h1>
    
    <p style={{ color: '#4b5563', marginBottom: '16px' }}>
      Your order <strong>#{orderNumber}</strong> has been received and is being processed.
    </p>
    
    <p style={{ color: '#4b5563', marginBottom: '24px' }}>
      Order Date: {orderDate}
    </p>

    <div style={{ marginBottom: '24px' }}>
      <h2 style={{ color: '#111827', fontSize: '18px', marginBottom: '12px' }}>
        Order Summary
      </h2>
      
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
            <th style={{ textAlign: 'left', padding: '8px 0', color: '#6b7280' }}>Item</th>
            <th style={{ textAlign: 'right', padding: '8px 0', color: '#6b7280' }}>Qty</th>
            <th style={{ textAlign: 'right', padding: '8px 0', color: '#6b7280' }}>Price</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '12px 0', color: '#111827' }}>{item.name}</td>
              <td style={{ textAlign: 'right', padding: '12px 0', color: '#111827' }}>{item.quantity}</td>
              <td style={{ textAlign: 'right', padding: '12px 0', color: '#111827' }}>{item.price.toFixed(2)} MAD</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ color: '#6b7280' }}>Subtotal</span>
        <span style={{ color: '#111827' }}>{subtotal.toFixed(2)} MAD</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ color: '#6b7280' }}>Tax</span>
        <span style={{ color: '#111827' }}>{tax.toFixed(2)} MAD</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '16px' }}>
        <span style={{ color: '#111827' }}>Total</span>
        <span style={{ color: '#111827' }}>{total.toFixed(2)} MAD</span>
      </div>
    </div>

    <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #e5e7eb', color: '#6b7280', fontSize: '14px' }}>
      <p>If you have any questions about your order, please reply to this email.</p>
      <p>© {new Date().getFullYear()} Your Store Name. All rights reserved.</p>
    </div>
  </div>
);