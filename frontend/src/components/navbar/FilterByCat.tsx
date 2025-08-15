import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { client } from '@/sanity/client';
import { type SanityDocument } from "next-sanity";

const categoriesQuery = `*[_type == "category"]{
  _id,
  name,
  slug,
  parentCategory->{
    _id,
    name,
    slug
  }
}`;
const options = { next: { revalidate: 30 } };

export default async function sideBarFilter() {
  const categories = await client.fetch<SanityDocument[]>(categoriesQuery, {}, options);

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

  // Get parent categories
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
    .filter((parent): parent is SanityDocument => !!parent && !!parent.name);

  return (
        <div className="w-full md:w-64 bg-white p-6 rounded-lg shadow-sm">
          {/* Category Dropdown */}
          <div className="mb-6 relative">
            <h2 className="text-lg font-semibold mb-2">Categories</h2>
            <div className="relative">
              <div className="mt-2 space-y-1">
                {parentCategories.map((parent) => (
                  <div key={parent._id} className="relative group">
                    <div
                      className="w-full text-left px-3 py-2 rounded-md flex justify-between items-center hover:bg-gray-100"
                    >
                      {parent.name}
                      {groupedCategories[parent._id]?.children.length > 0 && (
                        <ChevronRightIcon className="w-4 h-4" />
                      )}
                    </div>
                    
                    {/* Subcategories */}
                    {groupedCategories[parent._id]?.children.length > 0 && (
                      <div className="ml-4 mt-1 space-y-1 hidden group-hover:block">
                        {groupedCategories[parent._id].children.map((child) => (
                          <Link
                            key={child._id}
                            href={`/products/category/${child.slug.current}`}
                            className="w-full text-left px-3 py-1 rounded-md block hover:bg-gray-50"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
    </div>
  );
}