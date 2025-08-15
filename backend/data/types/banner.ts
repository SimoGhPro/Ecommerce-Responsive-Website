import { defineType, defineField } from 'sanity';
import { RedoIcon } from '@sanity/icons';

export default defineType({
  name: 'banner',
  title: 'Banner',
  type: 'document',
  icon: RedoIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Banner Name',
      type: 'string',
      validation: (Rule) => Rule.required().error('Name is required'),
    }),
    defineField({
      name: 'brand',
      title: 'Brand',
      type: 'reference',
      to: [{ type: 'brand' }], // Links to your existing brand schema
      // validation: (Rule) => Rule.required().error('Brand reference is required'),
    }),
    defineField({
      name: 'image',
      title: 'Banner Image',
      type: 'image',
      options: {
        hotspot: true, // Enables image cropping/hotspotting
      },
      validation: (Rule) => Rule.required().error('Image is required'),
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Accessible description for the image',
          validation: (Rule) => Rule.required().error('Alt text is required'),
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'brand.name', // Shows the referenced brand's name
      media: 'image', // Uses the image as preview thumbnail
    },
  },
});