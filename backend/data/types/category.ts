import { defineType, defineField } from 'sanity'
import { ListIcon } from '@sanity/icons'

export default defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  icon: ListIcon,
  fields: [
    defineField({
      name: 'Id',
      title: 'ID',
      type: 'string',
      description: 'Original ID from Logicom system',
      readOnly: true,
    }),
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'parentCategory',
      title: 'Parent Category',
      type: 'reference',
      to: [{ type: 'category' }],
      description: 'Reference to a parent category for hierarchy',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'parentCategory.name',
    },
    prepare(selection) {
      const { title, subtitle } = selection
      return {
        title,
        subtitle: subtitle ? `Child of ${subtitle}` : 'Top-level category',
      }
    },
  },
})