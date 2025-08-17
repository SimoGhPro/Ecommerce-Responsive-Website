// schemas/order.ts
import { defineType, defineField } from 'sanity'
import { PackageIcon } from '@sanity/icons'

export default defineType({
  name: 'order',
  title: 'Order',
  type: 'document',
  icon: PackageIcon,
  fields: [
    defineField({
      name: 'orderNumber',
      title: 'Order Number',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'user',
      title: 'User Information',
      type: 'object',
      fields: [
        defineField({
          name: 'firstName',
          title: 'First Name',
          type: 'string',
          validation: (Rule) => Rule.required().regex(/^[A-Za-z]+$/, { name: 'letters only' }),
        }),
        defineField({
          name: 'lastName',
          title: 'Last Name',
          type: 'string',
          validation: (Rule) => Rule.required().regex(/^[A-Za-z]+$/, { name: 'letters only' }),
        }),
        defineField({
          name: 'email',
          title: 'Email',
          type: 'string',
          validation: (Rule) => Rule.required().email(),
        }),
        defineField({
          name: 'endUserAddress',
          title: 'Address',
          type: 'string',
          validation: (Rule) => Rule.regex(/^[A-Za-z0-9\s]+$/, { name: 'alphanumeric only' }),
        }),
        defineField({
          name: 'endUserCity',
          title: 'City',
          type: 'string',
          validation: (Rule) => Rule.regex(/^[A-Za-z\s]+$/, { name: 'letters only' }),
        }),
        defineField({
          name: 'endUserPostalCode',
          title: 'Postal Code',
          type: 'string',
          validation: (Rule) => Rule.regex(/^[A-Za-z0-9]+$/, { name: 'alphanumeric only' }),
        }),
        defineField({
          name: 'endUserPhoneNumber',
          title: 'Phone Number',
          type: 'string',
          validation: (Rule) => Rule.regex(/^[0-9]+$/, { name: 'numbers only' }),
        }),
      ],
    }),
    defineField({
      name: 'stockVerification',
      title: 'Stock Verification',
      type: 'number',
      options: {
        list: [
          { title: 'No stock verification', value: 0 },
          { title: 'Stock verification', value: 1 },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'requestedDeliveryDate',
      title: 'Requested Delivery Date',
      type: 'date',
    }),
    defineField({
      name: 'deliveryMethod',
      title: 'Delivery Method',
      type: 'string',
    }),
    defineField({
      name: 'comments',
      title: 'Comments',
      type: 'text',
    }),
    defineField({
        name: 'items',
        title: 'Order Items',
        type: 'array',
        of: [
          {
            type: 'object',
            fields: [
              defineField({
                name: 'product',
                title: 'Product',
                type: 'reference',
                to: [{ type: 'product' }],
                validation: (Rule) => Rule.required(),
              }),
              defineField({
                name: 'variantId',
                title: 'Variant ID',
                type: 'string',
                description: 'The specific variant ID if this product has variants'
              }),
              defineField({
                name: 'quantity',
                title: 'Quantity',
                type: 'number',
                validation: (Rule) => Rule.required().integer().min(1),
              }),
            ],
            preview: {
              select: {
                productName: 'product.name',
                productSku: 'product.sku',
                variantId: 'variantId',
                quantity: 'quantity',
                media: 'product.images.0'
              },
              prepare(selection) {
                const { productName, productSku, variantId, quantity, media } = selection
                const variantText = variantId ? `(Variant: ${variantId})` : ''
                return {
                  title: `${productName} ${variantText}`,
                  subtitle: `SKU: ${productSku} | Qty: ${quantity}`,
                  media: media
                }
              }
            }
          },
        ],
      }),
    // Clerk user ID reference for authentication integration
    defineField({
      name: 'clerkUserId',
      title: 'Clerk User ID',
      type: 'string',
      description: 'Reference to the user in Clerk authentication system',
    }),
    defineField({
      name: 'status',
      title: 'Order Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Processing', value: 'processing' },
          { title: 'Shipped', value: 'shipped' },
          { title: 'Delivered', value: 'delivered' },
          { title: 'Cancelled', value: 'cancelled' },
        ],
        layout: 'dropdown',
      },
      initialValue: 'pending',
    }),
    defineField({
      name: 'totalAmount',
      title: 'Total Amount',
      type: 'number',
      description: 'The total amount for the order including taxes',
      }),
      defineField({
        name: 'currency',
        title: 'Currency',
        type: 'string',
        options: {
          list: [
            {title: 'MAD', value: 'MAD'},
            {title: 'EUR', value: 'EUR'},
            {title: 'USD', value: 'USD'},
            // Add other currencies as needed
          ],
        },
        initialValue: 'MAD',
      })
  ],
  preview: {
    select: {
      orderNumber: 'orderNumber',
      customer: 'user.firstName',
      status: 'status',
      items: 'items',
      createdAt: '_createdAt'
    },
    prepare(selection) {
      const { orderNumber, customer, status, items, createdAt } = selection
      const itemCount = items?.length || 0
      return {
        title: `Order #${orderNumber}`,
        subtitle: `${customer} | ${status} | ${itemCount} items | ${new Date(createdAt).toLocaleDateString()}`,
        media: PackageIcon
      }
    }
  }
})