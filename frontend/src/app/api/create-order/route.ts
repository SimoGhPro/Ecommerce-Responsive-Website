import { OrderConfirmationEmail } from '@/components/emails/OrderConfirmationEmail';
import { NextResponse } from 'next/server';
import { client } from '@/sanity/client';
import nodemailer from 'nodemailer';
import puppeteer from 'puppeteer';

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates
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

    // 3. Generate PDF with order details using Puppeteer
    let pdfBuffer: Buffer;
    try {
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      const htmlContent = generatePdfContent(createdOrder, cartItems);
      
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0'
      });
      
      pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          right: '10mm',
          bottom: '20mm',
          left: '10mm'
        },
        printBackground: true
      });
      
      await browser.close();
    } catch (pdfError) {
      console.error('Error generating PDF:', pdfError);
      throw new Error('Failed to generate order PDF');
    }

    // 4. Send email with PDF attachment
    try {
      const emailHtml = OrderConfirmationEmail({ order: createdOrder, cartItems });
      
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: order.user.email,
        subject: `Order Confirmation #${createdOrder.orderNumber}`,
        html: emailHtml,
        attachments: [{
          filename: `Order_${createdOrder.orderNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }]
      };

      await transporter.sendMail(mailOptions);
      console.log('Email with PDF attachment sent successfully');
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

function generatePdfContent(order: any, cartItems: any[]): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice #${order.orderNumber}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
          
          body { 
            font-family: 'Roboto', Arial, sans-serif; 
            line-height: 1.6;
            color: #333;
            padding: 10px;
          }
          
          .header { 
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
          }
          
          .logo {
            max-width: 150px;
            height: auto;
          }
          
          .invoice-title {
            text-align: right;
          }
          
          .invoice-title h1 {
            color: #2c3e50;
            margin: 0;
            font-size: 24px;
          }
          
          .invoice-title p {
            margin: 5px 0 0;
            color: #7f8c8d;
          }
          
          .company-info, .customer-info {
            margin-bottom: 15px;
          }
          
          .company-info h2, .customer-info h2 {
            color: #2c3e50;
            font-size: 18px;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 2px solid #3498db;
            display: inline-block;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          
          .info-item {
            margin-bottom: 5px;
          }
          
          .info-label {
            font-weight: 500;
            color: #7f8c8d;
          }
          
          .items-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          
          .items-table th {
            background-color: #3498db;
            color: white;
            text-align: left;
            padding: 12px 15px;
            font-weight: 500;
          }
          
          .items-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #eee;
          }
          
          .items-table tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          
          .text-right {
            text-align: right;
          }
          
          .text-center {
            text-align: center;
          }
          
          .totals-section {
            display: flex;
            justify-content: flex-end;
            margin-top: 30px;
          }
          
          .totals-table {
            width: 300px;
            border-collapse: collapse;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          
          .totals-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #eee;
          }
          
          .totals-table td:first-child {
            font-weight: 500;
            color: #7f8c8d;
          }
          
          .totals-table td:last-child {
            text-align: right;
            font-weight: 500;
          }
          
          .grand-total-row {
            background-color: #f8f9fa;
          }
          
          .grand-total {
            font-weight: 700;
            font-size: 1.2em;
            color: #2c3e50;
          }
          
          .tax-row {
            border-top: 2px solid #eee;
          }
          
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 0.9em;
            color: #7f8c8d;
            text-align: center;
          }
          
          .thank-you {
            font-size: 1.1em;
            color: #3498db;
            margin-bottom: 10px;
          }
          
          .notes-section {
            margin-top: 25px;
            padding: 10px;
            background-color: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #3498db;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          
          .notes-title {
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
          }
          
          .notes-title:before {
            content: "📝";
            margin-right: 8px;
            font-size: 1.2em;
          }
          
          .notes-content {
            line-height: 1.6;
            color: #555;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">
            <img src="https://jolofsystem.com/wp-content/uploads/2017/09/logo_djolof.png" alt="Company Logo" style="max-width: 150px;">
          </div>
          <div class="invoice-title">
            <h1>INVOICE</h1>
            <p>#${order.orderNumber}</p>
            <p>Date: ${new Date().toLocaleDateString()}</p>
          </div>
        </div>
        
        <div class="info-grid">
          <div class="company-info">
            <h2>From</h2>
            <div class="info-item">
              <div class="info-label">Company Name</div>
              <div>Jolof System</div>
            </div>
            <div class="info-item">
              <div class="info-label">Address</div>
              <div>123 Business Street, Casablanca, Morocco</div>
            </div>
            <div class="info-item">
              <div class="info-label">Phone</div>
              <div>+212 522 27 50 43</div>
            </div>
            <div class="info-item">
              <div class="info-label">Email</div>
              <div>info@jolofsystem.ma</div>
            </div>
          </div>
          
          <div class="customer-info">
            <h2>Bill To</h2>
            <div class="info-item">
              <div class="info-label">Name</div>
              <div>${order.user.firstName} ${order.user.lastName}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Email</div>
              <div>${order.user.email}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Phone</div>
              <div>${order.user.endUserPhoneNumber || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Address</div>
              <div>${order.user.endUserAddress}, ${order.user.endUserCity}, ${order.user.endUserPostalCode}</div>
            </div>
          </div>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th class="text-right">Unit Price</th>
              <th class="text-right">Qty</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${cartItems.map((item, index) => `
              <tr>
                <td>
                  <strong>${item.name}</strong>
                  ${item.description ? `<div style="font-size: 0.9em; color: #7f8c8d; margin-top: 5px;">${item.description}</div>` : ''}
                </td>
                <td class="text-right">${(item.discountPrice || item.price).toFixed(2)} MAD</td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">${((item.discountPrice || item.price) * item.quantity).toFixed(2)} MAD</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals-section">
          <table class="totals-table">
            <tr>
              <td>Subtotal:</td>
              <td>${(order.totalAmount / 1.1).toFixed(2)} MAD</td>
            </tr>
            <tr class="tax-row">
              <td>Tax (10%):</td>
              <td>${((order.totalAmount / 1.1) * 0.1).toFixed(2)} MAD</td>
            </tr>
            <tr>
              <td>Shipping:</td>
              <td>0.00 MAD</td>
            </tr>
            <tr class="grand-total-row">
              <td class="grand-total">Total:</td>
              <td class="grand-total">${order.totalAmount.toFixed(2)} MAD</td>
            </tr>
          </table>
        </div>
        
        <div class="notes-section">
          <div class="notes-title">Order Notes</div>
          <div class="notes-content">
            ${order.comments || 'Thank you for your business! We appreciate your trust in our services.'}
          </div>
        </div>
        
        <div class="footer">
          <div class="thank-you">Thank you for your order!</div>
          <p>If you have any questions about this invoice, please contact</p>
          <p>info@jolofsystem.ma or call +212 522 27 50 43</p>
          <p style="margin-top: 15px;">© ${new Date().getFullYear()} Jolof System. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;
}