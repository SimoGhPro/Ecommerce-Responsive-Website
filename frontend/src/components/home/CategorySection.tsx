// CategorySection.tsx
import Link from "next/link";
import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

// Image URL builder
const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

const options = { next: { revalidate: 30 } };
const CATEGORIES_QUERY = `*[_type == "category"]{
  _id,
  name,
  slug,
  image,
  parentCategory->{
    _id,
    name,
    slug,
    image
  }
}|order(parentCategory->name asc, name asc)`;

export default async function CategorySection() {
  const categories = await client.fetch<SanityDocument[]>(CATEGORIES_QUERY, {}, options);

  // Group categories by parent
  const groupedCategories = categories.reduce((acc, category) => {
    const parentId = category.parentCategory?._id || 'top-level';
    
    if (!acc[parentId]) {
      acc[parentId] = {
        parent: category.parentCategory,
        children: []
      };
    }
    
    if (parentId !== 'top-level') {
      acc[parentId].children.push(category);
    } else {
      if (!acc[category._id]) {
        acc[category._id] = {
          parent: category,
          children: []
        };
      }
    }
    
    return acc;
  }, {} as Record<string, { parent?: SanityDocument, children: SanityDocument[] }>);

  // Get valid parent categories
  const parentCategories = Object.values(groupedCategories)
    .filter(group => {
      const hasValidParent = group.parent && group.parent._id && group.parent.name;
      const isTopLevelWithChildren = !group.parent && group.children.length > 0;
      return hasValidParent || isTopLevelWithChildren;
    })
    .map(group => {
      if (!group.parent && group.children.length > 0 && group.children[0].parentCategory) {
        return group.children[0].parentCategory;
      }
      return group.parent || group.children[0];
    })
    .filter(parent => parent && parent.name);

  // Calculate if we have an odd number of categories
  const isOddCount = parentCategories.length % 2 !== 0;

  return (
    <section className="mb-12 p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Our categories</h2>
      
      <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
        {parentCategories.map((parent, index) => {
          if (!parent) return null;
          
          const imageUrl = parent.image
            ? urlFor(parent.image)?.auto('format').url()
            : null;

          return (
            <div 
              key={parent._id} 
              className={`space-y-3 ${isOddCount && index === parentCategories.length - 1 ? 'col-span-full md:col-auto md:mx-auto' : 'w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(16.666%-20px)]'}`}
            >
              <Link
                href={`/categories/${parent.slug?.current || ''}`}
                className="font-bold text-gray-900 hover:text-primary-600 block"
              >
                <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors h-full">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mb-3 mx-auto flex items-center justify-center text-gray-500 overflow-hidden">
                    {imageUrl ? (
                      <img 
                        src={imageUrl}
                        alt={parent.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      parent.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-sm font-medium text-center block">{parent.name}</span>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}