import { defineType, defineField } from 'sanity'
import { GroqIcon } from '@sanity/icons'

export default defineType({
  name: 'brand',
  title: 'Brand',
  type: 'document',
  icon: GroqIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required().error('Brand name is required')
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      validation: (Rule) => Rule.required().error('Slug is required')
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {
        hotspot: true,
        metadata: ['lqip', 'palette']
      },
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'logo',
    }
  }
})