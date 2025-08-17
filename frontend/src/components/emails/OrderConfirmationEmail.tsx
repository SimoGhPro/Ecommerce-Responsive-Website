export function OrderConfirmationEmail({ order, cartItems }: { order: any, cartItems: any[] }) {
    return (
      <div>
        <h1>Thank you for your order</h1>
        <p>Your order #{order.orderNumber} has been received and is being processed.</p>
        
        <h2>Order Summary</h2>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{((item.discountPrice || item.price) * item.quantity).toFixed(2)} {order.currency}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2}>Total</td>
              <td>{order.totalAmount.toFixed(2)} {order.currency}</td>
            </tr>
          </tfoot>
        </table>
        
        <h2>Shipping Information</h2>
        <p>
          {order.user.firstName} {order.user.lastName}<br />
          {order.user.endUserAddress}<br />
          {order.user.endUserCity}, {order.user.endUserPostalCode}<br />
          Phone: {order.user.endUserPhoneNumber}
        </p>
        
        <p>We'll notify you when your order ships. If you have any questions, please contact our support team.</p>
      </div>
    );
  }