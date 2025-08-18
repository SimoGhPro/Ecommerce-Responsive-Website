export function OrderConfirmationEmail({ order, cartItems }: { order: any, cartItems: any[] }) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
          .order-details { margin: 20px 0; }
          .item { display: flex; margin-bottom: 10px; }
          .total { font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation #${order.orderNumber}</h1>
          </div>
          
          <div class="order-details">
            <h2>Thank you for your order!</h2>
            <p>We've received your order and will process it shortly.</p>
            <p>You'll find your order details attached as a PDF document.</p>
            
            <h3>Order Summary</h3>
            ${cartItems.map(item => `
              <div class="item">
                <div>${item.quantity} x ${item.name}</div>
                <div>${((item.discountPrice || item.price) * item.quantity).toFixed(2)} MAD</div>
              </div>
            `).join('')}
            
            <div class="total">
              Total: ${order.totalAmount.toFixed(2)} MAD
            </div>
          </div>
          
          <div class="footer">
            <p>If you have any questions, please contact our customer support.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}