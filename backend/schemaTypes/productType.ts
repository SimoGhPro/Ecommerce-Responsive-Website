import { defineType, defineField, defineArrayMember } from 'sanity'
import { DesktopIcon } from '@sanity/icons'

export default defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  icon: DesktopIcon,
  fields: [
    defineField({
      name: 'sku',
      title: 'SKU',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text'
    }),
    defineField({
      name: 'manufacturer',
      title: 'Manufacturer',
      type: 'string'
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }]
    }),
    defineField({
      name: 'isESD',
      title: 'Is ESD',
      type: 'boolean',
      initialValue: false
    }),
    defineField({
      name: 'isEUItem',
      title: 'Is EU Item',
      type: 'boolean',
      initialValue: false
    }),
    defineField({
      name: 'barcode',
      title: 'Barcode',
      type: 'string'
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'object',
      fields: [
        defineField({
          name: 'priceExclVAT',
          title: 'Price Excl. VAT',
          type: 'number'
        }),
        defineField({
          name: 'salePrice',
          title: 'Sale Price (PriceExclVAT + 20%)',
          type: 'number',
          readOnly: true,
          description: 'Automatically calculated as PriceExclVAT * 1.2'
        }),
        defineField({
          name: 'specialPrice',
          title: 'Special Price',
          type: 'number'
        }),
        defineField({
          name: 'specialSalePrice',
          title: 'Special Sale Price (SpecialPrice + 20%)',
          type: 'number',
          readOnly: true,
          description: 'Automatically calculated as SpecialPrice * 1.2'
        }),
        defineField({
          name: 'startDate',
          title: 'Start Date',
          type: 'date'
        }),
        defineField({
          name: 'endDate',
          title: 'End Date',
          type: 'date'
        }),
        defineField({
          name: 'vat',
          title: 'VAT',
          type: 'number'
        }),
        defineField({
          name: 'recycleTax',
          title: 'Recycle Tax',
          type: 'number'
        }),
        defineField({
          name: 'currency',
          title: 'Currency',
          type: 'string',
          options: {
            list: [
              { title: 'Euro', value: 'EUR' },
              { title: 'Romanian Leu', value: 'RON' },
              { title: 'Moroccan Dirham', value: 'MAD' },
              { title: 'Saudi Riyal', value: 'SAR' },
              { title: 'UAE Dirham', value: 'AED' }
            ]
          }
        })
      ]
    }),
    defineField({
      name: 'volumePricing',
      title: 'Volume Pricing',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'quantity',
              title: 'Quantity',
              type: 'number'
            }),
            defineField({
              name: 'price',
              title: 'Price',
              type: 'number'
            }),
            defineField({
              name: 'salePrice',
              title: 'Sale Price (price + 20%)',
              type: 'number',
              readOnly: true,
              description: 'Automatically calculated as price * 1.2'
            }),
            defineField({
              name: 'discountPercent',
              title: 'Discount %',
              type: 'number'
            })
          ]
        })
      ]
    }),
    defineField({
      name: 'variants',
      title: 'Variants',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'id',
              title: 'ID',
              type: 'string'
            }),
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string'
            }),
            defineField({
              name: 'price',
              title: 'Price',
              type: 'number'
            }),
            defineField({
              name: 'listPrice',
              title: 'List Price',
              type: 'number'
            }),
            defineField({
              name: 'salePrice',
              title: 'Sale Price (Price + 20%)',
              type: 'number',
              readOnly: true,
              description: 'Automatically calculated as Price * 1.2'
            }),
            defineField({
              name: 'inventory',
              title: 'Inventory',
              type: 'number'
            }),
            defineField({
              name: 'ourInventory',
              title: 'Our Inventory',
              type: 'number',
              readOnly: true,
              description: 'Automatically calculated as Inventory / 2'
            }),
            defineField({
              name: 'barcodes',
              title: 'Barcodes',
              type: 'string'
            })
          ]
        })
      ]
    }),
    defineField({
      name: 'intelPoints',
      title: 'Intel Points',
      type: 'number'
    }),
    defineField({
      name: 'warranty',
      title: 'Warranty',
      type: 'string'
    }),
    defineField({
      name: 'specifications',
      title: 'Specifications',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string'
            }),
            defineField({
              name: 'value',
              title: 'Value',
              type: 'string'
            })
          ]
        })
      ]
    }),
    defineField({
      name: 'inventory',
      title: 'Inventory',
      type: 'object',
      fields: [
        defineField({
          name: 'quantity',
          title: 'Quantity',
          type: 'number'
        }),
        defineField({
          name: 'ourInventory',
          title: 'Our Inventory',
          type: 'number',
          readOnly: true,
          description: 'Automatically calculated as Quantity / 2'
        }),
        defineField({
          name: 'purchaseOrders',
          title: 'Purchase Orders',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              fields: [
                defineField({
                  name: 'quantity',
                  title: 'Quantity',
                  type: 'number'
                }),
                defineField({
                  name: 'deliveryDate',
                  title: 'Delivery Date',
                  type: 'date'
                })
              ]
            })
          ]
        })
      ]
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true
          }
        }
      ]
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Last Updated',
      type: 'datetime',
      initialValue: (new Date()).toISOString()
    })
  ],
  preview: {
    select: {
      title: 'name',
      media: 'images.0',
      sku: 'sku'
    },
    prepare(selection) {
      const { title, media, sku } = selection
      return {
        title: title,
        subtitle: `SKU: ${sku}`,
        media: media
      }
    }
  }
})